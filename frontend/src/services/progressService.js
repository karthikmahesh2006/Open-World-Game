import { apiRequest } from './apiClient';

export async function fetchGameProgress() {
  return apiRequest('/progress');
}

export async function syncGameProgress(updatePayload) {
  try {
    return await apiRequest('/progress/save', {
      method: 'POST',
      body: JSON.stringify(updatePayload)
    });
  } catch (err) {
    // Graceful local persistence fallback if backend server is offline
    const localRaw = localStorage.getItem('blocky_metro_offline_progress');
    const prog = localRaw
      ? JSON.parse(localRaw)
      : { level: 1, xp: 0, coins: 250, stats: { totalPaintballSplats: 0, rooftopFootballGoals: 0, arcadeHighScore: 0 } };
    if (updatePayload.xpDelta) {
      prog.xp += updatePayload.xpDelta;
      prog.level = Math.floor(prog.xp / 250) + 1;
    }
    if (updatePayload.coinsDelta) {
      prog.coins += updatePayload.coinsDelta;
    }
    localStorage.setItem('blocky_metro_offline_progress', JSON.stringify(prog));
    return { progress: prog, offline: true };
  }
}

export async function fetchMissions() {
  return apiRequest('/missions');
}

export async function fetchLeaderboard(category = 'paintball_splats') {
  return apiRequest(`/missions/leaderboard?category=${encodeURIComponent(category)}`);
}
