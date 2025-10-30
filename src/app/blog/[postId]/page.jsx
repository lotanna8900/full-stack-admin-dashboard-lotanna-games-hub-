"use client";
import { useState, useEffect, use, Suspense } from 'react';
import { useSearchParams } from 'next/navigation'; 
import { supabase } from '../../utils/supabaseClient'; 
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import Image from 'next/image';

// --- Inner Component ---
function BlogPostPageContent({ params: paramsProp }) {
  const params = use(paramsProp);
  const { postId } = params; 
  const searchParams = useSearchParams(); 

  // --- State Variables ---
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Auth state
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // Form state - SEPARATED for main comments and replies
  const [mainCommentContent, setMainCommentContent] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [replyingToCommentId, setReplyingToCommentId] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentContent, setEditingCommentContent] = useState('');

  // UI state
  const [expandedReplies, setExpandedReplies] = useState([]);
  const [showMainCommentForm, setShowMainCommentForm] = useState(false);

  // --- DATA FETCHING (SESSION & PROFILE) ---
  useEffect(() => {
    const fetchProfile = async (currentSession) => {
      if (currentSession) {
        const { data, error } = await supabase
          .from('profiles')
          .select('role, username')
          .eq('id', currentSession.user.id)
          .single();
        if (!error && data) {
          setUserRole(data.role);
        } else {
          setUserRole('guest');
          if (error) console.error("Error fetching profile on detail page:", error);
        }
      } else {
        setUserRole('guest');
      }
    };

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      fetchProfile(currentSession);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      fetchProfile(currentSession);
    });

    return () => subscription?.unsubscribe();
  }, []);

  // --- DATA FETCHING (POST, COMMENTS & VIEW COUNT) ---
  useEffect(() => {
    if (!postId) return;

    const fetchPostAndIncrementView = async () => {
      setLoading(true);
      setError(null);
      try {
        const { error: rpcError } = await supabase.rpc('increment_view_count', {
          item_id: postId,
          item_type: 'post'
        });
        if (rpcError) console.error('Error incrementing view count:', rpcError);

        const { data: postData, error: postError } = await supabase
          .from('posts')
          .select('*, comments(*, author:profiles(username, avatar_url))')
          .eq('id', postId)
          .single();
        if (postError) throw postError;

        if (postData) {
          setPost(postData);
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

  // --- SCROLLING EFFECT ---
  useEffect(() => {
    const replyId = searchParams.get('reply');
    if (replyId && !loading) { 
      const targetSelector = `[data-comment-id="${replyId}"]`;
      const targetElement = document.querySelector(targetSelector);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetElement.style.transition = 'background-color 0.5s ease';
        targetElement.style.backgroundColor = 'rgba(255, 255, 0, 0.2)';
        setTimeout(() => { targetElement.style.backgroundColor = ''; }, 2000);
      }
    }
  }, [comments, loading, searchParams]); 

  // --- HANDLER FUNCTIONS ---

  // Handle creating a main comment
  const handleCreateMainComment = async (event) => {
    event.preventDefault();
    if (!session || !mainCommentContent.trim()) return;

    const { data, error } = await supabase
      .from('comments')
      .insert([{ content: mainCommentContent, post_id: post.id, author_id: session.user.id, parent_id: null }])
      .select('*, author:profiles(username, avatar_url)')
      .single();

    if (error) { 
      console.error('Error creating comment:', error); 
      alert('Could not post comment.'); 
    } else if (data) {
      setComments(prevComments => [...prevComments, data]);
      setMainCommentContent('');
      setShowMainCommentForm(false);
    }
  };

  // Handle creating a reply
  const handleCreateReply = async (event, parentId) => {
    event.preventDefault();
    if (!session || !replyContent.trim()) return;

    const { data, error } = await supabase
      .from('comments')
      .insert([{ content: replyContent, post_id: post.id, author_id: session.user.id, parent_id: parentId }])
      .select('*, author:profiles(username, avatar_url)')
      .single();

    if (error) { 
      console.error('Error creating reply:', error); 
      alert('Could not post reply.'); 
    } else if (data) {
      setComments(prevComments => [...prevComments, data]);
      setReplyContent('');
      setReplyingToCommentId(null);
      if (!expandedReplies.includes(parentId)) {
        setExpandedReplies(prev => [...prev, parentId]);
      }
    }
  };

  // Handle updating an existing comment
  const handleUpdateComment = async (event, commentId) => {
    event.preventDefault();
    const { data, error } = await supabase
      .from('comments').update({ content: editingCommentContent }).eq('id', commentId)
      .select('*, author:profiles(username, avatar_url)').single();

    if (error) { 
      console.error('Error updating comment:', error); 
      alert('Could not update comment.'); 
    } else {
      setComments(prevComments => prevComments.map(c => (c.id === commentId ? data : c)));
      setEditingCommentId(null);
      setEditingCommentContent('');
    }
  };

  // Handle deleting a comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure?")) return;
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
      .from('comments').update({ is_pinned: !currentStatus }).eq('id', commentId)
      .select('*, author:profiles(username, avatar_url)').single();
    if (error) { 
      console.error('Error pinning comment:', error); 
      alert('Could not update comment.'); 
    } else if (updatedComment) {
      setComments(prevComments => prevComments.map(comment => comment.id === commentId ? updatedComment : comment));
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

  // --- LOADING / ERROR CHECKS ---
  if (loading) {
    return (
      <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '1rem' }}>
        <Link href="/blog" style={{ marginBottom: '1rem', display: 'inline-block' }}>
          &larr; Back to Blog
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

  // --- RENDER THE PAGE ---
  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '1rem' }}>
      {/* Back Link */}
      <Link href="/" style={{ marginBottom: '1rem', display: 'inline-block', color: 'var(--primary)', textDecoration: 'none' }}>
        &larr; Back to Dashboard
      </Link>

      {/* Post Content */}
      <h1 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>{post.title}</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Published on: {new Date(post.created_at).toLocaleDateString()}
      </p>
      
      {post.image_url && (
        <div style={{ position: 'relative', width: '100%', height: '400px', margin: '2rem 0', borderRadius: '12px', overflow: 'hidden' }}>
          <Image
            src={post.image_url}
            alt={post.title}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 800px) 100vw, 800px"
          />
        </div>
      )}
      
      <div style={{ marginTop: '2rem', whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>

      {/* --- Comments Section --- */}
      <div style={{ marginTop: '3rem', borderTop: '2px solid var(--grey-dark)', paddingTop: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Comments ({comments.length})</h2>

        {/* Add Comment Button (Shows Form) */}
        {session && !showMainCommentForm && (
          <button 
            onClick={() => setShowMainCommentForm(true)} 
            className="btn btn-primary" 
            style={{ marginBottom: '1.5rem', padding: '0.5rem 1rem' }}
          >
            Add a Comment
          </button>
        )}

        {/* Main Comment Form (Hidden by default) */}
        {session && showMainCommentForm && (
          <form onSubmit={handleCreateMainComment} style={{ marginBottom: '2rem' }}>
            <div className="form-group">
              <textarea
                className="form-textarea"
                placeholder="Share your thoughts..."
                value={mainCommentContent}
                onChange={(e) => setMainCommentContent(e.target.value)}
                required
                style={{ minHeight: '100px' }}
              ></textarea>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                Post Comment
              </button>
              <button 
                type="button" 
                className="btn" 
                onClick={() => {
                  setShowMainCommentForm(false);
                  setMainCommentContent('');
                }} 
                style={{ padding: '0.5rem 1rem' }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {!session && (
          <p style={{ marginBottom: '2rem' }}>
            You must be <Link href="/login" style={{color: 'var(--primary)', textDecoration: 'underline'}}>logged in</Link> to comment.
          </p>
        )}

        {/* Display Comments */}
        {comments
          .filter(comment => !comment.parent_id)
          .sort((a, b) => b.is_pinned - a.is_pinned || new Date(a.created_at) - new Date(b.created_at))
          .map(comment => {
            const replies = comments
              .filter(reply => reply.parent_id === comment.id)
              .sort((a, b) => b.is_pinned - a.is_pinned || new Date(a.created_at) - new Date(b.created_at));
            const isRepliesExpanded = expandedReplies.includes(comment.id);

            return (
              <div key={comment.id} data-comment-id={comment.id} className="comment-item" style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--grey-light)' }}>
                
                {/* Edit Form or Comment Content */}
                {editingCommentId === comment.id ? (
                  <form onSubmit={(e) => handleUpdateComment(e, comment.id)}>
                      <textarea className="form-textarea" value={editingCommentContent} onChange={(e) => setEditingCommentContent(e.target.value)} style={{ minHeight: '100px' }}></textarea>
                      <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
                          <button type="submit" className="btn btn-primary" style={{ padding: '0.25rem 0.5rem' }}>Save</button>
                          <button type="button" className="btn" onClick={() => setEditingCommentId(null)} style={{ padding: '0.25rem 0.5rem' }}>Cancel</button>
                      </div>
                  </form>
                ) : (
                  <>
                    {comment.is_pinned && <span style={{ float: 'right', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--primary)' }}>📌 Pinned</span>}
                    
                    <div className="comment-author-info" style={{ marginBottom: '0.75rem' }}>
                      <Link href={`/users/${comment.author_id}`}>
                        {comment.author?.avatar_url ? (
                          <Image
                            className="comment-avatar"
                            src={comment.author.avatar_url}
                            alt={comment.author.username || 'avatar'}
                            width={40}
                            height={40}
                          />
                        ) : (
                          <div className="comment-avatar-placeholder" style={{ width: '40px', height: '40px', fontSize: '1rem' }}>
                            <span>{comment.author ? comment.author.username.charAt(0).toUpperCase() : '?'}</span>
                          </div>
                        )}
                      </Link>
                      
                      <div>
                        <Link href={`/users/${comment.author_id}`} title="View profile" className="comment-author-link">
                          {comment.author ? comment.author.username : 'Anonymous'}
                        </Link>
                        <div className="comment-date" style={{ fontSize: '0.85rem' }}>
                          {new Date(comment.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', marginBottom: '0.75rem' }}>{comment.content}</p>
                    
                    <div className="comment-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem' }}>
                      {session && (
                        <button 
                          className="btn-link" 
                          onClick={() => {
                            setReplyingToCommentId(comment.id);
                            setReplyContent('');
                          }}
                        >
                          Reply
                        </button>
                      )}
                      {session && session.user.id === comment.author_id && (
                        <>
                          <button className="btn-link" onClick={() => { setEditingCommentId(comment.id); setEditingCommentContent(comment.content); }}>Edit</button>
                          <button className="btn-link" onClick={() => handleDeleteComment(comment.id)}>Delete</button>
                        </>
                      )}
                      {userRole === 'admin' && (<button className="btn-link" onClick={() => handlePinComment(comment.id, comment.is_pinned)}>{comment.is_pinned ? 'Unpin' : 'Pin'}</button>)}
                      
                      {replies.length > 0 && (
                         <button className="btn-link" onClick={() => toggleReplies(comment.id)}>
                            {isRepliesExpanded ? 'Hide Replies' : `View ${replies.length} ${replies.length === 1 ? 'Reply' : 'Replies'}`}
                         </button>
                      )}
                    </div>
                  </>
                )}

                {/* Reply Form */}
                {replyingToCommentId === comment.id && (
                   <form onSubmit={(e) => handleCreateReply(e, comment.id)} style={{ marginTop: '1rem', marginLeft: '3rem' }}>
                       <div className="form-group">
                         <textarea
                           className="form-textarea"
                           placeholder={`Replying to ${comment.author?.username || 'Anonymous'}...`}
                           value={replyContent}
                           onChange={(e) => setReplyContent(e.target.value)}
                           required
                           style={{ minHeight: '80px' }}
                         ></textarea>
                       </div>
                       <div style={{ display: 'flex', gap: '1rem' }}>
                         <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                           Post Reply
                         </button>
                         <button 
                           type="button" 
                           className="btn" 
                           onClick={() => {
                             setReplyingToCommentId(null);
                             setReplyContent('');
                           }} 
                           style={{ padding: '0.5rem 1rem' }}
                         >
                           Cancel
                         </button>
                       </div>
                   </form>
                )}
                
                {/* Nested Replies (Conditionally Rendered) */}
                {isRepliesExpanded && (
                  <div className="replies" style={{ marginLeft: '3rem', marginTop: '1rem', borderLeft: '3px solid var(--grey-light)', paddingLeft: '1.5rem' }}>
                    {replies.map(reply => (
                      <div key={reply.id} data-comment-id={reply.id} className="comment-item" style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--grey-light)' }}>
                         {editingCommentId === reply.id ? (
                            <form onSubmit={(e) => handleUpdateComment(e, reply.id)}>
                                <textarea className="form-textarea" value={editingCommentContent} onChange={(e) => setEditingCommentContent(e.target.value)} style={{ minHeight: '80px' }}></textarea>
                                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem' }}>
                                    <button type="submit" className="btn btn-primary" style={{ padding: '0.25rem 0.5rem' }}>Save</button>
                                    <button type="button" className="btn" onClick={() => setEditingCommentId(null)} style={{ padding: '0.25rem 0.5rem' }}>Cancel</button>
                                </div>
                            </form>
                         ) : (
                           <>
                             {reply.is_pinned && <span style={{ float: 'right', fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--primary)' }}>📌 Pinned</span>}
                             
                             <div className="comment-author-info" style={{ marginBottom: '0.75rem' }}>
                               <Link href={`/users/${reply.author_id}`}>
                                 {reply.author?.avatar_url ? (
                                   <Image
                                     className="comment-avatar"
                                     src={reply.author.avatar_url}
                                     alt={reply.author.username || 'avatar'}
                                     width={35}
                                     height={35}
                                   />
                                 ) : (
                                   <div className="comment-avatar-placeholder" style={{ width: '35px', height: '35px', fontSize: '0.9rem' }}>
                                     <span>{reply.author ? reply.author.username.charAt(0).toUpperCase() : '?'}</span>
                                   </div>
                                 )}
                               </Link>
                               
                               <div>
                                 <Link href={`/users/${reply.author_id}`} title="View profile" className="comment-author-link">
                                   {reply.author ? reply.author.username : 'Anonymous'}
                                 </Link>
                                 <div className="comment-date" style={{ fontSize: '0.85rem' }}>
                                   {new Date(reply.created_at).toLocaleDateString()}
                                 </div>
                               </div>
                             </div>

                             <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', marginBottom: '0.75rem' }}>{reply.content}</p>
                             
                             <div className="comment-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem' }}>
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
        {comments.length === 0 && <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No comments yet. Be the first to comment!</p>}
      </div>
    </div>
  );
}

// --- Main Page Export (Handles Suspense) ---
export default function BlogPostPageWrapper({ params }) {
  return (
    <Suspense fallback={<div>Loading Post...</div>}>
      <BlogPostPageContent params={params} />
    </Suspense>
  );
}