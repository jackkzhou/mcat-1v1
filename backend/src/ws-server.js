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
const userMatch = new Map();   // userId -> matchId

async function handleAuth(socket, msg){
  const payload = verifyToken(msg.token);

  if (!payload) {
    socket.send(JSON.stringify({ type: 'auth_failed', message: 'invalid or expired token' }));
    return;
  }

  const result = await pool.query('SELECT id, username FROM users WHERE id = $1', [payload.userId]);
  const user = result.rows[0];

  if (socket.readyState !== WebSocket.OPEN) return;

  if (!user) {
    socket.send(JSON.stringify({ type: 'auth_failed', message: 'user no longer exists' }));
    return;
  }

  const previous = clients.get(user.id);
  if (previous && previous !== socket) {
    clients.delete(user.id);
    previous.close(4001, 'signed in elsewhere');
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
  if (userMatch.has(socket.userId)) return;
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

  // Reserve both players BEFORE any await, so a second 'queue' message
  // arriving during loadPassages sees them as already taken.
  userMatch.set(id1, matchId);
  userMatch.set(id2, matchId);

  let loaded;
  try {
    loaded = await loadPassages();
  } catch (err) {
    userMatch.delete(id1);
    userMatch.delete(id2);
    throw err;                       // still reaches handleQueue's .catch and gets logged
  }

  if (p1.readyState !== WebSocket.OPEN || p2.readyState !== WebSocket.OPEN) {
    userMatch.delete(id1);
    userMatch.delete(id2);
    if (p1.readyState === WebSocket.OPEN) waiting.unshift(id1);
    if (p2.readyState === WebSocket.OPEN) waiting.unshift(id2);
    return;
  }

  const { passages, correctAnswers } = loaded;

  matches.set(matchId, {
    id: matchId,
    players: [id1, id2],
    passages,
    correctAnswers,
    selections: { [id1]: {}, [id2]: {} },
    submitted:  { [id1]: null, [id2]: null },
    ended: false,
  });

  p1.send(JSON.stringify({ type: 'match_start', matchId, opponent: id2, passages }));
  p2.send(JSON.stringify({ type: 'match_start', matchId, opponent: id1, passages }));
}

function handleClose(socket){
  const userId = socket.userId;
  if (userId === null){return};
  if (clients.get(userId) !== socket) return;   // superseded by a newer socket

  const i = waiting.indexOf(userId);
  if (i !== -1) waiting.splice(i, 1);
  clients.delete(userId)
  console.log(`user ${userId} disconnected (${clients.size} total)`);
}

async function loadPassages() {

  const PASSAGES_PER_MATCH = 1;

  const { rows: passageRows } = await pool.query(
    `SELECT id, passage_text, passage_image_url, passage_image_url_2,
            passage_image_url_3, passage_image_url_4, category
     FROM passages
     ORDER BY random()
     LIMIT $1`,
    [PASSAGES_PER_MATCH]
  );

  if (passageRows.length < PASSAGES_PER_MATCH) {
    throw new Error(`need ${PASSAGES_PER_MATCH} passages, database has ${passageRows.length}`);
  }

  const passageIds = passageRows.map((p) => p.id);

    const { rows: questionRows } = await pool.query(
    `SELECT id, passage_id, question_text, image_url
     FROM questions
     WHERE passage_id = ANY($1)
     ORDER BY id`,
    [passageIds]
  );

  const questionIds = questionRows.map((q) => q.id);

  const { rows: choiceRows } = await pool.query(
    `SELECT id, question_id, choice_text, image_url, is_correct
     FROM answer_choices
     WHERE question_id = ANY($1)
     ORDER BY id`,
    [questionIds]
  );

  const correctAnswers = {};
  for (const c of choiceRows) {
    if (c.is_correct) correctAnswers[c.question_id] = c.id;
  }

  const passages = passageRows.map((p) => ({
    id: p.id,
    passage_text: p.passage_text,
    category: p.category,
    // image urls...
    questions: questionRows
      .filter((q) => q.passage_id === p.id)
      .map((q) => ({
        id: q.id,
        question_text: q.question_text,
        image_url: q.image_url,
        choices: choiceRows
          .filter((c) => c.question_id === q.id)
          .map((c) => ({ id: c.id, choice_text: c.choice_text, image_url: c.image_url })),
      })),
  }));

  return { passages, correctAnswers };

  
}