require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const app = express();

app.get('/api/passages', async (req, res) => {
    const result = await pool.query('SELECT * FROM passages');
    res.json(result.rows);
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});