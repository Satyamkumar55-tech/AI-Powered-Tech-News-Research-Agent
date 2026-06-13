import React, { useState } from 'react';
import { Mail, Lock, User, ShieldAlert, Cpu } from 'lucide-react';

export default function Auth({ onLoginSuccess, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleValidation = () => {
    setError('');
    
    if (mode === 'signup' && !name.trim()) {
      setError('Please enter your full name.');
      return false;
    }
    
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return false;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }
    
    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    
    return true;
  };

  const getRegisteredUsers = () => {
    const users = localStorage.getItem('techpulse_registered_users');
    return users ? JSON.parse(users) : [];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!handleValidation()) return;
    
    setLoading(true);
    setError('');
    
    // Simulate API authorization latency
    setTimeout(() => {
      const users = getRegisteredUsers();
      const lowerEmail = email.trim().toLowerCase();

      if (mode === 'signup') {
        // Check if user already exists
        const userExists = users.some(u => u.email.toLowerCase() === lowerEmail);
        if (userExists) {
          setError('An account with this email already exists. Please sign in instead.');
          setLoading(false);
          return;
        }

        // Add user
        const newUser = {
          name: name.trim(),
          email: lowerEmail,
          password: password
        };
        const updatedUsers = [...users, newUser];
        localStorage.setItem('techpulse_registered_users', JSON.stringify(updatedUsers));
        
        setLoading(false);
        onLoginSuccess({
          email: newUser.email,
          name: newUser.name
        });
      } else {
        // Login mode
        const matchedUser = users.find(u => u.email.toLowerCase() === lowerEmail);
        if (!matchedUser) {
          setError('This account does not exist. Please sign up first.');
          setLoading(false);
          return;
        }

        if (matchedUser.password !== password) {
          setError('Incorrect password. Please try again.');
          setLoading(false);
          return;
        }

        setLoading(false);
        onLoginSuccess({
          email: matchedUser.email,
          name: matchedUser.name
        });
      }
    }, 1200);
  };



  const handleForgotPassword = () => {
    if (!email || !email.includes('@')) {
      alert('Please enter your email address in the email field first.');
      return;
    }
    alert(`A password reset link has been dispatched to ${email}. Please check your inbox.`);
  };

  return (
    <div 
      style={{
        display: 'flex',
        minHeight: '100vh',
        width: '100vw',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-app)',
        padding: '1.5rem',
        background: 'radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.08) 0%, rgba(139, 92, 246, 0.05) 90%), var(--bg-app)',
        transition: 'all var(--transition-normal)'
      }}
    >
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '440px',
          borderRadius: '16px',
          padding: '2.5rem 2rem',
          boxShadow: 'var(--shadow-lg)',
          animation: 'fadeIn 0.3s ease-out',
          border: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-sidebar)'
        }}
      >
        {/* Brand Logo Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div 
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgb(59, 130, 246), rgb(139, 92, 246))',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)',
              marginBottom: '0.75rem'
            }}
          >
            <Cpu size={26} color="#fff" />
          </div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
            TechPulse AI
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {mode === 'login' ? 'Sign in to access AI News Intelligence' : 'Register your research agent account'}
          </p>
        </div>

        {/* Error notification banner */}
        {error && (
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: 'rgb(248, 113, 113)',
              fontSize: '0.8rem',
              marginBottom: '1.25rem'
            }}
          >
            <ShieldAlert size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Auth form */}
        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="form-group">
              <label>Full Name</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <User size={16} />
                </span>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Mail size={16} />
              </span>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label>Password</label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'rgb(59, 130, 246)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Lock size={16} />
              </span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                disabled={loading}
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div className="form-group">
              <label>Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          {mode === 'login' && (
            <div 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                margin: '1.25rem 0',
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ cursor: 'pointer' }}
                disabled={loading}
              />
              <label htmlFor="remember" style={{ color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none' }}>
                Remember me for 30 days
              </label>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem', height: '42px', position: 'relative' }}
            disabled={loading}
          >
            {loading ? (
              <span className="auth-spinner" />
            ) : mode === 'login' ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>
        </form>



        {/* Toggle between login and signup */}
        <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
          </span>
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgb(59, 130, 246)',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {mode === 'login' ? 'Create an Account' : 'Sign In'}
          </button>
        </div>
      </div>

      <style>{`
        .auth-spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: #fff;
          animation: authSpin 0.8s linear infinite;
        }
        @keyframes authSpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
