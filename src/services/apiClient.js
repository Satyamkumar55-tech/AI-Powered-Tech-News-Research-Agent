// Central API client — all calls to the backend go through here.
// The Vite proxy forwards /api/* → http://localhost:3001 in development.

const BASE_URL = '/api';
const TIMEOUT_MS = 15000;

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

async function request(path, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      ...options,
    });

    const json = await response.json();

    if (!response.ok || !json.success) {
      throw new ApiError(
        json.error || `HTTP ${response.status}`,
        response.status,
        json
      );
    }

    return json;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new ApiError('Request timed out. Is the backend server running?', 408, null);
    }
    if (err instanceof ApiError) throw err;
    // Network error (server not running)
    throw new ApiError(
      'Cannot connect to TechPulse backend. Please start the server (cd server && npm start)',
      0,
      null
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

export const apiClient = {
  get: (path) => request(path),

  // Health check
  async checkHealth() {
    try {
      return await request('/health');
    } catch {
      return null;
    }
  },

  // Reports
  async getReports() {
    const res = await request('/reports');
    return res.data || [];
  },
  async getLatestReport() {
    const res = await request('/reports/latest');
    return res.data || null;
  },
  async getReportById(id) {
    const res = await request(`/reports/${id}`);
    return res.data || null;
  },

  // Articles
  async getArticles(limit = 100) {
    const res = await request(`/articles?limit=${limit}`);
    return res.data || [];
  },
  async getTopArticles(limit = 10) {
    const res = await request(`/articles/top?limit=${limit}`);
    return res.data || [];
  },
  async getArticlesByCategory(category, limit = 50) {
    const res = await request(`/articles/category/${encodeURIComponent(category)}?limit=${limit}`);
    return res.data || [];
  },

  // Analytics
  async getAnalytics() {
    const res = await request('/analytics');
    return res.data || {};
  },
  async getDashboard() {
    const res = await request('/dashboard');
    return res.data || {};
  },
};

export default apiClient;
