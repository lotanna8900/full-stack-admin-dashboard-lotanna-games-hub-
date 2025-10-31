"use client";
import { useState, useEffect, use } from 'react'; 
import { supabase } from '../../utils/supabaseClient'; 
import Link from 'next/link';
import Image from 'next/image'; 

export default function UserProfilePage({ params: paramsProp }) { 
  const params = use(paramsProp); 
  const { id } = params; 

  const [userProfile, setUserProfile] = useState(null);
  const [userStats, setUserStats] = useState({ comments: 0, posts: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!id) return; 
      setLoading(true);
      setError(null);
      
      try {
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles_public') 
          .select('*')
          .eq('id', id)
          .single();

        if (profileError) throw profileError;
        setUserProfile(profileData);

        // Fetch user stats
        const { count: commentCount } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('author_id', id);

        const { count: postCount } = await supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .eq('author_id', id);

        setUserStats({
          comments: commentCount || 0,
          posts: postCount || 0
        });

        // Fetch recent activity (comments)
        const { data: recentComments } = await supabase
          .from('comments')
          .select('*, post:posts(id, title)')
          .eq('author_id', id)
          .order('created_at', { ascending: false })
          .limit(5);

        setRecentActivity(recentComments || []);

      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [id]); 

  if (loading) {
    return (
      <div className="section">
        <div className="dashboard-header">
          <h1>Loading Profile...</h1>
        </div>
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="section">
        <div className="dashboard-header">
          <h1>Profile Not Found</h1>
          <p className="dashboard-subtitle">
            This user profile doesn't exist or couldn't be loaded.
          </p>
        </div>
        <Link href="/blog" className="btn">
          ← Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="section">
      {/* Profile Header */}
      <div className="profile-header-card">
        <div className="profile-header-content">
          {/* Avatar */}
          <div className="profile-avatar-wrapper">
            {userProfile.avatar_url ? (
              <Image
                src={userProfile.avatar_url}
                alt={userProfile.username || 'User avatar'}
                width={120}
                height={120}
                className="profile-avatar-img"
                priority 
              />
            ) : (
              <div className="profile-avatar-placeholder">
                <span>{userProfile.username ? userProfile.username.charAt(0).toUpperCase() : '?'}</span>
              </div>
            )}
          </div>
          
          {/* User Info */}
          <div className="profile-info">
            <h1 className="profile-username">{userProfile.username || 'Anonymous User'}</h1>
            <p className="profile-joined">
              📅 Member since {userProfile.created_at ? new Date(userProfile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown'}
            </p>
            
            {/* Stats Row */}
            <div className="profile-stats">
              <div className="profile-stat-item">
                <span className="stat-value">{userStats.comments}</span>
                <span className="stat-label">Comments</span>
              </div>
              <div className="profile-stat-divider"></div>
              <div className="profile-stat-item">
                <span className="stat-value">{userStats.posts}</span>
                <span className="stat-label">Posts</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content Grid */}
      <div className="content-grid" style={{ marginTop: '2rem' }}>
        {/* About Section */}
        <div className="content-card">
          <div className="content-header">
            <h2 className="content-title">About</h2>
          </div>
          <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: 'var(--text-primary)' }}>
            {userProfile.bio || 'This user hasn\'t written a bio yet.'}
          </p>
        </div>

        {/* Recent Activity Section */}
        {recentActivity.length > 0 && (
          <div className="content-card">
            <div className="content-header">
              <h2 className="content-title">Recent Activity</h2>
            </div>
            <div className="activity-list">
              {recentActivity.map((activity) => (
                <Link
                  key={activity.id}
                  href={`/blog/${activity.post?.id}?reply=${activity.id}`}
                  className="activity-item-link"
                >
                  <div className="activity-icon">💬</div>
                  <div className="activity-details">
                    <p className="activity-text">
                      Commented on <strong>{activity.post?.title || 'a post'}</strong>
                    </p>
                    <p className="activity-preview">
                      "{activity.content.substring(0, 80)}{activity.content.length > 80 ? '...' : ''}"
                    </p>
                    <p className="activity-date">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Back Button */}
      <div style={{ marginTop: '2rem' }}>
        <Link href="/blog" className="btn">
          ← Back to Blog
        </Link>
      </div>
    </div>
  );
}