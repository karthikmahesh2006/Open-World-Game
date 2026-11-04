export const CITY_LANDMARKS = [
  { id: 'townhall', name: 'City Town Hall', coords: { x: 0, z: -12 }, floors: 4, category: 'Civic' },
  { id: 'shop', name: 'Paintball Pro Shop & Arena Gate', coords: { x: 30, z: 6 }, floors: 4, category: 'Sports' },
  { id: 'violet_tower', name: 'Violet Tower (7F Arcade & Rooftop Football)', coords: { x: 74, z: 6 }, floors: 8, category: 'Entertainment' },
  { id: 'hospital', name: 'Metro Central Hospital', coords: { x: 80, z: -80 }, floors: 8, category: 'Emergency' },
  { id: 'police', name: 'Police Headquarters', coords: { x: -25, z: -80 }, floors: 8, category: 'Emergency' },
  { id: 'fire_station', name: 'Fire Station #1', coords: { x: 25, z: -80 }, floors: 8, category: 'Emergency' },
  { id: 'planetarium', name: 'Science Planetarium', coords: { x: -80, z: -135 }, floors: 8, category: 'Education' },
  { id: 'pharmacy', name: 'City Pharmacy & Drugstore', coords: { x: -135, z: -135 }, floors: 8, category: 'Everyday' },
  { id: 'barber_salon', name: 'Metro Barber & Hair Salon', coords: { x: 135, z: -80 }, floors: 8, category: 'Everyday' },
  { id: 'supermarket', name: 'SuperMart Grocery', coords: { x: -80, z: 24 }, floors: 8, category: 'Everyday' }
];

export const OPERATIONAL_VEHICLES = [
  { id: 'taxi_1', name: 'City Taxi Cab #1', location: 'Town Hall Taxi Stand (-14, 1.5)' },
  { id: 'taxi_2', name: 'City Taxi Cab #2', location: 'Town Hall Taxi Stand (-14, 9.0)' },
  { id: 'police_1', name: 'Police Cruiser #1', location: 'Police Headquarters (-25, -58.5)' },
  { id: 'fire_1', name: 'Fire Engine #1', location: 'Fire Station #1 (25, -58.5)' },
  { id: 'ambulance_1', name: 'Emergency Ambulance', location: 'Metro Central Hospital (80, -58.5)' },
  { id: 'sky_hawk', name: 'Sky-Hawk Rooftop Helicopter', location: 'Topmost Rooftop Helipads (8F)' }
];

export const DEFAULT_MISSIONS = [
  {
    missionId: 'splat_10',
    title: 'Arena Sharpshooter',
    description: 'Tag 10 Red AI Bots in the Outskirts Paintball Arena.',
    targetValue: 10,
    rewardXp: 200,
    rewardCoins: 120
  },
  {
    missionId: 'rooftop_goal_3',
    title: 'Violet Terrace Striker',
    description: 'Score 3 goals on the Violet Tower Rooftop Football Ground.',
    targetValue: 3,
    rewardXp: 180,
    rewardCoins: 100
  },
  {
    missionId: 'arcade_500',
    title: '7th Floor Arcade Wizard',
    description: 'Score 500+ points on any 7th Floor Neon Arcade cabinet.',
    targetValue: 500,
    rewardXp: 150,
    rewardCoins: 90
  },
  {
    missionId: 'pilot_chopper',
    title: 'Sky-Hawk Aviator',
    description: 'Take off in the Sky-Hawk Helicopter from a topmost rooftop helipad.',
    targetValue: 1,
    rewardXp: 120,
    rewardCoins: 80
  }
];
