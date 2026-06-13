import React, { useState } from 'react';
import { 
  Sparkles, 
  Shield, 
  Rocket, 
  Cloud, 
  Code,
  ArrowRight,
  TrendingUp,
  Clock,
  ChevronDown,
  ChevronUp,
  Eye,
  Bookmark
} from 'lucide-react';
import { articleService } from '../services/articleService';

export default function Categories({ 
  articles, 
  savedArticles, 
  toggleSaveArticle, 
  setSelectedArticleDetails, 
  setActivePage,
  setActiveCategoryFilter
}) {
  const [expandedCategory, setExpandedCategory] = useState(null);

  const categoryConfigs = [
    { name: 'AI', icon: Sparkles, desc: 'Generative Models, Neural Architectures, and Autonomous Agents', color: 'rgb(59, 130, 246)' },
    { name: 'Cybersecurity', icon: Shield, desc: 'Zero-Days, Network Stack Bugs, Ransomware, and Governance', color: 'rgb(249, 115, 22)' },
    { name: 'Startups', icon: Rocket, desc: 'Venture Capital, Seed Rounds, Mergers & Acquisitions, and Web3 Payouts', color: 'rgb(139, 92, 246)' },
    { name: 'Cloud Computing', icon: Cloud, desc: 'Serverless Architectures, Container Pods, Kubernetes, and Cloud Databases', color: 'rgb(6, 182, 212)' },
    { name: 'Software Development', icon: Code, desc: 'TypeScript Compilers, Rust Toolchains, Package Registry, and Frameworks', color: 'rgb(16, 185, 129)' }
  ];

  const getArticlesByCat = (catName) => {
    return articles.filter(a => a.category === catName);
  };

  const handleToggleExpand = (catName) => {
    if (expandedCategory === catName) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(catName);
    }
  };

  const handleNavigateToFeed = (catName) => {
    setActiveCategoryFilter(catName);
    setActivePage('news-feed');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Page Header info */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Browse research material indexed by core engineering sectors.
        </p>
      </div>

      {/* Grid List of Category Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {categoryConfigs.map((cat) => {
          const catArticles = getArticlesByCat(cat.name);
          const count = catArticles.length;
          const avgScore = articleService.getAvgImportanceScore(catArticles);
          const IconComponent = cat.icon;
          const isExpanded = expandedCategory === cat.name;

          return (
            <div 
              key={cat.name}
              className="glass-panel"
              style={{
                borderRadius: '14px',
                border: '1px solid var(--border-color)',
                overflow: 'hidden',
                transition: 'all var(--transition-normal)',
                boxShadow: isExpanded ? 'var(--shadow-lg), var(--shadow-glow)' : 'var(--shadow-sm)'
              }}
            >
              {/* Card Title Header */}
              <div 
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  cursor: 'pointer',
                  backgroundColor: isExpanded ? 'rgba(255,255,255,0.02)' : 'transparent',
                  transition: 'background-color var(--transition-fast)'
                }}
                onClick={() => handleToggleExpand(cat.name)}
                className="category-card-header"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {/* Category icon with color border */}
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      backgroundColor: `rgba(${cat.name === 'AI' ? '59, 130, 246' : cat.name === 'Cybersecurity' ? '249, 115, 22' : cat.name === 'Startups' ? '139, 92, 246' : cat.name === 'Cloud Computing' ? '6, 182, 212' : '16, 185, 129'}, 0.1)`,
                      border: `1.5px solid ${cat.color}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: cat.color
                    }}
                  >
                    <IconComponent size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{cat.name}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px', maxWidth: '460px' }}>
                      {cat.desc}
                    </p>
                  </div>
                </div>

                {/* Statistics right panel */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Articles</span>
                    <strong style={{ fontSize: '1.2rem', fontWeight: 800 }}>{count}</strong>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Avg Score</span>
                    <strong style={{ fontSize: '1.2rem', fontWeight: 800, color: cat.color }}>
                      {avgScore}
                    </strong>
                  </div>

                  {/* Expand toggle indicator */}
                  <div 
                    style={{
                      padding: '6px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>
              </div>

              {/* Collapsible Article Drilldown Feed */}
              {isExpanded && (
                <div 
                  style={{
                    padding: '1.5rem',
                    borderTop: '1px solid var(--border-color)',
                    backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    animation: 'fadeIn 0.25s ease-out'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Latest publications in {cat.name}:</h4>
                    <button
                      onClick={() => handleNavigateToFeed(cat.name)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', gap: '4px' }}
                    >
                      <span>Explore In Main Feed</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>

                  {catArticles.length === 0 ? (
                    <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      No articles in this category today.
                    </div>
                  ) : (
                    catArticles.map((art) => {
                      const isSaved = savedArticles.some(s => s.id === art.id);
                      return (
                        <div
                          key={art.id}
                          style={{
                            padding: '1rem',
                            borderRadius: '8px',
                            backgroundColor: 'var(--bg-card)',
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                            transition: 'all var(--transition-fast)'
                          }}
                          className="drilldown-article-item"
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.3 }}>{art.title}</h4>
                            <span 
                              style={{ 
                                fontSize: '0.75rem', 
                                fontWeight: 700, 
                                color: parseFloat(avgScore) >= 8.5 ? 'rgb(249, 115, 22)' : 'rgb(59, 130, 246)',
                                flexShrink: 0
                              }}
                            >
                              Score: {art.importanceScore.toFixed(1)}
                            </span>
                          </div>
                          
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                            {art.summary}
                          </p>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={10} />
                              {art.source} • {new Date(art.pubDate).toLocaleDateString()}
                            </span>

                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button 
                                onClick={() => setSelectedArticleDetails(art)}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.72rem', gap: '4px' }}
                              >
                                <Eye size={12} />
                                <span>Read</span>
                              </button>
                              
                              <button
                                onClick={() => toggleSaveArticle(art)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: isSaved ? 'rgb(139, 92, 246)' : 'var(--text-muted)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  padding: '4px',
                                  borderRadius: '4px',
                                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                  border: '1px solid var(--border-color)'
                                }}
                              >
                                <Bookmark size={12} fill={isSaved ? "currentColor" : "none"} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        .category-card-header:hover {
          background-color: rgba(255,255,255,0.03) !important;
        }
        .light .category-card-header:hover {
          background-color: rgba(0,0,0,0.02) !important;
        }
        .drilldown-article-item:hover {
          border-color: var(--border-color-hover) !important;
        }
      `}</style>

    </div>
  );
}
