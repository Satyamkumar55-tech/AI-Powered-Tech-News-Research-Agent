'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const reportsRouter = require('./src/routes/reports');
const articlesRouter = require('./src/routes/articles');
const analyticsRouter = require('./src/routes/analytics');

// Import scheduler
const scheduler = require('./src/scheduler');

// Import DB to force initialization on startup
const db = require('./src/database');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const statusIcon = status >= 400 ? '✗' : '✓';
    console.log(`[API] ${statusIcon} ${req.method} ${req.path} → ${status} (${duration}ms)`);
  });
  next();
});

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use('/api/reports', reportsRouter);
app.use('/api/articles', articlesRouter);
app.use('/api/analytics', analyticsRouter.stack ? analyticsRouter : require('./src/routes/analytics'));

// Mount dashboard at /api/dashboard using the same analytics router
// The analytics router handles both /api/analytics and /api/dashboard
app.get('/api/dashboard', (req, res) => {
  const db = require('./src/database');
  try {
    const summary = db.getDashboardSummary();
    res.json({ success: true, data: summary });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard data' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbInstance = require('./src/database');
  res.json({
    success: true,
    status: 'online',
    timestamp: new Date().toISOString(),
    database: {
      articles: dbInstance.getArticleCount(),
      reports: dbInstance.getReportCount(),
    },
    schedule: process.env.REPORT_GENERATION_SCHEDULE || '0 * * * *',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.message);
  res.status(500).json({ success: false, error: 'Internal server error', message: err.message });
});

// ─── Start Server ─────────────────────────────────────────────────────────────

async function startServer() {
  try {
    // Initialize database first (async operation)
    await db.initializeDatabase();
    console.log('[Startup] Database initialized');

    app.listen(PORT, () => {
      console.log('\n╔══════════════════════════════════════════════════════════╗');
      console.log('║         TechPulse AI — Backend Server                   ║');
      console.log('╠══════════════════════════════════════════════════════════╣');
      console.log(`║  Server running on: http://localhost:${PORT}              ║`);
      console.log(`║  Schedule: ${(process.env.REPORT_GENERATION_SCHEDULE || '0 * * * *').padEnd(46)}║`);
      console.log(`║  Database: ${(process.env.DB_PATH || './data/techpulse.db').padEnd(46)}║`);
      console.log('╚══════════════════════════════════════════════════════════╝\n');

      // Start the scheduler (will also generate initial report if DB is empty)
      scheduler.start().catch((err) => {
        console.error('[Startup] Scheduler failed to start:', err.message);
      });
    });
  } catch (err) {
    console.error('[Startup] Failed to initialize database:', err);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[Server] Shutting down gracefully...');
  scheduler.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n[Server] SIGTERM received. Shutting down...');
  scheduler.stop();
  process.exit(0);
});

module.exports = app;
