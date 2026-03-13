"use client";
import { useState, useEffect, use } from 'react'; 
import { useSearchParams } from 'next/navigation'; 
import { supabase } from '../../utils/supabaseClient'; 
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import Image from 'next/image';
import ReportCommentButton from '../../../components/ReportCommentButton';

export default function BlogPostPageContent({ params: paramsProp }) {
  const params = use(paramsProp);
  const { postId } = params; 
  const searchParams = useSearchParams(); 

  // --- State Variables ---
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [updates, setUpdates] = useState([]); // <-- NEW: Timeline Updates State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Auth state
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // Form state
  const [mainCommentContent, setMainCommentContent] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [replyingToCommentId, setReplyingToCommentId] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentContent, setEditingCommentContent] = useState('');
  
  // NEW: Update Form State
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateContent, setUpdateContent] = useState('');

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

  // --- DATA FETCHING (POST, COMMENTS, UPDATES & VIEW COUNT) ---
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

        // MODIFIED: Now fetching post_updates along with comments
        const { data: postData, error: postError } = await supabase
          .from('posts')
          .select('*, comments(*, author:profiles(username, avatar_url)), post_updates(*)')
          .eq('id', postId)
          .single();
          
        if (postError) throw postError;

        if (postData) {
          setPost(postData);
          setComments(postData.comments || []);
          // Sort updates newest first
          setUpdates((postData.post_updates || []).sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
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

  // NEW: Handle creating a Timeline Update
  const handleCreateUpdate = async (event) => {
    event.preventDefault();
    if (!session || !updateContent.trim()) return;

    const { data, error } = await supabase
      .from('post_updates')
      .insert([{ post_id: post.id, content: updateContent, author_id: session.user.id }])
      .select()
      .single();

    if (error) { 
      console.error('Error creating update:', error); 
      alert('Could not post official update.'); 
    } else if (data) {
      setUpdates(prev => [data, ...prev]);
      setUpdateContent('');
      setShowUpdateForm(false);
    }
  };

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

  const toggleReplies = (commentId) => {
    setExpandedReplies(prev =>
      prev.includes(commentId) ? prev.filter(id => id !== commentId) : [...prev, commentId]
    );
  };

  // --- LOADING / ERROR CHECKS ---
  if (loading) {
    return (
      <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '1rem' }}>
        <Link href="/blog" style={{ marginBottom: '1rem', display: 'inline-block' }}>&larr; Back to Blog</Link>
        <h1>Loading post...</h1>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '1rem' }}>
        <Link href="/blog" style={{ marginBottom: '1rem', display: 'inline-block' }}>&larr; Back to The Lab</Link>
        <h1>{error || 'Post not found.'}</h1>
      </div>
    );
  }

  // --- RENDER THE PAGE ---
  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '1rem' }}>
      <Link href="/blog" style={{ marginBottom: '1rem', display: 'inline-block', color: 'var(--primary)', textDecoration: 'none' }}>
        &larr; Back to The Lab
      </Link>

      {/* Post Content */}
      <h1 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>{post.title}</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Published on: {new Date(post.created_at).toLocaleDateString()}
      </p>
      
      {post.image_url && (
        <div style={{ position: 'relative', width: '100%', height: '400px', margin: '2rem 0', borderRadius: '12px', overflow: 'hidden' }}>
          <Image src={post.image_url} alt={post.title} fill style={{ objectFit: 'cover' }} sizes="(max-width: 800px) 100vw, 800px" priority={true} />
        </div>
      )}
      
      <div style={{ marginTop: '2rem', whiteSpace: 'pre-wrap', lineHeight: '1.8' }}>
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>

      {/* --- CTA BUTTON --- */}
      {post.cta_text && post.cta_link && (
        <div style={{ marginTop: '3rem', textAlign: 'center' }}>
          <Link 
            href={post.cta_link} 
            style={{ 
              display: 'inline-block', 
              padding: '1rem 2.5rem', 
              fontSize: '1rem', 
              letterSpacing: '3px', 
              textTransform: 'uppercase', 
              fontWeight: 'bold',
              color: '#ffffff', 
              background: 'linear-gradient(135deg, #b85c1a 0%, #f08030 100%)', 
              border: '1px solid rgba(240, 128, 48, 0.5)',
              borderRadius: '2px',
              textDecoration: 'none',
              boxShadow: '0 8px 20px rgba(184, 92, 26, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)' 
            }}
          >
            {post.cta_text}
          </Link>
        </div>
      )}

      {/* --- TIMELINE / DEVLOG UPDATES --- */}
      
      {/* Admin Add Update Form */}
      {userRole === 'admin' && (
        <div style={{ marginTop: '3rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
          <button 
            onClick={() => setShowUpdateForm(!showUpdateForm)} 
            className="btn btn-primary" 
            style={{ marginBottom: '1.5rem', padding: '0.6rem 1.5rem', background: 'transparent', border: '1px solid #b85c1a', color: '#b85c1a' }}
          >
            {showUpdateForm ? 'Cancel Update' : '➕ Post Official Update'}
          </button>

          {showUpdateForm && (
            <form onSubmit={handleCreateUpdate} style={{ marginBottom: '2rem', background: '#0a0d1a', padding: '1.5rem', borderRadius: '4px', border: '1px solid #1e2d45' }}>
              <h3 style={{ marginTop: 0, color: '#c8a84a', letterSpacing: '1px', textTransform: 'uppercase' }}>New Changelog Entry</h3>
              <p style={{ fontSize: '0.85rem', color: '#8ca0c0', marginBottom: '1rem' }}>This will immediately email subscribers and append to the timeline.</p>
              <textarea
                className="form-textarea"
                value={updateContent}
                onChange={(e) => setUpdateContent(e.target.value)}
                placeholder="Write your update here... (Markdown supported, links and images work perfectly)"
                style={{ minHeight: '150px', width: '100%', marginBottom: '1rem', background: '#04060d', color: '#c5d4e8', border: '1px solid #1e2d45', padding: '1rem' }}
                required
              />
              <button type="submit" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #b85c1a, #f08030)', border: 'none', padding: '0.75rem 2rem', color: 'white', fontWeight: 'bold' }}>
                Publish Update & Email Subscribers
              </button>
            </form>
          )}
        </div>
      )}

      {/* Public Timeline Render */}
      {updates.length > 0 && (
        <div style={{ marginTop: userRole === 'admin' ? '1rem' : '4rem', position: 'relative', paddingLeft: '2.5rem', marginBottom: '3rem' }}>
          {/* Vertical Track Line */}
          <div style={{ position: 'absolute', left: '7px', top: '10px', bottom: '0', width: '2px', background: 'linear-gradient(to bottom, #b85c1a 0%, #b85c1a 80%, transparent 100%)', opacity: 0.5 }} />

          <h3 style={{ marginBottom: '2.5rem', textTransform: 'uppercase', letterSpacing: '3px', color: '#c8a84a', fontSize: '1.2rem' }}>
            Development Timeline
          </h3>

          {updates.map((update) => (
            <div key={update.id} style={{ position: 'relative', marginBottom: '3rem' }}>
              {/* Glowing Timeline Dot */}
              <div style={{
                position: 'absolute', left: '-2.55rem', top: '0.35rem', width: '14px', height: '14px',
                borderRadius: '50%', background: '#04060d', border: '2px solid #f08030',
                boxShadow: '0 0 15px rgba(240, 128, 48, 0.6)'
              }} />

              {/* Date */}
              <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#f08030', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.75rem' }}>
                {new Date(update.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>

              {/* Update Content (Markdown parsed) */}
              <div className="timeline-markdown" style={{ background: 'rgba(20, 25, 41, 0.4)', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '1.5rem', borderRadius: '4px', lineHeight: '1.7', color: '#c5d4e8' }}>
                <style>{`
                  .timeline-markdown a {
                    color: #c8a84a;
                    text-decoration: underline;
                    text-underline-offset: 3px;
                    transition: color 0.2s;
                  }
                  .timeline-markdown a:hover {
                    color: #f08030;
                  }
                `}</style>
                <ReactMarkdown>{update.content}</ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      )}


      {/* --- Comments Section --- */}
      <div style={{ marginTop: '3rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Discussion ({comments.length})</h2>

        {session && !showMainCommentForm && (
        <button onClick={() => setShowMainCommentForm(true)} className="btn btn-primary" style={{ marginBottom: '1.5rem', padding: '0.5rem 1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>✍️</span> Add a Comment
        </button>
        )}

        {session && showMainCommentForm && (
          <form onSubmit={handleCreateMainComment} style={{ marginBottom: '2rem' }}>
            <div className="form-group">
              <textarea className="form-textarea" placeholder="Share your thoughts..." value={mainCommentContent} onChange={(e) => setMainCommentContent(e.target.value)} required style={{ minHeight: '100px' }}></textarea>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Post Comment</button>
              <button type="button" className="btn" onClick={() => { setShowMainCommentForm(false); setMainCommentContent(''); }} style={{ padding: '0.5rem 1rem' }}>Cancel</button>
            </div>
          </form>
        )}

        {!session && (
          <p style={{ marginBottom: '2rem' }}>You must be <Link href="/login" style={{color: 'var(--primary)', textDecoration: 'underline'}}>logged in</Link> to comment.</p>
        )}

        {/* Display Comments */}
        {comments.filter(comment => !comment.parent_id).sort((a, b) => b.is_pinned - a.is_pinned || new Date(a.created_at) - new Date(b.created_at)).map(comment => {
            const replies = comments.filter(reply => reply.parent_id === comment.id).sort((a, b) => b.is_pinned - a.is_pinned || new Date(a.created_at) - new Date(b.created_at));
            const isRepliesExpanded = expandedReplies.includes(comment.id);

            return (
              <div key={comment.id} data-comment-id={comment.id} className="comment-item" style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
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
                    <div className="comment-author-info" style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Link href={`/users/${comment.author_id}`}>
                        {comment.author?.avatar_url ? (
                          <Image className="comment-avatar" src={comment.author.avatar_url} alt={comment.author.username || 'avatar'} width={40} height={40} style={{ borderRadius: '50%' }} />
                        ) : (
                          <div className="comment-avatar-placeholder" style={{ width: '40px', height: '40px', fontSize: '1rem', borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span>{comment.author ? comment.author.username.charAt(0).toUpperCase() : '?'}</span>
                          </div>
                        )}
                      </Link>
                      <div>
                        <Link href={`/users/${comment.author_id}`} title="View profile" className="comment-author-link" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>
                          {comment.author ? comment.author.username : 'Anonymous'}
                        </Link>
                        <div className="comment-date" style={{ fontSize: '0.85rem', color: '#888' }}>
                          {new Date(comment.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', marginBottom: '0.75rem' }}>{comment.content}</p>
                    <div className="comment-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem' }}>
                      {session && <button className="btn-link" onClick={() => { setReplyingToCommentId(comment.id); setReplyContent(''); }} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>Reply</button>}
                      <ReportCommentButton commentId={comment.id} session={session} />
                      {session && session.user.id === comment.author_id && (
                        <>
                          <button className="btn-link" onClick={() => { setEditingCommentId(comment.id); setEditingCommentContent(comment.content); }} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>Edit</button>
                          <button className="btn-link" onClick={() => handleDeleteComment(comment.id)} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer' }}>Delete</button>
                        </>
                      )}
                      {userRole === 'admin' && (<button className="btn-link" onClick={() => handlePinComment(comment.id, comment.is_pinned)} style={{ background: 'none', border: 'none', color: '#c8a84a', cursor: 'pointer' }}>{comment.is_pinned ? 'Unpin' : 'Pin'}</button>)}
                      {replies.length > 0 && (
                         <button className="btn-link" onClick={() => toggleReplies(comment.id)} style={{ background: 'none', border: 'none', color: '#b85c1a', cursor: 'pointer' }}>
                            {isRepliesExpanded ? 'Hide Replies' : `View ${replies.length} ${replies.length === 1 ? 'Reply' : 'Replies'}`}
                         </button>
                      )}
                    </div>
                  </>
                )}

                {replyingToCommentId === comment.id && (
                   <form onSubmit={(e) => handleCreateReply(e, comment.id)} style={{ marginTop: '1rem', marginLeft: '3rem' }}>
                       <div className="form-group">
                         <textarea className="form-textarea" placeholder={`Replying to ${comment.author?.username || 'Anonymous'}...`} value={replyContent} onChange={(e) => setReplyContent(e.target.value)} required style={{ minHeight: '80px' }}></textarea>
                       </div>
                       <div style={{ display: 'flex', gap: '1rem' }}>
                         <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Post Reply</button>
                         <button type="button" className="btn" onClick={() => { setReplyingToCommentId(null); setReplyContent(''); }} style={{ padding: '0.5rem 1rem' }}>Cancel</button>
                       </div>
                   </form>
                )}
                
                {isRepliesExpanded && (
                  <div className="replies" style={{ marginLeft: '3rem', marginTop: '1rem', borderLeft: '3px solid rgba(255,255,255,0.05)', paddingLeft: '1.5rem' }}>
                    {replies.map(reply => (
                      <div key={reply.id} data-comment-id={reply.id} className="comment-item" style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
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
                              <div className="comment-author-info" style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Link href={`/users/${reply.author_id}`}>
                                  {reply.author?.avatar_url ? (
                                    <Image className="comment-avatar" src={reply.author.avatar_url} alt={reply.author.username || 'avatar'} width={35} height={35} style={{ borderRadius: '50%' }} />
                                  ) : (
                                    <div className="comment-avatar-placeholder" style={{ width: '35px', height: '35px', fontSize: '0.9rem', borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <span>{reply.author ? reply.author.username.charAt(0).toUpperCase() : '?'}</span>
                                    </div>
                                  )}
                                </Link>
                                <div>
                                  <Link href={`/users/${reply.author_id}`} title="View profile" className="comment-author-link" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>
                                    {reply.author ? reply.author.username : 'Anonymous'}
                                  </Link>
                                  <div className="comment-date" style={{ fontSize: '0.85rem', color: '#888' }}>
                                    {new Date(reply.created_at).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                              <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', marginBottom: '0.75rem' }}>{reply.content}</p>
                              <div className="comment-actions" style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem' }}>
                                <ReportCommentButton commentId={reply.id} session={session} />
                                {session && session.user.id === reply.author_id && (
                                  <>
                                    <button className="btn-link" onClick={() => { setEditingCommentId(reply.id); setEditingCommentContent(reply.content); }} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>Edit</button>
                                    <button className="btn-link" onClick={() => handleDeleteComment(reply.id)} style={{ background: 'none', border: 'none', color: '#ff4444', cursor: 'pointer' }}>Delete</button>
                                  </>
                                )}
                                {userRole === 'admin' && (<button className="btn-link" onClick={() => handlePinComment(reply.id, reply.is_pinned)} style={{ background: 'none', border: 'none', color: '#c8a84a', cursor: 'pointer' }}>{reply.is_pinned ? 'Unpin' : 'Pin'}</button>)}
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
        {post.comments.filter(c => !c.parent_id).length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#0a0d1a', borderRadius: '8px', border: '1px dashed #1e2d45' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem', opacity: 0.5 }}>💭</span>
            <p style={{ color: '#8ca0c0', margin: 0 }}>No comments yet. Be the first to share your thoughts!</p>
        </div>
        )}
      </div>
    </div>
  );
}