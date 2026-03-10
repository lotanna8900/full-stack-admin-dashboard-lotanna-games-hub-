"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../utils/supabaseClient'; 

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState(''); // NEW: Need email for OTP
  const [otp, setOtp] = useState('');     // NEW: Need the 6-digit code
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handlePasswordUpdate = async (event) => {
    event.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Step 1: Verify the 6-digit code
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'recovery', // Tells Supabase this is a password reset code
    });

    if (verifyError) {
      setMessage({ type: 'error', text: `Verification failed: ${verifyError.message}` });
      setLoading(false);
      return;
    }

    // Step 2: If code is valid, update the password
    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    });

    setLoading(false);

    if (updateError) {
      console.error('Error updating password:', updateError);
      setMessage({ type: 'error', text: 'Error: Could not set new password.' });
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
          <p className="auth-subtitle">Enter your email, the 6-digit code, and your new password.</p>
        </div>

        {message.text && (
          <div className={`auth-message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form className="auth-form" onSubmit={handlePasswordUpdate}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email" type="email" className="form-input"
              value={email} onChange={(e) => setEmail(e.target.value)}
              required placeholder="you@example.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="otp">6-Digit Reset Code</label>
            <input
              id="otp" type="text" className="form-input"
              value={otp} onChange={(e) => setOtp(e.target.value)}
              required maxLength={6} placeholder="123456"
              style={{ letterSpacing: '0.2rem', fontWeight: 'bold' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">New Password</label>
            <input
              id="password" type="password" className="form-input"
              value={password} onChange={(e) => setPassword(e.target.value)}
              required minLength={6} placeholder="••••••••"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirm-password">Confirm New Password</label>
            <input
              id="confirm-password" type="password" className="form-input"
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              required minLength={6} placeholder="••••••••"
            />
          </div>
          
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Verifying...' : 'Set New Password'}
          </button>
        </form>
      </div>
    </div>
  );
}