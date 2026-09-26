require('dotenv').config();

const jwt = require('jsonwebtoken');

const JWT_secret = process.env.JWT_secret;
if (!JWT_SECRET) throw new Error('JWT_SECRET is not set');

function signToken(user) {
    return jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

}

function verifyToken(token) {
    if (typeof token !== 'string' || token.length === 0) return null;
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
}

module.exports = { signToken, verifyToken };



