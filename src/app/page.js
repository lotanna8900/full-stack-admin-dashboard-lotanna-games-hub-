"use client";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from './utils/supabaseClient';
import Link from 'next/link'; // Import Link

export default function HomePage() {
  // Dashboard-specific State
  const router = useRouter();
  const [projectCount, setProjectCount] = useState(0);
  const [snippetCount, setSnippetCount] = useState(0);
  const [memberCount, setMemberCount] = useState(0);
  const [totalPostViews, setTotalPostViews] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null); // I need this for the admin buttons
  const [socialStats, setSocialStats] = useState([]); // For future use

  // Dashboard-specific Data Fetching 
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);

      // Check user role
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles').select('role').eq('id', session.user.id).single();
        setUserRole(profile?.role || 'guest');
      } else {
        setUserRole('guest');
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
        // We'll pass the whole array to a new state variable
        setSocialStats(socialStatsData || []);
      }
      
      setLoading(false);
    };

    fetchDashboardData();
  }, []);
  
  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  // --- RENDER (Dashboard Only) ---
  return (
    <div id="dashboard-section" className="section">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Dashboard</h1>
          <p className="dashboard-subtitle">Welcome back! Here&apos;s what&apos;s happening with your interactive fiction.</p>
        </div>
        
        {/* CORRECTED ACTION BUTTONS */}
        <div className="action-buttons">
          {userRole === 'admin' && (
            // Link to the /snippets page to add a new one
            <Link href="/snippets" className="btn">Upload Snippet</Link>
          )}
          {userRole === 'admin' && (
            // Link to the /blog page to add a new one
            <Link href="/blog" className="btn btn-primary">New Post</Link>
          )}
        </div>
      </div>

      <div className="stats-grid">
        {/* Projects Card (Links to /projects) */}
        <Link href="/projects" className="stat-card" title="Go to Projects">
          <div className="stat-label">Active Projects</div>
          <div className="stat-value">{projectCount}</div>
        </Link>

        {/* Snippets Card (Links to /snippets) */}
        <Link href="/snippets" className="stat-card" title="Go to Game Snippets">
          <div className="stat-label">Game Snippets</div>
          <div className="stat-value">{snippetCount}</div>
        </Link>

        {/* Members Card (Links to /blog) */}
        <Link href="/blog" className="stat-card" title="Go to Blog / Community Hub">
          <div className="stat-label">Community Members</div>
          <div className="stat-value">{memberCount}</div>
        </Link>

        {/* Clickable Consolidated Socials Card */}
        {socialStats.length > 0 && (
          <a
            href="https://google.com" // <-- I'LL REPLACE LATER WITH MY LINKTREE URL
            target="_blank"
            rel="noopener noreferrer"
            className="stat-card" 
            title="See all my social links"
            style={{ cursor: 'pointer' }} 
          >
            <div className="stat-label">Social Followers</div>
            {/* Inner list, part of my link */}
            <div className="social-stats-list" style={{ marginTop: '0.5rem' }}>
              {socialStats.map(stat => (
                <div key={stat.platform} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span>
                    {stat.platform === 'Instagram' && '📸 '}
                    {stat.platform === 'Tiktok' && '🎵 '}
                    {stat.platform === 'LinkedIn' && '💼 '}
                    {stat.platform}:
                  </span>
                  <strong>{stat.count}</strong>
                </div>
              ))}
            </div>
          </a>
        )}

        {/* Total Reads */}
        <div className="stat-card">
          <div className="stat-label">Total Reads</div>
          <div className="stat-value">{totalPostViews}</div>
        </div>
      </div>

      <div className="content-grid">
        <div className="content-card">
          <div className="content-header">
            <div>
              <h2 className="content-title">Recent Activity</h2>
              <p className="content-meta">Latest comments and content across the platform</p>
            </div>
          </div>
          <div className="activity-feed">
            {recentActivity.map((activity) => {
              // --- Render Comment Activity ---
              if (activity.type === 'comment') {
                const commentLinkUrl = `/blog/${activity.post?.id}?reply=${activity.id}`;
                return (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-icon">💬</div>
                    <Link href={commentLinkUrl} className="activity-content" title="Go to comment">
                      <div className="activity-text">
                        <strong>{activity.author?.username || 'Anonymous'}</strong> commented on &quot;<strong>{activity.post?.title || 'a post'}</strong>&quot;:
                        &quot;{activity.content.substring(0, 50)}...&quot;
                      </div>
                      <div className="activity-time">{new Date(activity.created_at).toLocaleDateString()}</div>
                    </Link>
                  </div>
                );
              }
              // --- Render New Post Activity ---
              else if (activity.type === 'post') {
                const postLinkUrl = `/blog/${activity.id}`;
                return (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-icon">✍️</div>
                    <Link href={postLinkUrl} className="activity-content" title="Go to Blog Post">
                      <div className="activity-text">
                        New Blog Post: &quot;<strong>{activity.title}</strong>&quot; was published.
                      </div>
                      <div className="activity-time">{new Date(activity.created_at).toLocaleDateString()}</div>
                    </Link>
                  </div>
                );
              }
              // --- Render New Project Activity ---
              else if (activity.type === 'project') {
                const projectLinkUrl = `/projects?project=${activity.id}`;
                return (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-icon">📁</div>
                    <Link href={projectLinkUrl} className="activity-content" title="Go to Project">
                      <div className="activity-text">
                        New Project Added: &quot;<strong>{activity.title}</strong>&quot;
                      </div>
                      <div className="activity-time">{new Date(activity.created_at).toLocaleDateString()}</div>
                    </Link>
                  </div>
                );
              }
              return null;
            })}
            {recentActivity.length === 0 && (
              <p style={{ textAlign: 'center', padding: '1rem' }}>No recent activity.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}








