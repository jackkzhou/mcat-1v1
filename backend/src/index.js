require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');   // ← ADD
const express = require('express');
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const app = express();

app.use(cors());           // ← ADD
app.use(express.json());

app.get('/api/passages', async (req, res) => {
    const result = await pool.query('SELECT * FROM passages');
    res.json(result.rows);
});

app.post('/api/signup', async(req, res) => {
    const {username, email, password} = req.body;

    if (!password || password.length < 6){
        return res.status(400).json({ error: 'password must be at least 6 characters' });
    }

    if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'valid email required' });
    }

    if (!username){
        return res.status(400).json({error: 'valid username required'});
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
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        return res.status(201).json({ token, user });

        // success path
    } catch (err) {
        if (err.code === '23505') {
            const field = err.constraint === 'users_email_key' ? 'email' : 'username';
            return res.status(409).json({ error: `${field} is already taken` });
        }
        throw err;   // anything else bubbles up
    }
})

app.listen(3000, () => {
  console.log('Server running on port 3000');
});