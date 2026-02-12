"use client";
import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleAuth = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    
    // Basic password validation for sign up
    if (isSigningUp && password.length < 6) {
      setMessage('Error: Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    let authError = null;

    if (isSigningUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      authError = error;
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      authError = error;
    }
    
    if (authError) {
      setMessage(`Error: ${authError.message}`);
      console.error(authError);
    } else {
      const action = isSigningUp 
        ? "Sign-up successful! Check your email to confirm your account." 
        : "Login successful! Redirecting...";
      setMessage(action);
      
      if (!isSigningUp) {
        setTimeout(() => {
          window.location.href = '/'; 
        }, 1000);
      }
    }
    
    setLoading(false);
  };

  // Toggle between sign in and sign up
  const toggleMode = () => {
    setIsSigningUp(!isSigningUp);
    setMessage('');
    setPassword('');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <h1>{isSigningUp ? 'Create Account' : 'Welcome Back'}</h1>
          <p className="auth-subtitle">
            {isSigningUp 
              ? 'Sign up to get started with your account' 
              : 'Sign in to continue to your dashboard'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleAuth} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder={isSigningUp ? 'At least 6 characters' : 'Enter your password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                autoComplete={isSigningUp ? 'new-password' : 'current-password'}
                style={{ paddingRight: '3rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                disabled={loading}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {isSigningUp && (
              <small style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
                Password must be at least 6 characters
              </small>
            )}
          </div>
          
          {/* Message Display */}
          {message && (
            <div 
              className={`auth-message ${message.startsWith('Error') ? 'error' : 'success'}`}
              role="alert"
            >
              {message}
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            className="btn btn-primary btn-full" 
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <span className="spinner"></span>
                Processing...
              </span>
            ) : (
              isSigningUp ? 'Create Account' : 'Sign In'
            )}
          </button>
        </form>

        {/* Forgot password link */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link 
            href="/forgot-password" 
            className="btn-link-secondary"
          >
            Forgot your password?
          </Link>
        </div>

        
        {/* Toggle Sign In/Up */}
        <div className="auth-footer">
          <p>
            {isSigningUp ? 'Already have an account?' : "Don't have an account?"}
            <button 
              type="button" 
              className="btn-link-primary" 
              onClick={toggleMode}
              disabled={loading}
            >
              {isSigningUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>

        {/* Back to Home Link */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <Link href="/" className="btn-link-secondary">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}