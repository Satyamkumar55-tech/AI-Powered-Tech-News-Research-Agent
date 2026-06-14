import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Newspaper, 
  Sparkles, 
  Map, 
  Bookmark, 
  BarChart2,
  Settings,
  LogOut,
  Cpu
} from 'lucide-react';

export default function Sidebar({ 
  activePage, 
  setActivePage, 
  savedCount,
  user,
  onLogout 
}) {
  const [isHovered, setIsHovered] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'news-feed', label: 'Intelligence Feed', icon: Newspaper },
    { id: 'situation-room', label: 'Situation Room', icon: Map },
    { id: 'reports', label: 'AI Reports', icon: Sparkles },
    { id: 'saved', label: 'Saved Signals', icon: Bookmark, badge: savedCount > 0 ? savedCount : null },
    { id: 'analytics', label: 'Sector Networks', icon: BarChart2 },
    { id: 'settings', label: 'System Config', icon: Settings }
  ];

  return (
    <>
      <aside 
        className="glass-panel"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          height: 'calc(100vh - 40px)',
          width: isHovered ? '240px' : '72px',
          borderRadius: '16px',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          transition: 'width var(--transition-normal)',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-sidebar)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-color)'
        }}
      >
        {/* Brand Logo Header */}
        <div 
          style={{
            padding: '1.25rem 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isHovered ? 'flex-start' : 'center',
            paddingLeft: isHovered ? '1.25rem' : '0',
            borderBottom: '1px solid var(--border-color)',
            transition: 'all var(--transition-fast)'
          }}
        >
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem',
              cursor: 'pointer' 
            }}
            onClick={() => setActivePage('dashboard')}
          >
            <div 
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(0,229,255,0.2), rgba(124,77,255,0.2))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-glow)',
                border: '1px solid rgba(0,229,255,0.4)',
                flexShrink: 0
              }}
            >
              <Cpu size={20} color="rgb(0, 229, 255)" />
            </div>
            {isHovered && (
              <div style={{ animation: 'fadeIn 0.2s ease-out', whiteSpace: 'nowrap' }}>
                <h1 
                  style={{ 
                    fontSize: '1rem', 
                    fontWeight: 700, 
                    color: '#fff',
                    fontFamily: 'var(--font-display)',
                    letterSpacing: '0.05em'
                  }}
                >
                  TechPulse AI
                </h1>
                <span 
                  style={{ 
                    fontSize: '0.6rem', 
                    color: 'rgb(0, 255, 157)', 
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  Command Center
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav 
          style={{ 
            flex: 1, 
            padding: '1.25rem 0', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '0.5rem',
            overflowY: 'auto',
            overflowX: 'hidden'
          }}
        >
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                title={!isHovered ? item.label : ''}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.85rem',
                  margin: '0 0.75rem',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 600 : 500,
                  fontFamily: 'var(--font-mono)',
                  color: isActive ? '#fff' : 'var(--text-muted)',
                  background: isActive 
                    ? 'rgba(0, 229, 255, 0.1)' 
                    : 'transparent',
                  border: isActive ? '1px solid rgba(0, 229, 255, 0.3)' : '1px solid transparent',
                  transition: 'all var(--transition-fast)',
                  justifyContent: isHovered ? 'flex-start' : 'center',
                  position: 'relative'
                }}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
              >
                <IconComponent 
                  size={20} 
                  color={isActive ? 'rgb(0, 229, 255)' : 'currentColor'} 
                  style={{ flexShrink: 0 }}
                />
                
                {isHovered && (
                  <span style={{ whiteSpace: 'nowrap', animation: 'fadeIn 0.2s ease-out' }}>
                    {item.label}
                  </span>
                )}
                
                {/* Custom Item Badge */}
                {item.badge !== null && (
                  <span 
                    style={{
                      position: isHovered ? 'static' : 'absolute',
                      top: isHovered ? 'auto' : '4px',
                      right: isHovered ? 'auto' : '4px',
                      marginLeft: isHovered ? 'auto' : '0',
                      fontSize: '0.65rem',
                      padding: '2px 6px',
                      borderRadius: '12px',
                      background: 'rgba(255, 93, 115, 0.2)',
                      color: 'rgb(255, 93, 115)',
                      fontWeight: 700,
                      border: '1px solid rgba(255, 93, 115, 0.4)',
                      display: isHovered ? 'inline-block' : 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: isHovered ? 'auto' : '18px',
                      height: isHovered ? 'auto' : '18px'
                    }}
                  >
                    {isHovered ? item.badge : ''}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Card & Logout Footer */}
        {user && (
          <div 
            style={{
              padding: '1.25rem 0',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              alignItems: 'center'
            }}
          >
            <button
              onClick={onLogout}
              title={!isHovered ? "Sign Out" : ""}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isHovered ? 'flex-start' : 'center',
                gap: '0.75rem',
                width: 'calc(100% - 1.5rem)',
                margin: '0 0.75rem',
                padding: '0.75rem',
                borderRadius: '8px',
                border: '1px solid transparent',
                background: 'rgba(255, 255, 255, 0.05)',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 500,
                color: 'var(--text-muted)',
                transition: 'all var(--transition-fast)'
              }}
              className="logout-btn"
            >
              <LogOut size={18} style={{ flexShrink: 0 }} />
              {isHovered && <span style={{ whiteSpace: 'nowrap' }}>Sign Out</span>}
            </button>
          </div>
        )}
      </aside>

      <style>{`
        .sidebar-link:hover {
          color: #fff !important;
          background: rgba(255, 255, 255, 0.05) !important;
          border-color: rgba(255, 255, 255, 0.1) !important;
        }
        .logout-btn:hover {
          background: rgba(255, 93, 115, 0.1) !important;
          border-color: rgba(255, 93, 115, 0.3) !important;
          color: rgb(255, 93, 115) !important;
        }
      `}</style>
    </>
  );
}
