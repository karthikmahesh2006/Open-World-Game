# Blocky Metro: Open World & Paintball Arena (Full-Stack Edition)

A full-stack 3D open-world box-character city and paintball game built with **React.js (Vite)**, **Three.js**, **Node.js + Express.js**, and **MongoDB (Mongoose)**.

## Project Structure
```text
open-world-game/
├── frontend/
│   ├── public/
│   │   └── manifest.json
│   ├── src/
│   │   ├── assets/
│   │   │   └── gameCatalog.js
│   │   ├── components/
│   │   │   └── modals/
│   │   │       └── PlayerProfileModal.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── GameContext.jsx
│   │   ├── game/
│   │   │   ├── BlockyMetroEngine.js
│   │   │   ├── soundEngine.js
│   │   │   └── textureGenerators.js
│   │   ├── hooks/
│   │   │   └── useGameEngine.js
│   │   ├── pages/
│   │   │   └── GameWorldPage.jsx
│   │   ├── services/
│   │   │   ├── apiClient.js
│   │   │   ├── authService.js
│   │   │   └── progressService.js
│   │   ├── styles/
│   │   │   └── index.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js
│   │   │   └── env.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── missionController.js
│   │   │   └── progressController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   └── errorMiddleware.js
│   │   ├── models/
│   │   │   ├── GameProgress.js
│   │   │   ├── LeaderboardEntry.js
│   │   │   ├── Mission.js
│   │   │   └── Player.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── missionRoutes.js
│   │   │   └── progressRoutes.js
│   │   ├── services/
│   │   │   ├── authService.js
│   │   │   └── progressService.js
│   │   ├── utils/
│   │   │   ├── responseHelper.js
│   │   │   └── tokenUtils.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── database/
│   ├── schema-overview.json
│   └── seed.js
├── docs/
│   ├── API_REFERENCE.md
│   └── ARCHITECTURE.md
├── .env.example
├── package.json
└── README.md
```

## Quick Start

1. **Install dependencies:**
   ```bash
   npm run install:all
   ```
2. **Configure environment variables:**
   Copy `.env.example` to `backend/.env` and set `MONGO_URI` (defaults to `mongodb://127.0.0.1:27017/blocky_metro_game`).
3. **Seed initial missions & leaderboards (optional):**
   ```bash
   npm run seed
   ```
4. **Run Backend & Frontend concurrently:**
   ```bash
   npm run dev
   ```
   - Frontend (React + Vite): `http://localhost:5173`
   - Backend API (Node + Express): `http://localhost:5000/api/health`
