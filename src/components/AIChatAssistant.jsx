import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  X, 
  Sparkles, 
  Cpu, 
  CornerDownLeft, 
  Bot,
  User 
} from 'lucide-react';
import { aiService } from '../services/aiService';

export default function AIChatAssistant({ articles }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hello! I am your TechPulse AI research agent. I can summarize articles, explain recent security threats, check tech trends, or recommend articles based on importance scores. What are we researching today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const chatEndRef = useRef(null);

  // Initialize AI service with backend data when articles/reports change
  useEffect(() => {
    if (articles && articles.length > 0) {
      aiService.setContext({
        articles: articles || [],
        reports: articles, // NOTE: This appears to be unused in aiService
        analytics: null,
      });
    }
  }, [articles]);

  // Auto scroll to bottom of messages
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSendMessage = (text) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage = {
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const botReply = aiService.answerUserQuestion(text);
      const botMessage = {
        sender: 'bot',
        text: botReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const presetQueries = [
    { label: "Summarize GPT-5 beta", query: "Summarize the OpenAI GPT-5 developer beta article" },
    { label: "Explain Linux Zero-Day", query: "Tell me about the Linux network stack vulnerability" },
    { label: "Recommend high score news", query: "Recommend articles with high importance scores" },
    { label: "Show tech trends", query: "What are the trending topics today?" }
  ];

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 990 }}>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgb(139, 92, 246) 0%, rgb(59, 130, 246) 100%)',
            color: '#ffffff',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(139, 92, 246, 0.4), var(--shadow-glow-purple)',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
          className="chat-fab"
          title="Open AI Chat Assistant"
        >
          <MessageSquare size={24} />
          {/* Subtle pulse ring */}
          <span 
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              border: '2px solid rgba(139, 92, 246, 0.4)',
              animation: 'ping 2s infinite'
            }}
          />
        </button>
      )}

      {/* Expanded Chat Drawer */}
      {isOpen && (
        <div
          className="glass-panel"
          style={{
            width: '400px',
            height: '600px',
            maxWidth: 'calc(100vw - 48px)',
            maxHeight: 'calc(100vh - 120px)',
            borderRadius: '16px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-lg), 0 20px 50px rgba(0,0,0,0.3)',
            border: '1px solid var(--border-color)',
            animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            backgroundColor: 'var(--bg-sidebar)'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(90deg, rgba(139, 92, 246, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, rgb(139, 92, 246), rgb(6, 182, 212))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Cpu size={16} color="#fff" />
              </div>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Research Assistant
                  <Sparkles size={12} color="rgb(6, 182, 212)" />
                </h4>
                <span style={{ fontSize: '0.7rem', color: 'rgb(16, 185, 129)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'rgb(16, 185, 129)', display: 'inline-block' }} />
                  AI Agent Online
                </span>
              </div>
            </div>
            
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.05)'
              }}
              className="chat-close-btn"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages Area */}
          <div
            style={{
              flex: 1,
              padding: '1.25rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              backgroundColor: 'rgba(0,0,0,0.05)'
            }}
          >
            {messages.map((msg, index) => {
              const isBot = msg.sender === 'bot';
              return (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.65rem',
                    flexDirection: isBot ? 'row' : 'row-reverse',
                    maxWidth: '85%',
                    alignSelf: isBot ? 'flex-start' : 'flex-end'
                  }}
                >
                  {/* Avatar */}
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isBot ? 'rgba(139, 92, 246, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                      border: `1px solid ${isBot ? 'rgba(139, 92, 246, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
                      color: isBot ? 'rgb(216, 180, 254)' : 'rgb(147, 197, 253)',
                      flexShrink: 0
                    }}
                  >
                    {isBot ? <Bot size={14} /> : <User size={14} />}
                  </div>
                  
                  {/* Bubble */}
                  <div
                    style={{
                      padding: '0.75rem 0.95rem',
                      borderRadius: '14px',
                      borderTopLeftRadius: isBot ? '2px' : '14px',
                      borderTopRightRadius: isBot ? '14px' : '2px',
                      backgroundColor: isBot ? 'var(--bg-card)' : 'rgb(59, 130, 246)',
                      color: isBot ? 'var(--text-main)' : '#ffffff',
                      border: `1px solid ${isBot ? 'var(--border-color)' : 'transparent'}`,
                      fontSize: '0.82rem',
                      lineHeight: 1.4,
                      boxShadow: 'var(--shadow-sm)',
                      whiteSpace: 'pre-line'
                    }}
                  >
                    {msg.text}
                    <div 
                      style={{ 
                        fontSize: '0.65rem', 
                        color: isBot ? 'var(--text-muted)' : 'rgba(255, 255, 255, 0.7)', 
                        textAlign: 'right', 
                        marginTop: '4px' 
                      }}
                    >
                      {msg.time}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', alignSelf: 'flex-start' }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(139, 92, 246, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgb(216, 180, 254)'
                }}>
                  <Bot size={14} />
                </div>
                <div
                  style={{
                    padding: '0.6rem 1rem',
                    borderRadius: '14px',
                    borderTopLeftRadius: '2px',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    gap: '4px',
                    alignItems: 'center'
                  }}
                >
                  <span className="typing-dot" style={{ animationDelay: '0s' }} />
                  <span className="typing-dot" style={{ animationDelay: '0.2s' }} />
                  <span className="typing-dot" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Quick suggestions if history is short */}
          {messages.length <= 2 && (
            <div 
              style={{
                padding: '0.75rem 1rem',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
                backgroundColor: 'rgba(0, 0, 0, 0.08)'
              }}
            >
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Suggested Tasks:</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {presetQueries.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(item.query)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                      fontSize: '0.7rem',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
                    }}
                    className="suggestion-chip"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputValue);
            }}
            style={{
              padding: '0.75rem 1rem',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'var(--bg-sidebar)'
            }}
          >
            <input
              type="text"
              placeholder="Ask a question about news or reports..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isTyping}
              style={{
                flex: 1,
                padding: '0.6rem 0.9rem',
                borderRadius: '20px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                fontSize: '0.82rem',
                color: 'var(--text-main)',
                outline: 'none',
                transition: 'all var(--transition-fast)'
              }}
              className="chat-input-field"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: inputValue.trim() && !isTyping ? 'rgb(59, 130, 246)' : 'rgba(255, 255, 255, 0.05)',
                color: inputValue.trim() && !isTyping ? '#fff' : 'var(--text-muted)',
                border: 'none',
                cursor: inputValue.trim() && !isTyping ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all var(--transition-fast)'
              }}
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}

      <style>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .chat-fab:hover {
          transform: scale(1.05) translateY(-2px);
          box-shadow: 0 12px 40px rgba(139, 92, 246, 0.5), var(--shadow-glow-purple) !important;
        }
        .suggestion-chip:hover {
          border-color: var(--border-color-hover) !important;
          background-color: rgba(139, 92, 246, 0.1) !important;
          color: rgb(216, 180, 254) !important;
        }
        .chat-input-field:focus {
          border-color: rgba(59, 130, 246, 0.5) !important;
        }
        .typing-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: var(--text-muted);
          display: inline-block;
          animation: typingPulse 1.2s infinite ease-in-out;
        }
        @keyframes typingPulse {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.4); opacity: 1; }
        }
        .chat-close-btn:hover {
          background-color: rgba(239, 68, 68, 0.2) !important;
          color: rgb(239, 68, 68) !important;
        }
      `}</style>
    </div>
  );
}
