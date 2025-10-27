"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient'; 
import Link from 'next/link';
import Image from 'next/image'; // 

export default function SnippetsPage() {
  // --- State Variables ---
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isNewSnippetModalOpen, setIsNewSnippetModalOpen] = useState(false);
  const [isEditSnippetModalOpen, setIsEditSnippetModalOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState(null);

  // Form State
  const [newSnippetTitle, setNewSnippetTitle] = useState('');
  const [newSnippetDescription, setNewSnippetDescription] = useState('');
  const [newSnippetGameUrl, setNewSnippetGameUrl] = useState('');
  const [newSnippetImageUrl, setNewSnippetImageUrl] = useState('');

  // Auth & User State
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // --- Data Fetching Effect ---
  useEffect(() => {
    setLoading(true);

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

    const getSnippets = async () => {
      const { data, error } = await supabase
        .from('snippets')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) console.error('Error fetching snippets:', error);
      else setSnippets(data || []);
      setLoading(false);
    };

    // Initial Fetch & Listener
    getSnippets();
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

  // Snippet Modal Handlers
  const openNewSnippetModal = () => setIsNewSnippetModalOpen(true);
  const closeNewSnippetModal = () => {
    setIsNewSnippetModalOpen(false);
    setNewSnippetTitle('');
    setNewSnippetDescription('');
    setNewSnippetGameUrl('');
    setNewSnippetImageUrl('');
  };

  const openEditSnippetModal = (snippet) => {
    setEditingSnippet(snippet);
    setNewSnippetTitle(snippet.title);
    setNewSnippetDescription(snippet.description || '');
    setNewSnippetGameUrl(snippet.game_url);
    setNewSnippetImageUrl(snippet.image_url || '');
    setIsEditSnippetModalOpen(true);
  };

  const closeEditSnippetModal = () => {
    setIsEditSnippetModalOpen(false);
    setEditingSnippet(null);
    setNewSnippetTitle('');
    setNewSnippetDescription('');
    setNewSnippetGameUrl('');
    setNewSnippetImageUrl('');
  };

  // CRUD Handlers
  const handleCreateSnippet = async (event) => {
    event.preventDefault();
    if (!session) return;
    const { data, error } = await supabase
      .from('snippets')
      .insert([{
        title: newSnippetTitle,
        description: newSnippetDescription,
        game_url: newSnippetGameUrl,
        image_url: newSnippetImageUrl,
        author_id: session.user.id
      }])
      .select()
      .single();
    if (error) { console.error('Error creating snippet:', error); alert('Could not create the snippet.'); }
    else { setSnippets([data, ...snippets]); closeNewSnippetModal(); }
  };

  const handleUpdateSnippet = async (event) => {
    event.preventDefault();
    if (!editingSnippet) return;
    const { data, error } = await supabase
      .from('snippets')
      .update({
        title: newSnippetTitle,
        description: newSnippetDescription,
        game_url: newSnippetGameUrl,
        image_url: newSnippetImageUrl
      })
      .eq('id', editingSnippet.id)
      .select()
      .single();
    if (error) { console.error('Error updating snippet:', error); alert('Could not update the snippet.'); }
    else { setSnippets(snippets.map(s => (s.id === editingSnippet.id ? data : s))); closeEditSnippetModal(); }
  };

  const handleDeleteSnippet = async (snippetId) => {
    if (!window.confirm("Are you sure?")) return;
    const { error } = await supabase.from('snippets').delete().eq('id', snippetId);
    if (error) { console.error('Error deleting snippet:', error); alert('Could not delete snippet.'); }
    else { setSnippets(snippets.filter(snippet => snippet.id !== snippetId)); }
  };

  if (loading) {
    return <div>Loading snippets...</div>;
  }

  return (
    <>
      {/* Game Snippets Section */}
      <div id="snippets-section" className="section">
        <div className="dashboard-header">
          <div className="dashboard-title">
            <h1>Game Snippets</h1>
            <p className="dashboard-subtitle">Explore demos and snippets from various projects</p>
          </div>
          <div className="action-buttons">
            {userRole === 'admin' && (
              <button className="btn btn-primary" onClick={openNewSnippetModal}>
                Add New Snippet
              </button>
            )}
          </div>
        </div>

        <div className="content-grid">
          {snippets.map((snippet) => (
            <div key={snippet.id} className="content-card">
              {snippet.image_url && (
                <div style={{ position: 'relative', width: '100%', height: '180px' }}>
                  <Image
                    src={snippet.image_url}
                    alt={snippet.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              )}
              <div style={{ padding: '1rem' }}>
                <h2 className="content-title">{snippet.title}</h2>
                <p className="content-meta">Added on {new Date(snippet.created_at).toISOString().split('T')[0]}</p>
                <p style={{ whiteSpace: 'pre-wrap' }}>{snippet.description}</p>
                <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <a href={snippet.game_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                    View Full Demo
                  </a>
                  {/* Admin Edit/Delete Buttons */}
                  {userRole === 'admin' && (
                    <>
                      <button className="btn" onClick={() => openEditSnippetModal(snippet)}>Edit</button>
                      <button className="btn btn-danger" onClick={() => handleDeleteSnippet(snippet.id)}>Delete</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Snippet Modal */}
      {isNewSnippetModalOpen && (
        <div id="new-snippet-modal" className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Game Snippet</h2>
              <span className="modal-close" onClick={closeNewSnippetModal}>&times;</span>
            </div>
            <form onSubmit={handleCreateSnippet}>
              {/* ... (form fields: title, description, game_url, image_url) ... */}
              <div className="form-group">
                <label className="form-label">Title</label>
                <input type="text" className="form-input" value={newSnippetTitle} onChange={(e) => setNewSnippetTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" style={{ whiteSpace: 'pre-wrap' }} value={newSnippetDescription} onChange={(e) => setNewSnippetDescription(e.target.value)}></textarea>
              </div>
              <div className="form-group">
                <label className="form-label">Game Demo URL</label>
                <input type="url" className="form-input" placeholder="https://dashingdon.com/play/..." value={newSnippetGameUrl} onChange={(e) => setNewSnippetGameUrl(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Cover Image URL (Optional)</label>
                <input type="url" className="form-input" placeholder="Copy URL from File Manager..." value={newSnippetImageUrl} onChange={(e) => setNewSnippetImageUrl(e.target.value)} />
              </div>
              <div style={{ textAlign: 'right', marginTop: '2rem' }}>
                <button type="button" className="btn" onClick={closeNewSnippetModal} style={{ marginRight: '1rem' }}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Snippet</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Snippet Modal */}
      {isEditSnippetModalOpen && (
        <div id="edit-snippet-modal" className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Game Snippet</h2>
              <span className="modal-close" onClick={closeEditSnippetModal}>&times;</span>
            </div>
            <form onSubmit={handleUpdateSnippet}>
              {/*  (form fields */}
              <div className="form-group">
                <label className="form-label">Title</label>
                <input type="text" className="form-input" value={newSnippetTitle} onChange={(e) => setNewSnippetTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" style={{ whiteSpace: 'pre-wrap' }} value={newSnippetDescription} onChange={(e) => setNewSnippetDescription(e.target.value)}></textarea>
              </div>
              <div className="form-group">
                <label className="form-label">Game Demo URL</label>
                <input type="url" className="form-input" value={newSnippetGameUrl} onChange={(e) => setNewSnippetGameUrl(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Cover Image URL (Optional)</label>
                <input type="url" className="form-input" value={newSnippetImageUrl} onChange={(e) => setNewSnippetImageUrl(e.target.value)} />
              </div>
              <div style={{ textAlign: 'right', marginTop: '2rem' }}>
                <button type="button" className="btn" onClick={closeEditSnippetModal} style={{ marginRight: '1rem' }}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}