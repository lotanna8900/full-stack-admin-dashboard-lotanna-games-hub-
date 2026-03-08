"use client";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from './utils/supabaseClient';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  // --- EXISTING STATE ---
  const [projectCount, setProjectCount] = useState(0);
  const [snippetCount, setSnippetCount] = useState(0);
  const [memberCount, setMemberCount] = useState(0);
  const [totalPostViews, setTotalPostViews] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [username, setUsername] = useState('');
  const [socialStats, setSocialStats] = useState([]);
  
  // --- NEW STATE FOR DYNAMIC CONTENT ---
  const [heroConfig, setHeroConfig] = useState(null);
  const [demoConfig, setDemoConfig] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);

      // 1. Fetch User Session
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

      // 2. --- NEW: Fetch Site Configuration ---
      const { data: configData } = await supabase
        .from('site_config')
        .select('*')
        .in('section_key', ['home_hero', 'home_demo']);

      if (configData) {
        const hero = configData.find(item => item.section_key === 'home_hero');
        const demo = configData.find(item => item.section_key === 'home_demo');
        setHeroConfig(hero);
        setDemoConfig(demo);
      }

      // 3. Fetch Counts
      const { count: projCount } = await supabase.from('projects').select('*', { count: 'exact', head: true });
      setProjectCount(projCount || 0);

      const { count: snipCount } = await supabase.from('snippets').select('*', { count: 'exact', head: true });
      setSnippetCount(snipCount || 0);

      const { data: memCount } = await supabase.rpc('get_public_member_count');
      setMemberCount(memCount || 0);

      // 4. Fetch Views
      const { data: totalViewsData } = await supabase.from('posts').select('view_count');
      if (totalViewsData) {
        const total = totalViewsData.reduce((sum, post) => sum + (post.view_count || 0), 0);
        setTotalPostViews(total);
      }

      // 5. Fetch Recent Activity
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

      // 6. Fetch Social Stats
      const { data: socialStatsData } = await supabase.from('social_stats').select('*');
      if (socialStatsData) setSocialStats(socialStatsData);
      
      setLoading(false);
    };

    fetchDashboardData();
  }, []);
  
  if (loading) {
    return (
      <div className="section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="dashboard-title"><h1>Loading Lota Labs...</h1></div>
      </div>
    );
  }

  // Helper functions
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };
  const formatNumber = (num) => num >= 1000 ? (num / 1000).toFixed(1) + 'K' : num;
  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="home-container" style={{ paddingBottom: '4rem' }}>
      
      {/* 1. DYNAMIC HERO SECTION */}
      {heroConfig && heroConfig.is_active && (
        <section style={{
          background: heroConfig.bg_style || '#1a1a2e',
          color: 'white',
          padding: '6rem 2rem',
          textAlign: 'center',
          borderRadius: '0 0 20px 20px',
          marginBottom: '2rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {heroConfig.badge_text && (
              <span style={{ 
                background: '#fbbf24', color: '#000', padding: '0.25rem 0.75rem', 
                borderRadius: '999px', fontSize: '0.8rem', fontWeight: 'bold', 
                textTransform: 'uppercase', letterSpacing: '1px' 
              }}>
                {heroConfig.badge_text}
              </span>
            )}
            <h1 style={{ 
              fontSize: '3.5rem', fontWeight: '800', margin: '1.5rem 0 1rem', 
              background: 'linear-gradient(to right, #fff, #94a3b8)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>
              {heroConfig.title}
            </h1>
            <p style={{ fontSize: '1.25rem', color: '#cbd5e1', marginBottom: '2rem', lineHeight: '1.6' }}>
              {heroConfig.subtitle}
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              {heroConfig.cta_primary_text && (
                <Link href={heroConfig.cta_primary_link || '#'} className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1.1rem' }}>
                  {heroConfig.cta_primary_text}
                </Link>
              )}
              {heroConfig.cta_secondary_text && (
                <Link href={heroConfig.cta_secondary_link || '#'} className="btn" style={{ background: 'rgba(255,255,255,0.1)', padding: '0.75rem 2rem', fontSize: '1.1rem' }}>
                  {heroConfig.cta_secondary_text}
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 2. DYNAMIC DEMO SECTION */}
      {demoConfig && demoConfig.is_active && (
        <section style={{ maxWidth: '1200px', margin: '0 auto 4rem', padding: '0 1rem' }}>
          <div style={{
            background: demoConfig.bg_style || '#4f46e5',
            borderRadius: '20px', padding: '3rem', display: 'flex', flexDirection: 'column',
            alignItems: 'center', textAlign: 'center', color: 'white', position: 'relative', overflow: 'hidden'
          }}>
             <div style={{
              position: 'absolute', top: '-50%', left: '-20%', width: '100%', height: '200%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
              transform: 'rotate(-45deg)'
            }} />
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', position: 'relative' }}>
              {demoConfig.title}
            </h2>
            <p style={{ fontSize: '1.1rem', maxWidth: '600px', marginBottom: '2rem', color: 'rgba(255,255,255,0.9)', position: 'relative' }}>
              {demoConfig.subtitle.split('Supernatural Fugitive').map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <strong style={{ 
                      color: '#fbbf24', 
                      fontFamily: '"Courier New", Courier, monospace', 
                      fontSize: '1.25rem', 
                      textShadow: '0 0 10px rgba(251, 191, 36, 0.4)',
                      letterSpacing: '1px'
                    }}>
                      Supernatural Fugitive
                    </strong>
                  )}
                </span>
              ))}
            </p>
            {demoConfig.cta_primary_text && (
              <Link href={demoConfig.cta_primary_link || '#'} className="btn" style={{ 
                background: 'white', color: '#4f46e5', fontWeight: 'bold', padding: '1rem 2.5rem',
                fontSize: '1.1rem', border: 'none', position: 'relative', boxShadow: '0 4px 14px rgba(0,0,0,0.25)'
              }}>
                {demoConfig.cta_primary_text}
              </Link>
            )}
          </div>
        </section>
      )}

      {/* 3. COMMUNITY DASHBOARD (Kept exactly as before) */}
      <div id="dashboard-section" className="section" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="dashboard-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="dashboard-title">
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', color: '#64748b' }}>Community Hub</h3>
            <p className="dashboard-subtitle">{getGreeting()}, {username}. Here is what is happening in the lab.</p>
          </div>
          <div className="action-buttons">
            {userRole === 'admin' && (
              <>
                <Link href="/snippets" className="btn" style={{ marginRight: '0.5rem' }}>📝 Upload Snippet</Link>
                <Link href="/blog" className="btn btn-primary">✍️ New Post</Link>
              </>
            )}
          </div>
        </div>

        {/* Existing Stats Grid & Activity Feed Code here... */}
        {/* I am abbreviating this part for brevity as it remains unchanged from your previous code */}
        {/* Make sure to keep the rest of your Stats Grid and Recent Activity sections here! */}
        
        <div className="stats-grid">
          <Link href="/projects" className="stat-card stat-card-interactive" title="Go to Projects">
            <div className="stat-icon" style={{ backgroundColor: '#8b5cf6' }}>📁</div>
            <div className="stat-info"><div className="stat-label">Active Projects</div><div className="stat-value">{projectCount}</div></div>
            <div className="stat-trend"><span className="trend-indicator">→</span></div>
          </Link>
          <Link href="/snippets" className="stat-card stat-card-interactive" title="Go to Game Snippets">
            <div className="stat-icon" style={{ backgroundColor: '#ec4899' }}>🎮</div>
            <div className="stat-info"><div className="stat-label">Game Snippets</div><div className="stat-value">{snippetCount}</div></div>
            <div className="stat-trend"><span className="trend-indicator">→</span></div>
          </Link>
          <Link href="/blog" className="stat-card stat-card-interactive" title="Go to Blog">
            <div className="stat-icon" style={{ backgroundColor: '#3b82f6' }}>👥</div>
            <div className="stat-info"><div className="stat-label">Community Members</div><div className="stat-value">{memberCount}</div></div>
            <div className="stat-trend"><span className="trend-indicator">→</span></div>
          </Link>
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#22c55e' }}>📖</div>
            <div className="stat-info"><div className="stat-label">Total Reads</div><div className="stat-value">{formatNumber(totalPostViews)}</div></div>
          </div>
          {socialStats.length > 0 && (
            <a href="https://linktr.ee/lota_labs" target="_blank" rel="noopener noreferrer" className="stat-card stat-card-social" style={{ gridColumn: 'span 2' }}>
              <div className="stat-icon" style={{ backgroundColor: '#f59e0b' }}>🌐</div>
              <div className="stat-info" style={{ flex: 1 }}>
                <div className="stat-label">Social Reach</div>
                <div className="social-stats-grid">
                  {socialStats.map(stat => (
                    <div key={stat.platform} className="social-stat-item">
                      <span className="social-platform">{stat.platform === 'Instagram' && '📸'}{stat.platform === 'Tiktok' && '🎵'}{stat.platform === 'LinkedIn' && '💼'}{stat.platform === 'Twitter' && '🐦'}{stat.platform === 'YouTube' && '📺'}{' '}{stat.platform}</span>
                      <strong className="social-count">{formatNumber(stat.count)}</strong>
                    </div>
                  ))}
                </div>
              </div>
              <div className="stat-trend"><span className="trend-indicator">↗</span></div>
            </a>
          )}
        </div>

        <div className="content-grid" style={{ marginTop: '2rem' }}>
          <div className="content-card">
            <div className="content-header" style={{ marginBottom: '1.5rem' }}>
              <div><h2 className="content-title">Recent Activity</h2><p className="content-meta">Latest updates across the platform</p></div>
              <Link href="/blog" className="btn-link" style={{ fontSize: '0.9rem' }}>View All →</Link>
            </div>
            <div className="activity-feed">
              {recentActivity.length === 0 ? (
                <div className="empty-state"><div className="empty-state-icon">📭</div><p className="empty-state-text">No recent activity yet</p></div>
              ) : (
                recentActivity.map((activity) => (
                    <Link key={activity.id} href={activity.type === 'comment' ? `/blog/${activity.post?.id}?reply=${activity.id}` : activity.type === 'post' ? `/blog/${activity.id}` : `/projects?project=${activity.id}`} className="activity-item">
                      <div className={`activity-icon activity-icon-${activity.type}`}>
                        {activity.type === 'comment' ? '💬' : activity.type === 'post' ? '✍️' : '📁'}
                      </div>
                      <div className="activity-content">
                        <div className="activity-text">
                           {activity.type === 'comment' ? <span><strong>{activity.author?.username || 'Anonymous'}</strong> commented on <strong>&quot;{activity.post?.title || 'a post'}&quot;</strong></span> :
                            activity.type === 'post' ? <span>New Blog Post: <strong>&quot;{activity.title}&quot;</strong></span> :
                            <span>New Project Added: <strong>&quot;{activity.title}&quot;</strong></span>}
                        </div>
                        <div className="activity-time">{getRelativeTime(activity.created_at)}</div>
                      </div>
                    </Link>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="quick-links-section" style={{ marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Quick Links</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <Link href="/projects" className="quick-link-card"><span className="quick-link-icon">📁</span><span className="quick-link-text">Browse Projects</span></Link>
            <Link href="/snippets" className="quick-link-card"><span className="quick-link-icon">🎮</span><span className="quick-link-text">Play Snippets</span></Link>
            <Link href="/blog" className="quick-link-card"><span className="quick-link-icon">📝</span><span className="quick-link-text">Read Blog</span></Link>
            <Link href="/profile" className="quick-link-card"><span className="quick-link-icon">⚙️</span><span className="quick-link-text">Profile Settings</span></Link>
          </div>
        </div>

      </div>
    </div>
  );
}








