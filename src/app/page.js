"use client";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from './utils/supabaseClient';
import Link from 'next/link';

export default function HomePage() {
  // Dashboard-specific State
  const router = useRouter();
  const [projectCount, setProjectCount] = useState(0);
  const [snippetCount, setSnippetCount] = useState(0);
  const [memberCount, setMemberCount] = useState(0);
  const [totalPostViews, setTotalPostViews] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [username, setUsername] = useState('');
  const [socialStats, setSocialStats] = useState([]);

  // Dashboard-specific Data Fetching 
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);

      // Check user role and username
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles').select('role, username').eq('id', session.user.id).single();
        setUserRole(profile?.role || 'guest');
        setUsername(profile?.username || 'User');
      } else {
        setUserRole('guest');
        setUsername('Guest');
      }

      // --- Fetch Counts ---
      const { count: projCount } = await supabase.from('projects').select('*', { count: 'exact', head: true });
      setProjectCount(projCount || 0);

      const { count: snipCount } = await supabase.from('snippets').select('*', { count: 'exact', head: true });
      setSnippetCount(snipCount || 0);

      const { count: memCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      setMemberCount(memCount || 0);

      // --- Calculate Total Post Views 
      const { data: totalViewsData } = await supabase.from('posts').select('view_count');
      if (totalViewsData) {
        const total = totalViewsData.reduce((sum, post) => sum + (post.view_count || 0), 0);
        setTotalPostViews(total);
      }

      // Fetch Recent Activity ---
      let combinedActivity = [];
      const { data: recentCommentsData } = await supabase.from('comments').select('*, post:posts(id, title), author:profiles(username)')
        .order('created_at', { ascending: false }).limit(5);
      if (recentCommentsData) {
        combinedActivity.push(...recentCommentsData.map(c => ({ ...c, type: 'comment' })));
      }
      
      const { data: latestPostData } = await supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(1);
      const latestPost = latestPostData?.[0];
      
      const { data: latestProjectData } = await supabase.from('projects').select('*').order('created_at', { ascending: false }).limit(1);
      const latestProject = latestProjectData?.[0];

      let newestContentItem = null;
      if (latestPost && latestProject) {
        newestContentItem = new Date(latestPost.created_at) > new Date(latestProject.created_at) ? { ...latestPost, type: 'post' } : { ...latestProject, type: 'project' };
      } else if (latestPost) newestContentItem = { ...latestPost, type: 'post' };
      else if (latestProject) newestContentItem = { ...latestProject, type: 'project' };
      
      if (newestContentItem) combinedActivity.push(newestContentItem);
      
      combinedActivity.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setRecentActivity(combinedActivity.slice(0, 6));

      // Fetch Social Stats ---
      const { data: socialStatsData, error: socialStatsError } = await supabase
        .from('social_stats')
        .select('*');

      if (socialStatsError) {
        console.error("Error fetching social stats:", socialStatsError);
      } else if (socialStatsData) {
        setSocialStats(socialStatsData || []);
      }
      
      setLoading(false);
    };

    fetchDashboardData();
  }, []);
  
  if (loading) {
    return (
      <div className="section">
        <div className="dashboard-header">
          <div className="dashboard-title">
            <h1>Loading dashboard...</h1>
          </div>
        </div>
      </div>
    );
  }

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Format large numbers
  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num;
  };

  // Get relative time
  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  // --- RENDER (Dashboard Only) ---
  return (
    <div id="dashboard-section" className="section">
      {/* Welcome Header */}
      <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
        <div className="dashboard-title">
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
            {getGreeting()}, {username}! 👋
          </h1>
          <p className="dashboard-subtitle">
            Here&apos;s what&apos;s happening with your interactive fiction.
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="action-buttons">
          {userRole === 'admin' && (
            <>
              <Link href="/snippets" className="btn">
                📝 Upload Snippet
              </Link>
              <Link href="/blog" className="btn btn-primary">
                ✍️ New Post
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {/* Projects Card */}
        <Link href="/projects" className="stat-card stat-card-interactive" title="Go to Projects">
          <div className="stat-icon" style={{ backgroundColor: '#8b5cf6' }}>📁</div>
          <div className="stat-info">
            <div className="stat-label">Active Projects</div>
            <div className="stat-value">{projectCount}</div>
          </div>
          <div className="stat-trend">
            <span className="trend-indicator">→</span>
          </div>
        </Link>

        {/* Snippets Card */}
        <Link href="/snippets" className="stat-card stat-card-interactive" title="Go to Game Snippets">
          <div className="stat-icon" style={{ backgroundColor: '#ec4899' }}>🎮</div>
          <div className="stat-info">
            <div className="stat-label">Game Snippets</div>
            <div className="stat-value">{snippetCount}</div>
          </div>
          <div className="stat-trend">
            <span className="trend-indicator">→</span>
          </div>
        </Link>

        {/* Members Card */}
        <Link href="/blog" className="stat-card stat-card-interactive" title="Go to Blog / Community Hub">
          <div className="stat-icon" style={{ backgroundColor: '#3b82f6' }}>👥</div>
          <div className="stat-info">
            <div className="stat-label">Community Members</div>
            <div className="stat-value">{memberCount}</div>
          </div>
          <div className="stat-trend">
            <span className="trend-indicator">→</span>
          </div>
        </Link>

        {/* Total Reads */}
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#22c55e' }}>📖</div>
          <div className="stat-info">
            <div className="stat-label">Total Reads</div>
            <div className="stat-value">{formatNumber(totalPostViews)}</div>
          </div>
        </div>

        {/* Social Stats Card - Spans 2 columns on larger screens */}
        {socialStats.length > 0 && (
          <a
            href="https://google.com" // Replace with your Linktree URL
            target="_blank"
            rel="noopener noreferrer"
            className="stat-card stat-card-social"
            title="See all my social links"
            style={{ gridColumn: 'span 2' }}
          >
            <div className="stat-icon" style={{ backgroundColor: '#f59e0b' }}>🌐</div>
            <div className="stat-info" style={{ flex: 1 }}>
              <div className="stat-label">Social Reach</div>
              <div className="social-stats-grid">
                {socialStats.map(stat => (
                  <div key={stat.platform} className="social-stat-item">
                    <span className="social-platform">
                      {stat.platform === 'Instagram' && '📸'}
                      {stat.platform === 'Tiktok' && '🎵'}
                      {stat.platform === 'LinkedIn' && '💼'}
                      {stat.platform === 'Twitter' && '🐦'}
                      {stat.platform === 'YouTube' && '📺'}
                      {' '}{stat.platform}
                    </span>
                    <strong className="social-count">{formatNumber(stat.count)}</strong>
                  </div>
                ))}
              </div>
            </div>
            <div className="stat-trend">
              <span className="trend-indicator">↗</span>
            </div>
          </a>
        )}
      </div>

      {/* Recent Activity Section */}
      <div className="content-grid" style={{ marginTop: '2rem' }}>
        <div className="content-card">
          <div className="content-header" style={{ marginBottom: '1.5rem' }}>
            <div>
              <h2 className="content-title">Recent Activity</h2>
              <p className="content-meta">Latest updates across the platform</p>
            </div>
            <Link href="/blog" className="btn-link" style={{ fontSize: '0.9rem' }}>
              View All →
            </Link>
          </div>
          
          <div className="activity-feed">
            {recentActivity.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📭</div>
                <p className="empty-state-text">No recent activity yet</p>
                <p className="empty-state-subtext">Check back later for updates!</p>
              </div>
            ) : (
              recentActivity.map((activity) => {
                // --- Render Comment Activity ---
                if (activity.type === 'comment') {
                  const commentLinkUrl = `/blog/${activity.post?.id}?reply=${activity.id}`;
                  return (
                    <Link 
                      key={activity.id} 
                      href={commentLinkUrl} 
                      className="activity-item"
                      title="Go to comment"
                    >
                      <div className="activity-icon activity-icon-comment">💬</div>
                      <div className="activity-content">
                        <div className="activity-text">
                          <strong>{activity.author?.username || 'Anonymous'}</strong> commented on{' '}
                          <strong>&quot;{activity.post?.title || 'a post'}&quot;</strong>
                          <p className="activity-preview">
                            &quot;{activity.content.substring(0, 80)}{activity.content.length > 80 ? '...' : ''}&quot;
                          </p>
                        </div>
                        <div className="activity-time">{getRelativeTime(activity.created_at)}</div>
                      </div>
                    </Link>
                  );
                }
                // --- Render New Post Activity ---
                else if (activity.type === 'post') {
                  const postLinkUrl = `/blog/${activity.id}`;
                  return (
                    <Link 
                      key={activity.id} 
                      href={postLinkUrl} 
                      className="activity-item"
                      title="Go to Blog Post"
                    >
                      <div className="activity-icon activity-icon-post">✍️</div>
                      <div className="activity-content">
                        <div className="activity-text">
                          New Blog Post:{' '}
                          <strong>&quot;{activity.title}&quot;</strong>
                        </div>
                        <div className="activity-time">{getRelativeTime(activity.created_at)}</div>
                      </div>
                    </Link>
                  );
                }
                // --- Render New Project Activity ---
                else if (activity.type === 'project') {
                  const projectLinkUrl = `/projects?project=${activity.id}`;
                  return (
                    <Link 
                      key={activity.id} 
                      href={projectLinkUrl} 
                      className="activity-item"
                      title="Go to Project"
                    >
                      <div className="activity-icon activity-icon-project">📁</div>
                      <div className="activity-content">
                        <div className="activity-text">
                          New Project Added:{' '}
                          <strong>&quot;{activity.title}&quot;</strong>
                        </div>
                        <div className="activity-time">{getRelativeTime(activity.created_at)}</div>
                      </div>
                    </Link>
                  );
                }
                return null;
              })
            )}
          </div>
        </div>
      </div>

      {/* Quick Links Section */}
      <div className="quick-links-section" style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Quick Links</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem' 
        }}>
          <Link href="/projects" className="quick-link-card">
            <span className="quick-link-icon">📁</span>
            <span className="quick-link-text">Browse Projects</span>
          </Link>
          <Link href="/snippets" className="quick-link-card">
            <span className="quick-link-icon">🎮</span>
            <span className="quick-link-text">Play Snippets</span>
          </Link>
          <Link href="/blog" className="quick-link-card">
            <span className="quick-link-icon">📝</span>
            <span className="quick-link-text">Read Blog</span>
          </Link>
          <Link href="/profile" className="quick-link-card">
            <span className="quick-link-icon">⚙️</span>
            <span className="quick-link-text">Profile Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
}








