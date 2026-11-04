# REST API Reference

Base URL: `http://localhost:5000/api`

## Health
- `GET /api/health` — Returns service and MongoDB connection status.

## Authentication & Player Profile
- `POST /api/auth/register` — Register a new player (`{ username, email, password }`).
- `POST /api/auth/login` — Authenticate and receive a JWT (`{ usernameOrEmail, password }`).
- `GET /api/auth/profile` — Fetch authenticated player's profile and game progress (`Bearer <token>`).
- `PUT /api/auth/settings` — Save mouse sensitivity, camera preferences, and last known 3D coordinates.

## Game Progress & Matches
- `GET /api/progress` — Load player's XP, level, coins, stats, inventory, and match history.
- `POST /api/progress/save` — Increment XP, coins, buildings visited, vehicles driven, or high scores.
- `POST /api/progress/paintball-match` — Record a completed Outskirts Paintball match (`{ blueScore, redScore, playerSplats }`).

## Missions & Leaderboards
- `GET /api/missions` — List all active city & arena missions.
- `GET /api/missions/leaderboard?category=paintball_splats` — Retrieve top 10 player scores.
