import React, { useState } from 'react';
import { 
  Settings, 
  Bell, 
  Sliders, 
  Link, 
  Cpu, 
  Sun, 
  Moon, 
  Check, 
  RefreshCw, 
  Database, 
  Mail, 
  MessageSquare, 
  CheckCircle2,
  Lock
} from 'lucide-react';

export default function SettingsView({ 
  theme, 
  toggleTheme, 
  user, 
  updateUser 
}) {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [notifPreferences, setNotifPreferences] = useState({
    dailyReport: true,
    breakingNews: true,
    weeklyDigest: false,
    emailAlerts: true,
    discordPush: false
  });
  const [preferredCats, setPreferredCats] = useState(['AI', 'Cybersecurity', 'Software Development']);
  

  const [saveSuccess, setSaveSuccess] = useState(false);

  const categories = ['AI', 'Cybersecurity', 'Startups', 'Cloud Computing', 'Software Development'];

  const handleTogglePref = (pref) => {
    setNotifPreferences(prev => ({ ...prev, [pref]: !prev[pref] }));
  };

  const handleToggleCat = (cat) => {
    if (preferredCats.includes(cat)) {
      setPreferredCats(prev => prev.filter(c => c !== cat));
    } else {
      setPreferredCats(prev => [...prev, cat]);
    }
  };

  const handleSaveAccount = (e) => {
    e.preventDefault();
    updateUser({ name, email });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };



  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Top section grid */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}
        className="settings-grid"
      >
        
        {/* Account Details Form */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Settings size={16} color="rgb(59, 130, 246)" />
            Account Management
          </h3>

          <form onSubmit={handleSaveAccount} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Researcher Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label>Registered Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-sm"
              style={{ alignSelf: 'flex-start', marginTop: '0.5rem', minWidth: '100px' }}
            >
              {saveSuccess ? 'Changes Saved!' : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* Theme and Preferences */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '14px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Theme switcher */}
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sun size={16} color="rgb(249, 115, 22)" />
              Interface Theme
            </h3>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => theme === 'light' && toggleTheme()}
                className={`btn btn-sm ${theme === 'dark' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, gap: '4px' }}
              >
                <Moon size={14} />
                <span>Dark Theme</span>
              </button>
              <button
                onClick={() => theme === 'dark' && toggleTheme()}
                className={`btn btn-sm ${theme === 'light' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, gap: '4px' }}
              >
                <Sun size={14} />
                <span>Light Theme</span>
              </button>
            </div>
          </div>

          {/* Preferred Categories */}
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sliders size={15} color="rgb(139, 92, 246)" />
              Topic Preferences
            </h3>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {categories.map((cat) => {
                const isSelected = preferredCats.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => handleToggleCat(cat)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: isSelected ? 'rgba(139, 92, 246, 0.15)' : 'var(--bg-input)',
                      borderColor: isSelected ? 'rgba(139, 92, 246, 0.4)' : 'var(--border-color)',
                      color: isSelected ? 'rgb(216, 180, 254)' : 'var(--text-muted)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    {isSelected && <Check size={12} />}
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* Notifications Preferences */}
      <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Bell size={16} color="rgb(6, 182, 212)" />
          Notification Control Matrix
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem' }}>
            <input 
              type="checkbox" 
              checked={notifPreferences.dailyReport} 
              onChange={() => handleTogglePref('dailyReport')}
            />
            <div>
              <strong>Daily AI Briefing Notification</strong>
              <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>Receive an alert when the Daily Research Report executes</span>
            </div>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem' }}>
            <input 
              type="checkbox" 
              checked={notifPreferences.breakingNews} 
              onChange={() => handleTogglePref('breakingNews')}
            />
            <div>
              <strong>Critical Zero-Day Vulnerability Alert</strong>
              <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>Send urgent popups for importance score &gt; 9.0 security patches</span>
            </div>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem' }}>
            <input 
              type="checkbox" 
              checked={notifPreferences.weeklyDigest} 
              onChange={() => handleTogglePref('weeklyDigest')}
            />
            <div>
              <strong>Weekly Tech Digest Briefing</strong>
              <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>Deliver summarized developer stack indexes every Monday morning</span>
            </div>
          </label>
        </div>
      </div>



      <style>{`
        .sync-spinner {
          animation: spin 1.2s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

    </div>
  );
}
