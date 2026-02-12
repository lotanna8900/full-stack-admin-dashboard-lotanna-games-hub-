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
  const [timeRange, setTimeRange] = useState(30); // Days to show

  // Auth & Loading State
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Social Stats State
  const [socialStats, setSocialStats] = useState([]); 
  const [loadingSocials, setLoadingSocials] = useState(false);
  const [isEditingSocials, setIsEditingSocials] = useState(false);

  // State for the edit form
  const [instagramFollowers, setInstagramFollowers] = useState(0);
  const [tiktokFollowers, setTiktokFollowers] = useState(0);
  const [linkedinFollowers, setLinkedinFollowers] = useState(0);

  // Growth calculations
  const [growthStats, setGrowthStats] = useState({
    viewsGrowth: 0,
    commentsGrowth: 0,
    membersGrowth: 0
  });

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
      const { data } = await supabase.from('social_stats').select('*');
      if (data) setSocialStats(data);
      setIsEditingSocials(false);
      alert('✓ Social stats updated successfully!');
    }
    setLoadingSocials(false);
  };

  // Fetch time-series data based on time range
  const fetchTimeSeriesData = async (days) => {
    const { data: viewsTrend } = await supabase.rpc('get_daily_post_views', { days_limit: days });
    setDailyViewsData(viewsTrend || []);

    const { data: signupsTrend } = await supabase.rpc('get_daily_signups', { days_limit: days });
    setDailySignupsData(signupsTrend || []);
  };

  // --- Data Fetching Effect ---
  useEffect(() => {
    const fetchAnalytics = async () => {
      // Count Members
      const { count: memCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      setMemberCount(memCount || 0);

      // Count Total Comments
      const { count: commentCount } = await supabase.from('comments').select('*', { count: 'exact', head: true });
      setTotalCommentCount(commentCount || 0);

      // Fetch Top Posts
      const { data: postsByViews } = await supabase
        .from('posts')
        .select('id, title, view_count')
        .order('view_count', { ascending: false })
        .limit(10);
      setTopPosts(postsByViews || []);

      // Calculate Total Post Views
      const { data: totalViewsData } = await supabase.from('posts').select('view_count');
      if (totalViewsData) {
        const total = totalViewsData.reduce((sum, post) => sum + (post.view_count || 0), 0);
        setTotalPostViews(total);
      }

      // Fetch Time-Series Data
      await fetchTimeSeriesData(timeRange);
    };

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
          await fetchAnalytics();

          // Fetch Social Stats
          const { data: socials, error: socialsError } = await supabase
            .from('social_stats')
            .select('*');
          
          if (!socialsError && socials) {
            setSocialStats(socials);
            socials.forEach(stat => {
              if (stat.platform === 'Instagram') setInstagramFollowers(stat.count);
              if (stat.platform === 'Tiktok') setTiktokFollowers(stat.count);
              if (stat.platform === 'LinkedIn') setLinkedinFollowers(stat.count);
            });
          }
        }
      } else {
        setUserRole('guest');
      }
      setLoading(false);
    };

    checkAuthAndFetch();
  }, []); 

  // Refetch time-series when range changes
  useEffect(() => {
    if (userRole === 'admin') {
      fetchTimeSeriesData(timeRange);
    }
  }, [timeRange, userRole]);

  // Format large numbers
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num;
  };

  // Get platform icon
  const getPlatformIcon = (platform) => {
    const icons = {
      'Instagram': '📸',
      'Tiktok': '🎵',
      'LinkedIn': '💼',
      'Twitter': '🐦',
      'YouTube': '📺'
    };
    return icons[platform] || '🌐';
  };

  // --- Render Logic ---
  if (loading) {
    return (
      <div className="section">
        <div className="dashboard-header">
          <h1>Loading analytics...</h1>
        </div>
      </div>
    );
  }

  if (userRole !== 'admin') {
    return (
      <div id="stats-section" className="section">
        <div className="dashboard-header">
          <div className="dashboard-title">
            <h1>🔒 Access Denied</h1>
            <p className="dashboard-subtitle">
              You do not have permission to view this page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="stats-section" className="section">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>📊 Analytics Dashboard</h1>
          <p className="dashboard-subtitle">
            Track your content performance and audience engagement
          </p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="stats-grid">
        <div className="stat-card stat-card-interactive">
          <div className="stat-icon" style={{ backgroundColor: '#3b82f6' }}>📖</div>
          <div className="stat-info">
            <div className="stat-label">Total Blog Views</div>
            <div className="stat-value">{formatNumber(totalPostViews)}</div>
          </div>
        </div>

        <div className="stat-card stat-card-interactive">
          <div className="stat-icon" style={{ backgroundColor: '#8b5cf6' }}>💬</div>
          <div className="stat-info">
            <div className="stat-label">Total Comments</div>
            <div className="stat-value">{formatNumber(totalCommentCount)}</div>
          </div>
        </div>
        
        <div className="stat-card stat-card-interactive">
          <div className="stat-icon" style={{ backgroundColor: '#22c55e' }}>👥</div>
          <div className="stat-info">
            <div className="stat-label">Community Members</div>
            <div className="stat-value">{formatNumber(memberCount)}</div>
          </div>
        </div>

        {/* Social Stats Cards */}
        {socialStats.map(stat => (
          <div key={stat.platform} className="stat-card stat-card-social">
            <div className="stat-icon" style={{ backgroundColor: '#f59e0b' }}>
              {getPlatformIcon(stat.platform)}
            </div>
            <div className="stat-info">
              <div className="stat-label">{stat.platform} Followers</div>
              <div className="stat-value">{formatNumber(stat.count)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Social Stats Management */}
      <div className="content-card analytics-card" style={{ marginTop: '2rem' }}>
        <div className="content-header">
          <h2 className="content-title">🌐 Social Media Stats</h2>
          {!isEditingSocials && (
            <button 
              className="btn" 
              onClick={() => setIsEditingSocials(true)}
            >
              ✏️ Edit Stats
            </button>
          )}
        </div>

        {isEditingSocials ? (
          <form onSubmit={handleUpdateSocials} style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">📸 Instagram Followers</label>
                <input
                  type="number"
                  className="form-input"
                  value={instagramFollowers}
                  onChange={(e) => setInstagramFollowers(parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label className="form-label">🎵 TikTok Followers</label>
                <input
                  type="number"
                  className="form-input"
                  value={tiktokFollowers}
                  onChange={(e) => setTiktokFollowers(parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label className="form-label">💼 LinkedIn Connections</label>
                <input
                  type="number"
                  className="form-input"
                  value={linkedinFollowers}
                  onChange={(e) => setLinkedinFollowers(parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loadingSocials}
              >
                {loadingSocials ? 'Saving...' : '✓ Save Changes'}
              </button>
              <button 
                type="button" 
                className="btn" 
                onClick={() => setIsEditingSocials(false)}
                disabled={loadingSocials}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="social-stats-display">
            {socialStats.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                {socialStats.map(stat => (
                  <div key={stat.platform} className="social-stat-display-item">
                    <span className="social-platform-name">
                      {getPlatformIcon(stat.platform)} {stat.platform}
                    </span>
                    <span className="social-follower-count">
                      {formatNumber(stat.count)} followers
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
                No social stats configured yet. Click "Edit Stats" to add them.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Top Posts Chart */}
      <div className="content-card analytics-card" style={{ marginTop: '2rem' }}>
        <div className="content-header">
          <h2 className="content-title">🏆 Top Performing Posts</h2>
          <span className="badge">by views</span>
        </div>
        <div style={{ marginTop: '1.5rem', height: '350px' }}>
          {topPosts.length > 0 ? (
            <ViewsBarChart
              data={topPosts}
              dataKey="view_count"
              nameKey="title"
            />
          ) : (
            <div className="chart-empty-state">
              <p>No post data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="time-range-selector" style={{ marginTop: '2rem' }}>
        <label style={{ fontWeight: '600', marginRight: '1rem' }}>Time Range:</label>
        <div className="btn-group">
          <button 
            className={`btn-group-item ${timeRange === 7 ? 'active' : ''}`}
            onClick={() => setTimeRange(7)}
          >
            7 Days
          </button>
          <button 
            className={`btn-group-item ${timeRange === 30 ? 'active' : ''}`}
            onClick={() => setTimeRange(30)}
          >
            30 Days
          </button>
          <button 
            className={`btn-group-item ${timeRange === 90 ? 'active' : ''}`}
            onClick={() => setTimeRange(90)}
          >
            90 Days
          </button>
        </div>
      </div>

      {/* Trend Charts */}
      <div className="content-grid" style={{ marginTop: '1.5rem' }}>
        <div className="content-card analytics-card">
          <h2 className="content-title">📈 Daily Post Views</h2>
          <p className="chart-subtitle">Last {timeRange} days</p>
          <div style={{ marginTop: '1rem', height: '300px' }}>
            {dailyViewsData.length > 0 ? (
              <TrendLineChart
                data={dailyViewsData}
                xDataKey="view_date"
                yDataKey="daily_views"
                yAxisLabel="Views"
              />
            ) : (
              <div className="chart-empty-state">
                <p>No view data available for this period</p>
              </div>
            )}
          </div>
        </div>

        <div className="content-card analytics-card">
          <h2 className="content-title">👥 Daily Signups</h2>
          <p className="chart-subtitle">Last {timeRange} days</p>
          <div style={{ marginTop: '1rem', height: '300px' }}>
            {dailySignupsData.length > 0 ? (
              <TrendLineChart
                data={dailySignupsData}
                xDataKey="signup_date"
                yDataKey="daily_signups"
                yAxisLabel="Signups"
              />
            ) : (
              <div className="chart-empty-state">
                <p>No signup data available for this period</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}