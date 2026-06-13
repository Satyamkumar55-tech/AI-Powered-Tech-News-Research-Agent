import { articleService } from './articleService';
import { trendingTopics } from '../data/categories';

class AIService {
  answerUserQuestion(query) {
    const lowercaseQuery = query.toLowerCase();
    const articles = articleService.getArticles();
    
    if (lowercaseQuery.includes("summarize") || lowercaseQuery.includes("gpt-5") || lowercaseQuery.includes("openai")) {
      const art = articles.find(a => a.id === "art-1") || articles[0];
      return `Here is an AI executive summary for **${art.title}**:\n\n* **What happened**: OpenAI released a private developer beta of GPT-5.\n* **Key Features**: Supports advanced multimodal reasoning, active problem-solving (multi-step planning), and decreases API pricing by 50%.\n* **Why it matters**: This model enables the building of autonomous agentic pipelines that can self-correct, dramatically lowering the cost of deploying enterprise-grade agents.`;
    }
    
    if (lowercaseQuery.includes("cybersecurity") || lowercaseQuery.includes("vulnerability") || lowercaseQuery.includes("linux") || lowercaseQuery.includes("netcollide")) {
      return `Security Alert regarding **NetCollide (CVE-2026-44021)**:\n\n* **Severity**: Critical (9.2 Importance Score).\n* **Vulnerability Type**: Remote Code Execution (RCE) via a buffer overflow in the Linux kernel network stack (IPv6 packets).\n* **Impact**: Unauthenticated attackers can execute arbitrary code with full root access.\n* **Recommendation**: Major Linux vendors (RedHat, Debian, Ubuntu) have released patches. Apply updates immediately, or disable IPv6 processing as a temporary bypass.`;
    }

    if (lowercaseQuery.includes("recommend") || lowercaseQuery.includes("suggest") || lowercaseQuery.includes("reading")) {
      return this.recommendArticles();
    }

    if (lowercaseQuery.includes("trend") || lowercaseQuery.includes("insights") || lowercaseQuery.includes("what's hot")) {
      const topTrends = trendingTopics.slice(0, 3);
      let res = `Currently, the top trending topics are:\n\n`;
      topTrends.forEach(t => {
        res += `* **${t.name} (${t.change})**: Score ${t.score}, trending ${t.trend}.\n`;
      });
      res += `\nWould you like to read the top articles for any of these?`;
      return res;
    }

    // Default fallback response
    return `I am the TechPulse AI Research Assistant. I can help you with:\n\n* Summarizing specific articles (e.g. "Summarize GPT-5")\n* Explaining recent security vulnerabilities (e.g. "Tell me about the Linux zero-day")\n* Recommending articles based on score (e.g. "Recommend articles")\n* Outlining current industry trends (e.g. "Show me trends")\n\nHow can I help you research today?`;
  }

  summarizeArticle(articleId) {
    const articles = articleService.getArticles();
    const art = articles.find(a => a.id === articleId);
    if (!art) return "Article not found.";
    return `Summary for **${art.title}**:\n\n${art.summary}\n\n**Why it matters:** ${art.whyItMatters}`;
  }

  recommendArticles() {
    const highScores = articleService.getTopArticles(3);
    if (highScores.length === 0) return "No articles available.";
    
    let res = `Based on your profile, here are the top ${highScores.length} recommended articles today:\n\n`;
    highScores.forEach((art, i) => {
      res += `${i + 1}. **${art.title}** (Score: ${art.importanceScore}/10) - *${art.source}*\n`;
    });
    res += `\nWould you like me to summarize any of these for you?`;
    return res;
  }
}

export const aiService = new AIService();
