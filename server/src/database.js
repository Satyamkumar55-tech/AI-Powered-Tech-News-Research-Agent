'use strict';

const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || './data/techpulse.db';

// Ensure the data directory exists
const dbDir = path.dirname(path.resolve(DB_PATH));
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let db = null;
let SQL = null;

async function initializeSQL() {
  if (!SQL) {
    SQL = await initSqlJs();
  }
  return SQL;
}

function saveDbToFile() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(path.resolve(DB_PATH), buffer);
  }
}

function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

async function initializeDatabase() {
  if (db) return db;
  
  await initializeSQL();
  
  const dbPath = path.resolve(DB_PATH);
  let data;
  
  // Load existing database or create new one
  if (fs.existsSync(dbPath)) {
    data = fs.readFileSync(dbPath);
    db = new SQL.Database(data);
  } else {
    db = new SQL.Database();
  }
  
  initSchema();
  saveDbToFile();
  return db;
}

function initSchema() {
  const database = getDb();

  try {
    // Articles table
    database.run(`
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
    database.run(`
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
    database.run(`
      CREATE TABLE IF NOT EXISTS report_articles (
        report_id TEXT NOT NULL,
        article_id TEXT NOT NULL,
        PRIMARY KEY (report_id, article_id),
        FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
        FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
      );
    `);

    // Analytics/stats table for quick lookups
    database.run(`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_type TEXT NOT NULL,
        event_data TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );
    `);

    console.log('[DB] Schema initialized successfully');
  } catch (err) {
    // Table might already exist, silently continue
    console.log('[DB] Schema tables may already exist:', err.message);
  }
}

// ─── Article Operations ───────────────────────────────────────────────────────

function insertArticle(article) {
  const db = getDb();
  try {
    db.run(`
      INSERT OR IGNORE INTO articles 
        (id, title, source, url, category, published_at, summary, content, importance_score, author, read_time, why_it_matters)
      VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      article.id,
      article.title,
      article.source,
      article.url,
      article.category,
      article.publishedAt,
      article.summary || '',
      article.content || '',
      article.importanceScore || 5.0,
      article.author || '',
      article.readTime || '',
      article.whyItMatters || ''
    ]);
    saveDbToFile();
    return { changes: 1 };
  } catch (err) {
    console.error('Error inserting article:', err);
    return { changes: 0 };
  }
}

function insertArticles(articles) {
  const db = getDb();
  let inserted = 0;
  try {
    for (const art of articles) {
      db.run(`
        INSERT OR IGNORE INTO articles 
          (id, title, source, url, category, published_at, summary, content, importance_score, author, read_time, why_it_matters)
        VALUES 
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        art.id,
        art.title,
        art.source,
        art.url,
        art.category,
        art.publishedAt,
        art.summary || '',
        art.content || '',
        art.importanceScore || 5.0,
        art.author || '',
        art.readTime || '',
        art.whyItMatters || ''
      ]);
      inserted++;
    }
    saveDbToFile();
  } catch (err) {
    console.error('Error inserting articles:', err);
  }
  return inserted;
}

function getAllArticles({ limit = 100, offset = 0 } = {}) {
  const db = getDb();
  const stmt = `
    SELECT * FROM articles 
    ORDER BY published_at DESC 
    LIMIT ? OFFSET ?
  `;
  const results = db.exec(stmt, [limit, offset]);
  if (results.length === 0) return [];
  
  const columns = results[0].columns;
  return results[0].values.map(row => {
    const obj = {};
    columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return rowToArticle(obj);
  });
}

function getTopArticles(limit = 10) {
  const db = getDb();
  const stmt = `
    SELECT * FROM articles 
    ORDER BY importance_score DESC, published_at DESC 
    LIMIT ?
  `;
  const results = db.exec(stmt, [limit]);
  if (results.length === 0) return [];
  
  const columns = results[0].columns;
  return results[0].values.map(row => {
    const obj = {};
    columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return rowToArticle(obj);
  });
}

function getArticlesByCategory(category, limit = 50) {
  const db = getDb();
  const stmt = `
    SELECT * FROM articles 
    WHERE category = ?
    ORDER BY published_at DESC 
    LIMIT ?
  `;
  const results = db.exec(stmt, [category, limit]);
  if (results.length === 0) return [];
  
  const columns = results[0].columns;
  return results[0].values.map(row => {
    const obj = {};
    columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return rowToArticle(obj);
  });
}

function getArticleById(id) {
  const db = getDb();
  const stmt = 'SELECT * FROM articles WHERE id = ?';
  const results = db.exec(stmt, [id]);
  if (results.length === 0 || results[0].values.length === 0) return null;
  
  const columns = results[0].columns;
  const row = results[0].values[0];
  const obj = {};
  columns.forEach((col, idx) => {
    obj[col] = row[idx];
  });
  return rowToArticle(obj);
}

