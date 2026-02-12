"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient'; 
import Link from 'next/link';
import Image from 'next/image';
import StoryEngine from '../../components/StoryEngine';
import demoData from '../../app/data/demo.json';
import MidnightEngine from '../../components/MidnightEngine';
import midnightData from '../../app/data/midnight.json';
import WalletConnect from '../../components/WalletConnect';

export default function SnippetsPage() {
  // --- State Variables ---
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isNewSnippetModalOpen, setIsNewSnippetModalOpen] = useState(false);
  const [isEditSnippetModalOpen, setIsEditSnippetModalOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState(null);

  // Game Player Modal State
  const [isGamePlayerOpen, setIsGamePlayerOpen] = useState(false);
  const [activeGameTitle, setActiveGameTitle] = useState('');

  // Wallet State
  const [walletAddress, setWalletAddress] = useState(null);

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

  // --- Effect to Lock Background Scroll When Game Player is Open ---
  useEffect(() => {
    if (isGamePlayerOpen) {
      // Lock background scroll
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
      document.body.style.touchAction = 'none'; // Prevent touch scrolling on mobile
    } else {
      // Unlock background scroll
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.body.style.touchAction = '';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.body.style.touchAction = '';
    };
  }, [isGamePlayerOpen]);

  // --- Handler Functions ---
  const openNewSnippetModal = () => {
    setIsNewSnippetModalOpen(true);
    setNewSnippetTitle('');
    setNewSnippetDescription('');
    setNewSnippetGameUrl('');
    setNewSnippetImageUrl('');
  };

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

  // Blockchain Mint Handler
  const handleMintTrigger = (itemName) => {
    if (!walletAddress) {
      alert("⚠️ HOLD UP! \n\nYou need to connect your wallet (top right) to save this item to the BNB Chain.");
      return;
    }
    alert(`✅ SIGNATURE REQUEST SENT\n\n👤 User: ${walletAddress}\n⚔️ Item: [${itemName}]\n🔗 Chain: BNB Testnet`);
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
        image_url: newSnippetImageUrl || null,
        author_id: session.user.id
      }])
      .select()
      .single();
      
    if (error) { 
      console.error('Error creating snippet:', error); 
      alert('Could not create the snippet.'); 
    } else { 
      setSnippets([data, ...snippets]); 
      closeNewSnippetModal(); 
    }
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
        image_url: newSnippetImageUrl || null
      })
      .eq('id', editingSnippet.id)
      .select()
      .single();
      
    if (error) { 
      console.error('Error updating snippet:', error); 
      alert('Could not update the snippet.'); 
    } else { 
      setSnippets(snippets.map(s => (s.id === editingSnippet.id ? data : s))); 
      closeEditSnippetModal(); 
    }
  };

  const handleDeleteSnippet = async (snippetId) => {
    if (!window.confirm("Are you sure you want to delete this snippet? This action cannot be undone.")) return;
    
    const { error } = await supabase.from('snippets').delete().eq('id', snippetId);
    if (error) { 
      console.error('Error deleting snippet:', error); 
      alert('Could not delete snippet.'); 
    } else { 
      setSnippets(snippets.filter(snippet => snippet.id !== snippetId)); 
    }
  };

  if (loading) {
    return (
      <div className="section">
        <div className="dashboard-header">
          <h1>Loading snippets...</h1>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Game Snippets Section */}
      <div id="snippets-section" className="section">
        <div className="dashboard-header">
          <div className="dashboard-title">
            <h1>🎮 Game Snippets</h1>
            <p className="dashboard-subtitle">
              Explore playable demos and interactive fiction samples
            </p>
          </div>
          <div className="action-buttons">
            {userRole === 'admin' && (
              <button className="btn btn-primary" onClick={openNewSnippetModal}>
                + Add Snippet
              </button>
            )}
          </div>
        </div>

        {snippets.length === 0 ? (
          <div className="empty-state-card">
            <div className="empty-state-icon">🎮</div>
            <h3>No game snippets yet</h3>
            <p>Check back soon for playable demos and samples!</p>
          </div>
        ) : (
          <div className="content-grid">
            {snippets.map((snippet) => (
              <div key={snippet.id} className="content-card snippet-card">
                {/* Cover Image */}
                {snippet.image_url && (
                  <div className="snippet-image-wrapper">
                    <Image
                      src={snippet.image_url}
                      alt={snippet.title}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="snippet-overlay">
                      <span className="play-icon">▶</span>
                    </div>
                  </div>
                )}
                
                {/* Content */}
                <div className="snippet-content">
                  <h2 className="content-title">{snippet.title}</h2>
                  <p className="content-meta">
                    Added {new Date(snippet.created_at).toLocaleDateString()}
                  </p>
                  <p className="snippet-description">
                    {snippet.description || 'No description provided.'}
                  </p>
                  
                  {/* Actions */}
                  <div className="snippet-actions">
                    <a 
                      href={snippet.game_url} 
                      target={snippet.game_url === '#local-demo' ? undefined : "_blank"}
                      rel="noopener noreferrer" 
                      className="btn btn-primary btn-play"
                      onClick={(e) => {
                        if (snippet.game_url === '#local-demo') {
                          e.preventDefault(); // Stop the browser from following the link
                          setActiveGameTitle(snippet.title);
                          setIsGamePlayerOpen(true);
                        }
                      }}
                    >
                      ▶ Play Now
                    </a>
                    
                    {userRole === 'admin' && (
                      <div className="admin-actions">
                        <button 
                          className="btn-icon" 
                          onClick={() => openEditSnippetModal(snippet)}
                          title="Edit snippet"
                        >
                          ✏️
                        </button>
                        <button 
                          className="btn-icon" 
                          onClick={() => handleDeleteSnippet(snippet.id)}
                          title="Delete snippet"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g., Chapter 1 Demo"
                  value={newSnippetTitle} 
                  onChange={(e) => setNewSnippetTitle(e.target.value)} 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-textarea" 
                  style={{ whiteSpace: 'pre-wrap', minHeight: '100px' }} 
                  placeholder="Brief description of what this demo includes..."
                  value={newSnippetDescription} 
                  onChange={(e) => setNewSnippetDescription(e.target.value)}
                ></textarea>
              </div>
              
              <div className="form-group">
                <label className="form-label">Game Demo URL *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="https://dashingdon.com/play/..." 
                  value={newSnippetGameUrl} 
                  onChange={(e) => setNewSnippetGameUrl(e.target.value)} 
                  required 
                />
                <small style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  Link to your hosted game demo
                </small>
              </div>
              
              <div className="form-group">
                <label className="form-label">Cover Image URL (Optional)</label>
                <input 
                  type="url" 
                  className="form-input" 
                  placeholder="Copy URL from File Manager..." 
                  value={newSnippetImageUrl} 
                  onChange={(e) => setNewSnippetImageUrl(e.target.value)} 
                />
              </div>
              
              <div style={{ textAlign: 'right', marginTop: '2rem' }}>
                <button 
                  type="button" 
                  className="btn" 
                  onClick={closeNewSnippetModal} 
                  style={{ marginRight: '1rem' }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Snippet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Snippet Modal */}
      {isEditSnippetModalOpen && editingSnippet && (
        <div id="edit-snippet-modal" className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Game Snippet</h2>
              <span className="modal-close" onClick={closeEditSnippetModal}>&times;</span>
            </div>
            <form onSubmit={handleUpdateSnippet}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={newSnippetTitle} 
                  onChange={(e) => setNewSnippetTitle(e.target.value)} 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-textarea" 
                  style={{ whiteSpace: 'pre-wrap', minHeight: '100px' }} 
                  value={newSnippetDescription} 
                  onChange={(e) => setNewSnippetDescription(e.target.value)}
                ></textarea>
              </div>
              
              <div className="form-group">
                <label className="form-label">Game Demo URL *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={newSnippetGameUrl} 
                  onChange={(e) => setNewSnippetGameUrl(e.target.value)} 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Cover Image URL (Optional)</label>
                <input 
                  type="url" 
                  className="form-input" 
                  value={newSnippetImageUrl} 
                  onChange={(e) => setNewSnippetImageUrl(e.target.value)} 
                />
              </div>
              
              <div style={{ textAlign: 'right', marginTop: '2rem' }}>
                <button 
                  type="button" 
                  className="btn" 
                  onClick={closeEditSnippetModal} 
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

      {/* --- NEW GAME PLAYER MODAL --- */}
      {isGamePlayerOpen && (
        <div className="game-modal-overlay"
              onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsGamePlayerOpen(false);
            }
          }}
          onTouchMove={(e) => e.stopPropagation()}
        >
            <div className="game-modal-window">
                
                {/* Header */}
                <div className="game-modal-header">
                    <h2 style={{color: 'var(--white)', margin: 0}}>{activeGameTitle}</h2>
                    
                    <div className="flex items-center gap-4">
                      {activeGameTitle !== 'The Midnight Suspect' && (
                          <WalletConnect onConnect={(addr) => setWalletAddress(addr)} />
                      )}
                      <button 
                          onClick={() => setIsGamePlayerOpen(false)}
                          className="game-close-btn"
                      >
                          &times;
                      </button>
                    </div>
                </div>

                {/* Game Engine Injection */}
                  {activeGameTitle === 'The Midnight Suspect' ? (
                      // LOAD THE NEW MIDNIGHT ENGINE
                      <MidnightEngine 
                          storyContent={midnightData} 
                      />
                  ) : (
                      // LOAD THE OLD KEEPER ENGINE
                      <StoryEngine 
                          storyContent={demoData} 
                          onMintTrigger={handleMintTrigger} 
                      />
                  )}
            </div>
        </div>
      )}
    </>
  );
}