import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  Search, 
  Sun, 
  Moon, 
  Bell, 
  CheckCheck, 
  Sparkles, 
  AlertTriangle,
  Info,
  Clock,
  X
} from 'lucide-react';

export default function Navbar({
  activePage,
  setActivePage,
  setSidebarOpen,
  searchQuery,
  setSearchQuery,
  theme,
  toggleTheme,
  notifications,
  markAllNotificationsRead,
  markNotificationRead
}) {
  const [notifOpen, setNotifOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notif) => {
    markNotificationRead(notif.id);
    setNotifOpen(false);
    if (notif.type === 'report') {
      setActivePage('reports');
    } else if (notif.type === 'alert') {
      setActivePage('news-feed');
    }
  };

  const getNotifIcon = (type) => {
    switch (type) {
      case 'report':
        return <Sparkles size={14} color="rgb(139, 92, 246)" />;
      case 'alert':
        return <AlertTriangle size={14} color="rgb(249, 115, 22)" />;
      default:
        return <Info size={14} color="rgb(59, 130, 246)" />;
    }
  };

  const getPageTitle = () => {
    switch (activePage) {
      case 'dashboard': return 'Dashboard Overview';
      case 'news-feed': return 'News Intelligence Feed';
      case 'reports': return 'AI Research Reports';
      case 'categories': return 'Topic Categories';
      case 'saved': return 'Saved Research';
      case 'analytics': return 'Research Analytics';
      case 'settings': return 'Agent Settings';
      default: return 'TechPulse AI';
    }
  };

  return (
    <header 
      className="glass-panel"
      style={{
        height: '70px',
        position: 'sticky',
        top: 0,
        zIndex: 90,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        borderBottom: '1px solid var(--border-color)',
        borderRadius: 0,
        backgroundColor: 'var(--bg-sidebar)',
        backdropFilter: 'var(--glass-blur)'
      }}
    >
      {/* Sidebar trigger + Page title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={() => setSidebarOpen(true)}
          className="mobile-menu-trigger"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-main)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '6px',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.05)'
          }}
        >
          <Menu size={20} />
        </button>
        
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
          {getPageTitle()}
        </h2>
      </div>

      {/* Center global search */}
      <div 
        className="navbar-search-container"
        style={{
          position: 'relative',
          width: '380px',
          maxWidth: '40%'
        }}
      >
        <div 
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'none'
          }}
        >
          <Search size={16} />
        </div>
        <input
          type="text"
          placeholder="Search articles, trends, keywords..."
          value={searchQuery}
          onChange={(e) => {
            const val = e.target.value;
            setSearchQuery(val);
            if (val.trim() !== '' && activePage !== 'news-feed' && activePage !== 'saved') {
              setActivePage('news-feed');
            }
          }}
          style={{
            width: '100%',
            padding: '0.55rem 1rem 0.55rem 2.25rem',
            borderRadius: '20px',
            background: 'var(--bg-input)',
            border: '1px solid var(--border-color)',
            fontSize: '0.85rem',
            color: 'var(--text-main)',
            outline: 'none',
            transition: 'all var(--transition-fast)'
          }}
          className="search-input-field"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '2px'
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        
        {/* Theme Toggler */}
        <button
          onClick={toggleTheme}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            border: '1px solid var(--border-color)',
            background: 'rgba(255, 255, 255, 0.03)',
            color: 'var(--text-main)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all var(--transition-fast)'
          }}
          className="navbar-ctrl-btn"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications Icon with Dropdown */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              border: '1px solid var(--border-color)',
              background: 'rgba(255, 255, 255, 0.03)',
              color: 'var(--text-main)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              transition: 'all var(--transition-fast)'
            }}
            className="navbar-ctrl-btn"
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                className="notif-badge-dot"
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: 'rgb(249, 115, 22)',
                  border: '2px solid var(--bg-sidebar)',
                  boxShadow: '0 0 10px rgba(249, 115, 22, 0.6)'
                }}
              />
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {notifOpen && (
            <div
              className="glass-panel"
              style={{
                position: 'absolute',
                right: 0,
                top: '48px',
                width: '320px',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-lg)',
                backgroundColor: 'var(--bg-sidebar)',
                border: '1px solid var(--border-color)',
                animation: 'fadeIn 0.2s ease-out',
                zIndex: 100
              }}
            >
              {/* Dropdown Header */}
              <div
                style={{
                  padding: '0.85rem 1.2rem',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'rgba(0, 0, 0, 0.1)'
                }}
              >
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgb(59, 130, 246)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <CheckCheck size={12} />
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      style={{
                        padding: '0.85rem 1.2rem',
                        borderBottom: '1px solid var(--border-color)',
                        cursor: 'pointer',
                        backgroundColor: notif.read ? 'transparent' : 'rgba(59, 130, 246, 0.05)',
                        transition: 'background-color var(--transition-fast)',
                        display: 'flex',
                        gap: '0.75rem'
                      }}
                      className="notif-item"
                    >
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: notif.read ? 'rgba(255, 255, 255, 0.05)' : 'rgba(59, 130, 246, 0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: '2px'
                        }}
                      >
                        {getNotifIcon(notif.type)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p
                          style={{
                            fontSize: '0.8rem',
                            fontWeight: notif.read ? 400 : 500,
                            color: notif.read ? 'var(--text-muted)' : 'var(--text-main)',
                            lineHeight: 1.3
                          }}
                        >
                          {notif.text}
                        </p>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            color: 'var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            marginTop: '4px'
                          }}
                        >
                          <Clock size={10} />
                          {notif.time}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 991px) {
          .mobile-menu-trigger {
            display: flex !important;
          }
          header {
            padding: 0 1rem !important;
          }
        }
        @media (max-width: 576px) {
          .navbar-search-container {
            display: none !important;
          }
        }
        .search-input-field:focus {
          border-color: rgba(59, 130, 246, 0.5) !important;
          box-shadow: var(--shadow-glow) !important;
          width: 440px !important;
        }
        .navbar-ctrl-btn:hover {
          border-color: var(--border-color-hover) !important;
          background: rgba(255, 255, 255, 0.08) !important;
          color: rgb(6, 182, 212) !important;
        }
        .light .navbar-ctrl-btn:hover {
          background: rgba(0, 0, 0, 0.04) !important;
        }
        .notif-item:hover {
          background-color: rgba(255, 255, 255, 0.03) !important;
        }
        .light .notif-item:hover {
          background-color: rgba(0, 0, 0, 0.02) !important;
        }
        .light .notif-badge-dot {
          border-color: var(--bg-sidebar) !important;
        }
      `}</style>
    </header>
  );
}
