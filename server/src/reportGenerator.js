'use strict';

const crypto = require('crypto');
const db = require('./database');
const { fetchAllSources } = require('./rssService');

// ─── Report Generation Logic ──────────────────────────────────────────────────

function generateExecutiveSummary(topArticles, allArticles) {
  const categoryBreakdown = {};
  allArticles.forEach((a) => {
    categoryBreakdown[a.category] = (categoryBreakdown[a.category] || 0) + 1;
  });

  const topCat = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0];
  const topCatName = topCat ? topCat[0] : 'Technology';

  const topTitles = topArticles.map((a) => a.title).slice(0, 3);
  const sourceList = [...new Set(allArticles.map((a) => a.source))].join(', ');

  return `This intelligence briefing covers ${allArticles.length} articles aggregated from ${sourceList}. ` +
    `The dominant category this cycle is ${topCatName} (${topCat ? topCat[1] : 0} stories). ` +
    `Top stories include: ${topTitles.join('; ')}. ` +
    `Our AI scoring system has identified the most critical developments for your review.`;
}

function generateInsights(topArticles, allArticles) {
  const insights = [];

  // Category trend insight
  const categoryBreakdown = {};
  allArticles.forEach((a) => {
    categoryBreakdown[a.category] = (categoryBreakdown[a.category] || 0) + 1;
  });
  const sortedCats = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1]);
  if (sortedCats[0]) {
    insights.push(`${sortedCats[0][0]} dominates this reporting cycle with ${sortedCats[0][1]} stories, ` +
      `representing ${Math.round((sortedCats[0][1] / allArticles.length) * 100)}% of all coverage.`);
  }

  // Top article insight
  if (topArticles[0]) {
    insights.push(`The highest-priority story — "${topArticles[0].title}" (Score: ${topArticles[0].importanceScore}/10) from ${topArticles[0].source} — ` +
      `demands immediate attention from decision makers.`);
  }

  // Second article insight
  if (topArticles[1]) {
    insights.push(`"${topArticles[1].title}" from ${topArticles[1].source} signals important movement in the ${topArticles[1].category} space.`);
  }

  // Source diversity insight
  const sources = [...new Set(allArticles.map((a) => a.source))];
  insights.push(`Intelligence gathered from ${sources.length} sources: ${sources.join(', ')}, providing broad market coverage.`);

  // Score distribution insight
  const highPriority = allArticles.filter((a) => a.importanceScore >= 7.5).length;
  if (highPriority > 0) {
    insights.push(`${highPriority} out of ${allArticles.length} articles scored above 7.5/10, indicating a high-signal news cycle.`);
  }

  return insights.slice(0, 5);
}

function generateTakeaways(topArticles) {
  return topArticles.map((art) => {
    const shortTitle = art.title.length > 60 ? art.title.slice(0, 57) + '...' : art.title;
    return `**${shortTitle}** (${art.source}, Score: ${art.importanceScore}/10): ${art.summary.slice(0, 200)}${art.summary.length > 200 ? '...' : ''}`;
  });
}

function generateWhyItMatters(topArticles, allArticles) {
  const categoryBreakdown = {};
  allArticles.forEach((a) => {
    categoryBreakdown[a.category] = (categoryBreakdown[a.category] || 0) + 1;
  });
  const sortedCats = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1]);
  const topCategories = sortedCats.slice(0, 3).map(([cat]) => cat).join(', ');

  const avgScore = allArticles.reduce((sum, a) => sum + a.importanceScore, 0) / (allArticles.length || 1);

  return `The current news cycle reveals a concentrated focus on ${topCategories}. ` +
    `With an average importance score of ${avgScore.toFixed(1)}/10 across ${allArticles.length} articles, ` +
    `this represents a ${avgScore >= 7 ? 'high-signal' : 'moderate-signal'} intelligence period. ` +
    `${topArticles[0] ? `The story requiring most immediate attention is "${topArticles[0].title}" — ` + topArticles[0].whyItMatters : ''} ` +
    `Technology leaders should prioritize reviewing the top-ranked stories and monitoring these trends closely over the next 24-48 hours.`;
}

function generateReportTitle(topArticles, allArticles) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  if (topArticles.length > 0) {
    const topCategory = topArticles[0].category;
    return `Tech Intelligence Briefing — ${dateStr} ${timeStr} (${topCategory} Focus)`;
  }

  return `Tech Intelligence Briefing — ${dateStr} ${timeStr}`;
}

// ─── Main Report Generator ────────────────────────────────────────────────────

async function generateReport() {
  console.log('\n[Report Generator] ─────────────────────────────────────');
  console.log('[Report Generator] Starting automated report generation...');

  try {
    // Step 1: Fetch latest articles from all sources
    let allArticles = await fetchAllSources();

    if (allArticles.length === 0) {
      console.warn('[Report Generator] No articles fetched. Aborting report generation.');
      return null;
    }

    // Step 2-3: Store articles to DB (deduplication handled by INSERT OR IGNORE)
    const insertedCount = db.insertArticles(allArticles);
    console.log(`[Report Generator] Inserted ${insertedCount} new articles into database`);

    // Step 4: Sort by publication date (already done in rssService)
    // Step 5: Keep the 10 most recent for report
    const recentArticles = allArticles.slice(0, 10);

    // Step 6: Rank by importance score
    const rankedArticles = [...recentArticles].sort((a, b) => b.importanceScore - a.importanceScore);

    // Step 7: Select top 3 most important
    const topArticles = rankedArticles.slice(0, 3);

    console.log('[Report Generator] Top 3 articles selected:');
    topArticles.forEach((a, i) => {
      console.log(`  ${i + 1}. [${a.importanceScore}/10] ${a.title.slice(0, 70)}`);
    });

    // Step 8: Generate report content
    const now = new Date();
    const reportId = 'rep-' + crypto.createHash('md5').update(now.toISOString()).digest('hex').slice(0, 10);

    const report = {
      id: reportId,
      title: generateReportTitle(topArticles, recentArticles),
      date: now.toISOString().split('T')[0],
      generatedAt: now.toISOString(),
      summary: generateExecutiveSummary(topArticles, recentArticles),
      insights: generateInsights(topArticles, recentArticles),
      takeaways: generateTakeaways(topArticles),
      whyItMatters: generateWhyItMatters(topArticles, recentArticles),
      articleIds: topArticles.map((a) => a.id),
    };

    // Step 9: Save report to DB
    const result = db.insertReport(report);
    if (result.changes > 0) {
      console.log(`[Report Generator] Report saved: ${reportId}`);
    } else {
      console.log(`[Report Generator] Report already exists or was not inserted`);
    }

    console.log('[Report Generator] Report generation complete ✓');
    console.log('[Report Generator] ─────────────────────────────────────\n');

    return report;
  } catch (err) {
    console.error('[Report Generator] ERROR:', err.message);
    console.error(err.stack);
    // Don't throw — keep server running, keep previous reports
    return null;
  }
}

module.exports = { generateReport };