function getArticleCount() {
  const db = getDb();
  const results = db.exec('SELECT COUNT(*) as count FROM articles');
  if (results.length === 0 || results[0].values.length === 0) return 0;
  return results[0].values[0][0];
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
  try {
    db.run(`
      INSERT OR IGNORE INTO reports 
        (id, title, date, generated_at, summary, insights, takeaways, why_it_matters, article_ids)
      VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      report.id,
      report.title,
      report.date,
      report.generatedAt,
      report.summary || '',
      JSON.stringify(report.insights || []),
      JSON.stringify(report.takeaways || []),
      report.whyItMatters || '',
      JSON.stringify(report.articleIds || [])
    ]);

    // Insert report-article junctions
    if (report.articleIds && report.articleIds.length > 0) {
      for (const artId of report.articleIds) {
        db.run(`
          INSERT OR IGNORE INTO report_articles (report_id, article_id) VALUES (?, ?)
        `, [report.id, artId]);
      }
    }
    
    saveDbToFile();
    return { changes: 1 };
  } catch (err) {
    console.error('Error inserting report:', err);
    return { changes: 0 };
  }
}

function getAllReports({ limit = 50, offset = 0 } = {}) {
  const db = getDb();
  const stmt = `
    SELECT * FROM reports 
    ORDER BY generated_at DESC 
    LIMIT ? OFFSET ?
  `;
  const results = db.exec(stmt, [limit, offset]);
  if (results.length === 0) return [];
  
  const columns = results[0].columns;
  return results[0].values.map(row => {
    const obj = {};
    columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return rowToReport(obj);
  });
}

function getLatestReport() {
  const db = getDb();
  const stmt = `
    SELECT * FROM reports 
    ORDER BY generated_at DESC 
    LIMIT 1
  `;
  const results = db.exec(stmt);
  if (results.length === 0 || results[0].values.length === 0) return null;
  
  const columns = results[0].columns;
  const row = results[0].values[0];
  const obj = {};
  columns.forEach((col, idx) => {
    obj[col] = row[idx];
  });
  return rowToReport(obj);
}

function getReportById(id) {
  const db = getDb();
  const stmt = 'SELECT * FROM reports WHERE id = ?';
  const results = db.exec(stmt, [id]);
  if (results.length === 0 || results[0].values.length === 0) return null;
  
  const columns = results[0].columns;
  const row = results[0].values[0];
  const obj = {};
  columns.forEach((col, idx) => {
    obj[col] = row[idx];
  });
  return rowToReport(obj);
}

function getReportCount() {
  const db = getDb();
  const results = db.exec('SELECT COUNT(*) as count FROM reports');
  if (results.length === 0 || results[0].values.length === 0) return 0;
  return results[0].values[0][0];
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

function execQuery(sql, params = []) {
  const db = getDb();
  try {
    const results = db.exec(sql, params);
    if (results.length === 0) return [];
    
    const columns = results[0].columns;
    return results[0].values.map(row => {
      const obj = {};
      columns.forEach((col, idx) => {
        obj[col] = row[idx];
      });
      return obj;
    });
  } catch (err) {
    console.error('Query error:', err);
    return [];
  }
}

function getAnalytics() {
  // Category distribution
  const categoryRows = execQuery(`
    SELECT category, COUNT(*) as count 
    FROM articles 
    GROUP BY category 
    ORDER BY count DESC
  `);

  // Source distribution
  const sourceRows = execQuery(`
    SELECT source, COUNT(*) as count 
    FROM articles 
    GROUP BY source 
    ORDER BY count DESC
  `);

  // Average importance score
  const avgScoreResult = execQuery(`
    SELECT AVG(importance_score) as avg FROM articles
  `);
  const avgScore = avgScoreResult.length > 0 ? (avgScoreResult[0].avg || 0) : 0;

  // Top category
  const topCategory = categoryRows.length > 0 ? categoryRows[0].category : 'N/A';

  // Total counts
  const articleCount = getArticleCount();
  const reportCount = getReportCount();

  // Most important article
  const topArticleRows = execQuery(`
    SELECT * FROM articles ORDER BY importance_score DESC LIMIT 1
  `);
  const topArticleRow = topArticleRows.length > 0 ? topArticleRows[0] : null;

  // Recent report generation times (last 7 reports for trend data)
  const recentReports = execQuery(`
    SELECT id, title, date, generated_at FROM reports 
    ORDER BY generated_at DESC 
    LIMIT 7
  `);

  // Score trend (last 7 days average score)
  const scoreTrend = execQuery(`
    SELECT 
      date(published_at) as day,
      AVG(importance_score) as avg_score,
      COUNT(*) as count
    FROM articles 
    WHERE published_at >= date('now', '-7 days')
    GROUP BY date(published_at)
    ORDER BY day ASC
  `);

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
  const latestReport = getLatestReport();
  const articleCount = getArticleCount();
  const reportCount = getReportCount();

  // Category distribution
  const categoryRows = execQuery(`
    SELECT category, COUNT(*) as count 
    FROM articles 
    GROUP BY category 
    ORDER BY count DESC
  `);

  const topCategory = categoryRows.length > 0 ? categoryRows[0].category : 'N/A';
  const topCategoryCount = categoryRows.length > 0 ? categoryRows[0].count : 0;

  // Most important article overall
  const topArticleRows = execQuery(`
    SELECT * FROM articles ORDER BY importance_score DESC LIMIT 1
  `);
  const topArticleRow = topArticleRows.length > 0 ? topArticleRows[0] : null;

  // Avg score
  const avgScoreResult = execQuery(`
    SELECT AVG(importance_score) as avg FROM articles
  `);
  const avgScore = avgScoreResult.length > 0 ? (avgScoreResult[0].avg || 0) : 0;

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
  initializeDatabase,
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
