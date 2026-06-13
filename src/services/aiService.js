// AI Assistant service — works entirely from stored reports and articles.
// No n8n, no webhooks. Answers are generated from real backend data.

class AIService {
  constructor() {
    this._articles = [];
    this._reports = [];
    this._analytics = null;
  }

  // Called from AIChatAssistant after loading real data from backend
  setContext({ articles = [], reports = [], analytics = null }) {
    this._articles = articles;
    this._reports = reports;
    this._analytics = analytics;
  }

  answerUserQuestion(query) {
    const q = query.toLowerCase().trim();

    // ── Summarize / article-specific ──────────────────────────────────────
    if (q.includes('summarize') || q.includes('summary')) {
      return this._handleSummarize(query);
    }

    // ── Latest / top news ─────────────────────────────────────────────────
    if (q.includes('latest') || q.includes('today') || q.includes('recent')) {
      return this._handleLatestNews();
    }

    // ── Recommend articles ────────────────────────────────────────────────
    if (q.includes('recommend') || q.includes('suggest') || q.includes('best articles') || q.includes('top articles')) {
      return this._handleRecommendations();
    }

    // ── Trends / what's hot ───────────────────────────────────────────────
    if (q.includes('trend') || q.includes("what's hot") || q.includes('trending') || q.includes('insights')) {
      return this._handleTrends();
    }

    // ── Reports ───────────────────────────────────────────────────────────
    if (q.includes('report') || q.includes('briefing') || q.includes('intelligence')) {
      return this._handleReports();
    }

    // ── Security ─────────────────────────────────────────────────────────
    if (q.includes('security') || q.includes('vulnerability') || q.includes('hack') || q.includes('threat') || q.includes('breach')) {
      return this._handleCategorySearch('Cybersecurity');
    }

    // ── AI / ML ────────────────────────────────────────────────────────────
    if (q.includes('ai') || q.includes('openai') || q.includes('gpt') || q.includes('llm') || q.includes('claude') || q.includes('machine learning')) {
      return this._handleCategorySearch('AI');
    }

    // ── Startups / funding ────────────────────────────────────────────────
    if (q.includes('startup') || q.includes('funding') || q.includes('vc') || q.includes('acquisition') || q.includes('investment')) {
      return this._handleCategorySearch('Startups');
    }

    // ── Cloud ─────────────────────────────────────────────────────────────
    if (q.includes('cloud') || q.includes('aws') || q.includes('azure') || q.includes('kubernetes')) {
      return this._handleCategorySearch('Cloud Computing');
    }

    // ── Analytics / stats ─────────────────────────────────────────────────
    if (q.includes('analytics') || q.includes('stats') || q.includes('statistics') || q.includes('how many')) {
      return this._handleAnalytics();
    }

    // ── Default help response ─────────────────────────────────────────────
    return this._handleDefault();
  }

  _handleSummarize(query) {
    if (this._articles.length === 0) {
      return 'No articles are loaded yet. Please wait for the backend to fetch the latest news.';
    }

    // Try to find a specific article matching the query
    const q = query.toLowerCase();
    const match = this._articles.find((art) =>
      art.title.toLowerCase().split(' ').some((word) => word.length > 4 && q.includes(word))
    );

    const art = match || this._articles[0]; // Fallback to top article

    return `Here is an AI executive summary for **"${art.title}"**:\n\n` +
      `**Source:** ${art.source} | **Category:** ${art.category} | **Score:** ${art.importanceScore}/10\n\n` +
      `**Summary:** ${art.summary}\n\n` +
      `**Why It Matters:** ${art.whyItMatters || 'This story has significant implications for the technology sector.'}`;
  }

  _handleLatestNews() {
    if (this._articles.length === 0) {
      return 'No articles available yet. The backend may still be loading news from RSS feeds.';
    }

    const latest = this._articles.slice(0, 5);
    let res = `**Latest ${latest.length} Stories** (sorted by publication date):\n\n`;
    latest.forEach((art, i) => {
      const date = new Date(art.publishedAt || art.pubDate).toLocaleDateString();
      res += `${i + 1}. **${art.title}**\n   *${art.source}* · ${date} · Score: ${art.importanceScore}/10\n\n`;
    });
    res += `\nWould you like me to summarize any of these stories?`;
    return res;
  }

  _handleRecommendations() {
    if (this._articles.length === 0) {
      return 'No articles loaded yet. Please wait for the system to fetch the latest news.';
    }

    const top = [...this._articles]
      .sort((a, b) => b.importanceScore - a.importanceScore)
      .slice(0, 5);

    let res = `**Top ${top.length} Recommended Articles** (ranked by importance score):\n\n`;
    top.forEach((art, i) => {
      res += `${i + 1}. **${art.title}** (${art.importanceScore}/10)\n   *${art.source}* — ${art.category}\n\n`;
    });
    res += `Would you like me to summarize any of these?`;
    return res;
  }

