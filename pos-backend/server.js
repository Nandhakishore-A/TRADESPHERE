const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('./config/db');
const { startExpirationWorker } = require('./services/expirationService');

// Route Handlers
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();

// Global Middleware
app.use(cors());
app.use(express.json());

// Root & Health Check Endpoints (Always responsive for Vercel, monitoring, and health probes)
app.get('/', (req, res) => {
  res.json({
    project: 'TradeSphere',
    tagline: 'Smart Stock Market & Portfolio Management Platform',
    status: 'online',
    version: '1.0.0',
    documentation: '/api/health',
    cloudDatabase: 'MongoDB Atlas',
  });
});

app.get('/api/health', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: isConnected ? 'connected' : 'offline_or_blocked_by_local_network',
    cloudAtlasTarget: 'cluster0.cf3gwld.mongodb.net',
    service: 'TradeSphere-Backend',
  });
});

// Database Connection Middleware for Serverless & Long-running instances with smart cooldown
let hasLoggedNetworkWarning = false;
let lastDbAttemptTime = 0;
const DB_RETRY_COOLDOWN_MS = 30000;

app.use(async (req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    req.dbConnected = true;
    return next();
  }

  const now = Date.now();
  if (now - lastDbAttemptTime < DB_RETRY_COOLDOWN_MS) {
    req.dbConnected = false;
    return next();
  }

  lastDbAttemptTime = now;
  try {
    await connectDB();
    req.dbConnected = true;
  } catch (err) {
    req.dbConnected = false;
    if (!hasLoggedNetworkWarning) {
      console.warn('⚠️ [TradeSphere] MongoDB Atlas port 27017 unreachable on this local network. Operating with resilient session mode.');
      hasLoggedNetworkWarning = true;
    }
  }
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/analytics', analyticsRoutes);

// Centralized 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.originalUrl}` });
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// Start Expiration Background Worker (Runs only in regular long-running Node processes, NOT on serverless)
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  startExpirationWorker(30000); // Check every 30s
}

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production' && require.main === module) {
  app.listen(PORT, () => {
    console.log(`[TradeSphere] Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
