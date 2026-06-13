import React, { useState, useEffect } from 'react';
import {
  BarChart2,
  TrendingUp,
  Layers,
  Globe,
  Sparkles,
  RefreshCw,
  WifiOff,
  Loader,
} from 'lucide-react';
import apiClient from '../services/apiClient';

export default function Analytics({ articles, reports, backendOnline }) {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTooltip, setActiveTooltip] = useState(null);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getAnalytics();
      setAnalyticsData(data);
    } catch {
      setAnalyticsData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (backendOnline) {
      loadAnalytics();
    } else {
      setLoading(false);
    }
  }, [backendOnline]);

  // ── Data from backend or computed from props ──────────────────────────────
  const categoryDistribution = analyticsData?.categoryDistribution || (() => {
    const counts = {};
    articles.forEach(a => { counts[a.category] = (counts[a.category] || 0) + 1; });
    return Object.entries(counts).map(([category, count]) => ({ category, count }));
  })();

  const sourceDistribution = analyticsData?.sourceDistribution || (() => {
    const counts = {};
    articles.forEach(a => { counts[a.source] = (counts[a.source] || 0) + 1; });
    return Object.entries(counts).map(([source, count]) => ({ source, count }));
  })();

  const totalArticles = analyticsData?.articleCount ?? articles.length;
  const totalReports = analyticsData?.reportCount ?? reports.length;
  const avgScore = analyticsData?.avgImportanceScore ?? (
    articles.length > 0
      ? parseFloat((articles.reduce((s, a) => s + (a.importanceScore || 0), 0) / articles.length).toFixed(2))
      : 0
  );

  // Score trend — from backend or generate from articles
  const scoreTrend = analyticsData?.scoreTrend?.length > 0
    ? analyticsData.scoreTrend
    : (() => {
        // Fallback: generate 7-day buckets from articles prop
        const buckets = {};
        articles.forEach(art => {
          const day = (art.publishedAt || art.pubDate || '').slice(0, 10);
          if (day) {
            if (!buckets[day]) buckets[day] = { scores: [], count: 0 };
            buckets[day].scores.push(art.importanceScore || 5);
            buckets[day].count++;
          }
        });
        return Object.entries(buckets)
          .sort(([a], [b]) => a.localeCompare(b))
          .slice(-7)
          .map(([day, data]) => ({
            day,
            avg_score: parseFloat((data.scores.reduce((s, v) => s + v, 0) / data.scores.length).toFixed(2)),
            count: data.count,
          }));
      })();

  // Report generation history (last 7 reports)
  const reportHistory = analyticsData?.recentReports || reports.slice(0, 7).map(r => ({
    id: r.id,
    title: r.title,
    date: r.date,
    generated_at: r.generatedAt,
  }));

  // Category colors
  const catColors = {
    'AI': 'rgb(59, 130, 246)',
    'Cybersecurity': 'rgb(249, 115, 22)',
    'Startups': 'rgb(139, 92, 246)',
    'Cloud Computing': 'rgb(6, 182, 212)',
    'Software Development': 'rgb(16, 185, 129)',
    'default': 'rgb(100, 116, 139)',
  };

  const getCatColor = (cat) => catColors[cat] || catColors.default;

  const maxCatVal = Math.max(...categoryDistribution.map(d => d.count), 1);
  const totalSources = sourceDistribution.reduce((s, d) => s + d.count, 0);

  // Score trend chart helpers
  const maxTrendScore = 10;

  const formatDay = (dayStr) => {
    if (!dayStr) return '?';
    const d = new Date(dayStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Analytics Summary Header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        <div className="glass-panel" style={{ padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Layers size={18} color="rgb(59, 130, 246)" />
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Monitored Sources</span>
            <strong style={{ fontSize: '1.05rem' }}>
              {loading ? '—' : `${sourceDistribution.length} RSS Feeds`}
            </strong>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <TrendingUp size={18} color="rgb(139, 92, 246)" />
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Articles Processed</span>
            <strong style={{ fontSize: '1.05rem' }}>
              {loading ? '—' : totalArticles.toLocaleString()}
            </strong>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Globe size={18} color="rgb(6, 182, 212)" />
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Avg Importance Score</span>
            <strong style={{ fontSize: '1.05rem' }}>
              {loading ? '—' : `${avgScore} / 10`}
            </strong>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Sparkles size={18} color="rgb(16, 185, 129)" />
            <div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Reports Generated</span>
              <strong style={{ fontSize: '1.05rem' }}>
                {loading ? '—' : totalReports}
              </strong>
            </div>
          </div>
          {!loading && backendOnline && (
            <button
              onClick={loadAnalytics}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', borderRadius: '50%' }}
              title="Refresh analytics"
            >
              <RefreshCw size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3rem', gap: '1rem', color: 'var(--text-muted)' }}>
          <Loader size={24} className="spin-animation" color="rgb(59,130,246)" />
          <span>Loading analytics from backend...</span>
        </div>
      )}

      {/* Offline state */}
      {!loading && !backendOnline && totalArticles === 0 && (
        <div className="glass-panel" style={{
          padding: '3rem', textAlign: 'center', borderRadius: '16px',
          border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem'
        }}>
          <WifiOff size={40} style={{ opacity: 0.4, color: 'var(--text-muted)' }} />
          <h3 style={{ fontWeight: 700 }}>Analytics Offline</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Start the backend to load real analytics: <code style={{ background: 'rgba(0,0,0,0.2)', padding: '2px 6px', borderRadius: '4px' }}>cd server && npm start</code>
          </p>
        </div>
      )}

      {/* Charts grid */}
      {!loading && (totalArticles > 0 || categoryDistribution.length > 0) && (
        <div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}
          className="analytics-charts-grid"
        >
          {/* Chart 1: Articles by Category (Bar Chart) */}
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BarChart2 size={16} color="rgb(59, 130, 246)" />
              Articles by Category Distribution
            </h3>
            <div style={{ position: 'relative', height: '240px' }}>
              {categoryDistribution.length === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No category data yet</div>
              ) : (
                <svg viewBox="0 0 400 220" style={{ width: '100%', height: '100%' }}>
                  <line x1="40" y1="20" x2="380" y2="20" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="3" />
                  <line x1="40" y1="70" x2="380" y2="70" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="3" />
                  <line x1="40" y1="120" x2="380" y2="120" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="3" />
                  <line x1="40" y1="170" x2="380" y2="170" stroke="var(--border-color)" strokeWidth="1" />

                  <text x="30" y="25" fill="var(--text-muted)" fontSize="8" textAnchor="end">100%</text>
                  <text x="30" y="75" fill="var(--text-muted)" fontSize="8" textAnchor="end">50%</text>
                  <text x="30" y="125" fill="var(--text-muted)" fontSize="8" textAnchor="end">25%</text>
                  <text x="30" y="175" fill="var(--text-muted)" fontSize="8" textAnchor="end">0</text>

                  {categoryDistribution.slice(0, 5).map((item, idx) => {
                    const barHeight = (item.count / maxCatVal) * 130;
                    const barWidth = 40;
                    const spacing = Math.min(65, 320 / Math.max(categoryDistribution.length, 1));
                    const x = 50 + idx * spacing;
                    const y = 170 - barHeight;
                    const color = getCatColor(item.category);

                    return (
                      <g
                        key={item.category}
                        onMouseEnter={() => setActiveTooltip({ chart: 'cat', index: idx, x: x + 20, y: y - 10, label: item.category, value: `${item.count} articles` })}
                        onMouseLeave={() => setActiveTooltip(null)}
                        style={{ cursor: 'pointer' }}
                      >
                        <rect x={x - 6} y="20" width={barWidth + 12} height="150" fill="transparent" />
                        <rect x={x} y={y} width={barWidth} height={barHeight} rx="4" fill={color} opacity="0.85" style={{ transition: 'all 0.3s ease' }} />
                        <text x={x + 20} y="200" fill="var(--text-muted)" fontSize="7" textAnchor="middle" transform={`rotate(15, ${x + 20}, 200)`}>
                          {item.category.length > 10 ? item.category.slice(0, 8) + '..' : item.category}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              )}

              {activeTooltip && activeTooltip.chart === 'cat' && (
                <div style={{
                  position: 'absolute',
                  left: `${(activeTooltip.x / 400) * 100}%`,
                  top: `${(activeTooltip.y / 220) * 100}%`,
                  transform: 'translate(-50%, -100%)',
                  padding: '4px 8px', borderRadius: '4px',
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(139, 92, 246, 0.4)',
                  color: '#fff', fontSize: '0.72rem', pointerEvents: 'none',
                  whiteSpace: 'nowrap', zIndex: 10
                }}>
                  <strong>{activeTooltip.label}</strong>: {activeTooltip.value}
                </div>
              )}
            </div>
          </div>

          {/* Chart 2: Importance Score Trend (Line Chart) */}
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TrendingUp size={16} color="rgb(139, 92, 246)" />
              Importance Score Trend Index
            </h3>
            <div style={{ position: 'relative', height: '240px' }}>
              {scoreTrend.length === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No trend data yet</div>
              ) : (
                <svg viewBox="0 0 400 220" style={{ width: '100%', height: '100%' }}>
                  <defs>
                    <linearGradient id="scoreGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="rgb(139, 92, 246)" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  <line x1="45" y1="20" x2="380" y2="20" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="3" />
                  <line x1="45" y1="70" x2="380" y2="70" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="3" />
                  <line x1="45" y1="120" x2="380" y2="120" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="3" />
                  <line x1="45" y1="170" x2="380" y2="170" stroke="var(--border-color)" strokeWidth="1" />

                  <text x="35" y="24" fill="var(--text-muted)" fontSize="8" textAnchor="end">10.0</text>
                  <text x="35" y="74" fill="var(--text-muted)" fontSize="8" textAnchor="end">7.0</text>
                  <text x="35" y="124" fill="var(--text-muted)" fontSize="8" textAnchor="end">4.0</text>
                  <text x="35" y="174" fill="var(--text-muted)" fontSize="8" textAnchor="end">1.0</text>

                  {(() => {
                    const points = scoreTrend.map((t, idx) => {
                      const spacing = 320 / Math.max(scoreTrend.length - 1, 1);
                      const x = 55 + idx * spacing;
                      const y = 170 - ((t.avg_score - 1) / 9) * 150;
                      return { x, y, ...t };
                    });
                    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                    const areaD = `${pathD} L ${points[points.length - 1].x} 170 L ${points[0].x} 170 Z`;

                    return (
                      <g>
                        <path d={areaD} fill="url(#scoreGlow)" />
                        <path d={pathD} fill="none" stroke="rgb(139, 92, 246)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        {points.map((p, i) => (
                          <g key={i}>
                            <circle
                              cx={p.x} cy={p.y} r="4"
                              fill="#ffffff" stroke="rgb(139, 92, 246)" strokeWidth="2.5"
                              onMouseEnter={() => setActiveTooltip({ chart: 'score', index: i, x: p.x, y: p.y - 10, label: formatDay(p.day), value: `Avg: ${p.avg_score}` })}
                              onMouseLeave={() => setActiveTooltip(null)}
                              style={{ cursor: 'pointer' }}
                            />
                            <text x={p.x} y="195" fill="var(--text-muted)" fontSize="7" textAnchor="middle">
                              {formatDay(p.day).split(' ')[1]}
                            </text>
                          </g>
                        ))}
                      </g>
                    );
                  })()}
                </svg>
              )}

              {activeTooltip && activeTooltip.chart === 'score' && (
                <div style={{
                  position: 'absolute',
                  left: `${(activeTooltip.x / 400) * 100}%`,
                  top: `${(activeTooltip.y / 220) * 100}%`,
                  transform: 'translate(-50%, -100%)',
                  padding: '4px 8px', borderRadius: '4px',
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(139, 92, 246, 0.4)',
                  color: '#fff', fontSize: '0.72rem', pointerEvents: 'none',
                  whiteSpace: 'nowrap', zIndex: 10
                }}>
                  <strong>{activeTooltip.label}</strong>: {activeTooltip.value}
                </div>
              )}
            </div>
          </div>

          {/* Chart 3: Report Generation History */}
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} color="rgb(6, 182, 212)" />
              Recent Intelligence Reports
            </h3>
            {reportHistory.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '180px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No reports generated yet</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '220px', overflowY: 'auto' }}>
                {reportHistory.map((rep, i) => (
                  <div key={rep.id || i} style={{
                    padding: '0.75rem', borderRadius: '8px',
                    backgroundColor: 'rgba(6,182,212,0.04)', border: '1px solid rgba(6,182,212,0.12)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem'
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.8rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {rep.title || 'Intelligence Briefing'}
                      </p>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        {rep.generated_at ? new Date(rep.generated_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : rep.date}
                      </span>
                    </div>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 700,
                      padding: '2px 6px', borderRadius: '4px',
                      backgroundColor: 'rgba(6,182,212,0.1)', color: 'rgb(6,182,212)',
                      whiteSpace: 'nowrap'
                    }}>
                      #{i + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chart 4: Source Distribution */}
          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Globe size={16} color="rgb(16, 185, 129)" />
              RSS Source Publication Share
            </h3>
            {sourceDistribution.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '180px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No source data yet</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '180px', justifyContent: 'center' }}>
                {sourceDistribution.map((item, idx) => {
                  const percentage = Math.round((item.count / totalSources) * 100);
                  return (
                    <div key={item.source || idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                        <span style={{ fontWeight: 600 }}>{item.source}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{item.count} articles ({percentage}%)</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-input)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                        <div style={{
                          width: `${percentage}%`, height: '100%',
                          background: 'linear-gradient(90deg, rgb(16, 185, 129) 0%, rgb(6, 182, 212) 100%)',
                          borderRadius: '4px', transition: 'width 0.5s ease'
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spin-animation {
          animation: spin 1s linear infinite;
        }
        @media (max-width: 991px) {
          .analytics-charts-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
