const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { PORT, CORS_ORIGIN } = require('./config/env');
const { connectDatabase, getDbStatus } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const progressRoutes = require('./routes/progressRoutes');
const missionRoutes = require('./routes/missionRoutes');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorMiddleware');

const app = express();

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Blocky Metro Open-World API',
    databaseConnected: getDbStatus(),
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/missions', missionRoutes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

async function startServer() {
  await connectDatabase();
  app.listen(PORT, () => {
    console.log(`[Server] Blocky Metro Backend API running on http://localhost:${PORT}`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = app;
