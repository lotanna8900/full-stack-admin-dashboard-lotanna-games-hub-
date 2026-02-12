"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../utils/supabaseClient'; 
import Link from 'next/link';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [tokenVerified, setTokenVerified] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setTokenVerified(true);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handlePasswordUpdate = async (event) => {
    event.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    
    setLoading(true);
    setMessage({ type: '', text: '' });

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    setLoading(false);

    if (error) {
      console.error('Error updating password:', error);
      setMessage({ type: 'error', text: 'Error: Could not update password. The link may have expired.' });
    } else {
      setMessage({ type: 'success', text: 'Success! Your password has been updated.' });
      await supabase.auth.signOut();
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Set New Password</h1>
          {!tokenVerified && (
            <p className="auth-subtitle">
              Verifying your reset token...
            </p>
          )}
        </div>

        {message.text && (
          <div className={`auth-message ${message.type}`}>
            {message.text}
          </div>
        )}

        {tokenVerified ? (
          <form className="auth-form" onSubmit={handlePasswordUpdate}>
            <div className="form-group">
              <label className="form-label" htmlFor="password">New Password</label>
              <input
                id="password"
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="confirm-password">Confirm New Password</label>
              <input
                id="confirm-password"
                type="password"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary btn-full" 
              disabled={loading}
            >
              {loading ? <span className="spinner"></span> : 'Set New Password'}
            </button>
          </form>
        ) : (
          !message.text && (
            <div style={{ textAlign: 'center' }}>
              <span className="spinner"></span>
            </div>
          )
        )}
        
        {message.type === 'error' && (
          <div className="auth-footer" style={{ borderTop: 'none', paddingTop: 0 }}>
            <Link href="/forgot-password" className="btn-link-secondary">
              Request a new reset link
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}