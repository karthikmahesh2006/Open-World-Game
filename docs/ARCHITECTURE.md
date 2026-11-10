# Architecture Overview (Railway Docker Edition)
- **Dockerfile**: Multi-stage `node:20-alpine` build compiling React/Vite (`frontend/dist`) and running the production Express server (`backend/src/server.js`).
- **Frontend (`frontend/`)**: React 18 + Vite + Tailwind CSS + Three.js (`BlockyMetroEngine.js`).
- **Backend (`backend/`)**: Node.js + Express REST API + `/api/multiplayer` real-time state sync with HTTP Keep-Alive and zero-lag logging.
- **Database (`database/`)**: MongoDB + Mongoose models with automatic in-memory fallback.
