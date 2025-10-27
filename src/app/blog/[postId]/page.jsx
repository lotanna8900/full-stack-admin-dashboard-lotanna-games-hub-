"use client";
import { useState, useEffect, use } from 'react';
import { supabase } from '../../utils/supabaseClient'; 
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

export default function BlogPostPage({ params: paramsProp }) {
  // --- STATE VARIABLES ---
  const params = use(paramsProp);
  const { postId } = params;
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Auth state
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [profile, setProfile] = useState(null);

  // Form state
  const [newCommentContent, setNewCommentContent] = useState('');
  const [replyingToCommentId, setReplyingToCommentId] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentContent, setEditingCommentContent] = useState('');

  // UI state
  const [expandedReplies, setExpandedReplies] = useState([]);

  // Scroll to specific comment if 'reply' param is present
  const searchParams = useSearchParams();
  
    useEffect(() => {
      const replyId = searchParams.get('reply');
      if (replyId && !loading) {
        const targetSelector = `[data-comment-id="${replyId}"]`;
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
    }, [comments, loading, searchParams]);

  // -- DATA FETCHING (SESSION & PROFILE) ---
  useEffect(() => {
    // Helper to fetch profile
    const fetchProfile = async (currentSession) => {
      if (currentSession) {
        const { data, error } = await supabase
          .from('profiles')
          .select('role, username')
          .eq('id', currentSession.user.id)
          .single();
        if (!error && data) {
          setProfile(data);
          setUserRole(data.role);
        } else {
          setProfile(null);
          setUserRole('guest');
        }
      } else {
        setProfile(null);
        setUserRole('guest');
      }
    };

    // Fetch initial session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      fetchProfile(currentSession);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      fetchProfile(currentSession);
    });

    // Cleanup listener
    return () => subscription?.unsubscribe();
  }, []);

  // --- DATA FETCHING (POST, COMMENTS & VIEW COUNT) ---
  useEffect(() => {
    if (!postId) return;

    const fetchPostAndIncrementView = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Increment View Count
        const { error: rpcError } = await supabase.rpc('increment_view_count', {
          item_id: postId,
          item_type: 'post'
        });

        if (rpcError) {
          console.error('Error incrementing view count:', rpcError);
          // Don't stop, just log the error
        }

        // 2. Fetch Post Data with Comments and Author Profiles
        const { data: postData, error: postError } = await supabase
          .from('posts')
          .select('*, comments(*, author:profiles(username))')
          .eq('id', postId)
          .single();

        if (postError) {
          throw postError;
        }

        if (postData) {
          setPost(postData);
          // Set comments
          setComments(postData.comments || []); 
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

  }, [postId]); 

  // --- HANDLER FUNCTIONS ---

  // Handle creating a new comment or reply
  const handleCreateComment = async (event, postId, parentId = null) => {
    event.preventDefault();
    if (!session || !newCommentContent.trim()) return;

    const { data, error } = await supabase
      .from('comments')
      .insert([{
        content: newCommentContent,
        post_id: postId,
        author_id: session.user.id,
        parent_id: parentId
      }])
      .select('*, author:profiles(username)') 
      .single();

    if (error) {
      console.error('Error creating comment:', error);
      alert('Could not post comment.');
    } else if (data) {
      // Add new comment to the state
      setComments(prevComments => [...prevComments, data]);
      setNewCommentContent('');
      setReplyingToCommentId(null); // Close reply box
    }
  };

  // Handle updating an existing comment
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
      setComments(prevComments =>
        prevComments.map(c => (c.id === commentId ? data : c))
      );
      setEditingCommentId(null);
      setEditingCommentContent('');
    }
  };

  // Handle deleting a comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    const { error } = await supabase.from('comments').delete().eq('id', commentId);

    if (error) {
      console.error('Error deleting comment:', error);
      alert('Could not delete comment.');
    } else {
      setComments(prevComments => prevComments.filter(c => c.id !== commentId));
    }
  };

  // Handle pinning a comment (Admin only)
  const handlePinComment = async (commentId, currentStatus) => {
    const { data: updatedComment, error } = await supabase
      .from('comments')
      .update({ is_pinned: !currentStatus })
      .eq('id', commentId)
      .select('*, author:profiles(username)')
      .single();

    if (error) {
      console.error('Error pinning comment:', error);
      alert('Could not update the comment.');
    } else if (updatedComment) {
      setComments(prevComments =>
        prevComments.map(comment =>
          comment.id === commentId ? updatedComment : comment
        )
      );
    }
  };

  // Handle toggling reply visibility
  const toggleReplies = (commentId) => {
    setExpandedReplies(prev =>
      prev.includes(commentId)
        ? prev.filter(id => id !== commentId)
        : [...prev, commentId]
    );
  };

  // --- LOADING / ERROR CHECKS (MUST BE AFTER ALL HOOKS) ---
  if (loading) {
    return (
      <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '1rem' }}>
        <Link href="/" style={{ marginBottom: '1rem', display: 'inline-block' }}>
          &larr; Back to Dashboard
        </Link>
        <h1>Loading post...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '1rem' }}>
        <Link href="/" style={{ marginBottom: '1rem', display: 'inline-block' }}>
          &larr; Back to Dashboard
        </Link>
        <h1>Error: {error}</h1>
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '1rem' }}>
        <Link href="/" style={{ marginBottom: '1rem', display: 'inline-block' }}>
          &larr; Back to Dashboard
        </Link>
        <h1>Post not found.</h1>
      </div>
    );
  }
  
  // (Main 'return' statement with JSX comes next)


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
        <div style={{ position: 'relative', width: '100%', height: '300px', margin: '2rem 0' }}> 
          <Image
            src={post.image_url}
            alt={post.title}
            fill 
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" 
          />
        </div>
      )}
      
      <div style={{ marginTop: '2rem', whiteSpace: 'pre-wrap' }}>
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>

      {/* --- Comments Section --- */}
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
        {!session && <p>You must be <Link href="/login" style={{textDecoration: 'underline'}}>logged in</Link> to comment.</p>}

        {/* Display Comments */}
        {comments
          .filter(comment => !comment.parent_id) // Top-level comments
          .sort((a, b) => b.is_pinned - a.is_pinned || new Date(a.created_at) - new Date(b.created_at)) // Pinned first, then oldest
          .map(comment => {
            const replies = comments
              .filter(reply => reply.parent_id === comment.id)
              .sort((a, b) => new Date(a.created_at) - new Date(b.created_at)); // Replies oldest first
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
                   <form onSubmit={(e) => handleCreateComment(e, post.id, comment.id)} style={{ marginTop: '1rem', marginLeft: '2rem' }}>
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