  _handleTrends() {
    if (this._articles.length === 0) {
      return 'No trend data available yet. Please start the backend and wait for news to be fetched.';
    }

    // Build category counts
    const catCounts = {};
    this._articles.forEach((art) => {
      catCounts[art.category] = (catCounts[art.category] || 0) + 1;
    });

    const sortedCats = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);
    const avgScore = (this._articles.reduce((s, a) => s + a.importanceScore, 0) / this._articles.length).toFixed(1);

    let res = `**Current Technology Trend Analysis:**\n\n`;
    res += `**Average importance score across ${this._articles.length} articles:** ${avgScore}/10\n\n`;
    res += `**Top trending categories:**\n`;
    sortedCats.forEach(([cat, count], i) => {
      const pct = Math.round((count / this._articles.length) * 100);
      res += `${i + 1}. **${cat}** — ${count} stories (${pct}% of coverage)\n`;
    });

    if (this._reports.length > 0) {
      res += `\n**Latest Report Insight:** ${this._reports[0].insights?.[0] || 'See the AI Reports page for detailed analysis.'}`;
    }

    res += `\n\nWould you like to read articles in a specific category?`;
    return res;
  }

  _handleReports() {
    if (this._reports.length === 0) {
      return 'No intelligence reports have been generated yet. The first report will be created automatically when the backend starts.';
    }

    const latest = this._reports[0];
    let res = `**Latest Intelligence Briefing:**\n\n`;
    res += `📋 **${latest.title}**\n`;
    res += `Generated: ${new Date(latest.generatedAt).toLocaleString()}\n\n`;
    res += `**Executive Summary:** ${latest.summary?.slice(0, 300)}${latest.summary?.length > 300 ? '...' : ''}\n\n`;

    if (latest.insights && latest.insights.length > 0) {
      res += `**Key Insights:**\n`;
      latest.insights.slice(0, 2).forEach((ins) => {
        res += `• ${ins}\n`;
      });
    }

    res += `\n**Total reports stored:** ${this._reports.length}\n`;
    res += `\nVisit the **AI Reports** page to browse all ${this._reports.length} historical reports.`;
    return res;
  }

  _handleCategorySearch(category) {
    const catArticles = this._articles.filter((a) => a.category === category);

    if (catArticles.length === 0) {
      return `No ${category} articles are in the current dataset. The system monitors this category and will surface stories as they appear in RSS feeds.`;
    }

    const top = catArticles.sort((a, b) => b.importanceScore - a.importanceScore).slice(0, 4);
    let res = `**Top ${category} Stories** (${catArticles.length} total in database):\n\n`;
    top.forEach((art, i) => {
      res += `${i + 1}. **${art.title}**\n   *${art.source}* · Score: ${art.importanceScore}/10\n   ${art.summary?.slice(0, 120)}...\n\n`;
    });
    res += `Would you like me to summarize any of these?`;
    return res;
  }

  _handleAnalytics() {
    const a = this._analytics;
    if (!a) {
      return 'Analytics data is still loading. Please try again in a moment.';
    }

    let res = `**TechPulse Intelligence Platform — Stats:**\n\n`;
    res += `📰 **Total Articles Processed:** ${a.articleCount || this._articles.length}\n`;
    res += `📋 **Total Reports Generated:** ${a.reportCount || this._reports.length}\n`;
    res += `⭐ **Average Importance Score:** ${a.avgImportanceScore || 'N/A'}/10\n`;
    res += `🏆 **Top Category:** ${a.topCategory || 'N/A'}\n\n`;

    if (a.categoryDistribution && a.categoryDistribution.length > 0) {
      res += `**Category Breakdown:**\n`;
      a.categoryDistribution.slice(0, 5).forEach(({ category, count }) => {
        res += `  • ${category}: ${count} articles\n`;
      });
    }

    if (a.sourceDistribution && a.sourceDistribution.length > 0) {
      res += `\n**Source Breakdown:**\n`;
      a.sourceDistribution.slice(0, 4).forEach(({ source, count }) => {
        res += `  • ${source}: ${count} articles\n`;
      });
    }

    return res;
  }

  _handleDefault() {
    const articleCount = this._articles.length;
    const reportCount = this._reports.length;

    return `Hello! I am your **TechPulse AI Research Assistant**.\n\n` +
      `I have access to **${articleCount} articles** and **${reportCount} intelligence reports** from the backend.\n\n` +
      `Here is what I can help you with:\n\n` +
      `• **Summarize** — "Summarize the latest AI article"\n` +
      `• **Latest news** — "What are the latest stories today?"\n` +
      `• **Recommend** — "Recommend articles with high importance scores"\n` +
      `• **Trends** — "Show me current tech trends"\n` +
      `• **Category** — "Show me cybersecurity news"\n` +
      `• **Reports** — "Tell me about the latest briefing"\n` +
      `• **Analytics** — "Show me platform statistics"\n\n` +
      `How can I help you research today?`;
  }
}

export const aiService = new AIService();
