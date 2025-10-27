"use client";
import { useState, useEffect } from "react";
import { supabase } from '../utils/supabaseClient'; 
// Removed unused imports: ReactMarkdown, Link

export default function FileManagerPage() {
  // --- State ---
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Auth & Loading State
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- Storage Handler Functions ---
  const BUCKET_NAME = 'admin-assets';

  // 1. Fetch the list of files
  const fetchFiles = async () => {
    // This check is good, but the main fetch is now tied to userRole in useEffect
    if (userRole !== 'admin') return; 

    const { data, error } = await supabase.storage.from(BUCKET_NAME).list();

    if (error) {
      console.error('Error listing files:', error);
    } else if (data) {
      data.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
      setFiles(data);
    }
  };

  // 2. Handle the file upload
  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
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
    alert('File uploaded successfully! Public URL copied to clipboard.');
    
    if (permanentImageUrl) {
        navigator.clipboard.writeText(permanentImageUrl)
            .then(() => console.log('URL copied!'))
            .catch(err => console.error('Failed to copy URL:', err));
    }

    setSelectedFile(null);
    if (e.target && typeof e.target.reset === 'function') {
      e.target.reset();
    }
    fetchFiles(); 
  };

  // 3. Handle file deletion
  const handleDeleteFile = async (fileName) => {
    if (!window.confirm(`Are you sure you want to delete the file: ${fileName}?`)) return;
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([fileName]);

    if (error) {
      console.error('Error deleting file:', error);
      alert('File deletion failed.');
    } else {
      alert('File deleted successfully.');
      fetchFiles();
    }
  };

  // 4. Function to get a temporary signed URL (if bucket was private)
  // Since my bucket is now public, i use getPublicUrl. createSignedUrl is for private files.
  const copyPublicUrl = async (fileName) => {
    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName); // Gets the permanent public URL
    
    if (data && data.publicUrl) {
      navigator.clipboard.writeText(data.publicUrl);
      alert(`Public URL for ${fileName} copied to clipboard.`);
    } else {
      alert('Could not get public URL.');
    }
  };
  
  // --- DATA FETCHING (AUTH & FILES) ---
  useEffect(() => {
    setLoading(true);

    const checkAuthAndFetchFiles = async () => {
      // 1. Get Session
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // 2. Get Profile & Role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        const role = profile?.role || 'guest';
        setUserRole(role);

        // 3. Fetch files ONLY if admin
        if (role === 'admin') {
          const { data, error } = await supabase.storage.from(BUCKET_NAME).list();
          if (error) {
            console.error('Error listing files:', error);
          } else if (data) {
            data.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
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
    return <div>Loading file manager...</div>;
  }

  // Security Gate: Show access denied if not admin
  if (userRole !== 'admin') {
    return (
      <div id="file-manager-section" className="section">
        <div className="dashboard-header">
          <div className="dashboard-title">
            <h1>Access Denied</h1>
            <p className="dashboard-subtitle">You must be an administrator to view this page.</p>
          </div>
        </div>
      </div>
    );
  }

  // Admin-Only View
  return (
    <div id="file-manager-section" className="section">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>File Manager</h1>
          <p className="dashboard-subtitle">Securely manage and host your project assets.</p>
        </div>
      </div>

      {/* File Upload Form */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid var(--grey-dark)' }}>
        <h2>Upload New File</h2>
        <form onSubmit={handleFileUpload}>
          <div className="form-group">
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              required
              disabled={uploading}
              style={{ border: 'none', padding: '0' }}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={uploading || !selectedFile}>
            {uploading ? 'Uploading...' : 'Upload File'}
          </button>
        </form>
      </div>

      {/* File List */}
      <h2>Current Assets ({files.length})</h2>
      <div className="file-list" style={{ marginTop: '1rem' }}>
        {files.map((file) => (
          <div
            key={file.name}
            className="file-item"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem',
              borderBottom: '1px solid var(--grey-dark)'
            }}
          >
            <div style={{ flexGrow: 1 }}>
              <strong style={{ display: 'block' }}>{file.name}</strong>
              <small>Last Updated: {new Date(file.updated_at).toLocaleDateString()}</small>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="btn btn-secondary"
                onClick={() => copyPublicUrl(file.name)} 
                style={{ padding: '0.5rem 1rem' }}
              >
                Copy URL
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleDeleteFile(file.name)}
                style={{ padding: '0.5rem 1rem' }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {files.length === 0 && <p>No files found in the asset manager.</p>}
      </div>
    </div>
  );
}

