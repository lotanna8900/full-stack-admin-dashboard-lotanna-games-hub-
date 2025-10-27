"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

// --- Constants  ---
const genreOptions = ['Fantasy', 'Science Fiction', 'Horror', 'Mystery', 'Romance', 'Historical', 'Thriller', 'Other'];
const settingOptions = ['Medieval', 'Urban Fantasy', 'Space Opera', 'Cyberpunk', 'Post-Apocalyptic', 'Modern', 'Historical Era', 'Other'];
const statusOptions = ['Active', 'Completed', 'Paused', 'Planning', 'Idea', 'Archived'];

export default function ProjectsPage() {
  // --- State Variables ---
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Scroll to project if URL has ?project=ID
  useEffect(() => {
    const projectId = searchParams.get('project');
    if (projectId && !loading) {
      const targetSelector = `[data-project-id="${projectId}"]`;
      const targetElement = document.querySelector(targetSelector);
      
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // 2. I think I should add highlight here
        targetElement.style.transition = 'background-color 0.5s ease';
        targetElement.style.backgroundColor = 'rgba(255, 255, 0, 0.2)';
        
        // 3. Remove highlight after 2 seconds
        setTimeout(() => {
          targetElement.style.backgroundColor = '';
        }, 2000);
      }
    }
  }, [projects, loading, searchParams]);

  // --- Data Fetching Effect ---
  useEffect(() => {
    setLoading(true);

    // 1. Helper to fetch user-specific data (role, subscriptions)
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

    // 2. Helper to fetch public project data
    const getProjects = async () => {
      const { data, error } = await supabase
        .from('projects').select('*').order('created_at', { ascending: false });

      if (error) console.error('Error fetching projects:', error);
      else setProjects(data || []);
      setLoading(false); // Stop loading after projects are fetched
    };

    // 3. Initial Fetch & Listener Setup
    getProjects(); // Fetch projects immediately

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      fetchUserData(currentSession);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      fetchUserData(currentSession);
    });

    return () => subscription?.unsubscribe();
  }, []); // Run only on mount

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
    const tagsArray = newProjectTags.split(',').map(tag => tag.trim()).filter(tag => tag);

    const { data, error } = await supabase
      .from('projects')
      .insert([{
        title: newProjectName, description: newProjectDescription, genre: newProjectGenre || null,
        setting: newProjectSetting || null, gender_choice: newProjectGenderChoice,
        non_binary_inclusive: newProjectNbInclusive, tags: tagsArray, status: newProjectStatus
      }])
      .select().single();

    if (error) { console.error('Error creating project:', error); alert('Could not create the project.'); }
    else if (data) { setProjects([data, ...projects]); closeNewProjectModal(); }
  };

  const handleUpdateProject = async (event) => {
    event.preventDefault();
    if (!editingProject) return;
    const projectId = editingProject.id;
    const tagsArray = newProjectTags.split(',').map(tag => tag.trim()).filter(tag => tag);
    const { data, error } = await supabase
      .from('projects')
      .update({
        title: newProjectName, description: newProjectDescription, genre: newProjectGenre || null,
        setting: newProjectSetting || null, gender_choice: newProjectGenderChoice,
        non_binary_inclusive: newProjectNbInclusive, tags: tagsArray, status: newProjectStatus
      })
      .eq('id', projectId)
      .select().single();

    if (error) { console.error('Error updating project:', error); alert('Could not update the project.'); }
    else if (data) { setProjects(projects.map(p => p.id === projectId ? data : p)); closeEditProjectModal(); }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) return;
    const { error } = await supabase.from('projects').delete().eq('id', projectId);
    if (error) { console.error('Error deleting project:', error); alert('Could not delete the project.'); }
    else { setProjects(projects.filter(p => p.id !== projectId)); }
  };

  const handlePinProject = async (projectId, currentStatus) => {
    const { data: updatedProject, error } = await supabase
      .from('projects').update({ is_pinned: !currentStatus }).eq('id', projectId)
      .select().single();
    if (error) { console.error('Error pinning project:', error); alert('Could not update the project.'); }
    else if (updatedProject) { setProjects(projects.map(p => (p.id === projectId ? updatedProject : p))); }
  };

  // --- Subscription Handlers ---
  const handleSubscribe = async (contentType, contentId) => {
    if (!session || contentType !== 'project') return;
    const insertData = { user_id: session.user.id, project_id: contentId };
    const { data, error } = await supabase.from('subscriptions').insert(insertData)
      .select('project_id').single();
    if (error) { console.error('Error subscribing:', error); alert('Failed to subscribe.'); }
    else if (data) { setSubscriptions([...subscriptions, data]); }
  };

  const handleUnsubscribe = async (contentType, contentId) => {
    if (!session || contentType !== 'project') return;
    const { error } = await supabase.from('subscriptions').delete()
      .eq('user_id', session.user.id).eq('project_id', contentId);
    if (error) { console.error('Error unsubscribing:', error); alert('Failed to unsubscribe.'); }
    else { setSubscriptions(subscriptions.filter(sub => sub.project_id !== contentId)); }
  };

  // --- Render Logic ---

  if (loading) {
    return (
      <div className="section">
        <div className="dashboard-header"><div className="dashboard-title"><h1>Loading Projects...</h1></div></div>
      </div>
    );
  }

  return (
    <>
      {/* Projects Section - Removed the redundant wrapper */}
      <div id="projects-section" className="section">
        <div className="dashboard-header">
          <div className="dashboard-title">
            <h1>My Projects</h1>
            <p className="dashboard-subtitle">Manage your interactive fiction projects</p>
          </div>
          <div className="action-buttons">
            {userRole === 'admin' && (
              <button className="btn btn-primary" onClick={openNewProjectModal}>New Project</button>
            )}
          </div>
        </div>

        <div className="content-grid">
          {projects
            .sort((a, b) => b.is_pinned - a.is_pinned)
            .map((project) => (
              <div key={project.id}
                className="content-card"
                data-project-id={project.id}
              >
                <div className="content-header">
                  <div>
                    <h2 className="content-title">{project.title}</h2>
                    <p className="content-meta">
                      {project.genre || 'Genre N/A'} {project.setting ? `• ${project.setting}` : ''}
                      {project.gender_choice ? ' • Gender Choice' : ''}
                      {project.non_binary_inclusive ? ' • NB Inclusive' : ''}
                    </p>
                  </div>
                  <span className="content-badge">{project.status || 'Status N/A'}</span>
                  {session && (
                    subscriptions.some(sub => sub.project_id === project.id) ? (
                      <button className="btn btn-secondary" onClick={() => handleUnsubscribe('project', project.id)}>Unsubscribe</button>
                    ) : (
                      <button className="btn" onClick={() => handleSubscribe('project', project.id)}>Subscribe</button>
                    )
                  )}
                  {userRole === 'admin' && (
                    <button className="btn-link" onClick={() => handlePinProject(project.id, project.is_pinned)}>
                      {project.is_pinned ? 'Unpin' : 'Pin 📌'}
                    </button>
                  )}
                </div>

                {project.is_pinned && <span className="pinned-badge">Pinned</span>}
                <p style={{ whiteSpace: 'pre-wrap' }}>{project.description}</p>

                {/* Buttons Div - I removed the empty duplicate div */}
                <div style={{ marginTop: '1.5rem' }}>
                  {userRole === 'admin' && (
                    <>
                      <button
                        className="btn"
                        onClick={() => openEditProjectModal(project)}
                        style={{ marginLeft: '1rem' }}
                      >
                        Edit Project
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDeleteProject(project.id)}
                        style={{ marginLeft: '1rem' }}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
        </div>
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
              {/* Form fields: Name, Description */}
              <div className="form-group">
                <label className="form-label">Project Name</label>
                <input type="text" className="form-input" placeholder="Enter project name" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" placeholder="Describe your project..." value={newProjectDescription} onChange={(e) => setNewProjectDescription(e.target.value)} style={{ whiteSpace: 'pre-wrap' }}></textarea>
              </div>
              {/* Form fields: Genre, Setting, Status */}
              <div className="form-group">
                <label className="form-label">Genre</label>
                <select className="form-select" value={newProjectGenre} onChange={(e) => setNewProjectGenre(e.target.value)}>
                  <option value="">-- Select Genre --</option>
                  {genreOptions.map(option => (<option key={option} value={option}>{option}</option>))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Setting</label>
                <select className="form-select" value={newProjectSetting} onChange={(e) => setNewProjectSetting(e.target.value)}>
                  <option value="">-- Select Setting --</option>
                  {settingOptions.map(option => (<option key={option} value={option}>{option}</option>))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={newProjectStatus} onChange={(e) => setNewProjectStatus(e.target.value)}>
                  {statusOptions.map(option => (<option key={option} value={option}>{option}</option>))}
                </select>
              </div>
              {/* Form fields: Checkboxes */}
              <div className="form-group" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>
                  <input type="checkbox" checked={newProjectGenderChoice} onChange={(e) => setNewProjectGenderChoice(e.target.checked)} /> Gender Choice?
                </label>
                <label className="form-label" style={{ marginBottom: 0 }}>
                  <input type="checkbox" checked={newProjectNbInclusive} onChange={(e) => setNewProjectNbInclusive(e.target.checked)} /> Non-Binary Inclusive?
                </label>
              </div>
              {/* Form fields: Tags */}
              <div className="form-group">
                <label className="form-label">Tags (comma-separated)</label>
                <input type="text" className="form-input" placeholder="e.g., Superpowers, Magic, Political" value={newProjectTags} onChange={(e) => setNewProjectTags(e.target.value)} />
              </div>
              {/* Form buttons */}
              <div style={{ textAlign: 'right', marginTop: '2rem' }}>
                <button type="button" className="btn" onClick={closeNewProjectModal} style={{ marginRight: '1rem' }}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Project</button>
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
              {/* Form fields: Name, Description */}
              <div className="form-group">
                <label className="form-label">Project Name</label>
                <input type="text" className="form-input" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" value={newProjectDescription} onChange={(e) => setNewProjectDescription(e.target.value)} style={{ whiteSpace: 'pre-wrap' }}></textarea>
              </div>
              {/* Form fields: Genre, Setting, Status */}
              <div className="form-group">
                <label className="form-label">Genre</label>
                <select className="form-select" value={newProjectGenre} onChange={(e) => setNewProjectGenre(e.target.value)}>
                  <option value="">-- Select Genre --</option>
                  {genreOptions.map(option => (<option key={option} value={option}>{option}</option>))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Setting</label>
                <select className="form-select" value={newProjectSetting} onChange={(e) => setNewProjectSetting(e.target.value)}>
                  <option value="">-- Select Setting --</option>
                  {settingOptions.map(option => (<option key={option} value={option}>{option}</option>))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={newProjectStatus} onChange={(e) => setNewProjectStatus(e.target.value)}>
                  {statusOptions.map(option => (<option key={option} value={option}>{option}</option>))}
                </select>
              </div>
              {/* Form fields: Checkboxes */}
              <div className="form-group" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>
                  <input type="checkbox" checked={newProjectGenderChoice} onChange={(e) => setNewProjectGenderChoice(e.target.checked)} /> Gender Choice?
                </label>
                <label className="form-label" style={{ marginBottom: 0 }}>
                  <input type="checkbox" checked={newProjectNbInclusive} onChange={(e) => setNewProjectNbInclusive(e.target.checked)} /> Non-Binary Inclusive?
                </label>
              </div>
              {/* Form fields: Tags */}
              <div className="form-group">
                <label className="form-label">Tags (comma-separated)</label>
                <input type="text" className="form-input" placeholder="e.g., Superpowers, Magic, Political" value={newProjectTags} onChange={(e) => setNewProjectTags(e.target.value)} />
              </div>
              {/* Form buttons */}
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


