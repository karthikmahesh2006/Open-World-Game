const mongoose = require('mongoose');
const { MONGODB_URI } = require('./env');

let isConnected = false;

async function connectDatabase() {
  if (!process.env.MONGODB_URI) {
    console.log('[Database] No MONGODB_URI set — running with fast in-memory store.');
    return false;
  }
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 3500 });
    isConnected = true;
    console.log('[Database] Connected to MongoDB successfully.');
    return true;
  } catch (err) {
    console.warn('[Database] MongoDB unavailable, using in-memory fallback:', err.message);
    isConnected = false;
    return false;
  }
}

function getDbStatus() {
  return isConnected;
}

module.exports = { connectDatabase, getDbStatus };
