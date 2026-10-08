const bcrypt = require('bcrypt');
const express = require('express');
const path = require('node:path');                          // NEW
const pool = require('./db');                               // CHANGED: shared pool (Step A)
const { signToken, verifyToken } = require('./auth');
const { attachWebSocket } = require('./ws-server');         // NEW

const app = express();
app.use(express.json());                                    // CHANGED: cors() removed

function authRequired(req, res, next) {
    const header = req.headers.authorization ?? '';
    if (!header.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'not authenticated' });
    }

    const payload = verifyToken(header.slice(7));
    if (!payload) {
        return res.status(401).json({ error: 'invalid token' });
    }

    req.userId = payload.userId;
    next();
}

app.post('/api/signup', async (req, res) => {
    const { username, email, password } = req.body;

    if (!password || password.length < 6) {
        return res.status(400).json({ error: 'password must be at least 6 characters' });
    }

    if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'valid email required' });
    }

    if (!username) {
        return res.status(400).json({ error: 'valid username required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const hash = await bcrypt.hash(password, 12);

    try {
        const result = await pool.query(
            `INSERT INTO users (username, email, password_hash)
             VALUES ($1, $2, $3)
             RETURNING id, username, email, rating`,
            [username, normalizedEmail, hash]
        );
        const user = result.rows[0];
        const token = signToken(user);
        return res.status(201).json({ token, user });
    } catch (err) {
        if (err.code === '23505') {
            const field = err.constraint === 'users_email_key' ? 'email' : 'username';
            return res.status(409).json({ error: `${field} is already taken` });
        }
        throw err;   // anything else bubbles up
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'email and password required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const result = await pool.query(
        `SELECT id, username, email, rating, password_hash FROM users WHERE email = $1`,
        [normalizedEmail]
    );

    const user = result.rows[0];

    if (!user) {
        return res.status(401).json({ error: 'invalid credentials' });
    }
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
        return res.status(401).json({ error: 'invalid credentials' });
    }
    delete user.password_hash;
    const token = signToken(user);

    return res.status(200).json({ token, user });
});

app.get('/api/me', authRequired, async (req, res) => {
    const result = await pool.query(
        `SELECT id, username, email, rating FROM users WHERE id = $1`,
        [req.userId]
    );
    if (!result.rows[0]) return res.status(401).json({ error: 'user no longer exists' });
    res.json(result.rows[0]);
});

// NEW: serve the built React app (run `npm run build` in frontend/ first)
const distDir = path.join(__dirname, '../../frontend/dist');
app.use(express.static(distDir));

// CHANGED: keep the server object so the WebSocket server can attach to it
const server = app.listen(3000, () => {
    console.log('Server running on port 3000 (HTTP + WebSocket)');
});
attachWebSocket(server);