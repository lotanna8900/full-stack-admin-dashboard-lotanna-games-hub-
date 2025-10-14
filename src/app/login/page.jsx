"use client";
import { useState } from 'react';
import { supabase } from '../utils/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAuth = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    
    let authError = null;

    if (isSigningUp) {
      // 1. Call the signUp method
      const { error } = await supabase.auth.signUp({ email, password });
      authError = error;
    } else {
      // 2. Call the signInWithPassword method
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      authError = error;
    }
    
    if (authError) {
      setMessage(`Error: ${authError.message}`);
      console.error(authError);
    } else {
      // The user is either logged in or needs to confirm their email
      const action = isSigningUp 
        ? "Sign-up successful! Check your email to confirm your account." 
        : "Login successful! Redirecting...";
      setMessage(action);
      
      // OPTIONAL: Redirect the user to the dashboard after successful login (not sign up)
      if (!isSigningUp) {
          window.location.href = '/'; 
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <h1>{isSigningUp ? 'Create Account' : 'Sign In'}</h1>
      <form onSubmit={handleAuth}>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        
        {message && <p style={{ color: message.startsWith('Error') ? 'red' : 'green' }}>{message}</p>}

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Processing...' : (isSigningUp ? 'Sign Up' : 'Sign In')}
        </button>
      </form>
      
      <p style={{ marginTop: '1rem' }}>
        {isSigningUp ? 'Already have an account?' : "Don't have an account?"}
        <button 
          type="button" 
          className="btn btn-link" 
          onClick={() => setIsSigningUp(!isSigningUp)}
          style={{ marginLeft: '0.5rem' }}
        >
          {isSigningUp ? 'Sign In' : 'Sign Up'}
        </button>
      </p>
    </div>
  );
}