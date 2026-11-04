# Blocky Metro: Full-Stack Architecture

## Overview
Blocky Metro is structured into four decoupled layers:
1. **Frontend (`frontend/`)**: React 18 + Vite + Tailwind CSS component hierarchy managing authentication, player profiles, mission tracking, and HUD overlays.
2. **3D Game Engine (`frontend/src/game/`)**: Standalone Three.js open-world engine (`BlockyMetroEngine.js`, `soundEngine.js`, `textureGenerators.js`) preserving all 35 multi-floor walk-in buildings, proximity elevators, topmost helipads, flyable Sky-Hawk Helicopter, operational Taxis/Police Car/Ambulance/Fire Engine, 7th Floor Neon Arcade, Terrace Rooftop Football, and Outskirts Paintball Arena.
3. **Backend (`backend/`)**: Node.js + Express REST API organized into `config/`, `models/`, `controllers/`, `services/`, `routes/`, `middleware/`, and `utils/`.
4. **Database (`database/` & `backend/src/models/`)**: MongoDB with Mongoose schemas (`Player`, `GameProgress`, `Mission`, `LeaderboardEntry`) plus an automatic in-memory fallback store so the server runs even if a local `mongod` service is not active.
