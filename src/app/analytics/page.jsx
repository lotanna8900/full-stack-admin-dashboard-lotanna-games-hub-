"use client";
import { useState, useEffect } from "react";
import { supabase } from '../utils/supabaseClient';
import ViewsBarChart from "../../components/ViewsBarChart"; 
import TrendLineChart from "../../components/TrendLineChart";

export default function AnalyticsPage() {
  // --- State Variables ---
  const [topPosts, setTopPosts] = useState([]);
  const [totalPostViews, setTotalPostViews] = useState(0);
  const [totalCommentCount, setTotalCommentCount] = useState(0);
  const [memberCount, setMemberCount] = useState(0); 
  const [dailyViewsData, setDailyViewsData] = useState([]);
  const [dailySignupsData, setDailySignupsData] = useState([]);

  // Auth & Loading State
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  //--- Additional Social Stats State (Future Use) ---
  const [socialStats, setSocialStats] = useState([]); 
  const [loadingSocials, setLoadingSocials] = useState(true)

  // State for the edit form
  const [instagramFollowers, setInstagramFollowers] = useState(0);
  const [tiktokFollowers, setTiktokFollowers] = useState(0);
  const [linkedinFollowers, setLinkedinFollowers] = useState(0);

  // Social Stats Update Handler
  const handleUpdateSocials = async (event) => {
    event.preventDefault();
    setLoadingSocials(true); 

    const upsertData = [
      { platform: 'Instagram', count: instagramFollowers },
      { platform: 'Tiktok', count: tiktokFollowers },
      { platform: 'LinkedIn', count: linkedinFollowers }
    ];

    const { error } = await supabase
      .from('social_stats')
      .upsert(upsertData, { onConflict: 'platform' });

    if (error) {
      console.error('Error updating social stats:', error);
      alert('Failed to update stats.');
    } else {
      alert('Social stats updated successfully!');
      // Re-fetch the data to display
      const { data } = await supabase.from('social_stats').select('*');
      if (data) setSocialStats(data);
    }
    setLoadingSocials(false);
  };


  // --- Data Fetching Effect ---
  useEffect(() => {
    // Helper function to fetch all analytics data
    const fetchAnalytics = async () => {
      // --- Fetch Counts ---
      // Count Projects
      const { count: projCount } = await supabase.from('projects').select('*', { count: 'exact', head: true });
      // Count Snippets
      const { count: snipCount } = await supabase.from('snippets').select('*', { count: 'exact', head: true });
      // Count Members (Profiles)
      const { count: memCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      setMemberCount(memCount || 0);

      // Count Total Comments
      const { count: commentCount } = await supabase.from('comments').select('*', { count: 'exact', head: true });
      setTotalCommentCount(commentCount || 0);

      // --- Fetch Top Posts ---
      const { data: postsByViews } = await supabase
        .from('posts')
        .select('id, title, view_count')
        .order('view_count', { ascending: false })
        .limit(10);
      setTopPosts(postsByViews || []);

      // --- Calculate Total Post Views ---
      const { data: totalViewsData } = await supabase.from('posts').select('view_count');
      if (totalViewsData) {
        const total = totalViewsData.reduce((sum, post) => sum + (post.view_count || 0), 0);
        setTotalPostViews(total);
      }

      // --- Fetch Time-Series Data ---
      // Fetch Daily Post Views Trend
      const { data: viewsTrend } = await supabase.rpc('get_daily_post_views', { days_limit: 30 });
      setDailyViewsData(viewsTrend || []);

      // Fetch Daily Signups Trend
      const { data: signupsTrend } = await supabase.rpc('get_daily_signups', { days_limit: 30 });
      setDailySignupsData(signupsTrend || []);
    };

    // Main function to check auth and fetch data
    const checkAuthAndFetch = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        const role = profile?.role || 'guest';
        setUserRole(role);

        if (role === 'admin') {
          // User is admin, fetch all analytics
          await fetchAnalytics();

          // Fetch Social Stats ---
          setLoadingSocials(true);
          const { data: socials, error: socialsError } = await supabase
            .from('social_stats')
            .select('*');
          
          if (socialsError) {
            console.error("Error fetching social stats:", socialsError);
          } else {
            setSocialStats(socials || []);
            // Populate the form fields with data from the DB
            socials.forEach(stat => {
              if (stat.platform === 'Instagram') setInstagramFollowers(stat.count);
              if (stat.platform === 'X (Tiktok)') setTiktokFollowers(stat.count);
              if (stat.platform === 'LinkedIn') setLinkedinFollowers(stat.count);
            });
          }
          setLoadingSocials(false);


            }
          } else {
            setUserRole('guest');

      }
      setLoading(false);
    };

    checkAuthAndFetch();
  }, []); 

  // --- Render Logic ---

  if (loading) {
    return <div>Loading analytics...</div>;
  }

  // Security Check: Block non-admins
  if (userRole !== 'admin') {
    return (
      <div id="stats-section" className="section">
        <div className="dashboard-header">
          <div className="dashboard-title">
            <h1>Access Denied</h1>
            <p className="dashboard-subtitle">You do not have permission to view this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="stats-section" className="section">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Analytics</h1>
          <p className="dashboard-subtitle">Track your content performance and engagement</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Blog Post Views</div>
          <div className="stat-value">{totalPostViews}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Total Comments</div>
          <div className="stat-value">{totalCommentCount}</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Total Community Members</div>
          <div className="stat-value">{memberCount}</div>
        </div>

        {/* NEW: Social Stat Cards */}
        {socialStats.map(stat => (
          <div key={stat.platform} className="stat-card">
            <div className="stat-label">Total {stat.platform} Followers</div>
            <div className="stat-value">{stat.count}</div>
          </div>
        ))}
      </div>

      {/* --- Admin Edit Form --- */}
      <div className="content-card" style={{ marginTop: '2rem' }}>
        <h2 className="content-title">Update Social Stats</h2>
        <form onSubmit={handleUpdateSocials}>
          {/* Instagram */}
          <div className="form-group">
            <label className="form-label">Instagram Followers</label>
            <input
              type="number"
              className="form-input"
              value={instagramFollowers}
              onChange={(e) => setInstagramFollowers(parseInt(e.target.value) || 0)}
            />
          </div>
          {/* Tiktok */}
          <div className="form-group">
            <label className="form-label">Tiktok Followers</label>
            <input
              type="number"
              className="form-input"
              value={tiktokFollowers}
              onChange={(e) => setTiktokFollowers(parseInt(e.target.value) || 0)}
            />
          </div>
          {/* LinkedIn */}
          <div className="form-group">
            <label className="form-label">LinkedIn Followers</label>
            <input
              type="number"
              className="form-input"
              value={linkedinFollowers}
              onChange={(e) => setLinkedinFollowers(parseInt(e.target.value) || 0)}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loadingSocials}>
            {loadingSocials ? 'Saving...' : 'Save Stats'}
          </button>
        </form>
      </div>

      <div className="content-card" style={{ marginTop: '2rem' }}>
        <h2 className="content-title">Top Performing Posts (by Views)</h2>
        <div style={{ marginTop: '1rem', height: '300px' }}>
          <ViewsBarChart
            data={topPosts}
            dataKey="view_count"
            nameKey="title"
          />
        </div>
      </div>

      <div className="content-grid" style={{ marginTop: '2rem' }}>
        <div className="content-card">
          <h2 className="content-title">Daily Post Views (Last 30 Days)</h2>
          <div style={{ marginTop: '1rem', height: '300px' }}>
            <TrendLineChart
              data={dailyViewsData}
              xDataKey="view_date"
              yDataKey="daily_views"
              yAxisLabel="Views"
            />
          </div>
        </div>

        <div className="content-card">
          <h2 className="content-title">Daily Signups (Last 30 Days)</h2>
          <div style={{ marginTop: '1rem', height: '300px' }}>
            <TrendLineChart
              data={dailySignupsData}
              xDataKey="signup_date"
              yDataKey="daily_signups"
              yAxisLabel="Signups"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

