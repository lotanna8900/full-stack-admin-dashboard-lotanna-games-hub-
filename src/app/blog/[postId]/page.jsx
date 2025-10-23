// src/app/blog/[postId]/page.jsx
"use client";
import { useState, useEffect, use } from 'react';
import { supabase } from '../../utils/supabaseClient'; // Adjust path if needed
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';

export default function BlogPostPage({ params: paramsProp }) {
  const params = use(paramsProp);
  const { postId } = params;
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // STATE VARIABLES (Copied/Adapted from dashboard)
  const [session, setSession] = useState(null); // Need session for auth checks
  const [userRole, setUserRole] = useState(null); // Need role for admin checks
  const [profile, setProfile] = useState(null); // Need profile for username etc.

  // Comment/Reply form state
  const [newCommentContent, setNewCommentContent] = useState('');
  const [replyingToCommentId, setReplyingToCommentId] = useState(null);

  // Edit comment state
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentContent, setEditingCommentContent] = useState('');

  // View Replies state
  const [expandedReplies, setExpandedReplies] = useState([]); 

  // UseEffect for Session and Profile ---
  useEffect(() => {
    // Fetch initial session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      fetchProfile(currentSession); // Fetch profile based on initial session
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      fetchProfile(currentSession); // Fetch profile on auth change
    });

    // Helper to fetch profile
    const fetchProfile = async (currentSession) => {
      if (currentSession) {
        const { data, error } = await supabase
          .from('profiles')
          .select('role, username') // Only fetch role and username needed here
          .eq('id', currentSession.user.id)
          .single();
        if (!error && data) {
          setProfile(data);
          setUserRole(data.role);
        } else {
          setProfile(null);
          setUserRole('guest'); // Or 'user' if preferred default
          if (error) console.error("Error fetching profile on detail page:", error);
        }
      } else {
        setProfile(null);
        setUserRole('guest');
      }
    };

    // Cleanup listener
    return () => subscription?.unsubscribe();
  }, []);
  // --- END SESSION useEffect ---

  useEffect(() => {
    if (!postId) return; // Don't fetch if ID isn't available yet

    const fetchPostAndIncrementView = async () => {
      setLoading(true);
      setError(null);

      try {
        // --- Increment View Count ---
        const { error: rpcError } = await supabase.rpc('increment_view_count', {
          item_id: postId,
          item_type: 'post'
        });

        if (rpcError) {
          // Log the error but don't stop loading the post
          console.error('Error incrementing view count:', rpcError);
        }

        // --- Fetch Post Data with Comments and Author Profiles ---
        const { data: postData, error: postError } = await supabase
          .from('posts')
          .select('*, comments(*, author:profiles(username))')
          .eq('id', postId)
          .single(); // Expect exactly one post

        if (postError) {
          throw postError; // Throw error if post not found or query fails
        }

        if (postData) {
          setPost(postData);
          // Sort comments by date (newest first for display)
          setComments(postData.comments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) || []);
        } else {
          setError('Post not found.');
        }

      } catch (err) {
        console.error("Error fetching post:", err);
        setError(err.message || 'Failed to load post.');
      } finally {
        setLoading(false);
      }
    };

    fetchPostAndIncrementView();

  }, [postId]); // Re-run effect if postId changes

  // --- Display Logic ---
  if (loading) {
    return <div>Loading post...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!post) {
    return <div>Post not found.</div>;
  }






    // Handle creating a comment
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
          parent_id: parentId // Null for top-level comments, or an ID for replies
        }])
        .select('*, author:profiles(username)') // Fetch the profile with the new comment
        .single();

      if (error) {
        console.error('Error creating comment:', error);
        alert('Could not post comment.');
      } else if (data) {
        setComments(prevComments => 
          [...prevComments, data].sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        );
        setNewCommentContent(''); 
        setReplyingToCommentId(null);
      }
    };


    // Update Comment
    const handleUpdateComment = async (event, commentId) => {
      event.preventDefault();
      
      const { data, error } = await supabase
        .from('comments')
        .update({ content: editingCommentContent })
        .eq('id', commentId)
        .select('*, author:profiles(username)')
        .single();

      if (error) {
        console.error('Error updating comment:', error);
        alert('Could not update comment.');
      } else {
        // Update the specific comment in the local state
        setComments(prevComments => 
          prevComments.map(c => (c.id === commentId ? data : c))
        );
        setEditingCommentId(null);
        setEditingCommentContent('');
      }
    };


    // Delete Comment
    const handleDeleteComment = async (commentId) => {
      if (!window.confirm("Are you sure you want to delete your comment?")) return;

      const { error } = await supabase.from('comments').delete().eq('id', commentId);

      if (error) {
        console.error('Error deleting comment:', error);
        alert('Could not delete comment.');
      } else {
        // Remove the comment from the local state
        setComments(prevComments => prevComments.filter(c => c.id !== commentId));
      }
    };


    // Pin/Unpin Handler for Comments 
    const handlePinComment = async (commentId, currentStatus) => {
      // 1. Send the update request to Supabase
      const { data: updatedComment, error } = await supabase
        .from('comments')
        .update({ is_pinned: !currentStatus })
        .eq('id', commentId)
        .select('*, author:profiles(username)') // Fetch updated comment with author
        .single();

      if (error) {
        console.error('Error pinning comment:', error);
        alert('Could not update the comment.');
      } else if (updatedComment) {
        // 2. Update the local 'comments' state directly
        setComments(prevComments =>
          prevComments.map(comment =>
            comment.id === commentId ? updatedComment : comment
          )
        );
      }
    };

    // toggle function for replies 
    const toggleReplies = (commentId) => {
      setExpandedReplies(prev => 
        prev.includes(commentId) 
          ? prev.filter(id => id !== commentId) 
          : [...prev, commentId]
      );
    };






  // --- Render the Page ---
  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '1rem' }}>
      {/* Back Link */}
      <Link href="/" style={{ marginBottom: '1rem', display: 'inline-block' }}>
        &larr; Back to Dashboard
      </Link>

      {/* Post Content */}
      <h1>{post.title}</h1>
      <p>Published on: {new Date(post.created_at).toLocaleDateString()}</p>
      {/* Display image if URL exists */}
      {post.image_url && (
        <img src={post.image_url} alt={post.title} style={{ width: '100%', maxHeight: '400px', objectFit: 'cover', margin: '2rem 0' }} />
      )}
      <div style={{ marginTop: '2rem', whiteSpace: 'pre-wrap' }}>
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>

      {/* Comments Section */}
      <div style={{ marginTop: '3rem', borderTop: '1px solid #ccc', paddingTop: '2rem' }}>
        <h2>Comments ({comments.length})</h2>

        {/* Main Comment Form */}
        {session && (
          <form onSubmit={(e) => handleCreateComment(e, post.id, null)} style={{ marginBottom: '2rem' }}>
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

        {/* Display Comments */}
        {comments
          .filter(comment => !comment.parent_id) // Top-level comments first
          .sort((a, b) => b.is_pinned - a.is_pinned || new Date(a.created_at) - new Date(b.created_at)) // Pinned first, then oldest
          .map(comment => {
            const replies = comments.filter(reply => reply.parent_id === comment.id)
                                    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at)); // Sort replies oldest first
            const isRepliesExpanded = expandedReplies.includes(comment.id);

            return (
              <div key={comment.id} data-comment-id={comment.id} className="comment-item" style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #eee' }}>
                
                {/* Edit Form or Comment Content */}
                {editingCommentId === comment.id ? (
                  <form onSubmit={(e) => handleUpdateComment(e, comment.id)}> {/* Edit Form */}
                      <textarea className="form-textarea" value={editingCommentContent} onChange={(e) => setEditingCommentContent(e.target.value)}></textarea>
                      <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
                          <button type="submit" className="btn btn-primary" style={{ padding: '0.25rem 0.5rem' }}>Save</button>
                          <button type="button" className="btn" onClick={() => setEditingCommentId(null)} style={{ padding: '0.25rem 0.5rem' }}>Cancel</button>
                      </div>
                  </form>
                ) : (
                  <> {/* Comment View */}
                    {comment.is_pinned && <span style={{ float: 'right', fontSize: '0.8rem', fontWeight: 'bold' }}>📌 Pinned</span>}
                    <p style={{ whiteSpace: 'pre-wrap' }}>{comment.content}</p>
                    <small>By: <strong>{comment.author ? comment.author.username : 'Anonymous'}</strong> on {new Date(comment.created_at).toLocaleDateString()}</small>
                    
                    <div className="comment-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem' }}>
                      {session && (<button className="btn-link" onClick={() => setReplyingToCommentId(comment.id)}>Reply</button>)}
                      {session && session.user.id === comment.author_id && (
                        <>
                          <button className="btn-link" onClick={() => { setEditingCommentId(comment.id); setEditingCommentContent(comment.content); }}>Edit</button>
                          <button className="btn-link" onClick={() => handleDeleteComment(comment.id)}>Delete</button>
                        </>
                      )}
                      {userRole === 'admin' && (<button className="btn-link" onClick={() => handlePinComment(comment.id, comment.is_pinned)}>{comment.is_pinned ? 'Unpin' : 'Pin'}</button>)}
                      
                      {/* View Replies Button */}
                      {replies.length > 0 && (
                        <button className="btn-link" onClick={() => toggleReplies(comment.id)}>
                            {isRepliesExpanded ? 'Hide Replies' : `View ${replies.length} Replies`}
                        </button>
                      )}
                    </div>
                  </>
                )}

                {/* Reply Form */}
                {replyingToCommentId === comment.id && (
                  <form onSubmit={(e) => handleCreateComment(e, post.id, comment.id)} style={{ marginTop: '1rem', marginLeft: '2rem' }}> {/* Reply Form */}
                      <div className="form-group">
                          <textarea className="form-textarea" placeholder={`Replying to ${comment.author?.username || 'Anonymous'}...`} value={newCommentContent} onChange={(e) => setNewCommentContent(e.target.value)} required></textarea>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                          <button type="submit" className="btn btn-primary" style={{ width: 'auto', padding: '0.5rem 1rem' }}>Post Reply</button>
                          <button type="button" className="btn" onClick={() => setReplyingToCommentId(null)} style={{ width: 'auto', padding: '0.5rem 1rem' }}>Cancel</button>
                      </div>
                  </form>
                )}
                
                {/* Nested Replies (Conditionally Rendered) */}
                {isRepliesExpanded && (
                  <div className="replies" style={{ marginLeft: '2rem', marginTop: '1rem', borderLeft: '2px solid var(--grey-light)', paddingLeft: '1rem' }}>
                    {replies.map(reply => (
                      <div key={reply.id} data-comment-id={reply.id} className="comment-item" style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #eee' }}>
                        {/* Edit Form or Reply Content (Same logic as parent comment) */}
                        {editingCommentId === reply.id ? (
                            <form onSubmit={(e) => handleUpdateComment(e, reply.id)}> {/* Edit Form for Reply */}
                                <textarea className="form-textarea" value={editingCommentContent} onChange={(e) => setEditingCommentContent(e.target.value)}></textarea>
                                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
                                    <button type="submit" className="btn btn-primary" style={{ padding: '0.25rem 0.5rem' }}>Save</button>
                                    <button type="button" className="btn" onClick={() => setEditingCommentId(null)} style={{ padding: '0.25rem 0.5rem' }}>Cancel</button>
                                </div>
                            </form>
                        ) : (
                          <> {/* Reply View */}
                            {reply.is_pinned && <span style={{ float: 'right', fontSize: '0.8rem', fontWeight: 'bold' }}>📌 Pinned</span>}
                            <p style={{ whiteSpace: 'pre-wrap' }}>{reply.content}</p>
                            <small>By: <strong>{reply.author ? reply.author.username : 'Anonymous'}</strong> on {new Date(reply.created_at).toLocaleDateString()}</small>
                            
                            <div className="comment-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem' }}>
                                {/* No "Reply" button for nested replies */}
                                {session && session.user.id === reply.author_id && (
                                  <>
                                      <button className="btn-link" onClick={() => { setEditingCommentId(reply.id); setEditingCommentContent(reply.content); }}>Edit</button>
                                      <button className="btn-link" onClick={() => handleDeleteComment(reply.id)}>Delete</button>
                                  </>
                                )}
                                {userRole === 'admin' && (<button className="btn-link" onClick={() => handlePinComment(reply.id, reply.is_pinned)}>{reply.is_pinned ? 'Unpin' : 'Pin'}</button>)}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        {comments.length === 0 && <p>No comments yet.</p>}
      </div>
    </div>
  );
}