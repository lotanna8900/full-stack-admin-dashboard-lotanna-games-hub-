"use client";
import { useState, Suspense } from 'react';
import { supabase } from '../utils/supabaseClient';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(''); // NEW: State for the 6-digit code
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [showOtp, setShowOtp] = useState(false); // NEW: Toggles the OTP input field
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  
  const nextParam = searchParams.get('next') || '/';

  const handleAuth = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    // --- NEW: OTP Verification Step ---
    if (showOtp) {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'signup' // Tells Supabase this is a new account confirmation
      });

      if (error) {
        setMessage(`Error: ${error.message}`);
        setLoading(false);
      } else {
        setMessage("Verification successful! Redirecting...");
        setTimeout(() => {
          router.push(nextParam);
          router.refresh();
        }, 1000);
      }
      return; // Stop the function here so it doesn't run the signup logic again
    }

    // --- Existing Auth Logic ---
    if (isSigningUp && password.length < 6) {
      setMessage('Error: Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    if (isSigningUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMessage(`Error: ${error.message}`);
      } else {
        setShowOtp(true); // Switch the UI to ask for the code!
        setMessage("Code sent! Check your email for the 6-digit verification code.");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage("Login successful! Redirecting...");
        setTimeout(() => {
          router.push(nextParam);
          router.refresh();
        }, 1000);
      }
    }
    
    setLoading(false);
  };

  const toggleMode = () => {
    setIsSigningUp(!isSigningUp);
    setShowOtp(false); // Reset OTP state if they toggle
    setMessage('');
    setPassword('');
    setOtp('');
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <h1>{showOtp ? 'Verify Email' : isSigningUp ? 'Create Account' : 'Welcome Back'}</h1>
        <p className="auth-subtitle">
          {showOtp 
            ? 'Enter the 6-digit code sent to your email'
            : isSigningUp 
              ? 'Sign up to get started with your account' 
              : 'Sign in to continue to your The Lab'}
        </p>
      </div>

      <form onSubmit={handleAuth} className="auth-form">
        <div className="form-group">
          <label className="form-label" htmlFor="email">Email Address</label>
          <input
            id="email" type="email" className="form-input" placeholder="you@example.com"
            value={email} onChange={(e) => setEmail(e.target.value)}
            required disabled={loading || showOtp} autoComplete="email"
          />
        </div>

        {/* --- DYNAMIC RENDER: Show OTP input OR Password input --- */}
        {showOtp ? (
          <div className="form-group">
            <label className="form-label" htmlFor="otp">6-Digit Code</label>
            <input
              id="otp" type="text" className="form-input" placeholder="123456"
              value={otp} onChange={(e) => setOtp(e.target.value)}
              required disabled={loading} maxLength={6}
              style={{ fontSize: '1.5rem', letterSpacing: '0.25rem', textAlign: 'center' }}
            />
          </div>
        ) : (
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password" type={showPassword ? 'text' : 'password'} className="form-input"
                placeholder={isSigningUp ? 'At least 6 characters' : 'Enter your password'}
                value={password} onChange={(e) => setPassword(e.target.value)}
                required disabled={loading} autoComplete={isSigningUp ? 'new-password' : 'current-password'}
                style={{ paddingRight: '3rem' }}
              />
              <button
                type="button" onClick={() => setShowPassword(!showPassword)}
                className="password-toggle" disabled={loading}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>
        )}
        
        {message && (
          <div className={`auth-message ${message.startsWith('Error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
          {loading ? 'Processing...' : showOtp ? 'Verify Code' : isSigningUp ? 'Create Account' : 'Sign In'}
        </button>
      </form>

      {!showOtp && (
        <>
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <Link href="/forgot-password" className="btn-link-secondary">Forgot your password?</Link>
          </div>
          <div className="auth-footer">
            <p>
              {isSigningUp ? 'Already have an account?' : "Don't have an account?"}
              <button type="button" className="btn-link-primary" onClick={toggleMode} disabled={loading}>
                {isSigningUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </>
      )}

      <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <Link href="/" className="btn-link-secondary">← Back to Home</Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="auth-container">
      <Suspense fallback={<div className="auth-card" style={{ textAlign: 'center', padding: '3rem' }}><h2>Loading...</h2></div>}>
        <LoginContent />
      </Suspense>
    </div>
  );
}