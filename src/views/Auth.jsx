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
    const parsed = users ? JSON.parse(users) : [];
    // Seed default user if registry is empty
    if (parsed.length === 0) {
      const defaultUser = {
        name: 'Satyam Kumar',
        email: 'developer@techpulse.ai',
        password: 'password123'
      };
      localStorage.setItem('techpulse_registered_users', JSON.stringify([defaultUser]));
      return [defaultUser];
    }
    return parsed;
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
          setError('This account does not exist. Please sign up first, or use test credentials: developer@techpulse.ai / password123');
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

  const handleGoogleSignIn = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      
      // Personalize the Google login based on entered email if available, otherwise default to Satyam Kumar
      let loginEmail = 'satyam.developer@gmail.com';
      let loginName = 'Satyam Kumar';
      
      if (email.trim() && email.includes('@')) {
        loginEmail = email.trim().toLowerCase();
        const prefix = loginEmail.split('@')[0];
        loginName = prefix.charAt(0).toUpperCase() + prefix.slice(1);
      }

      onLoginSuccess({
        email: loginEmail,
        name: loginName
      });
    }, 1000);
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

        {/* Divider */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            margin: '1.5rem 0',
            fontSize: '0.75rem',
            color: 'var(--text-muted)'
          }}
        >
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
          <span style={{ padding: '0 0.75rem' }}>OR CONTINUE WITH</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }} />
        </div>

        {/* Google Authentication Button */}
        <button
          onClick={handleGoogleSignIn}
          className="btn btn-secondary"
          style={{ 
            width: '100%', 
            height: '42px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '0.75rem' 
          }}
          disabled={loading}
        >
          {/* Simple flat Google G Logo */}
          <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.87-2.6-2.87-4.53-5.84-4.53z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

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
