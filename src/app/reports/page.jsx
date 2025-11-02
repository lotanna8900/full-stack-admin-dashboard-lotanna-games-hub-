"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import Link from 'next/link';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        setUserRole(profile?.role || 'guest');

        if (profile?.role === 'admin') {
          fetchReports();
        }
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const fetchReports = async () => {
    const query = supabase
      .from('reports')
      .select(`
        *,
        comment:comments(id, content, post_id, author:profiles(username)),
        reporter:profiles(username)
      `)
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query.eq('status', filter);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching reports:', error);
    } else {
      setReports(data || []);
    }
  };

  useEffect(() => {
    if (userRole === 'admin') {
      fetchReports();
    }
  }, [filter, userRole]);

  const updateReportStatus = async (reportId, newStatus, adminNotes = '') => {
    const { error } = await supabase
      .from('reports')
      .update({
        status: newStatus,
        reviewed_at: new Date().toISOString(),
        reviewed_by: (await supabase.auth.getSession()).data.session.user.id,
        admin_notes: adminNotes
      })
      .eq('id', reportId);

    if (error) {
      console.error('Error updating report:', error);
      alert('Failed to update report');
    } else {
      fetchReports();
    }
  };

  if (loading) return <div>Loading...</div>;

  if (userRole !== 'admin') {
    return (
      <div className="section">
        <h1>Access Denied</h1>
        <p>You must be an administrator to view this page.</p>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>🚩 Content Reports</h1>
          <p className="dashboard-subtitle">Review and manage user reports</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="btn-group" style={{ marginBottom: '2rem' }}>
        <button 
          className={`btn-group-item ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
        <button 
          className={`btn-group-item ${filter === 'reviewed' ? 'active' : ''}`}
          onClick={() => setFilter('reviewed')}
        >
          Reviewed
        </button>
        <button 
          className={`btn-group-item ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
      </div>

      {/* Reports List */}
      {reports.length === 0 ? (
        <div className="empty-state-card">
          <p>No {filter !== 'all' ? filter : ''} reports</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reports.map((report) => (
            <div key={report.id} className="content-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span className="badge">{report.status}</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  {new Date(report.created_at).toLocaleDateString()}
                </span>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <strong>Reported by:</strong> {report.reporter?.username || 'Unknown'}
                <br />
                <strong>Reason:</strong> {report.reason}
              </div>

              <div style={{ background: 'var(--grey-light)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                <strong>Comment:</strong>
                <p style={{ marginTop: '0.5rem' }}>{report.comment?.content || '[Deleted]'}</p>
                <small>By: {report.comment?.author?.username || 'Unknown'}</small>
              </div>

              {report.status === 'pending' && (
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    className="btn btn-primary"
                    onClick={() => updateReportStatus(report.id, 'reviewed')}
                  >
                    Mark Reviewed
                  </button>
                  <Link 
                    href={`/blog/${report.comment.post_id}?reply=${report.comment_id}`}
                    className="btn"
                    // Think I'll add 'target' to open in a new tab, seems good for admin pages
                    target="_blank" 
                    rel="noopener noreferrer"
                    >
                    View Comment
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}