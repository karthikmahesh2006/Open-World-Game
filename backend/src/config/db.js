const mongoose = require('mongoose');
const { MONGO_URI } = require('./env');

let isMongoConnected = false;

async function connectDatabase() {
  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });
    isMongoConnected = true;
    console.log(`[MongoDB] Connected: ${conn.connection.host}/${conn.connection.name}`);
    return true;
  } catch (err) {
    isMongoConnected = false;
    console.warn(`[MongoDB] Connection unavailable (${err.message}). Running with in-memory fallback store.`);
    return false;
  }
}

function getDbStatus() {
  return isMongoConnected && mongoose.connection.readyState === 1;
}

module.exports = { connectDatabase, getDbStatus };
