"use client";
import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handlePasswordReset = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // We no longer need the redirectTo URL since they enter the OTP directly on the site
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    setLoading(false);

    if (error) {
      console.error('Error sending password reset email:', error);
      setMessage({ type: 'error', text: 'Error: Could not send reset code. Please try again.' });
    } else {
      setMessage({ type: 'success', text: 'Success! Check your email for the 6-digit reset code. Redirecting...' });
      
      setTimeout(() => {
        router.push('/reset-password');
      }, 2000);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Forgot Password?</h1>
          <p className="auth-subtitle">
            No problem. Enter your email below and we'll send you a 6-digit code to reset it.
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
            {loading ? <span className="spinner"></span> : 'Send Reset Code'}
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