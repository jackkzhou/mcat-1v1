require('dotenv').config();

const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (socket) => {
  console.log('a client connected');

  socket.on('message', (message) => {

    const parsedMessage = JSON.parse(message);
    console.log('received: %s', message);
  });
});
