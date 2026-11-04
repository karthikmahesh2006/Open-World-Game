const path = require('path');
const fs = require('fs');
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

// Serve built React frontend (frontend/dist) in production deployments
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

app.use(notFoundHandler);
app.use(globalErrorHandler);

async function startServer() {
  await connectDatabase();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Blocky Metro Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = app;
