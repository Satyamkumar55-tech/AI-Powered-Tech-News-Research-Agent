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
  Loader
} from 'lucide-react';
import { reportService } from '../services/reportService';

export default function AIReports() {
  const [reportContent, setReportContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const loadReport = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await reportService.getLatestReport();
      setReportContent(data);
    } catch (err) {
      setError(err.message || 'Failed to load report');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 2500);
  };

  const handleShare = () => {
    const shareUrl = `https://techpulse.ai/reports/live`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      triggerToast("Report link copied to clipboard successfully!");
    }).catch(() => {
      triggerToast("Failed to copy link. Please try again.");
    });
  };

  const handleDownloadMarkdown = () => {
    if (!reportContent) return;
    
    let md = `# Live AI Research Report (${new Date().toLocaleDateString()})\n\n`;
    md += reportContent;
    md += `\n\n*Generated automatically by TechPulse AI News Research Agent.*`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `live-report-${new Date().toISOString().split('T')[0]}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("Markdown report file download started.");
  };

  const handlePrint = () => {
    window.print();
  };

  const todayDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
      
      {/* Toast Alert Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '0.8rem 1.5rem',
            borderRadius: '24px',
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            color: '#ffffff',
            fontSize: '0.82rem',
            fontWeight: 600,
            border: '1.5px solid rgba(139, 92, 246, 0.5)',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5), var(--shadow-glow-purple)',
            zIndex: 1000,
            animation: 'fadeIn 0.2s ease-out',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <CheckCircle size={16} color="rgb(16, 185, 129)" />
          {toastMessage}
        </div>
      )}

      {/* Selector and Actions Bar */}
      <div 
        className="glass-panel hide-on-print"
        style={{
          padding: '1.25rem',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Calendar size={18} color="var(--text-muted)" />
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Live AI Report</span>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button 
            onClick={loadReport} 
            className="btn btn-secondary btn-sm"
            style={{ gap: '6px' }}
            title="Refresh Report"
            disabled={isLoading}
          >
            <RefreshCw size={14} className={isLoading ? "spin-animation" : ""} />
            <span>Refresh</span>
          </button>

          <button 
            onClick={handleDownloadMarkdown} 
            className="btn btn-secondary btn-sm"
            style={{ gap: '6px' }}
            title="Download Report in Markdown format"
            disabled={!reportContent}
          >
            <FileDown size={14} />
            <span>Markdown</span>
          </button>

          <button 
            onClick={handlePrint} 
            className="btn btn-secondary btn-sm"
            style={{ gap: '6px' }}
            title="Print report or save as PDF"
            disabled={!reportContent}
          >
            <Printer size={14} />
            <span>Export PDF</span>
          </button>

          <button 
            onClick={handleShare} 
            className="btn btn-accent btn-sm"
            style={{ gap: '6px' }}
            title="Copy shareable link"
            disabled={!reportContent}
          >
            <Share2 size={14} />
            <span>Share Report</span>
          </button>
        </div>
      </div>

      {/* Main Report Document Print Container */}
      <div 
        className="glass-panel print-document"
        style={{
          padding: '2.5rem',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem',
          backgroundColor: 'var(--bg-card)',
          minHeight: '400px'
        }}
      >
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '1rem', color: 'var(--text-muted)', minHeight: '300px' }}>
            <Loader size={32} className="spin-animation" color="rgb(59, 130, 246)" />
            <p>Generating AI research report... This may take up to 90 seconds.</p>
          </div>
        ) : error ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '1rem', color: 'rgb(239, 68, 68)', minHeight: '300px' }}>
            <AlertCircle size={48} />
            <p style={{ fontWeight: 600 }}>{error}</p>
            <button onClick={loadReport} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Document Header */}
            <div 
              style={{ 
                borderBottom: '2px solid var(--border-color)', 
                paddingBottom: '1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                flexWrap: 'wrap',
                gap: '1rem' 
              }}
            >
              <div>
                <span 
                  style={{ 
                    fontSize: '0.72rem', 
                    color: 'rgb(6, 182, 212)', 
                    fontWeight: 700, 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.1em',
                    display: 'block',
                    marginBottom: '4px'
                  }}
                >
                  Verified AI Analyst Briefing
                </span>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', lineHeight: 1.1 }}>
                  Latest AI Research Report
                </h1>
              </div>
              
              <div style={{ textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <div>Date Generated: <strong>{todayDate}</strong></div>
                <div>Classification: <strong>Enterprise Research</strong></div>
              </div>
            </div>

            {/* Report Content Card */}
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={18} color="rgb(59, 130, 246)" />
                Report Content
              </h2>
              <div 
                style={{ 
                  fontSize: '0.92rem', 
                  color: 'var(--text-main)', 
                  lineHeight: 1.6,
                  padding: '1.25rem',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255,255,255,0.01)',
                  border: '1px solid var(--border-color)',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'inherit'
                }}
              >
                {reportContent}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Print Specific CSS Stylesheet injection */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spin-animation {
          animation: spin 1s linear infinite;
        }
        @media print {
          /* Hide app layout elements */
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          aside, header, .hide-on-print, .chat-fab, footer {
            display: none !important;
          }
          .main-content {
            margin: 0 !important;
            padding: 0 !important;
          }
          .content-body {
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
          }
          .print-document {
            border: none !important;
            background: transparent !important;
            padding: 0 !important;
            box-shadow: none !important;
            color: #000000 !important;
          }
          .print-document * {
            color: #000000 !important;
            border-color: #cccccc !important;
          }
          .print-document h1, .print-document h2, .print-document h3 {
            page-break-after: avoid;
          }
        }
      `}</style>

    </div>
  );
}
