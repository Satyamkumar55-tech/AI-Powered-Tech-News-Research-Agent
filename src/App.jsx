import React, { useState, useEffect, useCallback } from 'react';

// Import Shared Components
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import AIChatAssistant from './components/AIChatAssistant';

// Import Page Views
import Auth from './views/Auth';
import DashboardOverview from './views/DashboardOverview';
import NewsFeed from './views/NewsFeed';
import AIReports from './views/AIReports';
import Categories from './views/Categories';
import SavedArticles from './views/SavedArticles';
import Analytics from './views/Analytics';
import SettingsView from './views/Settings';

// Import Backend API Client
import apiClient from './services/apiClient';
import { initialNotifications } from './data/notifications';

export default function App() {
  // Authentication State (simulated)
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('techpulse_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Navigation Routing States
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');

  // Search & Filtering State (shared globally)
  const [searchQuery, setSearchQuery] = useState('');

  // Core Theme State (Dark mode by default)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('techpulse_theme') || 'dark';
  });

  // ── Backend data states ───────────────────────────────────────────────────
  const [articles, setArticles] = useState([]);
  const [reports, setReports] = useState([]);
  const [backendLoading, setBackendLoading] = useState(true);
  const [backendError, setBackendError] = useState(null);
  const [backendOnline, setBackendOnline] = useState(false);

  // Saved articles & notifications (local state)
  const [savedArticles, setSavedArticles] = useState([]);
  const [notifications, setNotifications] = useState(initialNotifications);

  // ── Fetch all data from backend ───────────────────────────────────────────
  const loadBackendData = useCallback(async () => {
    setBackendLoading(true);
    setBackendError(null);
    try {
      // Check backend health first
      const health = await apiClient.checkHealth();
      if (!health) {
        throw new Error('Backend server is not reachable. Please run: cd server && npm start');
      }
      setBackendOnline(true);

      // Load articles and reports in parallel
      const [fetchedArticles, fetchedReports] = await Promise.all([
        apiClient.getArticles(100),
        apiClient.getReports(),
      ]);

      setArticles(fetchedArticles);
      setReports(fetchedReports);
    } catch (err) {
      console.error('[App] Backend load error:', err.message);
      setBackendError(err.message);
      setBackendOnline(false);
      // Keep arrays empty so UI shows proper empty states
      setArticles([]);
      setReports([]);
    } finally {
      setBackendLoading(false);
    }
  }, []);

  // Load on mount (after login)
  useEffect(() => {
    if (user) {
      loadBackendData();
    }
  }, [user, loadBackendData]);

  // Sync theme class with body element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
    localStorage.setItem('techpulse_theme', theme);
  }, [theme]);

  // Handle Login authentication
  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('techpulse_user', JSON.stringify(userData));
    setActivePage('dashboard');
  };

  // Handle Logout session teardown
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('techpulse_user');
    setActivePage('dashboard');
  };

  // Update profile handler
  const handleUpdateProfile = (updatedData) => {
    setUser((prev) => {
      const newUser = { ...prev, ...updatedData };
      localStorage.setItem('techpulse_user', JSON.stringify(newUser));
      return newUser;
    });
  };

  // Toggle saving an article bookmark
  const toggleSaveArticle = (article) => {
    setSavedArticles((prev) => {
      const exists = prev.some((item) => item.id === article.id);
      if (exists) {
        return prev.filter((item) => item.id !== article.id);
      } else {
        return [...prev, article];
      }
    });
  };

  // Toggling Light/Dark mode
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Notification management functions
  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markNotificationRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // ── Backend status banner ─────────────────────────────────────────────────
  const renderBackendBanner = () => {
    if (backendLoading) {
      return (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 2000,
          padding: '0.6rem 1rem',
          background: 'rgba(59, 130, 246, 0.15)',
          borderBottom: '1px solid rgba(59, 130, 246, 0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '0.5rem', fontSize: '0.8rem', color: 'rgb(147, 197, 253)',
          backdropFilter: 'blur(8px)'
        }}>
          <div className="spinner-sm" style={{
            width: '14px', height: '14px', borderRadius: '50%',
            border: '2px solid rgba(59,130,246,0.3)',
            borderTopColor: 'rgb(59,130,246)',
            animation: 'spin 0.8s linear infinite'
          }} />
          Connecting to TechPulse intelligence backend...
        </div>
      );
    }
    if (backendError && !backendOnline) {
      return (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 2000,
          padding: '0.6rem 1rem',
          background: 'rgba(239, 68, 68, 0.12)',
          borderBottom: '1px solid rgba(239, 68, 68, 0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '0.75rem', fontSize: '0.8rem', color: 'rgb(252, 165, 165)',
          backdropFilter: 'blur(8px)', flexWrap: 'wrap'
        }}>
          <span>⚠️ Backend offline — Start the server: <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>cd server &amp;&amp; npm start</code></span>
          <button
            onClick={loadBackendData}
            style={{
              padding: '3px 10px', borderRadius: '6px', fontSize: '0.75rem',
              background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)',
              color: 'rgb(252,165,165)', cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      );
    }
    return null;
  };

  const bannerHeight = (backendLoading || backendError) ? '36px' : '0px';

  // Route page components depending on active routing state
  const renderActiveView = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <DashboardOverview
            articles={articles}
            reports={reports}
            setActivePage={setActivePage}
            backendLoading={backendLoading}
            backendOnline={backendOnline}
            onRefresh={loadBackendData}
          />
        );
      case 'news-feed':
        return (
          <NewsFeed
            articles={articles}
            savedArticles={savedArticles}
            toggleSaveArticle={toggleSaveArticle}
            globalSearchQuery={searchQuery}
            activeCategoryFilter={activeCategoryFilter}
            loading={backendLoading}
          />
        );
      case 'reports':
        return (
          <AIReports
            reports={reports}
            articles={articles}
            backendOnline={backendOnline}
            onRefresh={loadBackendData}
          />
        );
      case 'categories':
        return (
          <Categories
            articles={articles}
            savedArticles={savedArticles}
            toggleSaveArticle={toggleSaveArticle}
            setSelectedArticleDetails={(art) => {
              setActiveCategoryFilter(art.category);
              setActivePage('news-feed');
            }}
            setActivePage={setActivePage}
            setActiveCategoryFilter={setActiveCategoryFilter}
          />
        );
      case 'saved':
        return (
          <SavedArticles
            savedArticles={savedArticles}
            toggleSaveArticle={toggleSaveArticle}
            setSelectedArticleDetails={(art) => {
              setSearchQuery(art.title);
              setActivePage('news-feed');
            }}
          />
        );
      case 'analytics':
        return (
          <Analytics
            articles={articles}
            reports={reports}
            backendOnline={backendOnline}
          />
        );
      case 'settings':
        return (
          <SettingsView
            theme={theme}
            toggleTheme={toggleTheme}
            user={user}
            updateUser={handleUpdateProfile}
          />
        );
      default:
        return (
          <DashboardOverview
            articles={articles}
            reports={reports}
            setActivePage={setActivePage}
            backendLoading={backendLoading}
            backendOnline={backendOnline}
            onRefresh={loadBackendData}
          />
        );
    }
  };

  // Guest view - Auth panel
  if (!user) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  // Authenticated workspace dashboard
  return (
    <div className="app-container">
      {/* Backend Status Banner */}
      {renderBackendBanner()}

      {/* Navigation Sidebar */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        unreadNotifications={notifications.filter((n) => !n.read).length}
        savedCount={savedArticles.length}
        user={user}
        onLogout={handleLogout}
        style={{ marginTop: bannerHeight }}
      />

      {/* Main Workspace Frame */}
      <div
        className="main-content"
        style={{
          marginLeft: '0px',
          transition: 'margin-left var(--transition-normal)',
          paddingTop: (backendLoading || backendError) ? bannerHeight : '0',
        }}
      >
        {/* Top Navbar */}
        <Navbar
          activePage={activePage}
          setActivePage={setActivePage}
          setSidebarOpen={setSidebarOpen}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          theme={theme}
          toggleTheme={toggleTheme}
          notifications={notifications}
          markAllNotificationsRead={markAllNotificationsRead}
          markNotificationRead={markNotificationRead}
        />

        {/* Dynamic Inner Page Content */}
        <main className="content-body">
          {renderActiveView()}
        </main>
      </div>

      {/* Floating AI Chat Assistant — receives real articles + reports */}
      <AIChatAssistant
        articles={articles}
        reports={reports}
        backendOnline={backendOnline}
      />

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @media (min-width: 992px) {
          .main-content {
            margin-left: 260px !important;
          }
        }
      `}</style>
    </div>
  );
}
