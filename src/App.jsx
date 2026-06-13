import React, { useState, useEffect } from 'react';

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

// Import Mock Database
import { articleService } from './services/articleService';
import { reportService } from './services/reportService';
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

  // Database States
  const [articles, setArticles] = useState(() => articleService.getArticles());
  const [reports, setReports] = useState(() => reportService.reports);
  const [savedArticles, setSavedArticles] = useState(() => {
    // Seed with two articles so the user has some default bookmarks to inspect
    const allArts = articleService.getArticles();
    return [allArts[0], allArts[2]];
  });
  const [notifications, setNotifications] = useState(initialNotifications);

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
    setUser(prev => {
      const newUser = { ...prev, ...updatedData };
      localStorage.setItem('techpulse_user', JSON.stringify(newUser));
      return newUser;
    });
  };

  // Toggle saving an article bookmark
  const toggleSaveArticle = (article) => {
    setSavedArticles(prev => {
      const exists = prev.some(item => item.id === article.id);
      if (exists) {
        return prev.filter(item => item.id !== article.id);
      } else {
        return [...prev, article];
      }
    });
  };

  // Toggling Light/Dark mode
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Notification management functions
  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  // Route page components depending on active routing state
  const renderActiveView = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <DashboardOverview 
            articles={articles} 
            reports={reports} 
            setActivePage={setActivePage} 
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
          />
        );
      case 'reports':
        return (
          <AIReports 
            reports={reports} 
            articles={articles} 
          />
        );
      case 'categories':
        return (
          <Categories 
            articles={articles} 
            savedArticles={savedArticles}
            toggleSaveArticle={toggleSaveArticle}
            setSelectedArticleDetails={(art) => {
              // Opens detail view modal inside categories by redirecting or toggling
              // We'll hook it directly to news-feed detail view or render standard category logic
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
              // Direct redirect to newsfeed selection
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
        return <DashboardOverview articles={articles} reports={reports} setActivePage={setActivePage} />;
    }
  };

  // Guest view - Auth panel
  if (!user) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  // Authenticated workspace dashboard
  return (
    <div className="app-container">
      {/* Navigation Sidebar */}
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        unreadNotifications={notifications.filter(n => !n.read).length}
        savedCount={savedArticles.length}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Workspace Frame */}
      <div 
        className="main-content"
        style={{
          marginLeft: '0px', // Handled by media queries in layout. Responsive padding
          transition: 'margin-left var(--transition-normal)'
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

      {/* Floating ChatGPT Assistant */}
      <AIChatAssistant articles={articles} />

      <style>{`
        @media (min-width: 992px) {
          .main-content {
            margin-left: 260px !important;
          }
        }
      `}</style>
    </div>
  );
}
