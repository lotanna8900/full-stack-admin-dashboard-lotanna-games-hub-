"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown'; 
import { useSearchParams } from 'next/navigation';

export default function AnnouncementsPage() {
  // --- State Variables ---
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isNewAnnouncementModalOpen, setIsNewAnnouncementModalOpen] = useState(false);
  const [newAnnouncementTitle, setNewAnnouncementTitle] = useState('');
  const [newAnnouncementContent, setNewAnnouncementContent] = useState('');

  // Auth & User State
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const searchParams = useSearchParams();

    // --- Scroll to Highlighted Announcement Effect ---
    useEffect(() => {
      const highlightId = searchParams.get('id');
      if (highlightId && !loading) {
        const targetSelector = `[data-announcement-id="${highlightId}"]`;
        const targetElement = document.querySelector(targetSelector);
        
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // 2. I think I should add a highlight effect
          targetElement.style.transition = 'background-color 0.5s ease';
          targetElement.style.backgroundColor = 'rgba(255, 255, 0, 0.2)';
          
          // 3. Remove highlight after a delay
          setTimeout(() => {
            targetElement.style.backgroundColor = '';
          }, 2000);
        }
      }
    }, [announcements, loading, searchParams]);

  // --- Data Fetching Effect ---
  useEffect(() => {
    setLoading(true);

    // Helper to fetch user role
    const fetchUserData = async (currentSession) => {
      if (!currentSession) {
        setUserRole('guest');
        return;
      }
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', currentSession.user.id)
        .single();
      if (error) setUserRole('guest');
      else setUserRole(profile?.role || 'guest');
    };

    // Helper to fetch announcements
    const getAnnouncements = async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) console.error('Error fetching announcements:', error);
      else setAnnouncements(data || []);
      setLoading(false);
    };

    // Initial Fetch & Listener
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

  // --- Handler Functions ---

  // Modal Handlers
  const openNewAnnouncementModal = () => setIsNewAnnouncementModalOpen(true);
  const closeNewAnnouncementModal = () => {
    setIsNewAnnouncementModalOpen(false);
    setNewAnnouncementTitle('');
    setNewAnnouncementContent('');
  };

  // Create Handler
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

  if (loading) {
    return <div>Loading announcements...</div>;
  }


  return (
    <>
      {/* Announcements Section */}
      <div id="announcements-section" className="section">
        <div className="dashboard-header">
          <div className="dashboard-title">
            <h1>Announcements</h1>
            <p className="dashboard-subtitle">Latest news and updates for the community.</p>
          </div>
          <div className="action-buttons">
            {userRole === 'admin' && (
              <button className="btn btn-primary" onClick={openNewAnnouncementModal}>New Announcement</button>
            )}
          </div>
        </div>

        <div className="announcements-list">
          {announcements.map((announcement) => (
            <div key={announcement.id}
              className="card"
              data-announcement-id={announcement.id}
              style={{ marginBottom: '1.5rem', padding: '1.5rem' }}
            >
              <h2 className="content-title">{announcement.title}</h2>
              <p className="content-meta">
                Posted on {new Date(announcement.created_at).toLocaleDateString()}
              </p>
              <div className="announcement-content" style={{ marginTop: '1rem', whiteSpace: 'pre-wrap' }}>
                <ReactMarkdown>{announcement.content}</ReactMarkdown>
              </div>
            </div>
          ))}
          {announcements.length === 0 && <p>No announcements yet.</p>}
        </div>
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
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={newAnnouncementTitle}
                  onChange={(e) => setNewAnnouncementTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Content</label>
                <textarea
                  className="form-textarea"
                  style={{ minHeight: '200px', whiteSpace: 'pre-wrap' }}
                  value={newAnnouncementContent}
                  onChange={(e) => setNewAnnouncementContent(e.target.value)}
                  required
                ></textarea>
              </div>
              <div style={{ textAlign: 'right', marginTop: '2rem' }}>
                <button type="button" className="btn" onClick={closeNewAnnouncementModal} style={{ marginRight: '1rem' }}>Cancel</button>
                <button type="submit" className="btn btn-primary">Post Announcement</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
    



