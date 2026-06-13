'use strict';

const Parser = require('rss-parser');
const axios = require('axios');
const crypto = require('crypto');

const parser = new Parser({
  timeout: 10000,
  customFields: {
    item: ['media:content', 'media:thumbnail', 'content:encoded'],
  },
});

// ─── Category + Scoring Configuration ────────────────────────────────────────

const CATEGORY_KEYWORDS = {
  'AI': ['artificial intelligence', 'machine learning', 'deep learning', 'neural', 'openai', 'chatgpt', 'gpt', 'llm', 'claude', 'anthropic', 'gemini', 'ai model', 'generative', 'agi', 'language model', 'transformer', 'diffusion', 'stable diffusion', 'midjourney', 'copilot', 'ai agent', 'autonomous ai'],
  'Cybersecurity': ['security', 'vulnerability', 'hack', 'breach', 'malware', 'ransomware', 'phishing', 'zero-day', 'exploit', 'cve', 'threat', 'attack', 'cybersecurity', 'infosec', 'patch', 'firewall', 'encryption', 'ddos', 'botnet'],
  'Startups': ['startup', 'funding', 'venture capital', 'vc', 'seed round', 'series a', 'series b', 'acquisition', 'ipo', 'unicorn', 'valuation', 'investor', 'y combinator', 'a16z', 'sequoia', 'techstars', 'raise', 'investment', 'fundraise'],
  'Cloud Computing': ['cloud', 'aws', 'azure', 'google cloud', 'kubernetes', 'docker', 'serverless', 'container', 'devops', 'infrastructure', 'saas', 'paas', 'iaas', 'microservice', 'api gateway', 'lambda', 'ec2', 'gcp'],
  'Software Development': ['software', 'developer', 'programming', 'open source', 'github', 'javascript', 'typescript', 'python', 'rust', 'golang', 'framework', 'library', 'ide', 'compiler', 'sdk', 'api', 'code', 'frontend', 'backend'],
};

const IMPORTANCE_KEYWORDS = {
  high: ['critical', 'major', 'breakthrough', 'revolutionary', 'significant', 'historic', 'emergency', 'zero-day', 'acquisition', 'ipo', '$1b', '$500m', '$100m', 'shutdown', 'ban', 'regulation', 'gpt-5', 'gpt5'],
  medium: ['new', 'launch', 'release', 'update', 'feature', 'partnership', 'funding', 'growth', 'expand', 'announce', 'introduce'],
  low: ['tips', 'how to', 'guide', 'tutorial', 'opinion', 'review', 'analysis'],
};

// ─── News Sources ─────────────────────────────────────────────────────────────

const RSS_SOURCES = [
  {
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    type: 'rss',
  },
  {
    name: 'OpenAI Blog',
    url: 'https://openai.com/blog/rss.xml',
    type: 'rss',
  },
  {
    name: 'The Verge',
    url: 'https://www.theverge.com/rss/index.xml',
    type: 'rss',
  },
];

// ─── Helper Functions ─────────────────────────────────────────────────────────

function generateArticleId(url) {
  return 'art-' + crypto.createHash('md5').update(url).digest('hex').slice(0, 10);
}

function detectCategory(text) {
  const lowerText = text.toLowerCase();
  let bestCategory = 'Software Development';
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        score++;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }
  return bestCategory;
}

function calculateImportanceScore(title, summary) {
  const text = `${title} ${summary}`.toLowerCase();
  let score = 5.0; // Base score

  // High importance keyword boost
  for (const keyword of IMPORTANCE_KEYWORDS.high) {
    if (text.includes(keyword)) {
      score += 1.2;
    }
  }

  // Medium importance keyword boost
  for (const keyword of IMPORTANCE_KEYWORDS.medium) {
    if (text.includes(keyword)) {
      score += 0.4;
    }
  }

  // Low importance slight penalty
  for (const keyword of IMPORTANCE_KEYWORDS.low) {
    if (text.includes(keyword)) {
      score -= 0.3;
    }
  }

  // Dollar amount boosts (funding/acquisition signals)
  const dollarMatch = text.match(/\$(\d+(?:\.\d+)?)\s*(billion|million|b|m)\b/i);
  if (dollarMatch) {
    const amount = parseFloat(dollarMatch[1]);
    const unit = dollarMatch[2].toLowerCase();
    if (unit === 'billion' || unit === 'b') {
      score += Math.min(amount * 0.5, 2.0);
    } else {
      score += Math.min(amount * 0.01, 1.5);
    }
  }

  // Clamp to 1.0 - 10.0
  return parseFloat(Math.min(10.0, Math.max(1.0, score)).toFixed(1));
}

function generateSummary(title, description) {
  // Use the description if available, otherwise create a summary from title
  if (description && description.length > 20) {
    // Strip HTML tags
    const stripped = description.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    return stripped.length > 400 ? stripped.slice(0, 397) + '...' : stripped;
  }
  return `${title} — This article covers the latest developments in technology.`;
}

