"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import Link from 'next/link';

export default function ProfilePage() {
  // State for the profile form
  const [profile, setProfile] = useState(null);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [notifyComments, setNotifyComments] = useState(true);
  const [notifyDigest, setNotifyDigest] = useState(false);
  const [notifyMarketing, setNotifyMarketing] = useState(false);

  // State for session and loading
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- DATA FETCHING ---
  useEffect(() => {
    // Helper function to fetch the user's profile
    const fetchProfile = async (currentSession) => {
      if (currentSession) {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*') // Select all profile data
          .eq('id', currentSession.user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
        } else if (data) {
          // Populate state with fetched profile data
          setProfile(data);
          setUsername(data.username || '');
          setBio(data.bio || '');

          setNotifyComments(data.notify_comments ?? true); // Default to true if null
          setNotifyDigest(data.notify_digest ?? false);
          setNotifyMarketing(data.notify_marketing ?? false);
        }
        setLoading(false);
      }
    };

    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      fetchProfile(currentSession);
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      fetchProfile(currentSession);
    });

    // 3. Cleanup listener
    return () => subscription?.unsubscribe();
  }, []);


  // --- HANDLERS ---

  // Profile Update Handler
  const handleUpdateProfile = async (event) => {
    event.preventDefault();

    if (!session) {
      alert("You must be logged in to update your profile.");
      return;
    }

    const user = session.user;
    
    // Prepare the data for upsert
    const profileData = {
      id: user.id, // The user's ID
      username: username,
      bio: bio,
      updated_at: new Date(), 

      notify_comments: notifyComments,
      notify_digest: notifyDigest,
      notify_marketing: notifyMarketing
    };

    // Perform the 'upsert' operation
    const { error } = await supabase.from('profiles').upsert(profileData);

    if (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    } else {
      // CORRECTED: Update local state to the new data
      setProfile(profileData); 
      alert('Profile updated successfully!');
    }
  };

  // Loading state
  if (loading && !profile) {
    return <div>Loading profile...</div>; // Simple loading message
  }

  // Not logged in state
  if (!session) {
    return (
        <div id="settings-section" className="section">
            <div className="dashboard-header">
                <div className="dashboard-title">
                    <h1>Profile</h1>
                    <p>You must be logged in to view your profile.</p>
                    <Link href="/login" className="btn btn-primary" style={{marginTop: '1rem', width: 'auto'}}>Go to Login</Link>
                </div>
            </div>
        </div>
    );
  }


  return (
    <div id="settings-section" className="section">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Profile</h1>
          <p className="dashboard-subtitle">Manage your personal account and preferences</p>
        </div>
      </div>

      <div className="content-grid">
        <div className="content-card">
          <h2 className="content-title">Profile Settings</h2>
          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label className="form-label">Display Name</label>
              <input
                type="text"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea
                className="form-textarea"
                style={{ whiteSpace: 'pre-wrap' }} 
                placeholder="Tell us about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              ></textarea>
            </div>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </form>
        </div>

        <div className="content-card">
        <h2 className="content-title">Notification Preferences</h2>
        
        <div className="form-group">
          <label className="form-label">
            <input 
              type="checkbox" 
              checked={notifyComments} 
              onChange={(e) => setNotifyComments(e.target.checked)} 
            /> Email notifications for comments
          </label>
        </div>
        <div className="form-group">
          <label className="form-label">
            <input 
              type="checkbox" 
              checked={notifyDigest} 
              onChange={(e) => setNotifyDigest(e.target.checked)} 
            /> Weekly digest emails
          </label>
        </div>
        <div className="form-group">
          <label className="form-label">
            <input 
              type="checkbox" 
              checked={notifyMarketing} 
              onChange={(e) => setNotifyMarketing(e.target.checked)} 
            /> Marketing emails
          </label>
        </div>
      </div>
      </div>
    </div>
  );
}