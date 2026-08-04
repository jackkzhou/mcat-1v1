# MCAT 1v1 Platform

Real-time 1v1 MCAT quiz app.

## Stack
- Frontend: React (Vite)
- Backend: Node.js + Express, WebSockets for real-time match play
- DB: PostgreSQL — relational data (users/matches/questions) needs transactions for atomic score updates
- Cache/queue: Redis — matchmaking queue, pub/sub if scaled across servers
- Docker + docker-compose for consistent local dev and deployment