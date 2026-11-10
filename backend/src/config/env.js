const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/blocky_metro',
  JWT_SECRET: process.env.JWT_SECRET || 'blocky_metro_secret_key_2026',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*'
};
