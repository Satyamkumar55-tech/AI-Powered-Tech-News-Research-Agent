'use strict';

const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /api/articles — All articles, newest first
router.get('/', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    const articles = db.getAllArticles({ limit, offset });
    res.json({ success: true, count: articles.length, data: articles });
  } catch (err) {
    console.error('[API /articles] Error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch articles', message: err.message });
  }
});

// GET /api/articles/top — Top articles by importance score
router.get('/top', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const articles = db.getTopArticles(limit);
    res.json({ success: true, count: articles.length, data: articles });
  } catch (err) {
    console.error('[API /articles/top] Error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch top articles', message: err.message });
  }
});

// GET /api/articles/category/:category — Articles by category
router.get('/category/:category', (req, res) => {
  try {
    const { category } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const articles = db.getArticlesByCategory(category, limit);
    res.json({ success: true, count: articles.length, category, data: articles });
  } catch (err) {
    console.error(`[API /articles/category/${req.params.category}] Error:`, err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch articles by category', message: err.message });
  }
});

// GET /api/articles/:id — Single article by ID
router.get('/:id', (req, res) => {
  try {
    const article = db.getArticleById(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, error: `Article '${req.params.id}' not found` });
    }
    res.json({ success: true, data: article });
  } catch (err) {
    console.error(`[API /articles/${req.params.id}] Error:`, err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch article', message: err.message });
  }
});

module.exports = router;
