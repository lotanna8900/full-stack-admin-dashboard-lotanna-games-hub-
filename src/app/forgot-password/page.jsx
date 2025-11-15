"use client";
import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handlePasswordReset = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Must change this before I go to production
    // ive domain, e.g., 'https://lotalabs.com/reset-password'
    const redirectTo = 'lotalabs.vercel.app/reset-password';

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo,
    });

    setLoading(false);

    if (error) {
      console.error('Error sending password reset email:', error);
      setMessage({ type: 'error', text: 'Error: Could not send reset email. Please try again.' });
    } else {
      setMessage({ type: 'success', text: 'Success! Please check your email for a password reset link.' });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Forgot Password?</h1>
          <p className="auth-subtitle">
            No problem. Enter your email below and we'll send you a link to reset it.
          </p>
        </div>

        {message.text && (
          <div className={`auth-message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form className="auth-form" onSubmit={handlePasswordReset}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary btn-full" 
            disabled={loading}
          >
            {loading ? <span className="spinner"></span> : 'Send Reset Link'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Remembered your password?
            <Link href="/login" className="btn-link-primary">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}