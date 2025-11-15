"use client";
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../utils/supabaseClient';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AdminTicketViewPage() {
  const params = useParams();
  const router = useRouter();
  const { ticketId } = params;
  
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  
  // Admin Reply Form
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Admin Manage Form
  const [ticketStatus, setTicketStatus] = useState('');
  
  // Admin Avatar State
  const [adminAvatarUrl, setAdminAvatarUrl] = useState(''); 

  const messagesEndRef = useRef(null);

  // Function to fetch all ticket data
  const fetchTicketData = async (currentSession, adminRole) => {
    if (!currentSession || !ticketId || adminRole !== 'admin') {
      setError('Access Denied. You must be an admin.');
      setLoading(false);
      return;
    }

    // 1. Fetch the main ticket details
    const { data: ticketData, error: ticketError } = await supabase
      .from('support_tickets')
      .select('*, requester:profiles!requester_id(id, username, avatar_url)')
      .eq('id', ticketId)
      .single();

    if (ticketError) {
      console.error('Error fetching ticket:', ticketError);
      setError('Could not load support ticket.');
      setLoading(false);
      return;
    }
    setTicket(ticketData);
    setTicketStatus(ticketData.status);

    // 2. Fetch all messages for this ticket
    const { data: messagesData, error: messagesError } = await supabase
      .from('ticket_messages')
      .select('*, sender:profiles!sender_id(id, username, avatar_url, role)')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      setError('Could not load messages.');
    } else {
      setMessages(messagesData || []);
    }
    setLoading(false);
  };

  // Initial data load
  useEffect(() => {
    const initializePage = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, avatar_url') 
          .eq('id', session.user.id)
          .single();
        
        const role = profile?.role || 'guest';
        setUserRole(role);
        setAdminAvatarUrl(profile?.avatar_url || ''); 
        
        await fetchTicketData(session, role);
      } else {
        setUserRole('guest');
        setError('Access Denied. You must be an admin.');
        setLoading(false);
      }
    };
    initializePage();
  }, [ticketId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle sending a new reply
  const handleSendReply = async (event) => {
    event.preventDefault();
    if (!session || !newMessage.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError('');

    const { data: newMessageData, error } = await supabase
      .from('ticket_messages')
      .insert({
        ticket_id: ticketId,
        sender_id: session.user.id,
        message_content: newMessage
      })
      .select('*, sender:profiles!sender_id(id, username, avatar_url, role)')
      .single();

    setIsSubmitting(false);

    if (error) {
      console.error('Error sending reply:', error);
      setError('Failed to send reply. Please try again.');
    } else {
      setMessages([...messages, newMessageData]);
      setNewMessage('');
    }
  };

  // Handle updating the ticket status
  const handleUpdateTicket = async (event) => {
    event.preventDefault();
    if (!session) return;

    setIsSubmitting(true);
    // Removed admin_notes from update
    const { error } = await supabase
      .from('support_tickets')
      .update({
        status: ticketStatus,
        resolved_at: ['resolved', 'in_progress'].includes(ticketStatus) ? new Date().toISOString() : null,
        resolved_by: session.user.id
      })
      .eq('id', ticketId);

    setIsSubmitting(false);
    
    if (error) {
      console.error('Error updating ticket:', error);
      alert('Failed to update ticket status.');
    } else {
      alert('Ticket updated successfully!');
      setTicket({ ...ticket, status: ticketStatus });
    }
  };

  // --- Renders ---

  if (loading) {
    return (
      <div className="section">
        <div className="dashboard-header"><h1>Loading Ticket...</h1></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="section">
        <div className="dashboard-header">
          <div className="dashboard-title">
            <h1>Error</h1>
            <p className="dashboard-subtitle">{error}</p>
            <Link href="/admin-tickets" className="btn" style={{marginTop: '1rem'}}>Back to All Tickets</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="section">
        <div className="dashboard-header">
          <div className="dashboard-title">
            <h1>Ticket Not Found</h1>
            <Link href="/admin-tickets" className="btn" style={{marginTop: '1rem'}}>Back to All Tickets</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/admin-tickets" className="btn-link-secondary" style={{ fontSize: '0.9rem' }}>
          &larr; Back to all tickets
        </Link>
      </div>

      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1 style={{ fontSize: '1.8rem' }}>{ticket.subject}</h1>
          <p className="dashboard-subtitle">
            From: <strong>{ticket.requester.username || 'Unknown User'}</strong> &bull; 
            Status: <span style={{ textTransform: 'capitalize', fontWeight: '600', color: 'var(--primary)' }}>{ticket.status}</span>
          </p>
        </div>
      </div>

      <div className="content-grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '2rem', alignItems: 'flex-start' }}>
        
        {/* --- Chat Interface (Left Column) --- */}
        <div className="content-card" style={{ background: 'var(--grey-dark)' }}>
          <h2 className="content-title" style={{ marginBottom: '1rem' }}>Conversation</h2>
          <div 
            className="chat-messages-list" 
            style={{ 
              maxHeight: '60vh', 
              overflowY: 'auto', 
              padding: '1rem', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '1.5rem',
              background: 'var(--grey-darker)',
              borderRadius: '8px'
            }}
          >
            {messages.map(message => {
              const isYou = message.sender.id === session.user.id;
              
              return (
                <div 
                  key={message.id} 
                  className="chat-message"
                  style={{
                    display: 'flex',
                    gap: '0.75rem',
                    alignSelf: isYou ? 'flex-end' : 'flex-start'
                  }}
                >
                  {/* User Avatar (Left) */}
                  {!isYou && (
                    <Image
                      src={message.sender.avatar_url || 'https://placehold.co/40x40/667eea/white?text=U'}
                      alt={message.sender.username}
                      width={40}
                      height={40}
                      style={{ borderRadius: '50%', flexShrink: 0 }}
                    />
                  )}

                  {/* Message Bubble */}
                  <div 
                    className="message-bubble" 
                    style={{
                      background: isYou ? 'var(--primary)' : 'var(--grey-light)',
                      color: isYou ? 'white' : 'var(--text-primary)',
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      maxWidth: '450px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <strong style={{ fontSize: '0.9rem' }}>
                        {isYou ? 'You (Admin)' : message.sender.username}
                      </strong>
                    </div>
                    <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                      {message.message_content}
                    </p>
                    <small style={{ 
                      display: 'block', 
                      marginTop: '0.5rem', 
                      fontSize: '0.75rem', 
                      opacity: 0.7,
                      textAlign: 'right'
                    }}>
                      {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </small>
                  </div>

                  {/* Admin Avatar (Right) */}
                  {isYou && (
                    <Image
                      src={adminAvatarUrl || 'https://placehold.co/40x40/2a2a2a/white?text=A'}
                      alt="Your Avatar"
                      width={40}
                      height={40}
                      style={{ borderRadius: '50%', flexShrink: 0 }}
                    />
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* --- Reply Form --- */}
          <div className="reply-form" style={{ borderTop: '1px solid var(--grey-light)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
            <form onSubmit={handleSendReply}>
              <div className="form-group">
                <label className="form-label" htmlFor="new-message">Send a Reply</label>
                <textarea
                  id="new-message"
                  className="form-textarea"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  required
                  placeholder="Type your reply to the user..."
                  style={{ minHeight: '100px' }}
                />
              </div>
              
              {error && (
                <div className="auth-message error" style={{ marginBottom: '1rem' }}>
                  {error}
                </div>
              )}
              
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Reply'}
              </button>
            </form>
          </div>
        </div>

        {/* --- Admin Management Form (Right Column) --- */}
        <div className="content-card" style={{ position: 'sticky', top: '80px' }}>
          <h2 className="content-title">Manage Ticket</h2>
          <form onSubmit={handleUpdateTicket}>
            <div className="form-group">
              <label className="form-label" htmlFor="status">Ticket Status</label>
              <select
                id="status"
                className="form-select"
                value={ticketStatus}
                onChange={(e) => setTicketStatus(e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <button type="submit" className="btn" disabled={isSubmitting} style={{width: '100%'}}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
