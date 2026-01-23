"use client";
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation'; 
import { supabase } from '../utils/supabaseClient';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import NewsletterSender from '../../components/NewsletterSender';

function AnnouncementsContent() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNewAnnouncementModalOpen, setIsNewAnnouncementModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [newAnnouncementTitle, setNewAnnouncementTitle] = useState('');
  const [newAnnouncementContent, setNewAnnouncementContent] = useState('');
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [expandedAnnouncements, setExpandedAnnouncements] = useState([]);

  const searchParams = useSearchParams();

  // --- Data Fetching Effect ---
  useEffect(() => {
    setLoading(true);
    
    const fetchUserData = async (currentSession) => {
      if (!currentSession) { 
        setUserRole('guest'); 
        return; 
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentSession.user.id)
        .single();
      setUserRole(profile?.role || 'guest');
    };

    const getAnnouncements = async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) console.error('Error fetching announcements:', error);
      else setAnnouncements(data || []);
      setLoading(false);
    };

    getAnnouncements();
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      fetchUserData(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      fetchUserData(session);
    });

    return () => subscription?.unsubscribe();
  }, []);

  // --- Scrolling Effect ---
  useEffect(() => {
    const highlightId = searchParams.get('id');
    if (highlightId && !loading) {
      const targetSelector = `[data-announcement-id="${highlightId}"]`;
      const targetElement = document.querySelector(targetSelector);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetElement.style.transition = 'background-color 0.5s ease';
        targetElement.style.backgroundColor = 'rgba(255, 255, 0, 0.2)';
        setTimeout(() => { targetElement.style.backgroundColor = ''; }, 2000);
        
        // Auto-expand highlighted announcement
        const announcementId = targetElement.getAttribute('data-announcement-id');
        if (announcementId && !expandedAnnouncements.includes(announcementId)) {
          setExpandedAnnouncements([...expandedAnnouncements, announcementId]);
        }
      }
    }
  }, [announcements, loading, searchParams]); 

  // --- Handler Functions ---
  const openNewAnnouncementModal = () => {
    setIsNewAnnouncementModalOpen(true);
    setNewAnnouncementTitle('');
    setNewAnnouncementContent('');
  };

  const closeNewAnnouncementModal = () => {
    setIsNewAnnouncementModalOpen(false);
    setNewAnnouncementTitle('');
    setNewAnnouncementContent('');
  };

  const openEditModal = (announcement) => {
    setEditingAnnouncement(announcement);
    setNewAnnouncementTitle(announcement.title);
    setNewAnnouncementContent(announcement.content);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingAnnouncement(null);
    setNewAnnouncementTitle('');
    setNewAnnouncementContent('');
  };

  const handleCreateAnnouncement = async (event) => {
    event.preventDefault();
    if (!session) return;

    const { data, error } = await supabase
      .from('announcements')
      .insert([{ 
        title: newAnnouncementTitle, 
        content: newAnnouncementContent, 
        author_id: session.user.id 
      }])
      .select()
      .single();

    if (error) { 
      console.error('Error creating announcement:', error); 
      alert('Failed to create announcement.'); 
    } else { 
      setAnnouncements([data, ...announcements]); 
      closeNewAnnouncementModal(); 
    }
  };

  const handleUpdateAnnouncement = async (event) => {
    event.preventDefault();
    if (!editingAnnouncement) return;

    const { data, error } = await supabase
      .from('announcements')
      .update({ 
        title: newAnnouncementTitle, 
        content: newAnnouncementContent 
      })
      .eq('id', editingAnnouncement.id)
      .select()
      .single();

    if (error) { 
      console.error('Error updating announcement:', error); 
      alert('Failed to update announcement.'); 
    } else { 
      setAnnouncements(announcements.map(a => a.id === editingAnnouncement.id ? data : a)); 
      closeEditModal(); 
    }
  };

  const handleDeleteAnnouncement = async (announcementId) => {
    if (!window.confirm('Are you sure you want to delete this announcement? This action cannot be undone.')) return;

    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', announcementId);

    if (error) { 
      console.error('Error deleting announcement:', error); 
      alert('Failed to delete announcement.'); 
    } else { 
      setAnnouncements(announcements.filter(a => a.id !== announcementId)); 
    }
  };

  const toggleAnnouncement = (announcementId) => {
    setExpandedAnnouncements(prev => 
      prev.includes(announcementId) 
        ? prev.filter(id => id !== announcementId) 
        : [...prev, announcementId]
    );
  };

  // Get relative time
  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="section">
        <div className="dashboard-header">
          <h1>Loading announcements...</h1>
        </div>
      </div>
    );
  }

  return (
    <>
      <div id="announcements-section" className="section">
        <div className="dashboard-header">
          <div className="dashboard-title">
            <h1>📢 Announcements</h1>
            <p className="dashboard-subtitle">
              Stay up to date with the latest news and updates
            </p>
          </div>
          <div className="action-buttons">
            {userRole === 'admin' && (
              <button className="btn btn-primary" onClick={openNewAnnouncementModal}>
                + New Announcement
              </button>
            )}
          </div>
        </div>

        {/* Newsletter Component */}
        {userRole === 'admin' && (
          <div style={{ marginBottom: '2rem' }}>
            <NewsletterSender />
          </div>
        )}

        {/* Announcements List */}
        {announcements.length === 0 ? (
          <div className="empty-state-card">
            <div className="empty-state-icon">📭</div>
            <h3>No announcements yet</h3>
            <p>Check back later for important updates and news!</p>
          </div>
        ) : (
          <div className="announcements-list">
            {announcements.map((announcement) => {
              const isExpanded = expandedAnnouncements.includes(announcement.id);
              const contentPreview = announcement.content.substring(0, 200);
              const needsExpansion = announcement.content.length > 200;

              return (
                <div 
                  key={announcement.id} 
                  className="announcement-card" 
                  data-announcement-id={announcement.id}
                >
                  {/* Header */}
                  <div className="announcement-header">
                    <div className="announcement-icon">📢</div>
                    <div className="announcement-meta">
                      <h2 className="announcement-title">{announcement.title}</h2>
                      <p className="announcement-date">
                        {getRelativeTime(announcement.created_at)} · {new Date(announcement.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    {/* Admin Actions */}
                    {userRole === 'admin' && (
                      <div className="announcement-actions">
                        <button 
                          className="btn-icon" 
                          onClick={() => openEditModal(announcement)}
                          title="Edit announcement"
                        >
                          ✏️
                        </button>
                        <button 
                          className="btn-icon" 
                          onClick={() => handleDeleteAnnouncement(announcement.id)}
                          title="Delete announcement"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="announcement-content">
                    <ReactMarkdown>
                      {isExpanded ? announcement.content : contentPreview}
                    </ReactMarkdown>
                  </div>

                  {/* Read More Button */}
                  {needsExpansion && (
                    <button 
                      className="btn-link read-more-btn" 
                      onClick={() => toggleAnnouncement(announcement.id)}
                    >
                      {isExpanded ? '← Show Less' : 'Read More →'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Announcement Modal */}
      {isNewAnnouncementModalOpen && (
        <div id="new-announcement-modal" className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create New Announcement</h2>
              <span className="modal-close" onClick={closeNewAnnouncementModal}>&times;</span>
            </div>
            <form onSubmit={handleCreateAnnouncement}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Enter announcement title"
                  value={newAnnouncementTitle} 
                  onChange={(e) => setNewAnnouncementTitle(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Content (Markdown supported) *</label>
                <textarea 
                  className="form-textarea" 
                  style={{ minHeight: '250px', whiteSpace: 'pre-wrap' }} 
                  placeholder="Write your announcement here... You can use Markdown for formatting."
                  value={newAnnouncementContent} 
                  onChange={(e) => setNewAnnouncementContent(e.target.value)} 
                  required
                ></textarea>
                <small style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  💡 Tip: Use **bold**, *italic*, and [links](url) for formatting
                </small>
              </div>
              <div style={{ textAlign: 'right', marginTop: '2rem' }}>
                <button 
                  type="button" 
                  className="btn" 
                  onClick={closeNewAnnouncementModal} 
                  style={{ marginRight: '1rem' }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Post Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Announcement Modal */}
      {isEditModalOpen && editingAnnouncement && (
        <div id="edit-announcement-modal" className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Announcement</h2>
              <span className="modal-close" onClick={closeEditModal}>&times;</span>
            </div>
            <form onSubmit={handleUpdateAnnouncement}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={newAnnouncementTitle} 
                  onChange={(e) => setNewAnnouncementTitle(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Content (Markdown supported) *</label>
                <textarea 
                  className="form-textarea" 
                  style={{ minHeight: '250px', whiteSpace: 'pre-wrap' }} 
                  value={newAnnouncementContent} 
                  onChange={(e) => setNewAnnouncementContent(e.target.value)} 
                  required
                ></textarea>
              </div>
              <div style={{ textAlign: 'right', marginTop: '2rem' }}>
                <button 
                  type="button" 
                  className="btn" 
                  onClick={closeEditModal} 
                  style={{ marginRight: '1rem' }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default function AnnouncementsPage() {
  return (
    <Suspense fallback={
      <div className="section">
        <div className="dashboard-header">
          <h1>Loading announcements...</h1>
        </div>
      </div>
    }>
      <AnnouncementsContent />
    </Suspense>
  );
}