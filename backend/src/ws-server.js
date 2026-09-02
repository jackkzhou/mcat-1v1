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

  socket.on('close', () => {                           // ← added block
    clients.delete(id);
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


function handleQueue(socket){
  if (waiting.includes(socket.id)) return;
  waiting.push(socket.id);
    if(waiting.length < 2)
    {
      socket.send(JSON.stringify(type: 'queued'));
      return;
    }
      if(waiting.length >= 2)
      {
        matches.set(match_id, )
      }
}