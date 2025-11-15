"use client";
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../utils/supabaseClient';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Image from 'next/image'; 

export default function SupportTicketPage() {
  const params = useParams();
  const { ticketId } = params;
  
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  
  // New reply form
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const messagesEndRef = useRef(null); 
  const textareaRef = useRef(null);

  // Helper function for status config
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

  // Format time in a more user-friendly way
  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / 3600000);
    
    // If today, show time
    if (diffHours < 24 && date.getDate() === now.getDate()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If yesterday
    if (diffHours < 48 && date.getDate() === now.getDate() - 1) {
      return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Otherwise show date and time
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + 
           date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Function to fetch all ticket data
  const fetchTicketData = async (currentSession) => {
    if (!currentSession || !ticketId) return;

    // 1. Fetch the main ticket details
    const { data: ticketData, error: ticketError } = await supabase
      .from('support_tickets')
      .select('*, requester:profiles!requester_id(id, username, avatar_url)')
      .eq('id', ticketId)
      .single();

    if (ticketError) {
      console.error('Error fetching ticket:', ticketError);
      setError('Could not load support ticket. You may not have permission to view this.');
      setLoading(false);
      return;
    }
    setTicket(ticketData);

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
      await fetchTicketData(session);
    };
    initializePage();
  }, [ticketId]);

  // Real-time subscription for new messages
  useEffect(() => {
    if (!ticketId) return;

    const channel = supabase
      .channel(`ticket-${ticketId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'ticket_messages',
        filter: `ticket_id=eq.${ticketId}`
      }, async (payload) => {
        // Fetch the complete message with sender details
        const { data: newMessageData } = await supabase
          .from('ticket_messages')
          .select('*, sender:profiles!sender_id(id, username, avatar_url, role)')
          .eq('id', payload.new.id)
          .single();

        if (newMessageData) {
          setMessages(prev => [...prev, newMessageData]);
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'support_tickets',
        filter: `id=eq.${ticketId}`
      }, (payload) => {
        // Update ticket status in real-time
        setTicket(prev => ({ ...prev, ...payload.new }));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketId]);

  // Auto-scroll to bottom when new messages load
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
    setSuccessMessage('');

    const { data: newMessageData, error } = await supabase
      .from('ticket_messages')
      .insert({
        ticket_id: ticketId,
        sender_id: session.user.id,
        message_content: newMessage.trim()
      })
      .select('*, sender:profiles!sender_id(id, username, avatar_url, role)') 
      .single();

    setIsSubmitting(false);

    if (error) {
      console.error('Error sending reply:', error);
      setError('Failed to send reply. Please try again.');
    } else {
      // Only add message if it's not already in the list (real-time might have added it)
      setMessages(prev => {
        const exists = prev.some(msg => msg.id === newMessageData.id);
        return exists ? prev : [...prev, newMessageData];
      });
      setNewMessage('');
      setSuccessMessage('Reply sent successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Focus back on textarea
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  // Handle keyboard shortcut (Ctrl/Cmd + Enter to send)
  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSendReply(e);
    }
  };

  // --- Renders ---

  if (loading) {
    return (
      <div className="section">
        <div className="dashboard-header">
          <div className="dashboard-title">
            <h1>Loading Ticket...</h1>
          </div>
        </div>
        <div className="ticket-loading">
          <div className="ticket-loading-spinner">⏳</div>
          <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <div className="section">
        <div className="dashboard-header">
          <div className="dashboard-title">
            <h1>Error</h1>
            <p className="dashboard-subtitle">{error}</p>
            <Link href="/support" className="btn" style={{marginTop: '1rem'}}>
              ← Back to Support
            </Link>
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
            <p className="dashboard-subtitle">This ticket doesn't exist or you don't have access to it.</p>
            <Link href="/support" className="btn" style={{marginTop: '1rem'}}>
              ← Back to Support
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusConfig(ticket.status);

  return (
    <div className="section">
      {/* Back Button */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/support" className="btn-link-secondary" style={{ fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          ← Back to all tickets
        </Link>
      </div>

      {/* Ticket Header */}
      <div className="dashboard-header ticket-header" style={{ marginBottom: '2rem' }}>
        <div className="dashboard-title" style={{ flex: 1 }}>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '0.75rem' }}>{ticket.subject}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Ticket #{ticket.id.substring(0, 8)}...
            </span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>•</span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Created {new Date(ticket.created_at).toLocaleDateString()}
            </span>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>•</span>
            <span className="message-count-badge">
              {messages.length} {messages.length === 1 ? 'message' : 'messages'}
            </span>
          </div>
        </div>
        <span className={`ticket-status-badge ${statusInfo.className}`}>
          <span style={{ fontSize: '1.2rem' }}>{statusInfo.icon}</span>
          {statusInfo.label}
        </span>
      </div>

      {/* Chat Interface */}
      <div className="content-card" style={{ background: 'var(--grey-dark)', padding: 0 }}>
        {/* Messages Area */}
        <div 
          className="chat-messages-list" 
          style={{ 
            maxHeight: '60vh', 
            minHeight: '40vh',
            overflowY: 'auto', 
            padding: '1.5rem', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1.5rem' 
          }}
        >
          {messages.length === 0 ? (
            <div className="ticket-empty-state" style={{ border: 'none', padding: '2rem' }}>
              <div className="empty-state-icon">💬</div>
              <p style={{ color: 'var(--text-secondary)' }}>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message, index) => {
              const isYou = message.sender.id === session.user.id;
              const isAdmin = message.sender.role === 'admin';
              const showDate = index === 0 || 
                new Date(messages[index - 1].created_at).toDateString() !== new Date(message.created_at).toDateString();
              
              return (
                <div key={message.id}>
                  {/* Date Divider */}
                  {showDate && (
                    <div className="chat-date-divider">
                      <span>
                        {new Date(message.created_at).toLocaleDateString([], { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                  )}
                  
                  {/* Message */}
                  <div 
                    className="chat-message"
                    style={{
                      display: 'flex',
                      gap: '0.75rem',
                      alignSelf: isYou ? 'flex-end' : 'flex-start',
                      maxWidth: '80%',
                      width: 'fit-content',
                      marginLeft: isYou ? 'auto' : 0
                    }}
                  >
                    {/* Avatar (left side for others) */}
                    {!isYou && (
                      <div style={{ flexShrink: 0 }}>
                        <Image
                          src={message.sender.avatar_url || 'https://placehold.co/40x40/667eea/white?text=A'}
                          alt={message.sender.username}
                          width={40}
                          height={40}
                          className="chat-avatar chat-avatar-admin"
                        />
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div className={`message-bubble ${isYou ? 'message-bubble-user' : 'message-bubble-other'}`}>
                      {/* Sender Name */}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem', 
                        marginBottom: '0.5rem' 
                      }}>
                        <strong style={{ fontSize: '0.9rem' }}>
                          {isYou ? 'You' : message.sender.username}
                        </strong>
                        {isAdmin && !isYou && (
                          <span className="admin-badge">Admin</span>
                        )}
                      </div>
                      
                      {/* Message Content */}
                      <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '0.95rem' }}>
                        {message.message_content}
                      </p>
                      
                      {/* Timestamp */}
                      <small style={{ 
                        display: 'block', 
                        marginTop: '0.5rem', 
                        fontSize: '0.75rem', 
                        opacity: 0.7,
                        textAlign: 'right'
                      }}>
                        {formatMessageTime(message.created_at)}
                      </small>
                    </div>

                    {/* Avatar (right side for user) */}
                    {isYou && (
                      <div style={{ flexShrink: 0 }}>
                        <Image
                          src={ticket.requester.avatar_url || 'https://placehold.co/40x40/2a2a2a/white?text=Y'}
                          alt={ticket.requester.username}
                          width={40}
                          height={40}
                          className="chat-avatar chat-avatar-user"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply Form */}
        <div className="reply-form">
          <form onSubmit={handleSendReply}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" htmlFor="new-message" style={{ marginBottom: '0.75rem' }}>
                {ticket.status === 'resolved' ? '💡 Send a message to reopen this ticket' : '💬 Send a Reply'}
              </label>
              <textarea
                ref={textareaRef}
                id="new-message"
                className="form-textarea reply-textarea"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                required
                placeholder={ticket.status === 'resolved' 
                  ? "Type your message to reopen this ticket..." 
                  : "Type your message..."}
                style={{ 
                  minHeight: '120px',
                  fontSize: '0.95rem',
                  resize: 'vertical'
                }}
              />
              <div className="keyboard-hint">
                💡 Tip: On desktop, press <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to send quickly
              </div>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="ticket-message ticket-message-error">
                <span>❌</span>
                {error}
              </div>
            )}
            
            {/* Success Message */}
            {successMessage && (
              <div className="ticket-message ticket-message-success">
                <span>✅</span>
                {successMessage}
              </div>
            )}
            
            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="character-counter">
                {newMessage.length > 0 && `${newMessage.length} characters`}
              </div>
              <button 
                type="submit" 
                className="btn btn-primary btn-send-reply" 
                disabled={isSubmitting || !newMessage.trim()}
                style={{
                  opacity: (isSubmitting || !newMessage.trim()) ? 0.5 : 1,
                  cursor: (isSubmitting || !newMessage.trim()) ? 'not-allowed' : 'pointer',
                  minWidth: '120px'
                }}
              >
                {isSubmitting ? '📤 Sending...' : '📨 Send Reply'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Resolved Ticket Banner */}
      {ticket.status === 'resolved' && (
        <div className="resolved-ticket-banner">
          ✅ This ticket has been marked as resolved. Send a message to reopen it.
        </div>
      )}
    </div>
  );
}