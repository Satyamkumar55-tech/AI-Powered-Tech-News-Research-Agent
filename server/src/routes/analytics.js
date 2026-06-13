'use strict';

const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /api/analytics — Full analytics dataset
router.get('/', (req, res) => {
  try {
    const analytics = db.getAnalytics();
    res.json({ success: true, data: analytics });
  } catch (err) {
    console.error('[API /analytics] Error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch analytics', message: err.message });
  }
});

// GET /api/dashboard — Dashboard summary data
router.get('/dashboard', (req, res) => {
  try {
    const summary = db.getDashboardSummary();
    res.json({ success: true, data: summary });
  } catch (err) {
    console.error('[API /dashboard] Error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch dashboard data', message: err.message });
  }
});

module.exports = router;
