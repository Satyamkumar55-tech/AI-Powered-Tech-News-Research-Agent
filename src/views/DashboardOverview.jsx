import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Clock,
  BookOpen,
  Award,
  FolderCheck,
  ChevronRight,
  RefreshCw,
  WifiOff,
  Loader,
  AlertTriangle,
  Shield,
  DollarSign,
  Cpu,
} from 'lucide-react';
import apiClient from '../services/apiClient';

export default function DashboardOverview({ articles, reports, setActivePage, backendLoading, backendOnline, onRefresh, user }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [dashLoading, setDashLoading] = useState(true);

  // Load dashboard summary from backend
  useEffect(() => {
    let cancelled = false;
    const loadDashboard = async () => {
      setDashLoading(true);
      try {
        const data = await apiClient.getDashboard();
        if (!cancelled) setDashboardData(data);
      } catch {
        if (!cancelled) setDashboardData(null);
      } finally {
        if (!cancelled) setDashLoading(false);
      }
    };
    if (backendOnline) {
      loadDashboard();
    } else {
      setDashLoading(false);
    }
    return () => { cancelled = true; };
  }, [backendOnline, articles.length, reports.length]);

  // ── KPI values (from backend or computed from props) ──────────────────────
  const totalArticles = dashboardData?.articleCount ?? articles.length;
  const reportsCount = dashboardData?.reportCount ?? reports.length;
  const topCategory = dashboardData?.topCategory ?? 'N/A';
  const topCategoryCount = dashboardData?.topCategoryCount ?? 0;
  const avgScore = dashboardData?.avgImportanceScore ?? (
    articles.length > 0
      ? (articles.reduce((s, a) => s + (a.importanceScore || 0), 0) / articles.length).toFixed(1)
      : 0
  );
  const latestReportTime = dashboardData?.latestReportTime;
  const topArticle = dashboardData?.topArticle;

  // ── Real insights from latest report ─────────────────────────────────────
  const recentInsights = dashboardData?.recentInsights && dashboardData.recentInsights.length > 0
    ? dashboardData.recentInsights.map((text, i) => ({
        id: i + 1,
        title: text.length > 80 ? text.slice(0, 77) + '...' : text,
        text,
        tag: ['AI Trend', 'Security Alert', 'Market Signal', 'Cloud Update', 'Startup Watch'][i % 5],
      }))
    : [
        { id: 1, title: 'Intelligence Loading...', text: 'AI insights will appear here once the backend generates its first report.', tag: 'System' },
      ];

  // ── Trending categories from real data ────────────────────────────────────
  const trendingTopics = dashboardData?.categoryDistribution
    ? dashboardData.categoryDistribution.slice(0, 5).map((item, i) => ({
        name: item.category,
        score: Math.min(100, Math.round((item.count / (totalArticles || 1)) * 100 * 3)),
        change: `+${item.count} articles`,
        trend: i === 0 ? 'up' : i === 1 ? 'up' : 'neutral',
      }))
    : [];

  // ── TODAY'S AI BRIEFING widget data ───────────────────────────────────────
  const criticalStoriesCount = articles.filter((a) => a.importanceScore >= 8).length;
  const securityAlertsCount = articles.filter((a) => a.category === 'Cybersecurity').length;
  const fundingEventsCount = articles.filter((a) => a.category === 'Startups').length;
  const aiConfidence = articles.length > 0
    ? Math.min(99, Math.round(65 + (avgScore / 10) * 30))
    : 0;

  const formatLastUpdate = (isoStr) => {
    if (!isoStr) return 'Never';
    const d = new Date(isoStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderTrendIcon = (trend) => {
    if (trend === 'up') return <TrendingUp size={16} color="rgb(16, 185, 129)" />;
    if (trend === 'down') return <TrendingDown size={16} color="rgb(239, 68, 68)" />;
    return <Minus size={16} color="var(--text-muted)" />;
  };

  const renderTrendColor = (trend) => {
    if (trend === 'up') return 'rgb(16, 185, 129)';
    if (trend === 'down') return 'rgb(239, 68, 68)';
    return 'var(--text-muted)';
  };

  const isLoading = backendLoading || dashLoading;

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
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={18} color="rgb(6, 182, 212)" />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgb(6, 182, 212)' }}>
            AI Research Workspace
          </span>
          {/* Live backend status pill */}
          <span style={{
            marginLeft: '0.5rem',
            fontSize: '0.65rem', fontWeight: 700,
            padding: '2px 8px', borderRadius: '10px',
            backgroundColor: backendOnline ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
            color: backendOnline ? 'rgb(16,185,129)' : 'rgb(252,165,165)',
            border: `1px solid ${backendOnline ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
            display: 'flex', alignItems: 'center', gap: '4px'
          }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'currentColor', display: 'inline-block' }} />
            {backendOnline ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
          Welcome back, Researcher.
        </h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '600px' }}>
          {backendOnline
            ? `TechPulse AI has processed ${totalArticles} articles and generated ${reportsCount} intelligence report${reportsCount !== 1 ? 's' : ''}. Last update: ${formatLastUpdate(latestReportTime)}.`
            : 'TechPulse AI backend is offline. Start the backend server to begin receiving live intelligence reports.'}
        </p>
        {backendOnline && (
          <button
            onClick={onRefresh}
            style={{
              position: 'absolute', top: '1.25rem', right: '1.25rem',
              background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)',
              borderRadius: '8px', padding: '6px 12px', cursor: 'pointer',
              color: 'var(--text-muted)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px'
            }}
          >
            <RefreshCw size={12} />
            Refresh
          </button>
        )}
      </div>

      {/* TODAY'S AI BRIEFING widget */}
      <div
        className="glass-panel"
        style={{
          padding: '1.25rem 1.5rem',
          borderRadius: '14px',
          border: '1px solid rgba(6, 182, 212, 0.2)',
          background: 'linear-gradient(135deg, rgba(6,182,212,0.06) 0%, rgba(139,92,246,0.06) 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Cpu size={15} color="rgb(6,182,212)" />
            <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgb(6,182,212)' }}>
              Today's AI Briefing
            </span>
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={11} />
            Generated: {formatLastUpdate(latestReportTime)}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
          {[
            { label: 'Critical Stories', value: isLoading ? '—' : criticalStoriesCount, icon: <AlertTriangle size={14} />, color: 'rgb(239,68,68)' },
            { label: 'Security Alerts', value: isLoading ? '—' : securityAlertsCount, icon: <Shield size={14} />, color: 'rgb(249,115,22)' },
            { label: 'Funding Events', value: isLoading ? '—' : fundingEventsCount, icon: <DollarSign size={14} />, color: 'rgb(16,185,129)' },
            { label: 'AI Confidence', value: isLoading ? '—' : `${aiConfidence}%`, icon: <Sparkles size={14} />, color: 'rgb(139,92,246)' },
          ].map((stat) => (
            <div key={stat.label} style={{
              padding: '0.9rem',
              borderRadius: '10px',
              backgroundColor: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border-color)',
              display: 'flex', flexDirection: 'column', gap: '0.4rem'
            }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ color: stat.color }}>{stat.icon}</span>
                {stat.label}
              </span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: stat.color }}>
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        {/* Total Articles */}
        <div className="glass-panel hover-card" style={{ padding: '1.5rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Total Articles Processed</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(59, 130, 246, 0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'rgb(59, 130, 246)' }}>
              <BookOpen size={16} />
            </div>
          </div>
          {isLoading ? (
            <div className="skeleton" style={{ width: '80px', height: '32px', borderRadius: '6px' }} />
          ) : (
            <h3 style={{ fontSize: '1.85rem', fontWeight: 800 }}>{totalArticles.toLocaleString()}</h3>
          )}
          <p style={{ fontSize: '0.72rem', color: 'rgb(16, 185, 129)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '0.4rem' }}>
            <TrendingUp size={12} />
            <span>From {backendOnline ? '4' : '0'} live sources</span>
          </p>
        </div>

        {/* AI Reports Generated */}
        <div className="glass-panel hover-card" style={{ padding: '1.5rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>AI Reports Generated</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(139, 92, 246, 0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'rgb(139, 92, 246)' }}>
              <Sparkles size={16} />
            </div>
          </div>
          {isLoading ? (
            <div className="skeleton" style={{ width: '60px', height: '32px', borderRadius: '6px' }} />
          ) : (
            <h3 style={{ fontSize: '1.85rem', fontWeight: 800 }}>{reportsCount}</h3>
          )}
          <p style={{ fontSize: '0.72rem', color: 'rgb(16, 185, 129)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '0.4rem' }}>
            <TrendingUp size={12} />
            <span>Every hour, automatically</span>
          </p>
        </div>

        {/* Top Category Today */}
        <div className="glass-panel hover-card" style={{ padding: '1.5rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Top Category Today</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(6, 182, 212, 0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'rgb(6, 182, 212)' }}>
              <FolderCheck size={16} />
            </div>
          </div>
          {isLoading ? (
            <div className="skeleton" style={{ width: '100px', height: '32px', borderRadius: '6px' }} />
          ) : (
            <h3 style={{ fontSize: topCategory.length > 10 ? '1.1rem' : '1.85rem', fontWeight: 800, lineHeight: 1.2 }}>{topCategory}</h3>
          )}
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '0.4rem' }}>
            <span>{topCategoryCount} articles in this cycle</span>
          </p>
        </div>

        {/* Average Importance Score */}
        <div className="glass-panel hover-card" style={{ padding: '1.5rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Average Importance Score</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(249, 115, 22, 0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'rgb(249, 115, 22)' }}>
              <Award size={16} />
            </div>
          </div>
          {isLoading ? (
            <div className="skeleton" style={{ width: '80px', height: '32px', borderRadius: '6px' }} />
          ) : (
            <h3 style={{ fontSize: '1.85rem', fontWeight: 800 }}>
              {avgScore} <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ 10</span>
            </h3>
          )}
          <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--border-color)', borderRadius: '2px', marginTop: '0.65rem', overflow: 'hidden' }}>
            <div style={{ width: `${(avgScore / 10) * 100}%`, height: '100%', background: 'linear-gradient(90deg, rgb(249, 115, 22), rgb(59, 130, 246))', transition: 'width 0.5s ease' }} />
          </div>
        </div>
      </div>

      {/* Widgets: Recent Insights + Trending Topics */}
      <div
        style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}
        className="dashboard-widgets-grid"
      >
        {/* Recent AI-Generated Insights */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={16} color="rgb(139, 92, 246)" />
              Recent AI-Generated Insights
            </h3>
            <button
              onClick={() => setActivePage('reports')}
              style={{ background: 'none', border: 'none', color: 'rgb(59, 130, 246)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
            >
              View Reports <ChevronRight size={14} />
            </button>
          </div>

          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[1, 2, 3].map((n) => (
                <div key={n} style={{ padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div className="skeleton" style={{ width: '80px', height: '16px', borderRadius: '4px' }} />
                  <div className="skeleton skeleton-title" style={{ width: '70%', height: '18px' }} />
                  <div className="skeleton skeleton-text" style={{ height: '12px' }} />
                  <div className="skeleton skeleton-text" style={{ width: '85%', height: '12px' }} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentInsights.map((ins) => (
                <div
                  key={ins.id}
                  style={{ padding: '1rem', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}
                  className="insight-card-hover"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(139, 92, 246, 0.1)', color: 'rgb(216, 180, 254)' }}>
                      {ins.tag}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={10} />
                      {latestReportTime ? formatLastUpdate(latestReportTime) : 'Today'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.5 }}>{ins.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Trending Topics from real data */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Trending Topics</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {backendOnline ? 'Live category distribution' : 'Waiting for backend...'}
            </p>
          </div>

          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {[1, 2, 3, 4].map((n) => (
                <div key={n} style={{ padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <div className="skeleton" style={{ width: '60%', height: '14px', borderRadius: '4px', marginBottom: '6px' }} />
                  <div className="skeleton" style={{ width: '40%', height: '10px', borderRadius: '4px' }} />
                </div>
              ))}
            </div>
          ) : trendingTopics.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem', padding: '2rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <WifiOff size={24} style={{ opacity: 0.4 }} />
              <span>Trending data loads from the backend</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {trendingTopics.map((topic, idx) => (
                <div
                  key={idx}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', borderRadius: '10px', backgroundColor: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--border-color)' }}
                >
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 600 }}>{topic.name}</h4>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Score: {topic.score}/100</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: renderTrendColor(topic.trend) }}>
                      {topic.change}
                    </span>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {renderTrendIcon(topic.trend)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Shortcut Action Links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        <div
          onClick={() => setActivePage('news-feed')}
          className="glass-panel hover-card"
          style={{ padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
        >
          <div>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 600 }}>Explore Intelligence Feed</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {totalArticles > 0 ? `${totalArticles} live articles from RSS feeds` : 'Read detailed reports and search articles'}
            </p>
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
