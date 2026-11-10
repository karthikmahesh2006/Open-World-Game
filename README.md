# Blocky Metro: Open World & Paintball Arena (Full-Stack + Railway Docker Edition)

## Deploying on Railway with Docker (Recommended for Zero Lag)
1. Push this project folder (`open-world-game/`) to your GitHub repository.
2. In **Railway**, create a new project from your GitHub repo.
3. Railway automatically detects `railway.json` and `Dockerfile` (Multi-Stage `node:20-alpine` build).
4. Optional Environment Variables in Railway:
   - `MONGODB_URI` (optional — falls back to fast in-memory persistence if omitted)
   - `JWT_SECRET` (defaults to built-in secret if omitted)
5. Railway builds the static Vite frontend in Stage 1 and runs `node backend/src/server.js` in Stage 2 with HTTP Keep-Alive and zero-overhead `/api/multiplayer` syncing.

## Running Locally with Docker
```bash
docker build -t blocky-metro .
docker run -p 5000:5000 blocky-metro
```
Then open `http://localhost:5000`.
