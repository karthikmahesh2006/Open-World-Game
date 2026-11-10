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

exports.syncPlayerState = (req, res) => {
  try {
    pruneStalePlayers();
    const body = req.body || {};
    const id = String(body.id || '').trim();

    if (id) {
      activePlayers.set(id, {
        id,
        name: String(body.name || 'Player').slice(0, 18),
        shirtColor: Number(body.shirtColor) || 0x10b981,
        visorColor: Number(body.visorColor) || 0x6ee7b7,
        colorHex: String(body.colorHex || '#10b981'),
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
        zone: String(body.zone || 'Metro City'),
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
      status: 'ok',
      onlineCount: activePlayers.size,
      players: otherPlayers
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.getOnlinePlayers = (req, res) => {
  pruneStalePlayers();
  return res.json({
    status: 'ok',
    onlineCount: activePlayers.size,
    players: Array.from(activePlayers.values())
  });
};

exports.leaveMultiplayer = (req, res) => {
  const body = req.body || {};
  if (body.id) {
    activePlayers.delete(String(body.id));
  }
  return res.json({ status: 'ok', onlineCount: activePlayers.size });
};
