"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import Link from 'next/link';
import Image from 'next/image';

const defaultAvatars = [
  'https://rkhmjcwqsmgzqtmvdblm.supabase.co/storage/v1/object/public/admin-assets/1761761021617_battle.png',
  'https://rkhmjcwqsmgzqtmvdblm.supabase.co/storage/v1/object/public/admin-assets/1761761012962_gamer_(8).png',
  'https://rkhmjcwqsmgzqtmvdblm.supabase.co/storage/v1/object/public/admin-assets/1761761006084_gamer_(7).png',
  'https://rkhmjcwqsmgzqtmvdblm.supabase.co/storage/v1/object/public/admin-assets/1761760998806_gamer_(6).png',
  'https://rkhmjcwqsmgzqtmvdblm.supabase.co/storage/v1/object/public/admin-assets/1761760988444_gamer_(5).png',
  'https://rkhmjcwqsmgzqtmvdblm.supabase.co/storage/v1/object/public/admin-assets/1761760977097_gamer_(4).png',
  'https://rkhmjcwqsmgzqtmvdblm.supabase.co/storage/v1/object/public/admin-assets/1761760967668_gamer_(3).png',
  'https://rkhmjcwqsmgzqtmvdblm.supabase.co/storage/v1/object/public/admin-assets/1761760944777_gamer_(2).png',
  'https://rkhmjcwqsmgzqtmvdblm.supabase.co/storage/v1/object/public/admin-assets/1761760924464_gamer_(1).png',
  'https://rkhmjcwqsmgzqtmvdblm.supabase.co/storage/v1/object/public/admin-assets/1761760897804_gamer.png'
];

export default function ProfilePage() {
  // State for the profile form
  const [profile, setProfile] = useState(null);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [notifyComments, setNotifyComments] = useState(true);
  const [notifyAnnouncements, setNotifyAnnouncements] = useState(true);
  const [notifySubscriptions, setNotifySubscriptions] = useState(true);
  const [newAvatarUrl, setNewAvatarUrl] = useState('');

  // State for session and loading
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchProfile = async (currentSession) => {
      if (currentSession) {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentSession.user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
        } else if (data) {
          setProfile(data);
          setUsername(data.username || '');
          setBio(data.bio || '');
          setNewAvatarUrl(data.avatar_url || '');

          setNotifyComments(data.notify_comments ?? true);
          setNotifyAnnouncements(data.notify_announcements ?? true);
          setNotifySubscriptions(data.notify_subscriptions ?? true);
        }
        setLoading(false);
      }
    };

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      fetchProfile(currentSession);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      fetchProfile(currentSession);
    });

    return () => subscription?.unsubscribe();
  }, []);

  // --- HANDLERS ---
  const handleUpdateProfile = async (event) => {
    event.preventDefault();

    if (!session) {
      alert("You must be logged in to update your profile.");
      return;
    }

    setSaving(true);
    const user = session.user;
    
    const profileData = {
      id: user.id,
      username: username,
      bio: bio,
      updated_at: new Date(), 
      avatar_url: newAvatarUrl,
      notify_comments: notifyComments,
      notify_announcements: notifyAnnouncements,
      notify_subscriptions: notifySubscriptions
    };

    const { error } = await supabase.from('profiles').upsert(profileData);

    if (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    } else {
      setProfile(profileData); 
      alert('Profile updated successfully!');
    }
    setSaving(false);
  };

  // Loading state
  if (loading && !profile) {
    return (
      <div id="settings-section" className="section">
        <div className="dashboard-header">
          <h1>Loading profile...</h1>
        </div>
      </div>
    );
  }

  // Not logged in state
  if (!session) {
    return (
      <div id="settings-section" className="section">
        <div className="dashboard-header">
          <div className="dashboard-title">
            <h1>Profile</h1>
            <p>You must be logged in to view your profile.</p>
            <Link href="/login" className="btn btn-primary" style={{marginTop: '1rem', width: 'auto'}}>
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="settings-section" className="section">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Profile Settings</h1>
          <p className="dashboard-subtitle">Manage your personal account and preferences</p>
        </div>
      </div>

      <div className="content-grid">
        <div className="content-card">
          <h2 className="content-title">Personal Information</h2>
          <form onSubmit={handleUpdateProfile}>
            
            {/* Current Avatar Display */}
            {newAvatarUrl && (
              <div className="current-avatar-display">
                <Image 
                  src={newAvatarUrl} 
                  alt="Current avatar" 
                  width={80} 
                  height={80} 
                  style={{ borderRadius: '50%' }} 
                />
                <div>
                  <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Current Avatar</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>This is how others see you</p>
                </div>
              </div>
            )}

            {/* Avatar Picker */}
            <div className="form-group">
              <label className="form-label">Choose Avatar</label>
              <div className="avatar-picker-grid">
                {defaultAvatars.map((url) => (
                  <Image
                    key={url}
                    src={url}
                    alt="Avatar option"
                    width={70}
                    height={70}
                    onClick={() => setNewAvatarUrl(url)}
                    className={`avatar-option ${newAvatarUrl === url ? 'selected' : ''}`}
                  />
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Display Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter your display name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <small style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                This name will be shown on your comments and posts
              </small>
            </div>

            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea
                className="form-textarea"
                style={{ whiteSpace: 'pre-wrap', minHeight: '100px' }} 
                placeholder="Tell us about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              ></textarea>
              <small style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Share a bit about yourself (optional)
              </small>
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        <div className="content-card">
          <h2 className="content-title">Email Notifications</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Choose what emails you'd like to receive from us
          </p>
          
          <form onSubmit={handleUpdateProfile}>
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={notifyComments} 
                  onChange={(e) => setNotifyComments(e.target.checked)}
                  style={{ marginRight: '0.75rem', width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Comment Notifications</div>
                  <small style={{ color: 'var(--text-secondary)', fontWeight: 'normal' }}>
                    Get notified when someone replies to your comment
                  </small>
                </div>
              </label>
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={notifyAnnouncements} 
                  onChange={(e) => setNotifyAnnouncements(e.target.checked)}
                  style={{ marginRight: '0.75rem', width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Announcements</div>
                  <small style={{ color: 'var(--text-secondary)', fontWeight: 'normal' }}>
                    Receive important updates and announcements
                  </small>
                </div>
              </label>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={notifySubscriptions} 
                  onChange={(e) => setNotifySubscriptions(e.target.checked)}
                  style={{ marginRight: '0.75rem', width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Subscription Updates</div>
                  <small style={{ color: 'var(--text-secondary)', fontWeight: 'normal' }}>
                    Get notified about activity on posts you follow
                  </small>
                </div>
              </label>
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}