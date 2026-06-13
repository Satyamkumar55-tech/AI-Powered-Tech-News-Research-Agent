import { initialArticles } from '../data/articles';

class ArticleService {
  constructor() {
    this.articles = [...initialArticles];
  }

  getArticles() {
    return this.articles;
  }

  getTopArticles(limit = 3) {
    return [...this.articles]
      .sort((a, b) => b.importanceScore - a.importanceScore)
      .slice(0, limit);
  }

  getArticlesByCategory(articlesList = this.articles) {
    const counts = {};
    articlesList.forEach(art => {
      counts[art.category] = (counts[art.category] || 0) + 1;
    });
    return counts;
  }

  getArticleCount(articlesList = this.articles) {
    return articlesList.length;
  }

  getAvgImportanceScore(articlesList = this.articles) {
    if (articlesList.length === 0) return 0;
    const total = articlesList.reduce((sum, art) => sum + art.importanceScore, 0);
    return (total / articlesList.length).toFixed(1);
  }
}

export const articleService = new ArticleService();
