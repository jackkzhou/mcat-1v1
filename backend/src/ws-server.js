require('dotenv').config();

const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const WebSocket = require('ws');
const { randomUUID } = require('node:crypto');        // ← added

const wss = new WebSocket.Server({ port: 8080 });

const clients = new Map();                             // ← added: id → socket
const waiting = [];
const matches = new Map();

wss.on('connection', (socket) => {
  const id = randomUUID();                             // ← added
  socket.id = id;                                      // ← added
  clients.set(id, socket);                             // ← added

  console.log(`client ${id} connected (${clients.size} total)`);   // ← changed

  socket.on('error', console.error);

  socket.on('close', () => {
  clients.delete(id);
  const i = waiting.indexOf(id);
  if (i !== -1) waiting.splice(i, 1);
  console.log(`client ${id} disconnected (${clients.size} total)`);
  });

  socket.on('message', (message) => {
    let msg;
    try {
      msg = JSON.parse(message);
    } catch {
      socket.send(JSON.stringify({ type: 'error', message: 'invalid JSON' }));
      return;
    }

    console.log('received:', msg);

    if (msg.type === 'queue'){
      handleQueue(socket);
    }

    //Add more if statements?
  });
});


function handleQueue(socket) {
  if (socket.matchId) return;   
  if (waiting.includes(socket.id)) return;
  waiting.push(socket.id);

  if (waiting.length < 2) {
    socket.send(JSON.stringify({ type: 'queued' }));
    return;
  }

  const id1 = waiting.shift();
  const id2 = waiting.shift();

  const p1 = clients.get(id1);
  const p2 = clients.get(id2);

  const p1Ok = p1 && p1.readyState === WebSocket.OPEN;
  const p2Ok = p2 && p2.readyState === WebSocket.OPEN;

  if (!p1Ok || !p2Ok) {
    if (p1Ok) waiting.unshift(id1);
    if (p2Ok) waiting.unshift(id2);
    return;
  }

  const matchId = randomUUID();
  matches.set(matchId, { player1: id1, player2: id2 });

  p1.matchId = matchId;        // ← add
  p2.matchId = matchId;        // ← add

  p1.send(JSON.stringify({ type: 'match_found', matchId, opponent: id2 }));
  p2.send(JSON.stringify({ type: 'match_found', matchId, opponent: id1 }));

  console.log(`match ${matchId}: ${id1} vs ${id2}`);

  question = pool.query('SELECT q.id, q.question_text, p.passage_text
                        FROM questions q
                        JOIN passages p ON q.passage_id = p.id
                        ORDER BY random()
                        LIMIT 1')
  answers = pool.query(SELECT id, choice_text, is_correct
                        FROM answer_choices
                        WHERE question_id = $1)
  
