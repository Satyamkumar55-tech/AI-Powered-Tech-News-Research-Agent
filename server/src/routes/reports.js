'use strict';

const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /api/reports — All reports, newest first
router.get('/', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const reports = db.getAllReports({ limit, offset });

    // Enrich each report with its articles
    const enriched = reports.map((report) => {
      const articles = report.articleIds
        .map((id) => db.getArticleById(id))
        .filter(Boolean);
      return { ...report, articles };
    });

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (err) {
    console.error('[API /reports] Error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch reports', message: err.message });
  }
});

// GET /api/reports/latest — Newest report
router.get('/latest', (req, res) => {
  try {
    const report = db.getLatestReport();
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'No reports available yet',
        message: 'The system has not generated any reports yet. Please wait for the first scheduled report.',
      });
    }

    // Enrich with articles
    const articles = report.articleIds
      .map((id) => db.getArticleById(id))
      .filter(Boolean);

    res.json({ success: true, data: { ...report, articles } });
  } catch (err) {
    console.error('[API /reports/latest] Error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch latest report', message: err.message });
  }
});

// GET /api/reports/:id — Single report by ID
router.get('/:id', (req, res) => {
  try {
    const report = db.getReportById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, error: `Report '${req.params.id}' not found` });
    }

    // Enrich with articles
    const articles = report.articleIds
      .map((id) => db.getArticleById(id))
      .filter(Boolean);

    res.json({ success: true, data: { ...report, articles } });
  } catch (err) {
    console.error(`[API /reports/${req.params.id}] Error:`, err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch report', message: err.message });
  }
});

module.exports = router;
