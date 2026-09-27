require('dotenv').config();

const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const WebSocket = require('ws');
const { randomUUID } = require('node:crypto');
const { verifyToken } = require('./auth');

const wss = new WebSocket.Server({ port: 8080 });

const clients = new Map();   // id -> socket
const waiting = [];
const matches = new Map();

async function handleAuth(socket, msg){
  const payload = verifyToken(msg.token);

  if (!payload) {
    socket.send(JSON.stringify({ type: 'auth_failed', message: 'invalid or expired token' }));
    return;
  }

  socket.userId = payload.userId;
  clients.set(payload.userId, socket);

  socket.send(JSON.stringify({ type: 'auth_ok', userId: payload.userId }));
  console.log(`user ${payload.userId} authenticated (${clients.size} total)`);

}

wss.on('connection', (socket) => {
  socket.userId = null;

  socket.on('error', console.error);
  socket.on('close', () => handleClose(socket));  

  socket.on('message', (message) => {
    let msg;
    try {
      msg = JSON.parse(message);
    } catch {
      socket.send(JSON.stringify({ type: 'error', message: 'invalid JSON' }));
      return;
    }

    if (msg.type === 'auth') {
      handleAuth(socket, msg).catch((err) => {
        console.error('handleAuth failed:', err);
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: 'error', message: 'server error' }));
        }
      });
      return;
    }

    if (socket.userId === null) {
      socket.send(JSON.stringify({ type: 'error', message: 'not authenticated' }));
      return;
    }

    if (msg.type === 'queue') {
      handleQueue(socket).catch((err) => {
        console.error('handleQueue failed:', err);
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: 'error', message: 'server error' }));
        }
      });
    }

    // Add more if statements?
  });
});


async function handleQueue(socket) {
  if (socket.matchId) return;
  if (waiting.includes(socket.userId)) return;
  waiting.push(socket.userId);

  const pairs = drainQueue();

  if (waiting.includes(socket.userId)) {
    socket.send(JSON.stringify({ type: 'queued' }));
  }

  await Promise.all(pairs.map(startMatch));
}

// Pull every viable pair out of the queue. Dead sockets are dropped and the
// loop keeps going, so a player left over from a half-dead pair gets matched
// right away instead of sitting there until someone else queues.
function drainQueue() {
  const pairs = [];

  while (waiting.length >= 2) {
    const id1 = waiting.shift();
    const p1 = clients.get(id1);
    if (!p1 || p1.readyState !== WebSocket.OPEN) continue;

    const id2 = waiting.shift();
    const p2 = clients.get(id2);
    if (!p2 || p2.readyState !== WebSocket.OPEN) {
      waiting.unshift(id1);   // id2 is gone, so the queue still shrank
      continue;
    }

    pairs.push([id1, p1, id2, p2]);
  }

  return pairs;
}

async function startMatch([id1, p1, id2, p2]) {
  const matchId = randomUUID();

  const question = await pool.query(`
    SELECT q.id, q.question_text, p.passage_text
    FROM questions q
    JOIN passages p ON q.passage_id = p.id
    ORDER BY random()
    LIMIT 1
  `);
  const answers = await pool.query(
    `SELECT id, choice_text, is_correct
    FROM answer_choices
    WHERE question_id = $1`,
    [question.rows[0].id]
  );

  if (p1.readyState !== WebSocket.OPEN || p2.readyState !== WebSocket.OPEN) {
    if (p1.readyState === WebSocket.OPEN) waiting.unshift(id1);
    if (p2.readyState === WebSocket.OPEN) waiting.unshift(id2);
    return;
  }

  matches.set(matchId, { player1: id1, player2: id2 });

  p1.matchId = matchId;
  p2.matchId = matchId;

  p1.send(JSON.stringify({ type: 'match_found', matchId, opponent: id2 }));
  p2.send(JSON.stringify({ type: 'match_found', matchId, opponent: id1 }));

  console.log(`match ${matchId}: ${id1} vs ${id2}`);

  const payload = JSON.stringify({
    type: 'question',
    question: question.rows[0],
    choices: answers.rows.map(({ id, choice_text }) => ({ id, choice_text })),
  });

  p1.send(payload);
  p2.send(payload);
}

function handleClose(socket){
  const userId = socket.userId;
  if (userId === null){return};
  if (clients.get(userId) !== socket) return;   // superseded by a newer socket

  const i = waiting.indexOf(userId);
  if (i !== -1) waiting.splice(i, 1);
  console.log(`user ${userId} disconnected (${clients.size} total)`);
}
