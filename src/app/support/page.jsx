"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; 

export default function SupportPage() {
  const [session, setSession] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); 

  // New ticket modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState(''); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // --- 1. Initial Page Load ---
  useEffect(() => {
    const initializePage = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session) {
        await fetchTickets(session);
      }
      setLoading(false);
    };
    initializePage();
  }, []);

  // --- 2. Function to Fetch Tickets ---
  const fetchTickets = async (currentSession) => {
    const { data, error } = await supabase
      .from('support_tickets')
      .select(`
        id, 
        subject, 
        status, 
        created_at,
        ticket_messages (
          message_content,
          created_at
        )
      `)
      .eq('requester_id', currentSession.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tickets:', error);
      setMessage({ type: 'error', text: 'Could not load your tickets.' });
    } else {
      setTickets(data || []);
    }
  };

  // --- 3. Handle New Ticket Creation ---
  const handleSubmitTicket = async (event) => {
    event.preventDefault();
    if (!session) {
      setMessage({ type: 'error', text: 'You must be logged in to submit a ticket.' });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: '', text: '' });

    // Step 3a: Create the main ticket "topic"
    const { data: newTicket, error: ticketError } = await supabase
      .from('support_tickets')
      .insert({
        requester_id: session.user.id,
        subject: subject,
        status: 'pending' 
      })
      .select('id') 
      .single();

    if (ticketError) {
      console.error('Error creating ticket:', ticketError);
      setMessage({ type: 'error', text: `Error: ${ticketError.message}` });
      setIsSubmitting(false);
      return;
    }

    // Step 3b: Create the *first message* for this ticket
    const { error: messageError } = await supabase
      .from('ticket_messages')
      .insert({
        ticket_id: newTicket.id,
        sender_id: session.user.id,
        message_content: content
      });

    if (messageError) {
      console.error('Error sending message:', messageError);
      setMessage({ type: 'error', text: `Error: ${messageError.message}` });
      setIsSubmitting(false);
      return;
    }

    // --- Success ---
    setIsSubmitting(false);
    setMessage({ type: 'success', text: 'Support ticket submitted successfully!' });
    
    setSubject('');
    setContent('');
    setIsModalOpen(false);

    await fetchTickets(session);
    
    router.push(`/support/${newTicket.id}`);
  };

  // --- Helper Functions ---
  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        color: '#f59e0b',
        bgColor: 'rgba(245, 158, 11, 0.1)',
        icon: '⏱️',
        label: 'Pending',
        className: 'ticket-status-pending'
      },
      in_progress: {
        color: '#3b82f6',
        bgColor: 'rgba(59, 130, 246, 0.1)',
        icon: '💬',
        label: 'In Progress',
        className: 'ticket-status-in-progress'
      },
      resolved: {
        color: '#22c55e',
        bgColor: 'rgba(34, 197, 94, 0.1)',
        icon: '✅',
        label: 'Resolved',
        className: 'ticket-status-resolved'
      }
    };
    return configs[status] || configs.pending;
  };

  // Filter tickets based on search and status
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: tickets.length,
    pending: tickets.filter(t => t.status === 'pending').length,
    in_progress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length
  };

  // --- Renders ---

  if (loading) {
    return (
      <div className="section">
        <div className="dashboard-header">
          <div className="dashboard-title">
            <h1>Support</h1>
            <p className="dashboard-subtitle">Loading your support history...</p>
          </div>
        </div>
        <div className="ticket-loading">
          <div className="ticket-loading-spinner">⏳</div>
          <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>Loading tickets...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="section">
        <div className="dashboard-header">
          <div className="dashboard-title">
            <h1>Access Denied</h1>
            <p className="dashboard-subtitle">
              You must be <Link href="/login" className="btn-link-primary" style={{margin: '0 4px'}}>logged in</Link> to view this page.
            </p>
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
            <h1>Support Center</h1>
            <p className="dashboard-subtitle">Submit a request or track your existing tickets</p>
          </div>
          <div className="action-buttons">
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
              ➕ Create New Ticket
            </button>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="ticket-stats-grid">
          <div className="ticket-stat-card">
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              Total Tickets
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700' }}>{stats.total}</div>
          </div>
          <div className="ticket-stat-card">
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              Pending
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#f59e0b' }}>{stats.pending}</div>
          </div>
          <div className="ticket-stat-card">
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              In Progress
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#3b82f6' }}>{stats.in_progress}</div>
          </div>
          <div className="ticket-stat-card">
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              Resolved
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#22c55e' }}>{stats.resolved}</div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="ticket-filter-bar">
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div className="ticket-search-input" style={{ flex: '1', minWidth: '250px' }}>
              <span className="ticket-search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="ticket-filter-buttons">
              {['all', 'pending', 'in_progress', 'resolved'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`ticket-filter-btn ${filterStatus === status ? 'btn btn-primary active' : 'btn'}`}
                >
                  {status === 'all' ? 'All' : status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* --- Ticket History List --- */}
        <div className="content-card">
          <h2 className="content-title">Your Ticket History</h2>
          {filteredTickets.length === 0 ? (
            <div className="ticket-empty-state">
              <div className="empty-state-icon">
                {searchQuery || filterStatus !== 'all' ? '🔍' : '📭'}
              </div>
              <h3 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0' }}>
                {searchQuery || filterStatus !== 'all' ? 'No tickets found' : 'No support tickets yet'}
              </h3>
              <p className="empty-state-text" style={{ color: 'var(--text-secondary)', margin: 0 }}>
                {searchQuery || filterStatus !== 'all' 
                  ? 'Try adjusting your filters or search query' 
                  : 'Create your first support ticket to get help from our team'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredTickets.map(ticket => {
                const statusInfo = getStatusConfig(ticket.status);
                const lastMessage = ticket.ticket_messages?.[ticket.ticket_messages.length - 1];
                
                return (
                  <Link 
                    key={ticket.id} 
                    href={`/support/${ticket.id}`} 
                    className="ticket-link-item"
                    style={{ 
                      display: 'block',
                      background: 'var(--grey-dark)', 
                      padding: '1.5rem', 
                      borderRadius: '12px', 
                      border: '1px solid var(--grey-light)',
                      textDecoration: 'none',
                      color: 'inherit',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = 'var(--grey-light)';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'start', 
                      marginBottom: '0.75rem',
                      gap: '1rem',
                      flexWrap: 'wrap'
                    }}>
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', margin: '0 0 0.5rem 0' }}>
                          {ticket.subject}
                        </h3>
                        {lastMessage && (
                          <p style={{
                            color: 'var(--text-secondary)',
                            fontSize: '0.9rem',
                            margin: 0,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '500px'
                          }}>
                            {lastMessage.message_content}
                          </p>
                        )}
                      </div>
                      <span className={`ticket-status-badge ${statusInfo.className}`}>
                        <span>{statusInfo.icon}</span>
                        {statusInfo.label}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      flexWrap: 'wrap'
                    }}>
                      <span>Ticket #{ticket.id.substring(0, 8)}...</span>
                      <span>•</span>
                      <span>{formatTimeAgo(ticket.created_at)}</span>
                      {ticket.ticket_messages?.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="message-count-badge">
                            {ticket.ticket_messages.length} {ticket.ticket_messages.length === 1 ? 'message' : 'messages'}
                          </span>
                        </>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* --- New Ticket Modal --- */}
      {isModalOpen && (
        <div className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Submit a New Ticket</h2>
              <span className="modal-close" onClick={() => setIsModalOpen(false)}>&times;</span>
            </div>
            
            <form onSubmit={handleSubmitTicket}>
              <div className="form-group">
                <label className="form-label" htmlFor="subject">Subject</label>
                <input
                  id="subject"
                  type="text"
                  className="form-input"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  minLength="6"
                  placeholder="e.g., Issue with my account"
                />
                <small className={`character-counter ${subject.length >= 6 ? '' : 'warning'}`} style={{ 
                  display: 'block', 
                  marginTop: '0.25rem'
                }}>
                  {subject.length}/6 characters minimum
                </small>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="content">Your Message</label>
                <textarea
                  id="content"
                  className="form-textarea reply-textarea"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  minLength="11"
                  placeholder="Please describe your issue in detail..."
                  style={{ minHeight: '150px' }}
                />
                <small className={`character-counter ${content.length >= 11 ? '' : 'warning'}`} style={{ 
                  display: 'block', 
                  marginTop: '0.25rem'
                }}>
                  {content.length}/11 characters minimum
                </small>
              </div>

              {message.text && (
                <div className={`ticket-message ticket-message-${message.type}`}>
                  <span>{message.type === 'success' ? '✅' : '❌'}</span>
                  {message.text}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                <button type="button" className="btn" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary btn-send-reply" 
                  disabled={isSubmitting || subject.length < 6 || content.length < 11}
                  style={{
                    opacity: (isSubmitting || subject.length < 6 || content.length < 11) ? 0.5 : 1,
                    cursor: (isSubmitting || subject.length < 6 || content.length < 11) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isSubmitting ? 'Submitting...' : 'Create Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}