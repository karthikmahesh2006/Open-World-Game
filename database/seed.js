const { connectDatabase } = require('../backend/src/config/db');
const Mission = require('../backend/src/models/Mission');

async function seed() {
  const connected = await connectDatabase();
  if (!connected) {
    console.log('Skipping DB seed (running in memory mode).');
    process.exit(0);
  }
  await Mission.deleteMany({});
  await Mission.insertMany([
    { code: 'arena_10', title: 'Arena Sharpshooter', description: 'Tag 10 Red AI Bots in Paintball', xpReward: 200, coinReward: 100 },
    { code: 'rooftop_goal', title: 'Terrace Striker', description: 'Score on the Violet Tower Rooftop Pitch', xpReward: 180, coinReward: 90 }
  ]);
  console.log('Seeded missions successfully.');
  process.exit(0);
}
seed();
