import apiClient from './apiClient';

// articleService now fetches real data from the backend API.
// Keeps the same method signatures for full backward compatibility.

class ArticleService {
  async getArticles(limit = 100) {
    return apiClient.getArticles(limit);
  }

  async getTopArticles(limit = 3) {
    return apiClient.getTopArticles(limit);
  }

  async getArticlesByCategory(category, limit = 50) {
    if (!category || category === 'All') {
      return apiClient.getArticles(100);
    }
    return apiClient.getArticlesByCategory(category, limit);
  }

  // Utility helpers (operate on passed-in article arrays — same as before)
  getArticleCount(articlesList = []) {
    return articlesList.length;
  }

  getAvgImportanceScore(articlesList = []) {
    if (articlesList.length === 0) return 0;
    const total = articlesList.reduce((sum, art) => sum + (art.importanceScore || 0), 0);
    return (total / articlesList.length).toFixed(1);
  }

  getArticlesByCategory_sync(articlesList = []) {
    const counts = {};
    articlesList.forEach((art) => {
      counts[art.category] = (counts[art.category] || 0) + 1;
    });
    return counts;
  }
}

export const articleService = new ArticleService();
