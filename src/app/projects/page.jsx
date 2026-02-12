"use client";
import { useState, useEffect, Suspense } from 'react'; 
import { useSearchParams } from 'next/navigation'; 
import { supabase } from '../utils/supabaseClient'; 
import Link from 'next/link';

// --- Constants ---
const genreOptions = ['Fantasy', 'Science Fiction', 'Horror', 'Mystery', 'Romance', 'Historical', 'Thriller', 'Other'];
const settingOptions = ['Medieval', 'Urban Fantasy', 'Space Opera', 'Cyberpunk', 'Post-Apocalyptic', 'Modern', 'Historical Era', 'Other'];
const statusOptions = ['Active', 'Completed', 'Paused', 'Planning', 'Idea', 'Archived'];

// Status color mapping
const getStatusColor = (status) => {
  const colors = {
    'Active': '#22c55e',
    'Completed': '#3b82f6',
    'Paused': '#f59e0b',
    'Planning': '#8b5cf6',
    'Idea': '#ec4899',
    'Archived': '#6b7280'
  };
  return colors[status] || '#6b7280';
};

// --- Inner Component ---
function ProjectsPageContent() {
  // --- State Variables ---
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isNewProjectModalOpen, setNewProjectModalOpen] = useState(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  // Form State
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newProjectGenre, setNewProjectGenre] = useState('');
  const [newProjectSetting, setNewProjectSetting] = useState('');
  const [newProjectGenderChoice, setNewProjectGenderChoice] = useState(false);
  const [newProjectNbInclusive, setNewProjectNbInclusive] = useState(false);
  const [newProjectTags, setNewProjectTags] = useState('');
  const [newProjectStatus, setNewProjectStatus] = useState('Active');

  // Auth & User State
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);

  const searchParams = useSearchParams();

  // --- Data Fetching Effect ---
  useEffect(() => {
    setLoading(true);

    const fetchUserData = async (currentSession) => {
      if (!currentSession) {
        setUserRole('guest');
        setSubscriptions([]);
        return;
      }
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles').select('role').eq('id', currentSession.user.id).single();
      
      if (profileError) setUserRole('guest');
      else setUserRole(profile?.role || 'guest');

      const { data: subsData, error: subsError } = await supabase
        .from('subscriptions')
        .select('project_id')
        .eq('user_id', currentSession.user.id)
        .not('project_id', 'is', null);

      if (subsError) console.error("Error fetching project subscriptions:", subsError);
      else setSubscriptions(subsData || []);
    };

    const getProjects = async () => {
      const { data, error } = await supabase
        .from('projects').select('*').order('created_at', { ascending: false });

      if (error) console.error('Error fetching projects:', error);
      else setProjects(data || []);
      setLoading(false); 
    };

    getProjects(); 

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      fetchUserData(currentSession);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      fetchUserData(currentSession);
    });

    return () => subscription?.unsubscribe();
  }, []); 

  // --- Scrolling Effect ---
  useEffect(() => {
    const projectId = searchParams.get('project');
    if (projectId && !loading) {
      const targetSelector = `[data-project-id="${projectId}"]`;
      const targetElement = document.querySelector(targetSelector);
      
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetElement.style.transition = 'background-color 0.5s ease';
        targetElement.style.backgroundColor = 'rgba(255, 255, 0, 0.2)';
        setTimeout(() => { targetElement.style.backgroundColor = ''; }, 2000);
      }
    }
  }, [projects, loading, searchParams]); 

  // --- Modal Handlers ---
  const openNewProjectModal = () => setNewProjectModalOpen(true);
  const closeNewProjectModal = () => {
    setNewProjectModalOpen(false); 
    setNewProjectName(''); 
    setNewProjectDescription(''); 
    setNewProjectGenre('');
    setNewProjectSetting(''); 
    setNewProjectGenderChoice(false); 
    setNewProjectNbInclusive(false);
    setNewProjectTags(''); 
    setNewProjectStatus('Active');
  };
  
  const openEditProjectModal = (project) => {
    setEditingProject(project); 
    setNewProjectName(project.title); 
    setNewProjectDescription(project.description || '');
    setNewProjectGenre(project.genre || ''); 
    setNewProjectSetting(project.setting || '');
    setNewProjectGenderChoice(project.gender_choice); 
    setNewProjectNbInclusive(project.non_binary_inclusive);
    setNewProjectTags((project.tags || []).join(', ')); 
    setNewProjectStatus(project.status || 'Active');
    setIsEditProjectModalOpen(true);
  };
  
  const closeEditProjectModal = () => {
    setIsEditProjectModalOpen(false); 
    setEditingProject(null); 
    setNewProjectName('');
    setNewProjectDescription(''); 
    setNewProjectGenre(''); 
    setNewProjectSetting('');
    setNewProjectGenderChoice(false); 
    setNewProjectNbInclusive(false);
    setNewProjectTags(''); 
    setNewProjectStatus('Active');
  };

  // --- CRUD Handlers ---
  const handleCreateProject = async (event) => {
    event.preventDefault();
    if (!newProjectName.trim()) return alert('Project name cannot be empty.');
    if (!session) return alert('You must be logged in.'); 
    const tagsArray = newProjectTags.split(',').map(tag => tag.trim()).filter(tag => tag);

    const { data, error } = await supabase
      .from('projects')
      .insert([{
        title: newProjectName, 
        description: newProjectDescription, 
        genre: newProjectGenre || null,
        setting: newProjectSetting || null, 
        gender_choice: newProjectGenderChoice,
        non_binary_inclusive: newProjectNbInclusive, 
        tags: tagsArray, 
        status: newProjectStatus,
      }])
      .select().single();

    if (error) { 
      console.error('Error creating project:', error); 
      alert('Could not create the project.'); 
    } else if (data) { 
      setProjects([data, ...projects]); 
      closeNewProjectModal(); 
    }
  };

  const handleUpdateProject = async (event) => {
    event.preventDefault();
    if (!editingProject) return;
    const projectId = editingProject.id;
    const tagsArray = newProjectTags.split(',').map(tag => tag.trim()).filter(tag => tag);

    const { data, error } = await supabase
      .from('projects')
      .update({
        title: newProjectName, 
        description: newProjectDescription, 
        genre: newProjectGenre || null,
        setting: newProjectSetting || null, 
        gender_choice: newProjectGenderChoice,
        non_binary_inclusive: newProjectNbInclusive, 
        tags: tagsArray, 
        status: newProjectStatus
      })
      .eq('id', projectId)
      .select().single();

    if (error) { 
      console.error('Error updating project:', error); 
      alert('Could not update the project.'); 
    } else if (data) { 
      setProjects(projects.map(p => p.id === projectId ? data : p)); 
      closeEditProjectModal(); 
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) return;
    const { error } = await supabase.from('projects').delete().eq('id', projectId);
    if (error) { 
      console.error('Error deleting project:', error); 
      alert('Could not delete project.'); 
    } else { 
      setProjects(projects.filter(p => p.id !== projectId)); 
    }
  };

  const handlePinProject = async (projectId, currentStatus) => {
    const { data: updatedProject, error } = await supabase
      .from('projects').update({ is_pinned: !currentStatus }).eq('id', projectId)
      .select().single();
    if (error) { 
      console.error('Error pinning project:', error); 
      alert('Could not update project.'); 
    } else if (updatedProject) { 
      setProjects(projects.map(p => (p.id === projectId ? updatedProject : p))); 
    }
  };

  // --- Subscription Handlers ---
  const handleSubscribe = async (contentType, contentId) => {
    if (!session || contentType !== 'project') return;
    const insertData = { user_id: session.user.id, project_id: contentId };
    const { data, error } = await supabase.from('subscriptions').insert(insertData)
      .select('project_id').single();
    if (error) { 
      console.error('Error subscribing:', error); 
      alert('Failed to subscribe.'); 
    } else if (data) { 
      setSubscriptions([...subscriptions, data]); 
    }
  };

  const handleUnsubscribe = async (contentType, contentId) => {
    if (!session || contentType !== 'project') return;
    const { error } = await supabase.from('subscriptions').delete()
      .eq('user_id', session.user.id).eq('project_id', contentId);
    if (error) { 
      console.error('Error unsubscribing:', error); 
      alert('Failed to unsubscribe.'); 
    } else { 
      setSubscriptions(subscriptions.filter(sub => sub.project_id !== contentId)); 
    }
  };

  // --- Filter & Search Logic ---
  const filteredProjects = projects
    .filter(project => {
      // Filter by status
      if (filterStatus !== 'All' && project.status !== filterStatus) return false;
      
      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = project.title.toLowerCase().includes(query);
        const matchesDescription = project.description?.toLowerCase().includes(query);
        const matchesTags = project.tags?.some(tag => tag.toLowerCase().includes(query));
        const matchesGenre = project.genre?.toLowerCase().includes(query);
        
        return matchesTitle || matchesDescription || matchesTags || matchesGenre;
      }
      
      return true;
    })
    .sort((a, b) => b.is_pinned - a.is_pinned);

  // --- Render Logic ---
  if (loading) {
    return (
      <div className="section">
        <div className="dashboard-header">
          <div className="dashboard-title">
            <h1>Loading Projects...</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Projects Section */}
      <div id="projects-section" className="section">
        <div className="dashboard-header">
          <div className="dashboard-title">
            <h1>My Projects</h1>
            <p className="dashboard-subtitle">Manage your interactive fiction projects</p>
          </div>
          <div className="action-buttons">
            {userRole === 'admin' && (
              <button className="btn btn-primary" onClick={openNewProjectModal}>
                + New Project
              </button>
            )}
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="filter-bar" style={{ 
          display: 'flex', 
          gap: '1rem', 
          marginBottom: '2rem', 
          flexWrap: 'wrap', 
          alignItems: 'center' 
        }}>
          {/* Search Input */}
          <div style={{ flex: '1', minWidth: '250px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="🔍 Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div style={{ minWidth: '150px' }}>
            <select 
              className="form-select" 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Status</option>
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Results Count */}
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem', 
            color: 'var(--text-secondary)' 
          }}>
            <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No projects found</p>
            <p>
              {searchQuery || filterStatus !== 'All' 
                ? 'Try adjusting your filters or search query' 
                : 'Get started by creating your first project!'}
            </p>
          </div>
        ) : (
          <div className="content-grid">
            {filteredProjects.map((project) => (
              <div key={project.id}
                className="content-card project-card"
                data-project-id={project.id}
              >
                {/* Card Header */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start', 
                  marginBottom: '1rem' 
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <h2 className="content-title" style={{ margin: 0 }}>{project.title}</h2>
                      {project.is_pinned && <span className="pinned-badge">📌 Pinned</span>}
                    </div>
                    
                    {/* Status Badge */}
                    <span 
                      className="content-badge" 
                      style={{ 
                        backgroundColor: getStatusColor(project.status),
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}
                    >
                      {project.status || 'Status N/A'}
                    </span>
                  </div>

                  {/* Admin Pin Button */}
                  {userRole === 'admin' && (
                    <button 
                      className="btn-link" 
                      onClick={() => handlePinProject(project.id, project.is_pinned)}
                      title={project.is_pinned ? 'Unpin project' : 'Pin project'}
                    >
                      {project.is_pinned ? 'Unpin' : 'Pin 📌'}
                    </button>
                  )}
                </div>

                {/* Project Meta Info */}
                <div className="project-meta" style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '0.5rem', 
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)'
                }}>
                  {project.genre && (
                    <span style={{ 
                      background: 'var(--grey-light)', 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '4px' 
                    }}>
                      📚 {project.genre}
                    </span>
                  )}
                  {project.setting && (
                    <span style={{ 
                      background: 'var(--grey-light)', 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '4px' 
                    }}>
                      🌍 {project.setting}
                    </span>
                  )}
                  {project.gender_choice && (
                    <span style={{ 
                      background: 'var(--grey-light)', 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '4px' 
                    }}>
                      ⚧ Gender Choice
                    </span>
                  )}
                  {project.non_binary_inclusive && (
                    <span style={{ 
                      background: 'var(--grey-light)', 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '4px' 
                    }}>
                      🏳️‍🌈 NB Inclusive
                    </span>
                  )}
                </div>

                {/* Description */}
                <p style={{ 
                  whiteSpace: 'pre-wrap', 
                  marginBottom: '1rem',
                  lineHeight: '1.6' 
                }}>
                  {project.description || 'No description provided.'}
                </p>

                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '0.5rem', 
                    marginBottom: '1rem' 
                  }}>
                    {project.tags.map((tag, idx) => (
                      <span 
                        key={idx} 
                        style={{ 
                          background: 'var(--primary)', 
                          color: 'white', 
                          padding: '0.25rem 0.75rem', 
                          borderRadius: '12px', 
                          fontSize: '0.8rem' 
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ 
                  display: 'flex', 
                  gap: '0.75rem', 
                  flexWrap: 'wrap', 
                  marginTop: '1.5rem' 
                }}>
                  {/* Subscribe Button */}
                  {session && (
                    subscriptions.some(sub => sub.project_id === project.id) ? (
                      <button 
                        className="btn btn-secondary" 
                        onClick={() => handleUnsubscribe('project', project.id)}
                      >
                        ✓ Subscribed
                      </button>
                    ) : (
                      <button 
                        className="btn" 
                        onClick={() => handleSubscribe('project', project.id)}
                      >
                        Subscribe
                      </button>
                    )
                  )}

                  {/* Admin Buttons */}
                  {userRole === 'admin' && (
                    <>
                      <button
                        className="btn"
                        onClick={() => openEditProjectModal(project)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDeleteProject(project.id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Project Modal */}
      {isNewProjectModalOpen && (
        <div id="newproject-modal" className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Create New Project</h2>
              <span className="modal-close" onClick={closeNewProjectModal}>&times;</span>
            </div>
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label className="form-label">Project Name *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Enter project name" 
                  value={newProjectName} 
                  onChange={(e) => setNewProjectName(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-textarea" 
                  placeholder="Describe your project..." 
                  value={newProjectDescription} 
                  onChange={(e) => setNewProjectDescription(e.target.value)} 
                  style={{ whiteSpace: 'pre-wrap', minHeight: '120px' }}
                ></textarea>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Genre</label>
                  <select 
                    className="form-select" 
                    value={newProjectGenre} 
                    onChange={(e) => setNewProjectGenre(e.target.value)}
                  >
                    <option value="">-- Select Genre --</option>
                    {genreOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Setting</label>
                  <select 
                    className="form-select" 
                    value={newProjectSetting} 
                    onChange={(e) => setNewProjectSetting(e.target.value)}
                  >
                    <option value="">-- Select Setting --</option>
                    {settingOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select 
                  className="form-select" 
                  value={newProjectStatus} 
                  onChange={(e) => setNewProjectStatus(e.target.value)}
                >
                  {statusOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Tags (comma-separated)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g., Superpowers, Magic, Political" 
                  value={newProjectTags} 
                  onChange={(e) => setNewProjectTags(e.target.value)} 
                />
              </div>

              <div className="form-group" style={{ 
                display: 'flex', 
                gap: '2rem', 
                alignItems: 'center',
                padding: '1rem',
                background: 'var(--grey-light)',
                borderRadius: '8px'
              }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  cursor: 'pointer',
                  margin: 0 
                }}>
                  <input 
                    type="checkbox" 
                    checked={newProjectGenderChoice} 
                    onChange={(e) => setNewProjectGenderChoice(e.target.checked)}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span>Gender Choice</span>
                </label>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  cursor: 'pointer',
                  margin: 0 
                }}>
                  <input 
                    type="checkbox" 
                    checked={newProjectNbInclusive} 
                    onChange={(e) => setNewProjectNbInclusive(e.target.checked)}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span>Non-Binary Inclusive</span>
                </label>
              </div>

              <div style={{ textAlign: 'right', marginTop: '2rem' }}>
                <button 
                  type="button" 
                  className="btn" 
                  onClick={closeNewProjectModal} 
                  style={{ marginRight: '1rem' }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {isEditProjectModalOpen && editingProject && (
        <div id="edit-project-modal" className="modal active">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Project: {editingProject.title}</h2>
              <span className="modal-close" onClick={closeEditProjectModal}>&times;</span>
            </div>
            <form onSubmit={handleUpdateProject}>
              <div className="form-group">
                <label className="form-label">Project Name *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={newProjectName} 
                  onChange={(e) => setNewProjectName(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-textarea" 
                  value={newProjectDescription} 
                  onChange={(e) => setNewProjectDescription(e.target.value)} 
                  style={{ whiteSpace: 'pre-wrap', minHeight: '120px' }}
                ></textarea>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Genre</label>
                  <select 
                    className="form-select" 
                    value={newProjectGenre} 
                    onChange={(e) => setNewProjectGenre(e.target.value)}
                  >
                    <option value="">-- Select Genre --</option>
                    {genreOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Setting</label>
                  <select 
                    className="form-select" 
                    value={newProjectSetting} 
                    onChange={(e) => setNewProjectSetting(e.target.value)}
                  >
                    <option value="">-- Select Setting --</option>
                    {settingOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select 
                  className="form-select" 
                  value={newProjectStatus} 
                  onChange={(e) => setNewProjectStatus(e.target.value)}
                >
                  {statusOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ 
                display: 'flex', 
                gap: '2rem', 
                alignItems: 'center',
                padding: '1rem',
                background: 'var(--grey-light)',
                borderRadius: '8px'
              }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  cursor: 'pointer',
                  margin: 0 
                }}>
                  <input 
                    type="checkbox" 
                    checked={newProjectGenderChoice} 
                    onChange={(e) => setNewProjectGenderChoice(e.target.checked)}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span>Gender Choice</span>
                </label>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  cursor: 'pointer',
                  margin: 0 
                }}>
                  <input 
                    type="checkbox" checked={newProjectNbInclusive} onChange={(e) => setNewProjectNbInclusive(e.target.checked)} /> Non-Binary Inclusive?
                </label>
              </div>
              <div className="form-group">
                <label className="form-label">Tags (comma-separated)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g., Superpowers, Magic, Political" 
                  value={newProjectTags} 
                  onChange={(e) => setNewProjectTags(e.target.value)} 
                />
              </div>
              <div style={{ textAlign: 'right', marginTop: '2rem' }}>
                <button type="button" className="btn" onClick={closeEditProjectModal} style={{ marginRight: '1rem' }}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// --- Main Page Export (Handles Suspense)
export default function ProjectsPage() {
  return (
    <Suspense fallback={<div className="section"><div className="dashboard-header"><div className="dashboard-title"><h1>Loading Projects...</h1></div></div></div>}>
      <ProjectsPageContent />
    </Suspense>
  );
}


