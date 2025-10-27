"use client";
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation'; 
import { supabase } from '../utils/supabaseClient';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

function AnnouncementsContent() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNewAnnouncementModalOpen, setIsNewAnnouncementModalOpen] = useState(false);
  const [newAnnouncementTitle, setNewAnnouncementTitle] = useState('');
  const [newAnnouncementContent, setNewAnnouncementContent] = useState('');
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // Call useSearchParams() INSIDE the new component
  const searchParams = useSearchParams();

  // --- Data Fetching Effect ---
  useEffect(() => {
    setLoading(true);
    const fetchUserData = async (currentSession) => {
      if (!currentSession) { setUserRole('guest'); return; }
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', currentSession.user.id).single();
      setUserRole(profile?.role || 'guest');
    };
    const getAnnouncements = async () => {
      const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
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
      }
    }
  }, [announcements, loading, searchParams]); 

  // --- Handler Functions ---
  const openNewAnnouncementModal = () => setIsNewAnnouncementModalOpen(true);
  const closeNewAnnouncementModal = () => { /* ... */ };
  const handleCreateAnnouncement = async (event) => { /* ... */ };
  
  const closeNewAnnouncementModal_full = () => {
    setIsNewAnnouncementModalOpen(false);
    setNewAnnouncementTitle('');
    setNewAnnouncementContent('');
  };
  const handleCreateAnnouncement_full = async (event) => {
    event.preventDefault();
    if (!session) return;
    const { data, error } = await supabase
      .from('announcements').insert([{ title: newAnnouncementTitle, content: newAnnouncementContent, author_id: session.user.id }])
      .select().single();
    if (error) { console.error('Error creating announcement:', error); alert('Failed to create announcement.'); }
    else { setAnnouncements([data, ...announcements]); closeNewAnnouncementModal_full(); }
  };


  if (loading) {
    return <div>Loading announcements...</div>;
  }


  return (
    <>
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
             <div key={announcement.id} className="card" data-announcement-id={announcement.id} style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
               <h2 className="content-title">{announcement.title}</h2>
               <p className="content-meta">Posted on {new Date(announcement.created_at).toLocaleDateString()}</p>
               <div className="announcement-content" style={{ marginTop: '1frem', whiteSpace: 'pre-wrap' }}>
                 <ReactMarkdown>{announcement.content}</ReactMarkdown>
               </div>
             </div>
           ))}
           {announcements.length === 0 && <p>No announcements yet.</p>}
         </div>
      </div>
      {isNewAnnouncementModalOpen && (
        <div id="new-announcement-modal" className="modal active">
           <div className="modal-content">
             <div className="modal-header">
               <h2>Create New Announcement</h2>
               <span className="modal-close" onClick={closeNewAnnouncementModal_full}>&times;</span>
             </div>
             <form onSubmit={handleCreateAnnouncement_full}>
               <div className="form-group">
                 <label className="form-label">Title</label>
                 <input type="text" className="form-input" value={newAnnouncementTitle} onChange={(e) => setNewAnnouncementTitle(e.target.value)} required />
               </div>
               <div className="form-group">
                 <label className="form-label">Content</label>
                 <textarea className="form-textarea" style={{ minHeight: '200px', whiteSpace: 'pre-wrap' }} value={newAnnouncementContent} onChange={(e) => setNewAnnouncementContent(e.target.value)} required></textarea>
               </div>
               <div style={{ textAlign: 'right', marginTop: '2rem' }}>
                 <button type="button" className="btn" onClick={closeNewAnnouncementModal_full} style={{ marginRight: '1rem' }}>Cancel</button>
                 <button type="submit" className="btn btn-primary">Post Announcement</button>
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
    <Suspense fallback={<div>Loading Page...</div>}>
      <AnnouncementsContent />
    </Suspense>
  );
}