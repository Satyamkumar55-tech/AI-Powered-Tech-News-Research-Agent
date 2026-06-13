'use strict';

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || './data/techpulse.db';

// Ensure the data directory exists
const dbDir = path.dirname(path.resolve(DB_PATH));
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let db;

function getDb() {
  if (!db) {
    db = new Database(path.resolve(DB_PATH));
    db.pragma('journal_mode = WAL'); // Better concurrent read performance
    db.pragma('foreign_keys = ON');
    initSchema();
  }
  return db;
}

function initSchema() {
  const database = db;

  // Articles table
  database.exec(`
    CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      source TEXT NOT NULL,
      url TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      published_at TEXT NOT NULL,
      summary TEXT,
      content TEXT,
      importance_score REAL DEFAULT 5.0,
      author TEXT,
      read_time TEXT,
      why_it_matters TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Reports table
  database.exec(`
    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      generated_at TEXT NOT NULL,
      summary TEXT,
      insights TEXT,
      takeaways TEXT,
      why_it_matters TEXT,
      article_ids TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Report-Article junction (optional for querying)
  database.exec(`
    CREATE TABLE IF NOT EXISTS report_articles (
      report_id TEXT NOT NULL,
      article_id TEXT NOT NULL,
      PRIMARY KEY (report_id, article_id),
      FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
      FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
    );
  `);

  // Analytics/stats table for quick lookups
  database.exec(`
    CREATE TABLE IF NOT EXISTS analytics_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL,
      event_data TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  console.log('[DB] Schema initialized successfully');
}

// ─── Article Operations ───────────────────────────────────────────────────────

function insertArticle(article) {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO articles 
      (id, title, source, url, category, published_at, summary, content, importance_score, author, read_time, why_it_matters)
    VALUES 
      (@id, @title, @source, @url, @category, @publishedAt, @summary, @content, @importanceScore, @author, @readTime, @whyItMatters)
  `);
  return stmt.run(article);
}

function insertArticles(articles) {
  const db = getDb();
  const insertMany = db.transaction((arts) => {
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO articles 
        (id, title, source, url, category, published_at, summary, content, importance_score, author, read_time, why_it_matters)
      VALUES 
        (@id, @title, @source, @url, @category, @publishedAt, @summary, @content, @importanceScore, @author, @readTime, @whyItMatters)
    `);
    let inserted = 0;
    for (const art of arts) {
      const result = stmt.run(art);
      inserted += result.changes;
    }
    return inserted;
  });
  return insertMany(articles);
}

function getAllArticles({ limit = 100, offset = 0 } = {}) {
  const db = getDb();
  const rows = db.prepare(`
    SELECT * FROM articles 
    ORDER BY published_at DESC 
    LIMIT ? OFFSET ?
  `).all(limit, offset);
  return rows.map(rowToArticle);
}

function getTopArticles(limit = 10) {
  const db = getDb();
  const rows = db.prepare(`
    SELECT * FROM articles 
    ORDER BY importance_score DESC, published_at DESC 
    LIMIT ?
  `).all(limit);
  return rows.map(rowToArticle);
}

function getArticlesByCategory(category, limit = 50) {
  const db = getDb();
  const rows = db.prepare(`
    SELECT * FROM articles 
    WHERE category = ?
    ORDER BY published_at DESC 
    LIMIT ?
  `).all(category, limit);
  return rows.map(rowToArticle);
}

function getArticleById(id) {
  const db = getDb();
  const row = db.prepare('SELECT * FROM articles WHERE id = ?').get(id);
  return row ? rowToArticle(row) : null;
}

function getArticleCount() {
  const db = getDb();
  return db.prepare('SELECT COUNT(*) as count FROM articles').get().count;
}

function rowToArticle(row) {
  return {
    id: row.id,
    title: row.title,
    source: row.source,
    url: row.url,
    category: row.category,
    publishedAt: row.published_at,
    pubDate: row.published_at, // alias for frontend compatibility
    summary: row.summary || '',
    content: row.content || '',
    importanceScore: row.importance_score,
    author: row.author || 'Staff',
    readTime: row.read_time || '3 min read',
    whyItMatters: row.why_it_matters || '',
    createdAt: row.created_at,
  };
}

// ─── Report Operations ────────────────────────────────────────────────────────

function insertReport(report) {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO reports 
      (id, title, date, generated_at, summary, insights, takeaways, why_it_matters, article_ids)
    VALUES 
      (@id, @title, @date, @generatedAt, @summary, @insights, @takeaways, @whyItMatters, @articleIds)
  `);

  const row = {
    ...report,
    insights: JSON.stringify(report.insights || []),
    takeaways: JSON.stringify(report.takeaways || []),
    articleIds: JSON.stringify(report.articleIds || []),
  };

  const result = stmt.run(row);

  // Insert report-article junctions
  if (result.changes > 0 && report.articleIds && report.articleIds.length > 0) {
    const junctionStmt = db.prepare(`
      INSERT OR IGNORE INTO report_articles (report_id, article_id) VALUES (?, ?)
    `);
    const insertJunctions = db.transaction(() => {
      for (const artId of report.articleIds) {
        junctionStmt.run(report.id, artId);
      }
    });
    insertJunctions();
  }

  return result;
}

function getAllReports({ limit = 50, offset = 0 } = {}) {
  const db = getDb();
  const rows = db.prepare(`
    SELECT * FROM reports 
    ORDER BY generated_at DESC 
    LIMIT ? OFFSET ?
  `).all(limit, offset);
  return rows.map(rowToReport);
}

function getLatestReport() {
  const db = getDb();
  const row = db.prepare(`
    SELECT * FROM reports 
    ORDER BY generated_at DESC 
    LIMIT 1
  `).get();
  return row ? rowToReport(row) : null;
}

function getReportById(id) {
  const db = getDb();
  const row = db.prepare('SELECT * FROM reports WHERE id = ?').get(id);
  return row ? rowToReport(row) : null;
}

function getReportCount() {
  const db = getDb();
  return db.prepare('SELECT COUNT(*) as count FROM reports').get().count;
}

function rowToReport(row) {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    generatedAt: row.generated_at,
    summary: row.summary || '',
    insights: JSON.parse(row.insights || '[]'),
    takeaways: JSON.parse(row.takeaways || '[]'),
    whyItMatters: row.why_it_matters || '',
    articleIds: JSON.parse(row.article_ids || '[]'),
    articles: [], // populated separately if needed
    createdAt: row.created_at,
  };
}

// ─── Analytics Operations ─────────────────────────────────────────────────────

function getAnalytics() {
  const db = getDb();

  // Category distribution
  const categoryRows = db.prepare(`
    SELECT category, COUNT(*) as count 
    FROM articles 
    GROUP BY category 
    ORDER BY count DESC
  `).all();

  // Source distribution
  const sourceRows = db.prepare(`
    SELECT source, COUNT(*) as count 
    FROM articles 
    GROUP BY source 
    ORDER BY count DESC
  `).all();

  // Average importance score
  const avgScore = db.prepare(`
    SELECT AVG(importance_score) as avg FROM articles
  `).get().avg || 0;

  // Top category
  const topCategory = categoryRows[0] ? categoryRows[0].category : 'N/A';

  // Total counts
  const articleCount = getArticleCount();
  const reportCount = getReportCount();

  // Most important article
  const topArticleRow = db.prepare(`
    SELECT * FROM articles ORDER BY importance_score DESC LIMIT 1
  `).get();

  // Recent report generation times (last 7 reports for trend data)
  const recentReports = db.prepare(`
    SELECT id, title, date, generated_at FROM reports 
    ORDER BY generated_at DESC 
    LIMIT 7
  `).all();

  // Score trend (last 7 days average score)
  const scoreTrend = db.prepare(`
    SELECT 
      date(published_at) as day,
      AVG(importance_score) as avg_score,
      COUNT(*) as count
    FROM articles 
    WHERE published_at >= date('now', '-7 days')
    GROUP BY date(published_at)
    ORDER BY day ASC
  `).all();

  return {
    articleCount,
    reportCount,
    avgImportanceScore: parseFloat(avgScore.toFixed(2)),
    topCategory,
    categoryDistribution: categoryRows,
    sourceDistribution: sourceRows,
    topArticle: topArticleRow ? rowToArticle(topArticleRow) : null,
    recentReports,
    scoreTrend,
  };
}

function getDashboardSummary() {
  const db = getDb();

  const latestReport = getLatestReport();
  const articleCount = getArticleCount();
  const reportCount = getReportCount();

  // Category distribution
  const categoryRows = db.prepare(`
    SELECT category, COUNT(*) as count 
    FROM articles 
    GROUP BY category 
    ORDER BY count DESC
  `).all();

  const topCategory = categoryRows[0] ? categoryRows[0].category : 'N/A';
  const topCategoryCount = categoryRows[0] ? categoryRows[0].count : 0;

  // Most important article overall
  const topArticleRow = db.prepare(`
    SELECT * FROM articles ORDER BY importance_score DESC LIMIT 1
  `).get();

  // Avg score
  const avgScore = db.prepare(`
    SELECT AVG(importance_score) as avg FROM articles
  `).get().avg || 0;

  return {
    latestReportTime: latestReport ? latestReport.generatedAt : null,
    latestReportTitle: latestReport ? latestReport.title : null,
    latestReportId: latestReport ? latestReport.id : null,
    reportCount,
    articleCount,
    topCategory,
    topCategoryCount,
    topArticle: topArticleRow ? rowToArticle(topArticleRow) : null,
    avgImportanceScore: parseFloat(avgScore.toFixed(1)),
    recentInsights: latestReport ? latestReport.insights.slice(0, 3) : [],
    categoryDistribution: categoryRows,
  };
}

module.exports = {
  getDb,
  // Articles
  insertArticle,
  insertArticles,
  getAllArticles,
  getTopArticles,
  getArticlesByCategory,
  getArticleById,
  getArticleCount,
  // Reports
  insertReport,
  getAllReports,
  getLatestReport,
  getReportById,
  getReportCount,
  // Analytics
  getAnalytics,
  getDashboardSummary,
};
