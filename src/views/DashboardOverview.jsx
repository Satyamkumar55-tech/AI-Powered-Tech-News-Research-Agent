import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Sparkles, 
  Clock, 
  BookOpen, 
  Award, 
  FolderCheck,
  ChevronRight
} from 'lucide-react';
import { articleService } from '../services/articleService';
import { trendingTopics } from '../data/categories';

export default function DashboardOverview({ articles, reports, setActivePage }) {
  const totalArticles = articleService.getArticleCount(articles);
  const avgScore = articleService.getAvgImportanceScore(articles);
  const reportsCount = reports.length;
  
  // Find top category today
  const categoryCounts = articleService.getArticlesByCategory(articles);
  let topCategory = 'N/A';
  let topCount = 0;
  Object.keys(categoryCounts).forEach(cat => {
    if (categoryCounts[cat] > topCount) {
      topCategory = cat;
      topCount = categoryCounts[cat];
    }
  });

  const recentInsights = [
    {
      id: 1,
      title: "Active Autonomous AI Agents Rising",
      text: "GPT-5 developer beta and Claude 4.5 releases mark a key shift from conversational text to active, multi-step agentic execution bases.",
      tag: "AI Trend"
    },
    {
      id: 2,
      title: "Critical Infrastructure Vulnerabilities Intensifying",
      text: "Discovery of Linux kernel NetCollide vulnerability and the CareAlliance hospital lockouts illustrate rising threats to critical systems.",
      tag: "Security Alert"
    },
    {
      id: 3,
      title: "Fintech Shifting Toward Stablecoins",
      text: "Stripe's $320M acquisition of PayFlow validates stablecoins as a low-cost, near-instant settlement layer for international B2B payments.",
      tag: "Startups"
    }
  ];

  const renderTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={16} color="rgb(16, 185, 129)" />;
      case 'down':
        return <TrendingDown size={16} color="rgb(239, 68, 68)" />;
      default:
        return <Minus size={16} color="var(--text-muted)" />;
    }
  };

  const renderTrendColor = (trend) => {
    switch (trend) {
      case 'up': return 'rgb(16, 185, 129)';
      case 'down': return 'rgb(239, 68, 68)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Welcome Banner */}
      <div 
        className="glass-panel"
        style={{
          padding: '2rem',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.15) 50%, rgba(6, 182, 212, 0.05) 100%)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={18} color="rgb(6, 182, 212)" />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgb(6, 182, 212)' }}>
            AI Research Workspace
          </span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
          Welcome back, Researcher.
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '600px' }}>
          TechPulse AI has processed the latest RSS feeds and compiled insights. <strong>{unreadCount => {}}</strong> 1 new AI Report and 1 critical threat alert require your attention.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem'
        }}
      >
        {/* Total Articles */}
        <div className="glass-panel hover-card" style={{ padding: '1.5rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Total Articles Processed</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyCenter: 'center', display: 'flex', justifyContent: 'center', color: 'rgb(59, 130, 246)' }}>
              <BookOpen size={16} style={{ margin: 'auto' }} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.85rem', fontWeight: 800 }}>{totalArticles * 128}</h3>
          <p style={{ fontSize: '0.72rem', color: 'rgb(16, 185, 129)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '0.4rem' }}>
            <TrendingUp size={12} />
            <span>+14.2% since yesterday</span>
          </p>
        </div>

        {/* AI Reports Generated */}
        <div className="glass-panel hover-card" style={{ padding: '1.5rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>AI Reports Generated</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyCenter: 'center', display: 'flex', justifyContent: 'center', color: 'rgb(139, 92, 246)' }}>
              <Sparkles size={16} style={{ margin: 'auto' }} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.85rem', fontWeight: 800 }}>{reportsCount}</h3>
          <p style={{ fontSize: '0.72rem', color: 'rgb(16, 185, 129)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '0.4rem' }}>
            <TrendingUp size={12} />
            <span>+2 reports generated this week</span>
          </p>
        </div>

        {/* Top Category Today */}
        <div className="glass-panel hover-card" style={{ padding: '1.5rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Top Category Today</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(6, 182, 212, 0.1)', display: 'flex', alignItems: 'center', justifyCenter: 'center', display: 'flex', justifyContent: 'center', color: 'rgb(6, 182, 212)' }}>
              <FolderCheck size={16} style={{ margin: 'auto' }} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.85rem', fontWeight: 800 }}>{topCategory}</h3>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '0.4rem' }}>
            <span>{topCount} major publications today</span>
          </p>
        </div>

        {/* Average Importance Score */}
        <div className="glass-panel hover-card" style={{ padding: '1.5rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Average Importance Score</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(249, 115, 22, 0.1)', display: 'flex', alignItems: 'center', justifyCenter: 'center', display: 'flex', justifyContent: 'center', color: 'rgb(249, 115, 22)' }}>
              <Award size={16} style={{ margin: 'auto' }} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.85rem', fontWeight: 800 }}>{avgScore} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ 10</span></h3>
          <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--border-color)', borderRadius: '2px', marginTop: '0.65rem', overflow: 'hidden' }}>
            <div style={{ width: `${avgScore * 10}%`, height: '100%', background: 'linear-gradient(90deg, rgb(249, 115, 22), rgb(59, 130, 246))' }} />
          </div>
        </div>
      </div>

      {/* Widgets: Recent Insights + Trending Topics */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '1.5rem'
        }}
        className="dashboard-widgets-grid"
      >
        {/* Recent Insights Widget */}
        <div 
          className="glass-panel" 
          style={{ 
            padding: '1.5rem', 
            borderRadius: '16px', 
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={16} color="rgb(139, 92, 246)" />
              Recent AI-Generated Insights
            </h3>
            <button 
              onClick={() => setActivePage('reports')}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgb(59, 130, 246)',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '2px'
              }}
            >
              View Reports
              <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {recentInsights.map((ins) => (
              <div 
                key={ins.id}
                style={{
                  padding: '1rem',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem'
                }}
                className="insight-card-hover"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span 
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(139, 92, 246, 0.1)',
                      color: 'rgb(216, 180, 254)'
                    }}
                  >
                    {ins.tag}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={10} />
                    Today
                  </span>
                </div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>{ins.title}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{ins.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trending Topics Widget */}
        <div 
          className="glass-panel" 
          style={{ 
            padding: '1.5rem', 
            borderRadius: '16px', 
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Trending Topics
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hot sectors processed today</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {trendingTopics.map((topic, idx) => (
              <div 
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.01)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600 }}>{topic.name}</h4>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Score: {topic.score}/100</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: renderTrendColor(topic.trend) }}>
                    {topic.change}
                  </span>
                  <div 
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {renderTrendIcon(topic.trend)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Shortcut Action Links */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem'
        }}
      >
        <div 
          onClick={() => setActivePage('news-feed')}
          className="glass-panel hover-card" 
          style={{ padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
        >
          <div>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 600 }}>Explore Intelligence Feed</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Read detailed reports and search articles</p>
          </div>
          <ChevronRight size={18} color="var(--text-muted)" />
        </div>

        <div 
          onClick={() => setActivePage('analytics')}
          className="glass-panel hover-card" 
          style={{ padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
        >
          <div>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 600 }}>Analyze Publication Metrics</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>Check distribution charts and trend lines</p>
          </div>
          <ChevronRight size={18} color="var(--text-muted)" />
        </div>
      </div>

      <style>{`
        @media (max-width: 991px) {
          .dashboard-widgets-grid {
            grid-template-columns: 1fr !important;
          }
        }
        .insight-card-hover:hover {
          background-color: rgba(255, 255, 255, 0.05) !important;
          border-color: rgba(59, 130, 246, 0.2) !important;
        }
      `}</style>
    </div>
  );
}
