const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { PORT, CORS_ORIGIN } = require("./config/env");
const { connectDatabase, getDbStatus } = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const progressRoutes = require("./routes/progressRoutes");
const missionRoutes = require("./routes/missionRoutes");
const { notFoundHandler, globalErrorHandler } = require("./middleware/errorMiddleware");

const app = express();

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Blocky Metro Open-World API",
    databaseConnected: getDbStatus(),
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// REAL-TIME MULTIPLAYER PRESENCE & STATE SYNC (/api/multiplayer/*)
// Built directly into server.js so deployment never fails on missing route files
// ============================================================================
const activePlayers = new Map();
const STALE_TIMEOUT_MS = 12000;

function pruneStalePlayers() {
  const now = Date.now();
  for (const [id, p] of activePlayers.entries()) {
    if (now - p.lastUpdated > STALE_TIMEOUT_MS) {
      activePlayers.delete(id);
    }
  }
}

const multiplayerRouter = express.Router();

multiplayerRouter.post("/sync", (req, res) => {
  try {
    pruneStalePlayers();
    const body = req.body || {};
    const id = String(body.id || "").trim();

    if (id) {
      activePlayers.set(id, {
        id,
        name: String(body.name || "Player").slice(0, 18),
        shirtColor: Number(body.shirtColor) || 0x10b981,
        visorColor: Number(body.visorColor) || 0x6ee7b7,
        colorHex: String(body.colorHex || "#10b981"),
        x: Number(body.x) || 0,
        y: Number(body.y) || 0,
        z: Number(body.z) || 28,
        yaw: Number(body.yaw) || 0,
        speed: Number(body.speed) || 0,
        isSwimming: Boolean(body.isSwimming),
        inHelicopter: Boolean(body.inHelicopter),
        activeVehicleId: body.activeVehicleId || null,
        inArena: Boolean(body.inArena),
        hp: Number(body.hp ?? 100),
        splats: Number(body.splats ?? 0),
        zone: String(body.zone || "Metro City"),
        lastUpdated: Date.now()
      });
    }

    const otherPlayers = [];
    for (const [peerId, peerData] of activePlayers.entries()) {
      if (peerId !== id) {
        otherPlayers.push(peerData);
      }
    }

    return res.json({
      status: "ok",
      onlineCount: activePlayers.size,
      players: otherPlayers
    });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
});

multiplayerRouter.get("/players", (req, res) => {
  pruneStalePlayers();
  return res.json({
    status: "ok",
    onlineCount: activePlayers.size,
    players: Array.from(activePlayers.values())
  });
});

multiplayerRouter.post("/leave", (req, res) => {
  const body = req.body || {};
  if (body.id) {
    activePlayers.delete(String(body.id));
  }
  return res.json({ status: "ok", onlineCount: activePlayers.size });
});

app.use("/api/auth", authRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/missions", missionRoutes);
app.use("/api/multiplayer", multiplayerRouter);

// Serve built React frontend (frontend/dist) in production deployments
const frontendDistPath = path.resolve(__dirname, "../../frontend/dist");
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

app.use(notFoundHandler);
app.use(globalErrorHandler);

async function startServer() {
  await connectDatabase();
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Blocky Metro Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = app;
