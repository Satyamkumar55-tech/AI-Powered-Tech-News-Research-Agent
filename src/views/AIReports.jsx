import React, { useState, useEffect } from 'react';
import {
  FileDown,
  Printer,
  Share2,
  Calendar,
  CheckCircle,
  FileText,
  AlertCircle,
  RefreshCw,
  Loader,
  ChevronDown,
  Clock,
  Sparkles,
  BookOpen,
  Target,
  Lightbulb,
  ExternalLink,
  WifiOff,
} from 'lucide-react';
import apiClient from '../services/apiClient';
import { reportService } from '../services/reportService';

export default function AIReports({ reports: propReports, backendOnline, onRefresh }) {
  const [allReports, setAllReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Load all reports on mount
  const loadReports = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const reports = await apiClient.getReports();
      setAllReports(reports);
      if (reports.length > 0) {
        // Load the latest report in full detail
        const latest = await apiClient.getLatestReport();
        setSelectedReport(latest);
      }
    } catch (err) {
      setError(err.message || 'Failed to load reports from backend.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  // Sync if parent pushes new reports
  useEffect(() => {
    if (propReports && propReports.length > 0 && allReports.length === 0 && !isLoading) {
      setAllReports(propReports);
      setSelectedReport(propReports[0]);
    }
  }, [propReports]);

  // Select a report by ID from the dropdown
  const handleSelectReport = async (reportId) => {
    if (!reportId) return;
    if (selectedReport?.id === reportId) return;
    setIsLoading(true);
    try {
      const report = await apiClient.getReportById(reportId);
      setSelectedReport(report);
    } catch (err) {
      triggerToast('Failed to load report: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2800);
  };

  const handleShare = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl).then(() => {
      triggerToast('Report link copied to clipboard successfully!');
    }).catch(() => {
      triggerToast('Failed to copy link.');
    });
  };

  const handleDownloadMarkdown = () => {
    if (!selectedReport) return;
    const md = reportService.formatReportAsMarkdown(selectedReport);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `techpulse-report-${selectedReport.date}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Markdown report file download started.');
  };

  const handlePrint = () => window.print();

  const formatDate = (isoStr) => {
    if (!isoStr) return '';
    return new Date(isoStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatTime = (isoStr) => {
    if (!isoStr) return '';
    return new Date(isoStr).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getScoreColor = (score) => {
    if (score >= 9.0) return 'rgb(239, 68, 68)';
    if (score >= 8.0) return 'rgb(249, 115, 22)';
    if (score >= 6.5) return 'rgb(59, 130, 246)';
    return 'var(--text-muted)';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>

      {/* Toast */}
      {toastMessage && (
        <div style={{
          position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
          padding: '0.8rem 1.5rem', borderRadius: '24px',
          backgroundColor: 'rgba(15, 23, 42, 0.95)', color: '#ffffff',
          fontSize: '0.82rem', fontWeight: 600,
          border: '1.5px solid rgba(139, 92, 246, 0.5)',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
          zIndex: 1000, animation: 'fadeIn 0.2s ease-out',
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <CheckCircle size={16} color="rgb(16, 185, 129)" />
          {toastMessage}
        </div>
      )}

      {/* Header Controls Bar */}
      <div className="glass-panel hide-on-print" style={{
        padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '1rem'
      }}>
        {/* Report selector dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '220px' }}>
          <Calendar size={18} color="var(--text-muted)" />
          <div style={{ position: 'relative', flex: 1 }}>
            <select
              value={selectedReport?.id || ''}
              onChange={(e) => handleSelectReport(e.target.value)}
              disabled={isLoading || allReports.length === 0}
              style={{
                width: '100%', padding: '0.5rem 2rem 0.5rem 0.75rem',
                background: 'var(--bg-input)', border: '1px solid var(--border-color)',
                borderRadius: '8px', color: 'var(--text-main)',
                fontSize: '0.85rem', outline: 'none', cursor: 'pointer',
                appearance: 'none', WebkitAppearance: 'none'
              }}
            >
              {allReports.length === 0 ? (
                <option value="">No reports available</option>
              ) : (
                allReports.map((r) => (
                  <option key={r.id} value={r.id}>
                    {formatTime(r.generatedAt)} — {r.title.length > 45 ? r.title.slice(0, 42) + '...' : r.title}
                  </option>
                ))
              )}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          </div>
          {allReports.length > 0 && (
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              {allReports.length} total
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={loadReports} className="btn btn-secondary btn-sm" style={{ gap: '6px' }} disabled={isLoading}>
            <RefreshCw size={14} className={isLoading ? 'spin-animation' : ''} />
            <span>Refresh</span>
          </button>
          <button onClick={handleDownloadMarkdown} className="btn btn-secondary btn-sm" style={{ gap: '6px' }} disabled={!selectedReport}>
            <FileDown size={14} />
            <span>Markdown</span>
          </button>
          <button onClick={handlePrint} className="btn btn-secondary btn-sm" style={{ gap: '6px' }} disabled={!selectedReport}>
            <Printer size={14} />
            <span>Export PDF</span>
          </button>
          <button onClick={handleShare} className="btn btn-accent btn-sm" style={{ gap: '6px' }} disabled={!selectedReport}>
            <Share2 size={14} />
            <span>Share Report</span>
          </button>
        </div>
      </div>

      {/* Main Report Document */}
      <div className="glass-panel print-document" style={{
        padding: '2.5rem', borderRadius: '16px', border: '1px solid var(--border-color)',
        display: 'flex', flexDirection: 'column', gap: '2rem',
        backgroundColor: 'var(--bg-card)', minHeight: '400px'
      }}>
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '1rem', color: 'var(--text-muted)', minHeight: '300px' }}>
            <Loader size={32} className="spin-animation" color="rgb(59, 130, 246)" />
            <p>Loading intelligence report...</p>
          </div>
        ) : error ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '1rem', minHeight: '300px' }}>
            <WifiOff size={48} color="rgb(239,68,68)" style={{ opacity: 0.7 }} />
            <p style={{ fontWeight: 600, color: 'rgb(239,68,68)' }}>{error}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '400px' }}>
              Make sure the backend is running: <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>cd server && npm start</code>
            </p>
            <button onClick={loadReports} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
              Try Again
            </button>
          </div>
        ) : !selectedReport ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '1rem', color: 'var(--text-muted)', minHeight: '300px' }}>
            <FileText size={48} style={{ opacity: 0.4 }} />
            <h3 style={{ fontWeight: 700, fontSize: '1.1rem' }}>No Reports Generated Yet</h3>
            <p style={{ fontSize: '0.85rem', textAlign: 'center', maxWidth: '380px' }}>
              The backend will automatically generate the first intelligence report on startup. Reports are generated every hour.
            </p>
            {onRefresh && (
              <button onClick={onRefresh} className="btn btn-secondary" style={{ marginTop: '0.5rem', gap: '6px' }}>
                <RefreshCw size={14} />
                Check Again
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Document Header */}
            <div style={{
              borderBottom: '2px solid var(--border-color)',
              paddingBottom: '1.25rem',
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
              flexWrap: 'wrap', gap: '1rem'
            }}>
              <div>
                <span style={{
                  fontSize: '0.72rem', color: 'rgb(6, 182, 212)', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                  display: 'block', marginBottom: '4px'
                }}>
                  Verified AI Analyst Briefing
                </span>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)', lineHeight: 1.1 }}>
                  {selectedReport.title}
                </h1>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end', marginBottom: '4px' }}>
                  <Clock size={13} />
                  <span>Generated: <strong>{formatTime(selectedReport.generatedAt)}</strong></span>
                </div>
                <div>Classification: <strong>Enterprise Research</strong></div>
                {allReports.length > 1 && (
                  <div style={{ marginTop: '4px', color: 'rgb(139,92,246)', fontWeight: 600 }}>
                    Report #{allReports.findIndex(r => r.id === selectedReport.id) + 1} of {allReports.length}
                  </div>
                )}
              </div>
            </div>

            {/* Executive Summary */}
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={16} color="rgb(59, 130, 246)" />
                Executive Summary
              </h2>
              <div style={{
                padding: '1.25rem', borderRadius: '12px',
                backgroundColor: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.15)',
                fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: 1.7
              }}>
                {selectedReport.summary}
              </div>
            </div>

            {/* Top Source Articles */}
            {selectedReport.articles && selectedReport.articles.length > 0 && (
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Target size={16} color="rgb(249, 115, 22)" />
                  Top {selectedReport.articles.length} Priority Articles
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {selectedReport.articles.map((art, idx) => (
                    <div key={art.id || idx} style={{
                      padding: '1.1rem', borderRadius: '10px',
                      backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)',
                      display: 'flex', flexDirection: 'column', gap: '0.5rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{
                            fontSize: '0.65rem', fontWeight: 800,
                            width: '20px', height: '20px', borderRadius: '50%',
                            backgroundColor: 'rgba(249,115,22,0.15)',
                            color: 'rgb(249,115,22)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            {idx + 1}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                            {art.source} · {art.category}
                          </span>
                        </div>
                        <span style={{
                          fontSize: '0.75rem', fontWeight: 800,
                          color: getScoreColor(art.importanceScore),
                          padding: '2px 8px', borderRadius: '6px',
                          backgroundColor: 'rgba(255,255,255,0.04)',
                          border: '1px solid var(--border-color)'
                        }}>
                          {art.importanceScore?.toFixed(1)} / 10
                        </span>
                      </div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, lineHeight: 1.3 }}>{art.title}</h4>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{art.summary?.slice(0, 200)}{art.summary?.length > 200 ? '...' : ''}</p>
                      {art.url && (
                        <a href={art.url} target="_blank" rel="noreferrer" style={{
                          fontSize: '0.72rem', color: 'rgb(59,130,246)',
                          display: 'flex', alignItems: 'center', gap: '4px',
                          textDecoration: 'none', width: 'fit-content'
                        }}>
                          Read original <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Industry Insights */}
            {selectedReport.insights && selectedReport.insights.length > 0 && (
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={16} color="rgb(139, 92, 246)" />
                  Industry Insights
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {selectedReport.insights.map((insight, i) => (
                    <div key={i} style={{
                      padding: '0.9rem 1.1rem', borderRadius: '10px',
                      backgroundColor: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.12)',
                      display: 'flex', gap: '0.75rem', alignItems: 'flex-start'
                    }}>
                      <span style={{
                        width: '20px', height: '20px', borderRadius: '50%', flexShrink: 0,
                        backgroundColor: 'rgba(139,92,246,0.15)', color: 'rgb(216,180,254)',
                        fontSize: '0.7rem', fontWeight: 800,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px'
                      }}>
                        {i + 1}
                      </span>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.6 }}>{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Takeaways */}
            {selectedReport.takeaways && selectedReport.takeaways.length > 0 && (
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Lightbulb size={16} color="rgb(16, 185, 129)" />
                  Key Takeaways
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {selectedReport.takeaways.map((takeaway, i) => (
                    <div key={i} style={{
                      padding: '0.9rem 1.1rem', borderRadius: '10px',
                      backgroundColor: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.12)',
                      display: 'flex', gap: '0.75rem', alignItems: 'flex-start'
                    }}>
                      <CheckCircle size={16} color="rgb(16,185,129)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.6 }}>{takeaway}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Why It Matters */}
            {selectedReport.whyItMatters && (
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BookOpen size={16} color="rgb(6, 182, 212)" />
                  Why It Matters
                </h2>
                <div style={{
                  padding: '1.25rem', borderRadius: '12px',
                  backgroundColor: 'rgba(6,182,212,0.04)', border: '1px solid rgba(6,182,212,0.15)',
                  fontSize: '0.92rem', color: 'var(--text-main)', lineHeight: 1.7
                }}>
                  {selectedReport.whyItMatters}
                </div>
              </div>
            )}

            {/* Report footer */}
            <div style={{
              borderTop: '1px solid var(--border-color)', paddingTop: '1rem',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              flexWrap: 'wrap', gap: '0.5rem',
              fontSize: '0.72rem', color: 'var(--text-muted)'
            }}>
              <span>Report ID: {selectedReport.id}</span>
              <span>TechPulse AI Intelligence Platform · Auto-generated</span>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spin-animation {
          animation: spin 1s linear infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @media print {
          body { background: #ffffff !important; color: #000000 !important; }
          aside, header, .hide-on-print, .chat-fab, footer { display: none !important; }
          .main-content { margin: 0 !important; padding: 0 !important; }
          .content-body { padding: 0 !important; margin: 0 !important; max-width: 100% !important; }
          .print-document { border: none !important; background: transparent !important; padding: 0 !important; box-shadow: none !important; color: #000000 !important; }
          .print-document * { color: #000000 !important; border-color: #cccccc !important; }
          .print-document h1, .print-document h2, .print-document h3 { page-break-after: avoid; }
        }
      `}</style>
    </div>
  );
}
