"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient'; 
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown'; 

export default function BlogListPage() {
  // --- State Variables ---
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [isEditPostModalOpen, setIsEditPostModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  // Form State (for Modals)
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImageUrl, setNewPostImageUrl] = useState(''); // For image URL

  // Comment & Reply State
  const [newCommentContent, setNewCommentContent] = useState('');
  const [replyingToCommentId, setReplyingToCommentId] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentContent, setEditingCommentContent] = useState('');
  const [expandedReplies, setExpandedReplies] = useState([]); // For toggling replies

  // Auth, User & Subscription State
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);

  // --- Data Fetching Effect ---
  useEffect(() => {
    setLoading(true);

    // Helper to fetch user-specific data (role, subscriptions)
    const fetchUserData = async (currentSession) => {
      if (!currentSession) {
        setUserRole('guest');
        setSubscriptions([]);
        return;
      }
      // Fetch Profile Role
      const { data: profile, error: profileError } = await supabase
        .from('profiles').select('role').eq('id', currentSession.user.id).single();
      if (profileError) setUserRole('guest');
      else setUserRole(profile?.role || 'guest');

      // Fetch Post Subscriptions
      const { data: subsData, error: subsError } = await supabase
        .from('subscriptions').select('post_id')
        .eq('user_id', currentSession.user.id)
        .not('post_id', 'is', null);
      if (subsError) console.error("Error fetching post subscriptions:", subsError);
      else setSubscriptions(subsData || []);
    };

    // Helper to fetch posts and comments
    const getPosts = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*, comments(*, author:profiles(username))') // Fetch posts with comments and authors
        .order('created_at', { ascending: false });
      if (error) console.error('Error fetching posts:', error);
      else setPosts(data || []);
      setLoading(false);
    };

    // Initial Fetch & Listener
    getPosts();
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

  // Post Modal Handlers
  const openNewPostModal = () => setIsNewPostModalOpen(true);
  const closeNewPostModal = () => {
    setIsNewPostModalOpen(false);
    setNewPostTitle('');
    setNewPostContent('');
    setNewPostImageUrl('');
  };
  const openEditPostModal = (post) => {
    setEditingPost(post);
    setNewPostTitle(post.title);
    setNewPostContent(post.content);
    setNewPostImageUrl(post.image_url || '');
    setIsEditPostModalOpen(true);
  };
  const closeEditPostModal = () => {
    setIsEditPostModalOpen(false);
    setEditingPost(null);
    setNewPostTitle('');
    setNewPostContent('');
    setNewPostImageUrl('');
  };

  // Post CRUD Handlers
  const handleCreatePost = async (event) => {
    event.preventDefault();
    if (!session) return;
    const { data, error } = await supabase
      .from('posts')
      .insert([{ 
        title: newPostTitle, 
        content: newPostContent, 
        image_url: newPostImageUrl || null,
        author_id: session.user.id 
      }])
      .select('*, comments(*, author:profiles(username))') // Fetch full object
      .single();
    if (error) { console.error('Error creating post:', error); alert('Could not create post.'); }
    else { setPosts([data, ...posts]); closeNewPostModal(); }
  };

  const handleUpdatePost = async (event) => {
    event.preventDefault();
    if (!editingPost) return;
    const { data, error } = await supabase
      .from('posts')
      .update({ title: newPostTitle, content: newPostContent, image_url: newPostImageUrl || null })
      .eq('id', editingPost.id)
      .select('*, comments(*, author:profiles(username))')
      .single();
    if (error) { console.error('Error updating post:', error); alert('Could not update post.'); }
    else { setPosts(posts.map(p => (p.id === editingPost.id ? data : p))); closeEditPostModal(); }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure?")) return;
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (error) { console.error('Error deleting post:', error); alert('Could not delete post.'); }
    else { setPosts(posts.filter(p => p.id !== postId)); }
  };

  const handlePinPost = async (postId, currentStatus) => {
    const { data: updatedPost, error } = await supabase
      .from('posts').update({ is_pinned: !currentStatus }).eq('id', postId)
      .select('*, comments(*, author:profiles(username))').single();
    if (error) { console.error('Error pinning post:', error); alert('Could not update post.'); }
    else if (updatedPost) { setPosts(posts.map(p => (p.id === postId ? updatedPost : p))); }
  };

  // Comment Handlers
  const handleCreateComment = async (event, postId, parentId = null) => {
    event.preventDefault();

    if (!session) {
      alert('You must be logged in to comment.');
      return;
    }
    if (!newCommentContent.trim()) {
      return; // Don't submit empty comments
    }

    const { data, error } = await supabase
      .from('comments')
      .insert([{
        content: newCommentContent,
        post_id: postId,
        author_id: session.user.id,
        parent_id: parentId // This will be null for top-level comments, or an ID for replies
      }])
      .select('*, author:profiles(username)') // Fetch the profile with the new comment
      .single();

    if (error) {
      console.error('Error creating comment:', error);
      alert('Could not post comment.');
    } else if (data) {
      setPosts(posts.map(post =>
        post.id === postId
          ? { ...post, comments: [...post.comments, data].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)) }
          : post
      ));
      setNewCommentContent(''); // Reset the input field
      setReplyingToCommentId(null); // Close the reply box
    }
  };

  const handleUpdateComment = async (event, commentId) => {
    event.preventDefault();
    const { data, error } = await supabase
      .from('comments').update({ content: editingCommentContent }).eq('id', commentId)
      .select('*, author:profiles(username)').single();
    if (error) { console.error('Error updating comment:', error); alert('Could not update comment.'); }
    else {
      setPosts(posts.map(post => ({ ...post, comments: post.comments.map(c => (c.id === commentId ? data : c)) })));
      setEditingCommentId(null);
      setEditingCommentContent('');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure?")) return;
    const { error } = await supabase.from('comments').delete().eq('id', commentId);
    if (error) { console.error('Error deleting comment:', error); alert('Could not delete comment.'); }
    else { setPosts(posts.map(post => ({ ...post, comments: post.comments.filter(c => c.id !== commentId) }))); }
  };

  const handlePinComment = async (commentId, currentStatus) => {
    const { data: updatedComment, error } = await supabase
      .from('comments').update({ is_pinned: !currentStatus }).eq('id', commentId)
      .select('*, author:profiles(username)').single();
    if (error) { console.error('Error pinning comment:', error); alert('Could not update comment.'); }
    else if (updatedComment) {
      setPosts(posts.map(post => ({ ...post, comments: post.comments.map(c => c.id === commentId ? updatedComment : c) })));
    }
  };

  const toggleReplies = (commentId) => {
    setExpandedReplies(prev => prev.includes(commentId) ? prev.filter(id => id !== commentId) : [...prev, commentId]);
  };
  
  // Subscription Handlers
  const handleSubscribe = async (contentType, contentId) => {
    if (!session || contentType !== 'post') return;
    const { data, error } = await supabase.from('subscriptions').insert({ user_id: session.user.id, post_id: contentId })
      .select('post_id').single();
    if (error) { console.error('Error subscribing:', error); alert('Failed to subscribe.'); }
    else if (data) { setSubscriptions([...subscriptions, data]); }
  };

  const handleUnsubscribe = async (contentType, contentId) => {
    if (!session || contentType !== 'post') return;
    const { error } = await supabase.from('subscriptions').delete()
      .eq('user_id', session.user.id).eq('post_id', contentId);
    if (error) { console.error('Error unsubscribing:', error); alert('Failed to unsubscribe.'); }
    else { setSubscriptions(subscriptions.filter(sub => sub.post_id !== contentId)); }
  };
  
  if (loading) {
    return <div>Loading posts...</div>;
  }

  return (
    <>
    {/* Blog Section */}
    <div id="blog-section" className="section">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Blog Posts</h1>
          <p className="dashboard-subtitle">Share your thoughts and development insights</p>
        </div>
        <div className="action-buttons">
          {userRole === 'admin' && (
            <button className="btn btn-primary" onClick={openNewPostModal}>New Post</button>
          )}
        </div>
      </div>

      <div className="content-grid">
        {posts
          .sort((a, b) => b.is_pinned - a.is_pinned)
          .map((post) => (
            <div key={post.id} className="content-card" data-post-id={post.id}>
              {post.image_url && (
                <div style={{ position: 'relative', width: '100%', height: '200px', marginBottom: '1rem' }}>
                  <Image
                    src={post.image_url} alt={post.title} fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="content-title">{post.title}</h2>
                {userRole === 'admin' && (
                  <button className="btn-link" onClick={() => handlePinPost(post.id, post.is_pinned)}>
                    {post.is_pinned ? 'Unpin' : 'Pin 📌'}
                  </button>
                )}
              </div>
              {post.is_pinned && <span className="pinned-badge">Pinned</span>}
              <p className="content-meta">Published on {new Date(post.created_at).toISOString().split('T')[0]}</p>
              
              {/* Post Preview */}
              <p style={{ whiteSpace: 'pre-wrap' }}>{post.content.substring(0, 200)}...</p>

              {/* Action Buttons */}
              <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Link href={`/blog/${post.id}`} className="btn">Read More</Link>
                {session && (
                  subscriptions.some(sub => sub.post_id === post.id) ? (
                    <button className="btn btn-secondary" onClick={() => handleUnsubscribe('post', post.id)}>Unsubscribe</button>
                  ) : (
                    <button className="btn" onClick={() => handleSubscribe('post', post.id)}>Subscribe</button>
                  )
                )}
                {userRole === 'admin' && (
                  <>
                    <button className="btn" onClick={() => openEditPostModal(post)}>Edit</button>
                    <button className="btn btn-danger" onClick={() => handleDeletePost(post.id)}>Delete</button>
                  </>
                )}
              </div>

            {/* --- Comments Section --- */}
            <div className="comments-section" style={{ marginTop: '2rem', borderTop: '1px solid var(--grey-dark)', paddingTop: '1rem' }}>
              <h3 style={{ marginBottom: '1rem' }}>Comments ({post.comments.length})</h3>

              {/* Display existing comments */}
              <div className="comments-list">
                {post.comments
                  .sort((a, b) => b.is_pinned - a.is_pinned) // Pinned comments first
                  .filter(comment => !comment.parent_id)
                  .map((comment) => (
                    <div key={comment.id} 
                      className="comment-item" 
                      data-comment-id={comment.id} 
                      style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--grey-dark)' }}
                    >

                      {/* Conditionally render Edit Form or Comment Content */}
                      {editingCommentId === comment.id ? (
                        <form onSubmit={(e) => handleUpdateComment(e, comment.id)}>
                          <textarea
                            className="form-textarea"
                            value={editingCommentContent}
                            onChange={(e) => setEditingCommentContent(e.target.value)}
                          ></textarea>
                          <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
                            <button type="submit" className="btn btn-primary" style={{ padding: '0.25rem 0.5rem' }}>Save</button>
                            <button type="button" className="btn" onClick={() => setEditingCommentId(null)} style={{ padding: '0.25rem 0.5rem' }}>Cancel</button>
                          </div>
                        </form>
                      ) : (
                        <> {/* Comment View */}
                          {/* Pinned Badge */}
                          {comment.is_pinned && <span className="pinned-badge" style={{ float: 'right', fontSize: '0.8rem', fontWeight: 'bold' }}>📌 Pinned</span>}
                          {/* Comment Content */}
                          <p style={{ whiteSpace: 'pre-wrap' }}>{comment.content}</p>
                          <p className="content-meta" style={{ fontSize: '0.8rem' }}>
                            Comment by <strong>{comment.author ? comment.author.username : 'Anonymous'}</strong> on {new Date(comment.created_at).toISOString().split('T')[0]}
                          </p>

                          {/* Action Buttons */}
                          <div className="comment-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            {session && (<button className="btn-link" onClick={() => setReplyingToCommentId(comment.id)}>Reply</button>)}
                            
                            {/* User's own Edit/Delete buttons */}
                            {session && session.user.id === comment.author_id && (
                              <>
                                <button className="btn-link" onClick={() => { setEditingCommentId(comment.id); setEditingCommentContent(comment.content); }}>Edit</button>
                                <button className="btn-link" onClick={() => handleDeleteComment(comment.id)}>Delete</button>
                              </>
                            )}

                            {/* Admin Pin button */}
                            {userRole === 'admin' && (<button className="btn-link" onClick={() => handlePinComment(comment.id, comment.is_pinned)}>{comment.is_pinned ? 'Unpin' : 'Pin'}</button>)}

                            {/* View replies logic */}
                            {(() => {
                              const replies = post.comments.filter(reply => reply.parent_id === comment.id);
                              const isRepliesExpanded = expandedReplies.includes(comment.id);
                              
                              return replies.length > 0 && (
                                <button className="btn-link" onClick={() => toggleReplies(comment.id)}>
                                    {isRepliesExpanded ? 'Hide Replies' : `View ${replies.length} Replies`}
                                </button>
                              );
                            })()}
                          </div>
                        </>
                      )}

                      {/* Nested Replies */}
                      {expandedReplies.includes(comment.id) && (
                        <div className="replies" style={{ marginLeft: '2rem', marginTop: '1rem' }}>
                          {post.comments
                            .sort((a, b) => b.is_pinned - a.is_pinned) // Pinned replies first
                            .filter(reply => reply.parent_id === comment.id)
                            .map((reply) => (
                              <div key={reply.id} 
                                className="comment-item" 
                                data-comment-id={reply.id}
                                style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--grey-dark)' }}
                              >

                                {/* Conditionally render Edit Form or Reply Content */}
                                {editingCommentId === reply.id ? (
                                  <form onSubmit={(e) => handleUpdateComment(e, reply.id)}>
                                    <textarea
                                      className="form-textarea"
                                      value={editingCommentContent}
                                      onChange={(e) => setEditingCommentContent(e.target.value)}
                                    ></textarea>
                                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
                                      <button type="submit" className="btn btn-primary" style={{ padding: '0.25rem 0.5rem' }}>Save</button>
                                      <button type="button" className="btn" onClick={() => setEditingCommentId(null)} style={{ padding: '0.25rem 0.5rem' }}>Cancel</button>
                                    </div>
                                  </form>
                                ) : (
                                  <>
                                    {reply.is_pinned && <span className="pinned-badge" style={{ float: 'right', fontSize: '0.8rem', fontWeight: 'bold' }}>📌 Pinned</span>}
                                    <p style={{ whiteSpace: 'pre-wrap' }}>{reply.content}</p>
                                    <p className="content-meta" style={{ fontSize: '0.8rem' }}>
                                      Reply by <strong>{reply.author ? reply.author.username : 'Anonymous'}</strong> on {new Date(reply.created_at).toISOString().split('T')[0]}
                                    </p>
                                    
                                    <div className="comment-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                      {/* User's own Edit/Delete buttons for the reply */}
                                      {session && session.user.id === reply.author_id && (
                                        <>
                                          <button className="btn-link" onClick={() => { setEditingCommentId(reply.id); setEditingCommentContent(reply.content); }}>Edit</button>
                                          <button className="btn-link" onClick={() => handleDeleteComment(reply.id)}>Delete</button>
                                        </>
                                      )}

                                      {/* Admin Pin button for the reply */}
                                      {userRole === 'admin' && (<button className="btn-link" onClick={() => handlePinComment(reply.id, reply.is_pinned)}>{reply.is_pinned ? 'Unpin' : 'Pin'}</button>)}
                                    </div>
                                  </>
                                )}
                              </div>
                            ))}
                      </div>
                      )}

                      {/* Reply Form */}
                      {replyingToCommentId === comment.id && (
                        <form onSubmit={(e) => handleCreateComment(e, post.id, comment.id)} style={{ marginTop: '1rem', marginLeft: '2rem' }}>
                          <div className="form-group">
                            <textarea
                              className="form-textarea"
                              placeholder={`Replying to ${comment.author?.username || 'Anonymous'}...`}
                              value={newCommentContent}
                              onChange={(e) => setNewCommentContent(e.target.value)}
                              required
                            ></textarea>
                          </div>
                          <div style={{ display: 'flex', gap: '1rem' }}>
                            <button type="submit" className="btn btn-primary" style={{ width: 'auto', padding: '0.5rem 1rem' }}>
                              Post Reply
                            </button>
                            <button type="button" className="btn" onClick={() => setReplyingToCommentId(null)} style={{ width: 'auto', padding: '0.5rem 1rem' }}>
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  ))}
              </div>

              {/* Main Comment Form */}
              {session && (
                <form onSubmit={(e) => handleCreateComment(e, post.id, null)} style={{ marginTop: '1.5rem' }}>
                  <div className="form-group">
                    <textarea
                      className="form-textarea"
                      placeholder="Add a comment..."
                      value={newCommentContent}
                      onChange={(e) => setNewCommentContent(e.target.value)}
                      required
                    ></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: 'auto', padding: '0.5rem 1rem' }}>
                    Post Comment
                  </button>
                </form>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* New Post Modal */}
    {isNewPostModalOpen && (
    <div id="newpost-modal" className="modal active">
        <div className="modal-content">
            <div className="modal-header">
                <h2>Create New Blog Post</h2>
                <span className="modal-close" onClick={closeNewPostModal}>&times;</span>
            </div>
            <form onSubmit={handleCreatePost}>
              <div className="form-group">
                <label className="form-label">Post Title</label>
                {/* UPDATED: Connect state to the input */}
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Enter post title" 
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Content</label>
                {/* Connect state to the textarea */}
                <textarea 
                  className="form-textarea" 
                  style={{ minHeight: '300px' }} 
                  placeholder="Write your blog post content here..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                ></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">Header Image URL (Optional)</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="Copy URL from File Manager..."
                  value={newPostImageUrl}
                  onChange={(e) => setNewPostImageUrl(e.target.value)}
                />
              </div>

              <div style={{ textAlign: 'right', marginTop: '2rem' }}>
                <button type="button" className="btn" onClick={closeNewPostModal} style={{ marginRight: '1rem' }}>Cancel</button>
                <button type="submit" className="btn btn-primary">Publish Post</button>
              </div>
            </form>
        </div>
    </div>
    )}


    {/* Edit Post Modal */}
    {isEditPostModalOpen && (
      <div id="edit-post-modal" className="modal active">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Edit Blog Post</h2>
            <span className="modal-close" onClick={closeEditPostModal}>&times;</span>
          </div>
          <form onSubmit={handleUpdatePost}>
            <div className="form-group">
              <label className="form-label">Post Title</label>
              <input type="text" className="form-input" value={newPostTitle} onChange={(e) => setNewPostTitle(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Content</label>
              <textarea className="form-textarea" style={{ minHeight: '300px' }} value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)}></textarea>
            </div>

            <div className="form-group">
              <label className="form-label">Header Image URL (Optional)</label>
              <input
                type="url"
                className="form-input"
                placeholder="Copy URL from File Manager..."
                value={newPostImageUrl}
                onChange={(e) => setNewPostImageUrl(e.target.value)}
              />
            </div>

            <div style={{ textAlign: 'right', marginTop: '2rem' }}>
              <button type="button" className="btn" onClick={closeEditPostModal} style={{ marginRight: '1rem' }}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    )}
    </>
  );
}