function generateWhyItMatters(category, title) {
  const categoryInsights = {
    'AI': `This AI development could reshape how organizations adopt and deploy artificial intelligence in their workflows.`,
    'Cybersecurity': `Security vulnerabilities of this nature can impact millions of users and organizations. Immediate awareness and action are critical.`,
    'Startups': `This funding or acquisition event signals investor confidence and could accelerate innovation in this sector.`,
    'Cloud Computing': `Cloud infrastructure improvements directly impact the cost, performance, and reliability of applications used by millions.`,
    'Software Development': `Developer tooling advancements improve productivity and software quality across the entire industry.`,
  };
  return categoryInsights[category] || `This technology development has significant implications for the industry and could drive important changes ahead.`;
}

// ─── RSS Feed Fetchers ────────────────────────────────────────────────────────

async function fetchRSSFeed(source) {
  try {
    console.log(`[RSS] Fetching: ${source.name} (${source.url})`);
    const feed = await parser.parseURL(source.url);

    const articles = (feed.items || []).slice(0, 15).map((item) => {
      const url = item.link || item.guid || '';
      const title = item.title || 'Untitled';
      const description = item.contentSnippet || item.content || item.summary || '';
      const pubDate = item.pubDate || item.isoDate || new Date().toISOString();
      const category = detectCategory(`${title} ${description}`);
      const importanceScore = calculateImportanceScore(title, description);
      const summary = generateSummary(title, description);

      return {
        id: generateArticleId(url),
        title: title.trim(),
        source: source.name,
        url,
        category,
        publishedAt: new Date(pubDate).toISOString(),
        summary,
        content: summary, // Use summary as content for RSS (full content not always available)
        importanceScore,
        author: item.creator || item.author || 'Staff',
        readTime: `${Math.max(2, Math.ceil(summary.length / 1000))} min read`,
        whyItMatters: generateWhyItMatters(category, title),
      };
    });

    console.log(`[RSS] ${source.name}: fetched ${articles.length} articles`);
    return articles;
  } catch (err) {
    console.error(`[RSS] Failed to fetch ${source.name}: ${err.message}`);
    return []; // Gracefully skip failed sources
  }
}

async function fetchHackerNews() {
  try {
    console.log('[HN] Fetching top stories from Hacker News API');

    // Get top story IDs
    const topResponse = await axios.get('https://hacker-news.firebaseio.com/v0/topstories.json', {
      timeout: 8000,
    });

    const storyIds = (topResponse.data || []).slice(0, 20); // Top 20 stories

    // Fetch individual stories in parallel (with concurrency limit)
    const storyPromises = storyIds.map((id) =>
      axios
        .get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, { timeout: 5000 })
        .then((r) => r.data)
        .catch(() => null)
    );

    const stories = await Promise.all(storyPromises);

    const articles = stories
      .filter((story) => story && story.url && story.title && story.type === 'story')
      .map((story) => {
        const url = story.url;
        const title = story.title || 'Untitled';
        const pubDate = new Date(story.time * 1000).toISOString();
        const category = detectCategory(title);
        const importanceScore = calculateImportanceScore(title, '');
        const summary = generateSummary(title, story.text || '');

        return {
          id: generateArticleId(url),
          title: title.trim(),
          source: 'Hacker News',
          url,
          category,
          publishedAt: pubDate,
          summary,
          content: summary,
          importanceScore: Math.min(importanceScore + (story.score ? Math.log10(story.score + 1) * 0.5 : 0), 10.0),
          author: story.by || 'HN Community',
          readTime: '3 min read',
          whyItMatters: generateWhyItMatters(category, title),
        };
      });

    console.log(`[HN] Fetched ${articles.length} articles from Hacker News`);
    return articles;
  } catch (err) {
    console.error(`[HN] Failed to fetch Hacker News: ${err.message}`);
    return [];
  }
}

// ─── Main Fetch Function ──────────────────────────────────────────────────────

async function fetchAllSources() {
  console.log('[RSS Service] Starting fetch from all sources...');

  // Fetch all sources in parallel
  const [techCrunch, openAI, theVerge, hackerNews] = await Promise.all([
    fetchRSSFeed(RSS_SOURCES[0]),
    fetchRSSFeed(RSS_SOURCES[1]),
    fetchRSSFeed(RSS_SOURCES[2]),
    fetchHackerNews(),
  ]);

  // Combine all articles
  let allArticles = [...techCrunch, ...openAI, ...theVerge, ...hackerNews];

  // Deduplicate by URL
  const seenUrls = new Set();
  const seenTitles = new Set();
  allArticles = allArticles.filter((art) => {
    const normalizedTitle = art.title.toLowerCase().slice(0, 60);
    if (!art.url || seenUrls.has(art.url) || seenTitles.has(normalizedTitle)) {
      return false;
    }
    seenUrls.add(art.url);
    seenTitles.add(normalizedTitle);
    return true;
  });

  // Sort by publish date (newest first)
  allArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  // Keep the 50 most recent (to have more than enough for reports)
  allArticles = allArticles.slice(0, 50);

  console.log(`[RSS Service] Total unique articles fetched: ${allArticles.length}`);
  return allArticles;
}

module.exports = {
  fetchAllSources,
  detectCategory,
  calculateImportanceScore,
};
