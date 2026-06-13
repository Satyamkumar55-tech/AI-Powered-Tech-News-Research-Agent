import React, { useState } from 'react';
import { 
  BarChart2, 
  TrendingUp, 
  Layers, 
  Globe, 
  Sparkles,
  PieChart
} from 'lucide-react';
import { articleService } from '../services/articleService';

export default function Analytics({ articles, reports }) {
  const [activeTooltip, setActiveTooltip] = useState(null); // { chart, index, x, y, label, value }

  // Data processing: Articles by Category
  const categoryCounts = articleService.getArticlesByCategory(articles);
  const categories = Object.keys(categoryCounts);
  const categoryValues = Object.values(categoryCounts);
  const maxCatVal = Math.max(...categoryValues, 1);

  // Data processing: Source distribution
  const sourceCounts = {};
  articles.forEach(art => {
    sourceCounts[art.source] = (sourceCounts[art.source] || 0) + 1;
  });
  const sources = Object.keys(sourceCounts);
  const sourceValues = Object.values(sourceCounts);
  const totalSources = sourceValues.reduce((a, b) => a + b, 0);

  // Hardcoded trend scores for Line Chart
  const scoreTrends = [
    { date: 'June 5', score: 7.2 },
    { date: 'June 6', score: 7.5 },
    { date: 'June 7', score: 7.9 },
    { date: 'June 8', score: 7.4 },
    { date: 'June 9', score: 8.2 },
    { date: 'June 10', score: 8.9 },
    { date: 'June 11', score: 9.3 }
  ];

  // Hardcoded daily report volumes
  const reportVolumes = [
    { day: 'Mon', count: 4 },
    { day: 'Tue', count: 6 },
    { day: 'Wed', count: 5 },
    { day: 'Thu', count: 8 },
    { day: 'Fri', count: 6 },
    { day: 'Sat', count: 3 },
    { day: 'Sun', count: 2 }
  ];
  const maxReportCount = Math.max(...reportVolumes.map(r => r.count), 1);

  // Colors mapping for styling
  const catColors = {
    'AI': 'rgb(59, 130, 246)',            // Blue
    'Cybersecurity': 'rgb(249, 115, 22)',   // Orange
    'Startups': 'rgb(139, 92, 246)',        // Purple
    'Cloud Computing': 'rgb(6, 182, 212)',  // Cyan
    'Software Development': 'rgb(16, 185, 129)' // Green
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Analytics Summary */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}
      >
        <div className="glass-panel" style={{ padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Layers size={18} color="rgb(59, 130, 246)" />
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Monitored Feeds</span>
            <strong style={{ fontSize: '1.05rem' }}>5 RSS Portals</strong>
          </div>
        </div>
        
        <div className="glass-panel" style={{ padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <TrendingUp size={18} color="rgb(139, 92, 246)" />
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Growth Rate</span>
            <strong style={{ fontSize: '1.05rem' }}>+12% Weekly</strong>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Globe size={18} color="rgb(6, 182, 212)" />
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Avg Dispatch Time</span>
            <strong style={{ fontSize: '1.05rem' }}>6:00 AM Daily</strong>
          </div>
        </div>
      </div>

      {/* Grid: Charts */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '1.5rem'
        }}
        className="analytics-charts-grid"
      >
        {/* Chart 1: Articles by Category (SVG Bar Chart) */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <BarChart2 size={16} color="rgb(59, 130, 246)" />
            Articles by Category Distribution
          </h3>

          <div style={{ position: 'relative', height: '240px' }}>
            <svg viewBox="0 0 400 220" style={{ width: '100%', height: '100%' }}>
              {/* Grid Lines */}
              <line x1="40" y1="20" x2="380" y2="20" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="3" />
              <line x1="40" y1="70" x2="380" y2="70" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="3" />
              <line x1="40" y1="120" x2="380" y2="120" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="3" />
              <line x1="40" y1="170" x2="380" y2="170" stroke="var(--border-color)" strokeWidth="1" />

              {/* Y Axis labels */}
              <text x="30" y="25" fill="var(--text-muted)" fontSize="8" textAnchor="end">100%</text>
              <text x="30" y="75" fill="var(--text-muted)" fontSize="8" textAnchor="end">50%</text>
              <text x="30" y="125" fill="var(--text-muted)" fontSize="8" textAnchor="end">25%</text>
              <text x="30" y="175" fill="var(--text-muted)" fontSize="8" textAnchor="end">0</text>

              {/* Bar Elements */}
              {categories.map((cat, idx) => {
                const count = categoryCounts[cat];
                const barHeight = (count / maxCatVal) * 130;
                const barWidth = 32;
                const x = 60 + idx * 65;
                const y = 170 - barHeight;
                const color = catColors[cat] || 'rgb(59, 130, 246)';

                return (
                  <g 
                    key={cat}
                    onMouseEnter={(e) => setActiveTooltip({
                      chart: 'cat', index: idx, x: x + 16, y: y - 10, label: cat, value: `${count} Articles`
                    })}
                    onMouseLeave={() => setActiveTooltip(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Bar background hover highlight */}
                    <rect x={x - 6} y="20" width={barWidth + 12} height="150" fill="transparent" />
                    
                    {/* Rounded Bar */}
                    <rect 
                      x={x} 
                      y={y} 
                      width={barWidth} 
                      height={barHeight} 
                      rx="4" 
                      fill={color} 
                      opacity="0.85"
                      style={{ transition: 'all 0.3s ease' }}
                    />
                    
                    {/* X Axis Label */}
                    <text 
                      x={x + 16} 
                      y="190" 
                      fill="var(--text-muted)" 
                      fontSize="7" 
                      textAnchor="middle"
                      transform={`rotate(10, ${x + 16}, 190)`}
                    >
                      {cat.length > 10 ? cat.slice(0, 8) + '..' : cat}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Custom React Tooltip rendering */}
            {activeTooltip && activeTooltip.chart === 'cat' && (
              <div 
                style={{
                  position: 'absolute',
                  left: `${(activeTooltip.x / 400) * 100}%`,
                  top: `${(activeTooltip.y / 220) * 100}%`,
                  transform: 'translate(-50%, -100%)',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(139, 92, 246, 0.4)',
                  color: '#fff',
                  fontSize: '0.72rem',
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap',
                  zIndex: 10
                }}
              >
                <strong>{activeTooltip.label}</strong>: {activeTooltip.value}
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Importance Score Trends (SVG Line Chart) */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TrendingUp size={16} color="rgb(139, 92, 246)" />
            Importance Score Trend Index
          </h3>

          <div style={{ position: 'relative', height: '240px' }}>
            <svg viewBox="0 0 400 220" style={{ width: '100%', height: '100%' }}>
              {/* Defs for gradients */}
              <defs>
                <linearGradient id="scoreGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="rgb(139, 92, 246)" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="45" y1="20" x2="380" y2="20" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="3" />
              <line x1="45" y1="70" x2="380" y2="70" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="3" />
              <line x1="45" y1="120" x2="380" y2="120" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="3" />
              <line x1="45" y1="170" x2="380" y2="170" stroke="var(--border-color)" strokeWidth="1" />

              {/* Y Axis Labels */}
              <text x="35" y="24" fill="var(--text-muted)" fontSize="8" textAnchor="end">10.0</text>
              <text x="35" y="74" fill="var(--text-muted)" fontSize="8" textAnchor="end">7.0</text>
              <text x="35" y="124" fill="var(--text-muted)" fontSize="8" textAnchor="end">4.0</text>
              <text x="35" y="174" fill="var(--text-muted)" fontSize="8" textAnchor="end">1.0</text>

              {/* Draw Area path under trend line */}
              <path 
                d="M 50 170 L 50 70 L 100 80 L 150 95 L 200 85 L 250 120 L 300 135 L 350 155 L 350 170 Z" 
                fill="url(#scoreGlow)" 
                style={{ display: 'none' /* Will construct path dynamically below */ }}
              />

              {/* Construct Line Path dynamically */}
              {(() => {
                const points = scoreTrends.map((t, idx) => {
                  const x = 60 + idx * 50;
                  // Map score 1-10 to Y coordinate 170 - 20 (range 150px)
                  const y = 170 - ((t.score - 1) / 9) * 150;
                  return { x, y, ...t };
                });
                
                const pathD = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                const areaD = `${pathD} L ${points[points.length - 1].x} 170 L ${points[0].x} 170 Z`;

                return (
                  <g>
                    {/* Area fill */}
                    <path d={areaD} fill="url(#scoreGlow)" />
                    
                    {/* Line path */}
                    <path 
                      d={pathD} 
                      fill="none" 
                      stroke="rgb(139, 92, 246)" 
                      strokeWidth="2.5" 
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Nodes (Circles) */}
                    {points.map((p, idx) => (
                      <circle
                        key={idx}
                        cx={p.x}
                        cy={p.y}
                        r="4"
                        fill="#ffffff"
                        stroke="rgb(139, 92, 246)"
                        strokeWidth="2.5"
                        onMouseEnter={(e) => setActiveTooltip({
                          chart: 'score', index: idx, x: p.x, y: p.y - 10, label: p.date, value: `Score ${p.score}`
                        })}
                        onMouseLeave={() => setActiveTooltip(null)}
                        style={{ cursor: 'pointer', transition: 'r 0.2s ease' }}
                      />
                    ))}

                    {/* X Axis labels */}
                    {points.map((p, idx) => (
                      <text 
                        key={idx} 
                        x={p.x} 
                        y="190" 
                        fill="var(--text-muted)" 
                        fontSize="7" 
                        textAnchor="middle"
                      >
                        {p.date.split(' ')[1]}
                      </text>
                    ))}
                  </g>
                );
              })()}
            </svg>

            {/* Line Tooltip */}
            {activeTooltip && activeTooltip.chart === 'score' && (
              <div 
                style={{
                  position: 'absolute',
                  left: `${(activeTooltip.x / 400) * 100}%`,
                  top: `${(activeTooltip.y / 220) * 100}%`,
                  transform: 'translate(-50%, -100%)',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(139, 92, 246, 0.4)',
                  color: '#fff',
                  fontSize: '0.72rem',
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap',
                  zIndex: 10
                }}
              >
                <strong>{activeTooltip.label}</strong>: {activeTooltip.value}
              </div>
            )}
          </div>
        </div>

        {/* Chart 3: Daily Report Count (SVG Bar Chart) */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} color="rgb(6, 182, 212)" />
            Daily AI Report Execution Counts
          </h3>

          <div style={{ position: 'relative', height: '240px' }}>
            <svg viewBox="0 0 400 220" style={{ width: '100%', height: '100%' }}>
              {/* Grid Lines */}
              <line x1="40" y1="20" x2="380" y2="20" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="3" />
              <line x1="40" y1="95" x2="380" y2="95" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="3" />
              <line x1="40" y1="170" x2="380" y2="170" stroke="var(--border-color)" strokeWidth="1" />

              {/* Y Labels */}
              <text x="30" y="24" fill="var(--text-muted)" fontSize="8" textAnchor="end">10 rep</text>
              <text x="30" y="99" fill="var(--text-muted)" fontSize="8" textAnchor="end">5 rep</text>
              <text x="30" y="174" fill="var(--text-muted)" fontSize="8" textAnchor="end">0</text>

              {/* Bar Elements */}
              {reportVolumes.map((r, idx) => {
                const barHeight = (r.count / 10) * 150;
                const barWidth = 24;
                const x = 55 + idx * 47;
                const y = 170 - barHeight;

                return (
                  <g 
                    key={idx}
                    onMouseEnter={(e) => setActiveTooltip({
                      chart: 'rep', index: idx, x: x + 12, y: y - 10, label: `${r.day}day`, value: `${r.count} Reports`
                    })}
                    onMouseLeave={() => setActiveTooltip(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    <rect x={x - 6} y="20" width={barWidth + 12} height="150" fill="transparent" />
                    <rect 
                      x={x} 
                      y={y} 
                      width={barWidth} 
                      height={barHeight} 
                      rx="3" 
                      fill="rgb(6, 182, 212)" 
                      opacity="0.8"
                    />
                    <text x={x + 12} y="190" fill="var(--text-muted)" fontSize="8" textAnchor="middle">{r.day}</text>
                  </g>
                );
              })}
            </svg>

            {/* Tooltip */}
            {activeTooltip && activeTooltip.chart === 'rep' && (
              <div 
                style={{
                  position: 'absolute',
                  left: `${(activeTooltip.x / 400) * 100}%`,
                  top: `${(activeTooltip.y / 220) * 100}%`,
                  transform: 'translate(-50%, -100%)',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(139, 92, 246, 0.4)',
                  color: '#fff',
                  fontSize: '0.72rem',
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap',
                  zIndex: 10
                }}
              >
                <strong>{activeTooltip.label}</strong>: {activeTooltip.value}
              </div>
            )}
          </div>
        </div>

        {/* Chart 4: Source Distribution (Progress Bars Index) */}
        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Globe size={16} color="rgb(16, 185, 129)" />
            RSS Source Publication Share
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '180px', justifyContent: 'center' }}>
            {sources.map((src, idx) => {
              const count = sourceCounts[src];
              const percentage = Math.round((count / totalSources) * 100);
              
              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ fontWeight: 600 }}>{src}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{count} articles ({percentage}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-input)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                    <div 
                      style={{ 
                        width: `${percentage}%`, 
                        height: '100%', 
                        background: 'linear-gradient(90deg, rgb(16, 185, 129) 0%, rgb(6, 182, 212) 100%)',
                        borderRadius: '4px' 
                      }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 991px) {
          .analytics-charts-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

    </div>
  );
}
