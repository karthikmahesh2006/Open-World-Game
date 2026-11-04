const mongoose = require('mongoose');
const { connectDatabase, getDbStatus } = require('../backend/src/config/db');
const Mission = require('../backend/src/models/Mission');
const LeaderboardEntry = require('../backend/src/models/LeaderboardEntry');
const { DEFAULT_MISSIONS } = require('../backend/src/controllers/missionController');

async function seedDatabase() {
  const connected = await connectDatabase();
  if (!connected || !getDbStatus()) {
    console.log('[Seed] MongoDB daemon not reachable; default missions are served automatically by missionController.');
    process.exit(0);
  }

  await Mission.deleteMany({});
  await Mission.insertMany(DEFAULT_MISSIONS);

  await LeaderboardEntry.deleteMany({});
  await LeaderboardEntry.insertMany([
    { username: 'MetroChampion', category: 'paintball_splats', score: 42 },
    { username: 'SkyHawkPilot', category: 'paintball_splats', score: 35 },
    { username: 'VioletArcadePro', category: 'arcade_highscore', score: 1250 },
    { username: 'TerraceStriker', category: 'rooftop_goals', score: 14 }
  ]);

  console.log('[Seed] Successfully seeded Missions and Leaderboards into MongoDB!');
  await mongoose.connection.close();
}

seedDatabase();
