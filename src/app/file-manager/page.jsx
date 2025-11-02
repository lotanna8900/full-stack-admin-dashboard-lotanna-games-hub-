"use client";
import { useState, useEffect } from "react";
import { supabase } from '../utils/supabaseClient'; 
import Image from 'next/image';

export default function FileManagerPage() {
  // --- State ---
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date'); // date, name, size
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  // Auth & Loading State
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- Storage Handler Functions ---
  const BUCKET_NAME = 'admin-assets';

  // Get file size in readable format
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Check if file is an image
  const isImageFile = (filename) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  };

  // Get file icon based on extension
  const getFileIcon = (filename) => {
    if (isImageFile(filename)) return '🖼️';
    if (filename.endsWith('.pdf')) return '📄';
    if (filename.endsWith('.zip') || filename.endsWith('.rar')) return '📦';
    if (filename.endsWith('.mp4') || filename.endsWith('.mov')) return '🎥';
    return '📎';
  };

  // 1. Fetch the list of files
  const fetchFiles = async () => {
    if (userRole !== 'admin') return; 

    const { data, error } = await supabase.storage.from(BUCKET_NAME).list();

    if (error) {
      console.error('Error listing files:', error);
    } else if (data) {
      setFiles(data);
    }
  };

  // 2. Handle the file upload
  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    
    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    
    const file = selectedFile;
    const filePath = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      alert('File upload failed. Check the console for details.');
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    const permanentImageUrl = publicUrlData.publicUrl;
    setUploading(false);
    
    if (permanentImageUrl) {
      navigator.clipboard.writeText(permanentImageUrl)
        .then(() => alert(`✓ File uploaded successfully!\n\nPublic URL copied to clipboard:\n${permanentImageUrl}`))
        .catch(err => {
          console.error('Failed to copy URL:', err);
          alert(`File uploaded successfully!\n\nURL: ${permanentImageUrl}`);
        });
    }

    setSelectedFile(null);
    if (e.target && typeof e.target.reset === 'function') {
      e.target.reset();
    }
    fetchFiles(); 
  };

  // 3. Handle file deletion
  const handleDeleteFile = async (fileName) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"? This action cannot be undone.`)) return;
    
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([fileName]);

    if (error) {
      console.error('Error deleting file:', error);
      alert('File deletion failed.');
    } else {
      alert('✓ File deleted successfully.');
      fetchFiles();
    }
  };

  // 4. Copy public URL
  const copyPublicUrl = async (fileName) => {
    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);
    
    if (data && data.publicUrl) {
      navigator.clipboard.writeText(data.publicUrl);
      alert(`✓ URL copied to clipboard:\n${data.publicUrl}`);
    } else {
      alert('Could not get public URL.');
    }
  };

  // Filter and sort files
  const getFilteredAndSortedFiles = () => {
    let filtered = files.filter(file => 
      file.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'size':
        filtered.sort((a, b) => (b.metadata?.size || 0) - (a.metadata?.size || 0));
        break;
      case 'date':
      default:
        filtered.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        break;
    }

    return filtered;
  };
  
  // --- DATA FETCHING (AUTH & FILES) ---
  useEffect(() => {
    setLoading(true);

    const checkAuthAndFetchFiles = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        const role = profile?.role || 'guest';
        setUserRole(role);

        if (role === 'admin') {
          const { data, error } = await supabase.storage.from(BUCKET_NAME).list();
          if (error) {
            console.error('Error listing files:', error);
          } else if (data) {
            setFiles(data);
          }
        }
      } else {
        setUserRole('guest');
      }
      setLoading(false);
    };

    checkAuthAndFetchFiles();
  }, []); 

  // --- RENDER LOGIC ---
  if (loading) {
    return (
      <div className="section">
        <div className="dashboard-header">
          <h1>Loading file manager...</h1>
        </div>
      </div>
    );
  }

  if (userRole !== 'admin') {
    return (
      <div id="file-manager-section" className="section">
        <div className="dashboard-header">
          <div className="dashboard-title">
            <h1>🔒 Access Denied</h1>
            <p className="dashboard-subtitle">You must be an administrator to view this page.</p>
          </div>
        </div>
      </div>
    );
  }

  const displayFiles = getFilteredAndSortedFiles();
  const totalSize = files.reduce((acc, file) => acc + (file.metadata?.size || 0), 0);

  return (
    <div id="file-manager-section" className="section">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>📁 File Manager</h1>
          <p className="dashboard-subtitle">
            Securely manage and host your project assets · {files.length} files · {formatFileSize(totalSize)} total
          </p>
        </div>
      </div>

      {/* File Upload Card */}
      <div className="content-card file-upload-card" style={{ marginBottom: '2rem' }}>
        <h2 className="content-title">Upload New File</h2>
        <form onSubmit={handleFileUpload}>
          <div className="file-upload-zone">
            <input
              type="file"
              id="file-input"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              required
              disabled={uploading}
              className="file-input-hidden"
            />
            <label htmlFor="file-input" className="file-upload-label">
              {selectedFile ? (
                <>
                  <span className="file-icon">{getFileIcon(selectedFile.name)}</span>
                  <span className="file-name">{selectedFile.name}</span>
                  <span className="file-size">{formatFileSize(selectedFile.size)}</span>
                </>
              ) : (
                <>
                  <span className="upload-icon">📤</span>
                  <span>Click to browse or drag and drop</span>
                  <small>Maximum file size: 10MB</small>
                </>
              )}
            </label>
          </div>
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={uploading || !selectedFile}
            style={{ marginTop: '1rem' }}
          >
            {uploading ? '⏳ Uploading...' : '📤 Upload File'}
          </button>
        </form>
      </div>

      {/* Controls Bar */}
      <div className="file-controls" style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '1.5rem', 
        flexWrap: 'wrap',
        alignItems: 'center',
        background: 'var(--grey-dark)',
        padding: '1rem',
        borderRadius: '8px'
      }}>
        {/* Search */}
        <input
          type="text"
          className="form-input"
          placeholder="🔍 Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: '1', minWidth: '200px' }}
        />

        {/* Sort */}
        <select 
          className="form-select" 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          style={{ minWidth: '150px' }}
        >
          <option value="date">Sort by Date</option>
          <option value="name">Sort by Name</option>
          <option value="size">Sort by Size</option>
        </select>

        {/* View Mode */}
        <div className="btn-group">
          <button 
            className={`btn-group-item ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            ⊞ Grid
          </button>
          <button 
            className={`btn-group-item ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            ☰ List
          </button>
        </div>
      </div>

      {/* File List/Grid */}
      {displayFiles.length === 0 ? (
        <div className="empty-state-card">
          <div className="empty-state-icon">📂</div>
          <h3>{searchQuery ? 'No files found' : 'No files yet'}</h3>
          <p>{searchQuery ? 'Try a different search term' : 'Upload your first file to get started'}</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="file-grid">
          {displayFiles.map((file) => (
            <div key={file.name} className="file-grid-item">
              {isImageFile(file.name) ? (
                <div className="file-preview">
                  <Image
                    src={supabase.storage.from(BUCKET_NAME).getPublicUrl(file.name).data.publicUrl}
                    alt={file.name}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              ) : (
                <div className="file-preview file-preview-icon">
                  <span>{getFileIcon(file.name)}</span>
                </div>
              )}
              
              <div className="file-info">
                <div className="file-name" title={file.name}>
                  {file.name.length > 30 ? file.name.substring(0, 30) + '...' : file.name}
                </div>
                <div className="file-meta">
                  {formatFileSize(file.metadata?.size || 0)}
                </div>
              </div>

              <div className="file-actions">
                <button
                  className="btn-icon"
                  onClick={() => copyPublicUrl(file.name)}
                  title="Copy URL"
                >
                  📋
                </button>
                <button
                  className="btn-icon btn-icon-danger"
                  onClick={() => handleDeleteFile(file.name)}
                  title="Delete"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="file-list">
          {displayFiles.map((file) => (
            <div key={file.name} className="file-list-item">
              <div className="file-list-icon">{getFileIcon(file.name)}</div>
              <div className="file-list-info">
                <div className="file-name">{file.name}</div>
                <div className="file-meta">
                  {formatFileSize(file.metadata?.size || 0)} · Last updated: {new Date(file.updated_at).toLocaleDateString()}
                </div>
              </div>
              <div className="file-list-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => copyPublicUrl(file.name)}
                >
                  📋 Copy URL
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDeleteFile(file.name)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

