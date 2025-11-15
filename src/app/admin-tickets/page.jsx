"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import Link from 'next/link';

export default function AdminSupportTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    const initializePage = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        setUserRole(profile?.role || 'guest');
      } else {
        setUserRole('guest');
      }
    };
    initializePage();
  }, []);

  const fetchTickets = async () => {
    if (userRole !== 'admin') return; 

    setLoading(true);
    const query = supabase
      .from('support_tickets')
      .select(`
        id,
        created_at,
        subject,
        status,
        requester:profiles!requester_id(id, username, avatar_url)
      `)
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query.eq('status', filter);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching support tickets:', error);
    } else {
      setTickets(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (userRole === 'admin') {
      fetchTickets();
    }
  }, [userRole, filter]);


  // --- Renders ---
  if (loading && !tickets.length) {
    return (
      <div className="section">
        <div className="dashboard-header">
          <div className="dashboard-title"><h1>Loading...</h1></div>
        </div>
      </div>
    );
  }

  if (userRole !== 'admin') {
    return (
      <div className="section">
        <div className="dashboard-header">
          <div className="dashboard-title">
            <h1>Access Denied</h1>
            <p className="dashboard-subtitle">You must be an administrator to view this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="section">
        <div className="dashboard-header">
          <div className="dashboard-title">
            <h1>🎫 Support Tickets</h1>
            <p className="dashboard-subtitle">Review and manage user support requests</p>
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
            className={`btn-group-item ${filter === 'in_progress' ? 'active' : ''}`}
            onClick={() => setFilter('in_progress')}
          >
            In Progress
          </button>
          <button 
            className={`btn-group-item ${filter === 'resolved' ? 'active' : ''}`}
            onClick={() => setFilter('resolved')}
          >
            Resolved
          </button>
          <button 
            className={`btn-group-item ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
        </div>

        {/* Tickets List */}
        {loading ? (
          <div>Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="empty-state-card" style={{ textAlign: 'center', padding: '2rem' }}>
            <h3>No {filter !== 'all' ? filter : ''} tickets</h3>
            <p>All clear!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {tickets.map((ticket) => (
              <div key={ticket.id} className="content-card" style={{ background: 'var(--grey-dark)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <span 
                    className="badge" 
                    style={{ 
                      textTransform: 'capitalize', 
                      background: ticket.status === 'pending' ? 'var(--primary)' : (ticket.status === 'resolved' ? 'var(--color-success, #22c55e)' : 'var(--grey-light)'),
                      color: ticket.status === 'pending' ? 'white' : undefined
                    }}
                  >
                    {ticket.status}
                  </span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    {new Date(ticket.created_at).toLocaleString()}
                  </span>
                </div>

                <div style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>
                  <p>
                    <strong>From:</strong> {ticket.requester?.username || 'Unknown User'}
                  </p>
                  <p><strong>Subject:</strong> {ticket.subject}</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {/* The button is now a Link */}
                  <Link 
                    href={`/admin-tickets/${ticket.id}`}
                    className="btn btn-primary"
                  >
                    Manage Ticket
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </>
  );
}