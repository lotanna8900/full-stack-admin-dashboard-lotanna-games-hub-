"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient'; 
import Link from 'next/link';
import Image from 'next/image';
import ReportCommentButton from '../../components/ReportCommentButton';

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&display=swap');

  :root {
    --void:        #04060d;
    --abyss:       #070b14;
    --deep:        #0c1120;
    --navy:        #111827;
    --slate:       #1e2d45;
    --mist:        #2b3f5c;
    --steel:       #3d5278;
    --fog:         #5c7099;
    --ash:         #8ca0c0;
    --bone:        #c5d4e8;
    --white:       #eef3f9;

    --ember:       #b85c1a;
    --ember-mid:   #d4711f;
    --ember-hot:   #f08030;
    --gold:        #c4922a;
    --gold-mid:    #dba93a;
    --gold-bright: #f0c050;

    --soul-deep:   #2d1a5c;
    --soul:        #5535a0;
    --soul-mid:    #7b52c8;
    --soul-bright: #a07ae0;
    --crimson:     #b02020;

    --font-title:  'Cinzel', serif;
    --font-body:   'Cormorant Garamond', serif;
  }

  /* ── PAGE SHELL ────────────────────────────────────── */
  .bl-page {
    background: var(--void);
    min-height: 100vh;
    font-family: var(--font-body);
    color: var(--bone);
  }

  /* ── LOADING ────────────────────────────────────────── */
  .bl-loading {
    min-height: 80vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  @keyframes bl-pulse { 0%,100%{opacity:.2} 50%{opacity:1} }
  .bl-loading-text {
    font-family: var(--font-title);
    font-size: .6rem;
    letter-spacing: .5em;
    color: var(--fog);
    text-transform: uppercase;
    animation: bl-pulse 2s ease infinite;
  }

  /* ── HEADER ─────────────────────────────────────────── */
  .bl-header {
    padding: 3rem 0 2rem;
    border-bottom: 1px solid var(--slate);
    margin-bottom: 2.5rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }

  .bl-eyebrow {
    font-family: var(--font-title);
    font-size: .5rem;
    letter-spacing: .45em;
    color: var(--ember-mid);
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: .6rem;
    margin-bottom: .6rem;
  }
  .bl-eyebrow::before {
    content: '';
    display: inline-block;
    width: 20px; height: 1px;
    background: var(--ember-mid);
  }

  .bl-page-title {
    font-family: var(--font-title);
    font-size: clamp(1.5rem, 3vw, 2.2rem);
    font-weight: 600;
    color: var(--white);
    line-height: 1.1;
    margin: 0 0 .3rem;
  }

  .bl-page-sub {
    font-size: 1.1rem;
    color: var(--fog);
    font-style: italic;
  }

  /* ── NEW POST BUTTON ────────────────────────────────── */
  .bl-new-post-btn {
    display: inline-flex;
    align-items: center;
    gap: .5rem;
    padding: .6rem 1.5rem;
    background: linear-gradient(135deg, rgba(184,92,26,.2), rgba(192,144,40,.15));
    border: 1px solid rgba(192,144,40,.4);
    color: var(--gold);
    font-family: var(--font-title);
    font-size: .55rem;
    font-weight: 600;
    letter-spacing: .25em;
    text-transform: uppercase;
    cursor: pointer;
    border-radius: 2px;
    transition: all .2s;
    white-space: nowrap;
  }
  .bl-new-post-btn:hover {
    background: linear-gradient(135deg, rgba(184,92,26,.35), rgba(192,144,40,.3));
    border-color: var(--gold);
    box-shadow: 0 0 20px rgba(192,144,40,.2);
  }

  /* ── POST FEED ──────────────────────────────────────── */
  .bl-feed {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  @keyframes bl-fadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── POST CARD ──────────────────────────────────────── */
  .bl-post {
    background: var(--abyss);
    border: 1px solid var(--slate);
    border-top: none;
    padding: 2rem 2.25rem;
    transition: background .2s;
    opacity: 0;
    animation: bl-fadeUp .5s ease forwards;
    position: relative;
  }
  .bl-post:first-child { border-top: 1px solid var(--slate); border-radius: 2px 2px 0 0; }
  .bl-post:last-child  { border-radius: 0 0 2px 2px; }
  .bl-post:hover       { background: var(--deep); }

  /* Pinned left accent */
  .bl-post.bl-pinned::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 2px;
    background: linear-gradient(to bottom, var(--gold), var(--ember));
  }

  /* ── POST COVER IMAGE ───────────────────────────────── */
  .bl-cover-wrap {
    position: relative;
    width: 100%;
    height: 220px;
    margin-bottom: 1.5rem;
    overflow: hidden;
    border: 1px solid var(--slate);
  }
  .bl-cover-wrap::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 40%;
    background: linear-gradient(to top, var(--abyss), transparent);
    pointer-events: none;
  }

  /* ── POST META ROW ──────────────────────────────────── */
  .bl-post-meta-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: .6rem;
  }

  .bl-post-title {
    font-family: var(--font-title);
    font-size: 1.15rem;
    font-weight: 600;
    color: var(--white);
    letter-spacing: .04em;
    line-height: 1.25;
    margin: 0;
    flex: 1;
    transition: color .2s;
  }
  .bl-post:hover .bl-post-title { color: var(--gold-bright); }

  .bl-pin-btn {
    background: transparent;
    border: none;
    color: var(--fog);
    font-family: var(--font-title);
    font-size: .48rem;
    letter-spacing: .2em;
    text-transform: uppercase;
    cursor: pointer;
    padding: .3rem .5rem;
    transition: color .2s;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .bl-pin-btn:hover { color: var(--gold); }

  .bl-pinned-badge {
    display: inline-flex;
    align-items: center;
    gap: .3rem;
    font-family: var(--font-title);
    font-size: .45rem;
    letter-spacing: .3em;
    color: var(--gold);
    text-transform: uppercase;
    background: rgba(192,144,40,.1);
    border: 1px solid rgba(192,144,40,.3);
    padding: .2rem .6rem;
    border-radius: 1px;
    margin-bottom: .5rem;
  }

  .bl-post-date {
    font-family: var(--font-title);
    font-size: .48rem;
    letter-spacing: .25em;
    color: var(--fog);
    text-transform: uppercase;
    margin-bottom: 1rem;
  }

  /* ── POST BODY PREVIEW ──────────────────────────────── */
  .bl-post-preview {
    font-size: 1.1rem;
    color: var(--ash);
    line-height: 1.75;
    font-style: italic;
    margin-bottom: 1.5rem;
    white-space: pre-wrap;
  }

  /* ── POST ACTIONS ───────────────────────────────────── */
  .bl-post-actions {
    display: flex;
    align-items: center;
    gap: .75rem;
    flex-wrap: wrap;
    padding-bottom: 1.25rem;
    border-bottom: 1px solid var(--slate);
  }

  .bl-btn {
    display: inline-flex;
    align-items: center;
    gap: .4rem;
    padding: .5rem 1.1rem;
    font-family: var(--font-title);
    font-size: .52rem;
    font-weight: 500;
    letter-spacing: .2em;
    text-transform: uppercase;
    text-decoration: none;
    cursor: pointer;
    border-radius: 2px;
    transition: all .2s;
  }

  .bl-btn-primary {
    background: linear-gradient(135deg, var(--ember), var(--ember-hot));
    color: var(--white);
    border: none;
    box-shadow: 0 2px 12px rgba(184,92,26,.3);
  }
  .bl-btn-primary:hover {
    background: linear-gradient(135deg, var(--ember-hot), var(--gold));
    box-shadow: 0 0 20px rgba(240,128,48,.4);
  }

  .bl-btn-ghost {
    background: transparent;
    color: var(--ash);
    border: 1px solid var(--slate);
  }
  .bl-btn-ghost:hover {
    background: rgba(255,255,255,.04);
    border-color: var(--steel);
    color: var(--bone);
  }

  .bl-btn-danger {
    background: transparent;
    color: var(--fog);
    border: 1px solid var(--slate);
  }
  .bl-btn-danger:hover {
    background: rgba(176,32,32,.12);
    border-color: var(--crimson);
    color: #e07070;
  }

  .bl-btn-link {
    background: transparent;
    border: none;
    color: var(--fog);
    font-family: var(--font-title);
    font-size: .48rem;
    letter-spacing: .2em;
    text-transform: uppercase;
    cursor: pointer;
    padding: .25rem .1rem;
    text-decoration: none;
    transition: color .2s;
  }
  .bl-btn-link:hover { color: var(--gold); }

  /* Sub component styles */
  .bl-btn-subscribed {
    background: rgba(85,53,160,.15);
    color: var(--soul-bright);
    border: 1px solid rgba(115,80,200,.35);
  }
  .bl-btn-subscribed:hover {
    background: rgba(85,53,160,.25);
    border-color: var(--soul-mid);
  }

  .bl-sub-wrap {
    display: flex;
    align-items: center;
    gap: .6rem;
    background: rgba(255,255,255,.03);
    border: 1px solid var(--slate);
    padding: .3rem .75rem .3rem .4rem;
    border-radius: 2px;
  }
  .bl-sub-count {
    font-family: var(--font-title);
    font-size: .48rem;
    letter-spacing: .15em;
    color: var(--fog);
    text-transform: uppercase;
    white-space: nowrap;
  }

  /* ── TOGGLE COMMENTS BUTTON ─────────────────────────── */
  .bl-toggle-comments {
    width: 100%;
    margin-top: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: .6rem;
    padding: .6rem;
    background: transparent;
    border: none;
    color: var(--fog);
    font-family: var(--font-title);
    font-size: .5rem;
    letter-spacing: .25em;
    text-transform: uppercase;
    cursor: pointer;
    transition: color .2s;
    border-top: 1px solid var(--slate);
  }
  .bl-toggle-comments:hover { color: var(--ash); }
  .bl-toggle-comments .bl-comment-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px; height: 20px;
    background: var(--slate);
    color: var(--bone);
    font-family: var(--font-title);
    font-size: .5rem;
    border-radius: 50%;
  }

  /* ── COMMENTS SECTION ───────────────────────────────── */
  .bl-comments {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--slate);
  }

  .bl-comments-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;
  }

  .bl-comments-title {
    font-family: var(--font-title);
    font-size: .6rem;
    letter-spacing: .3em;
    color: var(--ash);
    text-transform: uppercase;
    margin: 0;
  }

  /* ── COMMENT FORM ───────────────────────────────────── */
  .bl-comment-form {
    margin-bottom: 1.5rem;
  }

  .bl-textarea {
    width: 100%;
    background: var(--deep);
    border: 1px solid var(--slate);
    color: var(--bone);
    font-family: var(--font-body);
    font-size: 1.05rem;
    line-height: 1.6;
    padding: .8rem 1rem;
    resize: vertical;
    min-height: 90px;
    transition: border-color .2s, box-shadow .2s;
    outline: none;
    box-sizing: border-box;
    border-radius: 2px;
  }
  .bl-textarea:focus {
    border-color: rgba(192,144,40,.4);
    box-shadow: 0 0 0 2px rgba(192,144,40,.08);
  }
  .bl-textarea::placeholder { color: var(--steel); font-style: italic; }

  .bl-form-actions { display: flex; gap: .75rem; margin-top: .75rem; }

  /* ── COMMENT LIST ───────────────────────────────────── */
  .bl-comment-item {
    padding: 1rem 0;
    border-bottom: 1px solid var(--slate);
    position: relative;
  }
  .bl-comment-item:last-child { border-bottom: none; }

  .bl-comment-pinned-badge {
    float: right;
    font-family: var(--font-title);
    font-size: .42rem;
    letter-spacing: .25em;
    color: var(--gold);
    text-transform: uppercase;
    background: rgba(192,144,40,.1);
    border: 1px solid rgba(192,144,40,.25);
    padding: .15rem .5rem;
    border-radius: 1px;
  }

  .bl-comment-body {
    font-size: 1.05rem;
    color: var(--bone);
    line-height: 1.7;
    white-space: pre-wrap;
    margin-bottom: .75rem;
  }

  .bl-comment-author-row {
    display: flex;
    align-items: center;
    gap: .65rem;
    margin-bottom: .5rem;
  }

  .bl-avatar {
    width: 28px; height: 28px;
    border-radius: 50%;
    object-fit: cover;
    border: 1px solid var(--slate);
    flex-shrink: 0;
  }

  .bl-avatar-placeholder {
    width: 28px; height: 28px;
    border-radius: 50%;
    background: var(--slate);
    border: 1px solid var(--mist);
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-title);
    font-size: .6rem;
    color: var(--ash);
    flex-shrink: 0;
  }

  .bl-comment-meta {
    font-family: var(--font-title);
    font-size: .45rem;
    letter-spacing: .15em;
    color: var(--fog);
    display: flex;
    align-items: center;
    gap: .3rem;
  }

  .bl-comment-author-link {
    color: var(--ash);
    text-decoration: none;
    transition: color .2s;
    text-transform: uppercase;
  }
  .bl-comment-author-link:hover { color: var(--gold); }

  .bl-comment-dot { color: var(--steel); }

  .bl-comment-actions {
    display: flex;
    gap: .75rem;
    align-items: center;
    flex-wrap: wrap;
    margin-top: .35rem;
  }

  /* ── REPLIES ────────────────────────────────────────── */
  .bl-replies {
    margin-left: 1.75rem;
    margin-top: 1rem;
    padding-left: 1rem;
    border-left: 1px solid var(--slate);
  }

  /* ── MODALS ─────────────────────────────────────────── */
  .bl-modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 1000;
    background: rgba(4,6,13,.88);
    backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }

  .bl-modal {
    background: var(--deep);
    border: 1px solid var(--slate);
    width: 100%;
    max-width: 640px;
    max-height: 90vh;
    overflow-y: auto;
    border-radius: 2px;
    box-shadow: 0 40px 80px rgba(0,0,0,.8), 0 0 30px rgba(115,80,200,.15);
  }

  .bl-modal-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem 1.75rem;
    border-bottom: 1px solid var(--slate);
    position: sticky;
    top: 0;
    background: var(--deep);
    z-index: 1;
  }

  .bl-modal-title {
    font-family: var(--font-title);
    font-size: .62rem;
    letter-spacing: .3em;
    color: var(--bone);
    text-transform: uppercase;
    margin: 0;
  }

  .bl-modal-close {
    width: 32px; height: 32px;
    display: flex; align-items: center; justify-content: center;
    background: transparent;
    border: 1px solid var(--mist);
    color: var(--fog);
    font-size: 1rem;
    cursor: pointer;
    border-radius: 2px;
    transition: all .2s;
    flex-shrink: 0;
  }
  .bl-modal-close:hover { border-color: var(--crimson); color: #e07070; }

  .bl-modal-body { padding: 1.75rem; }

  .bl-form-group { display: flex; flex-direction: column; gap: .4rem; margin-bottom: 1.1rem; }

  .bl-form-label {
    font-family: var(--font-title);
    font-size: .48rem;
    letter-spacing: .3em;
    color: var(--fog);
    text-transform: uppercase;
  }

  .bl-form-input {
    background: var(--abyss);
    border: 1px solid var(--slate);
    color: var(--bone);
    font-family: var(--font-body);
    font-size: 1rem;
    padding: .65rem .9rem;
    outline: none;
    transition: border-color .2s, box-shadow .2s;
    border-radius: 2px;
    width: 100%;
    box-sizing: border-box;
  }
  .bl-form-input:focus {
    border-color: rgba(192,144,40,.4);
    box-shadow: 0 0 0 2px rgba(192,144,40,.08);
  }
  .bl-form-input::placeholder { color: var(--steel); font-style: italic; }

  .bl-form-textarea-tall {
    background: var(--abyss);
    border: 1px solid var(--slate);
    color: var(--bone);
    font-family: var(--font-body);
    font-size: 1.05rem;
    line-height: 1.7;
    padding: .75rem .9rem;
    min-height: 260px;
    resize: vertical;
    outline: none;
    transition: border-color .2s, box-shadow .2s;
    border-radius: 2px;
    width: 100%;
    box-sizing: border-box;
  }
  .bl-form-textarea-tall:focus {
    border-color: rgba(192,144,40,.4);
    box-shadow: 0 0 0 2px rgba(192,144,40,.08);
  }
  .bl-form-textarea-tall::placeholder { color: var(--steel); font-style: italic; }

  .bl-form-cta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .bl-modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: .75rem;
    padding-top: 1rem;
    margin-top: .5rem;
    border-top: 1px solid var(--slate);
  }

  .bl-form-submit {
    display: inline-flex; align-items: center; gap: .4rem;
    padding: .6rem 1.5rem;
    background: linear-gradient(135deg, var(--ember), var(--ember-hot));
    color: var(--white);
    font-family: var(--font-title);
    font-size: .52rem;
    font-weight: 600;
    letter-spacing: .2em;
    text-transform: uppercase;
    border: none;
    cursor: pointer;
    border-radius: 2px;
    box-shadow: 0 2px 12px rgba(184,92,26,.3);
    transition: all .2s;
  }
  .bl-form-submit:hover {
    background: linear-gradient(135deg, var(--ember-hot), var(--gold));
    box-shadow: 0 0 20px rgba(240,128,48,.4);
  }

  .bl-form-cancel {
    display: inline-flex; align-items: center;
    padding: .6rem 1.25rem;
    background: transparent;
    border: 1px solid var(--mist);
    color: var(--fog);
    font-family: var(--font-title);
    font-size: .52rem;
    letter-spacing: .2em;
    text-transform: uppercase;
    cursor: pointer;
    border-radius: 2px;
    transition: all .2s;
  }
  .bl-form-cancel:hover { border-color: var(--steel); color: var(--bone); }

  @media (max-width: 600px) {
    .bl-post { padding: 1.5rem 1.25rem; }
    .bl-form-cta-grid { grid-template-columns: 1fr; }
    .bl-modal-body { padding: 1.25rem; }
  }
`;

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export default function BlogListPage() {
  // ── All state (UNTOUCHED) ──
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [isEditPostModalOpen, setIsEditPostModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImageUrl, setNewPostImageUrl] = useState('');
  const [newPostCtaText, setNewPostCtaText] = useState('');
  const [newPostCtaLink, setNewPostCtaLink] = useState('');
  const [commentFormOpen, setCommentFormOpen] = useState(null);
  const [mainCommentContent, setMainCommentContent] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [replyingToCommentId, setReplyingToCommentId] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentContent, setEditingCommentContent] = useState('');
  const [expandedReplies, setExpandedReplies] = useState([]);
  const [expandedPostComments, setExpandedPostComments] = useState([]);
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);

  // ── All effects & handlers (UNTOUCHED) ──
  useEffect(() => {
    setLoading(true);
    const fetchUserData = async (currentSession) => {
      if (!currentSession) { setUserRole('guest'); setSubscriptions([]); return; }
      const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('id', currentSession.user.id).single();
      if (profileError) setUserRole('guest');
      else setUserRole(profile?.role || 'guest');
      const { data: subsData, error: subsError } = await supabase.from('subscriptions').select('post_id').eq('user_id', currentSession.user.id).not('post_id', 'is', null);
      if (subsError) console.error("Error fetching post subscriptions:", subsError);
      else setSubscriptions(subsData || []);
    };
    const getPosts = async () => {
      const { data, error } = await supabase.from('posts').select('*, comments(*, author:profiles(username, avatar_url)), subscriptions(count)').order('created_at', { ascending: false });
      if (error) console.error('Error fetching posts:', error);
      else setPosts(data || []);
      setLoading(false);
    };
    getPosts();
    supabase.auth.getSession().then(({ data: { session } }) => { setSession(session); fetchUserData(session); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { setSession(session); fetchUserData(session); });
    return () => subscription?.unsubscribe();
  }, []);

  const openNewPostModal = () => setIsNewPostModalOpen(true);
  const closeNewPostModal = () => { setIsNewPostModalOpen(false); setNewPostTitle(''); setNewPostContent(''); setNewPostImageUrl(''); setNewPostCtaText(''); setNewPostCtaLink(''); };
  const openEditPostModal = (post) => { setEditingPost(post); setNewPostTitle(post.title); setNewPostContent(post.content); setNewPostImageUrl(post.image_url || ''); setNewPostCtaText(post.cta_text || ''); setNewPostCtaLink(post.cta_link || ''); setIsEditPostModalOpen(true); };
  const closeEditPostModal = () => { setIsEditPostModalOpen(false); setEditingPost(null); setNewPostTitle(''); setNewPostContent(''); setNewPostImageUrl(''); setNewPostCtaText(''); setNewPostCtaLink(''); };

  const handleCreatePost = async (event) => {
    event.preventDefault(); if (!session) return;
    const { data, error } = await supabase.from('posts').insert([{ title: newPostTitle, content: newPostContent, image_url: newPostImageUrl || null, cta_text: newPostCtaText || null, cta_link: newPostCtaLink || null, author_id: session.user.id }]).select('*, comments(*, author:profiles(username, avatar_url))').single();
    if (error) { console.error('Error creating post:', error); alert('Could not create post.'); }
    else { setPosts([data, ...posts]); closeNewPostModal(); }
  };

  const handleUpdatePost = async (event) => {
    event.preventDefault(); if (!editingPost) return;
    const { data, error } = await supabase.from('posts').update({ title: newPostTitle, content: newPostContent, image_url: newPostImageUrl || null, cta_text: newPostCtaText || null, cta_link: newPostCtaLink || null }).eq('id', editingPost.id).select('*, comments(*, author:profiles(username, avatar_url))').single();
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
    const { data: updatedPost, error } = await supabase.from('posts').update({ is_pinned: !currentStatus }).eq('id', postId).select('*, comments(*, author:profiles(username, avatar_url))').single();
    if (error) { console.error('Error pinning post:', error); alert('Could not update post.'); }
    else if (updatedPost) { setPosts(posts.map(p => (p.id === postId ? updatedPost : p))); }
  };

  const handleCreateMainComment = async (event, postId) => {
    event.preventDefault();
    if (!session) { alert('You must be logged in to comment.'); return; }
    if (!mainCommentContent.trim()) return;
    const { data, error } = await supabase.from('comments').insert([{ content: mainCommentContent, post_id: postId, author_id: session.user.id, parent_id: null }]).select('*, author:profiles(username, avatar_url)').single();
    if (error) { console.error('Error creating comment:', error); alert('Could not post comment.'); }
    else if (data) { setPosts(posts.map(post => post.id === postId ? { ...post, comments: [...post.comments, data].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)) } : post)); setMainCommentContent(''); setCommentFormOpen(null); }
  };

  const handleCreateReply = async (event, postId, parentId) => {
    event.preventDefault();
    if (!session || !replyContent.trim()) return;
    const { data, error } = await supabase.from('comments').insert([{ content: replyContent, post_id: postId, author_id: session.user.id, parent_id: parentId }]).select('*, author:profiles(username, avatar_url)').single();
    if (error) { console.error('Error creating reply:', error); alert('Could not post reply.'); }
    else if (data) { setPosts(posts.map(post => post.id === postId ? { ...post, comments: [...post.comments, data].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)) } : post)); setReplyContent(''); setReplyingToCommentId(null); if (!expandedReplies.includes(parentId)) setExpandedReplies(prev => [...prev, parentId]); }
  };

  const handleUpdateComment = async (event, commentId) => {
    event.preventDefault();
    const { data, error } = await supabase.from('comments').update({ content: editingCommentContent }).eq('id', commentId).select('*, author:profiles(username, avatar_url)').single();
    if (error) { console.error('Error updating comment:', error); alert('Could not update comment.'); }
    else { setPosts(posts.map(post => ({ ...post, comments: post.comments.map(c => (c.id === commentId ? data : c)) }))); setEditingCommentId(null); setEditingCommentContent(''); }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure?")) return;
    const { error } = await supabase.from('comments').delete().eq('id', commentId);
    if (error) { console.error('Error deleting comment:', error); alert('Could not delete comment.'); }
    else { setPosts(posts.map(post => ({ ...post, comments: post.comments.filter(c => c.id !== commentId) }))); }
  };

  const handlePinComment = async (commentId, currentStatus) => {
    const { data: updatedComment, error } = await supabase.from('comments').update({ is_pinned: !currentStatus }).eq('id', commentId).select('*, author:profiles(username, avatar_url)').single();
    if (error) { console.error('Error pinning comment:', error); alert('Could not update comment.'); }
    else if (updatedComment) { setPosts(posts.map(post => ({ ...post, comments: post.comments.map(c => c.id === commentId ? updatedComment : c) }))); }
  };

  const toggleReplies = (commentId) => { setExpandedReplies(prev => prev.includes(commentId) ? prev.filter(id => id !== commentId) : [...prev, commentId]); };
  const togglePostComments = (postId) => { setExpandedPostComments(prev => prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]); };

  const handleSubscribe = async (contentType, contentId) => {
    if (!session || contentType !== 'post') return;
    const { data, error } = await supabase.from('subscriptions').insert({ user_id: session.user.id, post_id: contentId }).select('post_id').single();
    if (error) { console.error('Error subscribing:', error); alert('Failed to subscribe.'); }
    else if (data) { setSubscriptions([...subscriptions, data]); }
  };

  const handleUnsubscribe = async (contentType, contentId) => {
    if (!session || contentType !== 'post') return;
    const { error } = await supabase.from('subscriptions').delete().eq('user_id', session.user.id).eq('post_id', contentId);
    if (error) { console.error('Error unsubscribing:', error); alert('Failed to unsubscribe.'); }
    else { setSubscriptions(subscriptions.filter(sub => sub.post_id !== contentId)); }
  };

  const cleanPreview = (text) => {
    if (!text) return '';
    return text.replace(/[#_*~`>-]/g, '').trim().substring(0, 150) + '...';
  };

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="bl-page bl-loading">
          <span className="bl-loading-text">Loading Devlogs</span>
        </div>
      </>
    );
  }

  const sortedPosts = [...posts].sort((a, b) => {
    if (a.is_pinned === b.is_pinned) return new Date(b.created_at) - new Date(a.created_at);
    return a.is_pinned ? -1 : 1;
  });

  // ── Reusable Comment Node ──
  const CommentNode = ({ comment, postId, isReply = false }) => (
    <div className="bl-comment-item">
      {editingCommentId === comment.id ? (
        <form onSubmit={(e) => handleUpdateComment(e, comment.id)}>
          <textarea className="bl-textarea" value={editingCommentContent} onChange={(e) => setEditingCommentContent(e.target.value)} />
          <div className="bl-form-actions" style={{ marginTop: '.5rem' }}>
            <button type="submit" className="bl-btn bl-btn-primary" style={{ padding: '.4rem .9rem', fontSize: '.5rem' }}>Save</button>
            <button type="button" className="bl-btn bl-btn-ghost" style={{ padding: '.4rem .9rem', fontSize: '.5rem' }} onClick={() => setEditingCommentId(null)}>Cancel</button>
          </div>
        </form>
      ) : (
        <>
          {comment.is_pinned && <span className="bl-comment-pinned-badge">📌 Pinned</span>}
          <p className="bl-comment-body">{comment.content}</p>

          <div className="bl-comment-author-row">
            <Link href={`/users/${comment.author_id}`}>
              {comment.author?.avatar_url ? (
                <Image className="bl-avatar" src={comment.author.avatar_url} alt={comment.author.username || 'avatar'} width={28} height={28} />
              ) : (
                <div className="bl-avatar-placeholder">
                  <span>{comment.author ? comment.author.username.charAt(0).toUpperCase() : '?'}</span>
                </div>
              )}
            </Link>
            <small className="bl-comment-meta">
              <Link href={`/users/${comment.author_id}`} className="bl-comment-author-link">
                {comment.author ? comment.author.username : 'Anonymous'}
              </Link>
              <span className="bl-comment-dot">·</span>
              <span>{new Date(comment.created_at).toLocaleDateString()}</span>
            </small>
          </div>

          <div className="bl-comment-actions">
            {session && !isReply && (
              <button className="bl-btn-link" onClick={() => { setReplyingToCommentId(comment.id); setReplyContent(''); }}>
                Reply
              </button>
            )}
            <ReportCommentButton commentId={comment.id} session={session} />
            {session && session.user.id === comment.author_id && (
              <>
                <button className="bl-btn-link" onClick={() => { setEditingCommentId(comment.id); setEditingCommentContent(comment.content); }}>Edit</button>
                <button className="bl-btn-link" onClick={() => handleDeleteComment(comment.id)} style={{ color: 'var(--blood)' }}>Delete</button>
              </>
            )}
            {userRole === 'admin' && (
              <button className="bl-btn-link" onClick={() => handlePinComment(comment.id, comment.is_pinned)}>
                {comment.is_pinned ? 'Unpin' : 'Pin'}
              </button>
            )}
            {!isReply && (() => {
              const replies = posts.find(p => p.id === postId)?.comments.filter(r => r.parent_id === comment.id) || [];
              return replies.length > 0 && (
                <button className="bl-btn-link" onClick={() => toggleReplies(comment.id)}>
                  {expandedReplies.includes(comment.id) ? 'Hide Replies' : `${replies.length} ${replies.length === 1 ? 'Reply' : 'Replies'}`}
                </button>
              );
            })()}
          </div>
        </>
      )}

      {/* Reply Form */}
      {replyingToCommentId === comment.id && (
        <form onSubmit={(e) => handleCreateReply(e, postId, comment.id)} style={{ marginTop: '1rem', marginLeft: '1.5rem' }}>
          <textarea
            className="bl-textarea"
            placeholder={`Replying to ${comment.author?.username || 'Anonymous'}...`}
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            required
          />
          <div className="bl-form-actions">
            <button type="submit" className="bl-btn bl-btn-primary" style={{ padding: '.45rem 1rem', fontSize: '.5rem' }}>Post Reply</button>
            <button type="button" className="bl-btn bl-btn-ghost" style={{ padding: '.45rem 1rem', fontSize: '.5rem' }} onClick={() => { setReplyingToCommentId(null); setReplyContent(''); }}>Cancel</button>
          </div>
        </form>
      )}

      {/* Nested Replies */}
      {!isReply && expandedReplies.includes(comment.id) && (() => {
        const post = posts.find(p => p.id === postId);
        const replies = post?.comments.filter(r => r.parent_id === comment.id).sort((a, b) => b.is_pinned - a.is_pinned) || [];
        return replies.length > 0 && (
          <div className="bl-replies">
            {replies.map(reply => <CommentNode key={reply.id} comment={reply} postId={postId} isReply />)}
          </div>
        );
      })()}
    </div>
  );

  // ── Post Form Fields (shared between create/edit) ──
  const PostFormFields = () => (
    <>
      <div className="bl-form-group">
        <label className="bl-form-label">Post Title *</label>
        <input type="text" className="bl-form-input" placeholder="Enter post title" value={newPostTitle} onChange={(e) => setNewPostTitle(e.target.value)} required />
      </div>
      <div className="bl-form-group">
        <label className="bl-form-label">Content</label>
        <textarea className="bl-form-textarea-tall" placeholder="Write your blog post content here..." value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)} />
      </div>
      <div className="bl-form-group">
        <label className="bl-form-label">Header Image URL (Optional)</label>
        <input type="url" className="bl-form-input" placeholder="https://..." value={newPostImageUrl} onChange={(e) => setNewPostImageUrl(e.target.value)} />
      </div>
      <div className="bl-form-cta-grid">
        <div className="bl-form-group">
          <label className="bl-form-label">CTA Button Text</label>
          <input type="text" className="bl-form-input" placeholder="e.g. Play Chapter 1" value={newPostCtaText} onChange={(e) => setNewPostCtaText(e.target.value)} />
        </div>
        <div className="bl-form-group">
          <label className="bl-form-label">CTA Button Link</label>
          <input type="text" className="bl-form-input" placeholder="e.g. /games" value={newPostCtaLink} onChange={(e) => setNewPostCtaLink(e.target.value)} />
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>{styles}</style>
      <div className="bl-page">
        <div id="blog-section" style={{ maxWidth: '820px', margin: '0 auto', padding: '0 1.5rem' }}>

          {/* ── Header ── */}
          <div className="bl-header">
            <div>
              <p className="bl-eyebrow">Lota Labs</p>
              <h1 className="bl-page-title">Devlog</h1>
              <p className="bl-page-sub">Development insights &amp; studio updates.</p>
            </div>
            {userRole === 'admin' && (
              <button className="bl-new-post-btn" onClick={openNewPostModal}>+ New Post</button>
            )}
          </div>

          {/* ── Post Feed ── */}
          <div className="bl-feed">
            {sortedPosts.map((post, i) => (
              <div
                key={post.id}
                className={`bl-post ${post.is_pinned ? 'bl-pinned' : ''}`}
                style={{ animationDelay: `${i * 0.06}s` }}
                data-post-id={post.id}
              >
                {/* Cover image */}
                {post.image_url && (
                  <div className="bl-cover-wrap">
                    <Image src={post.image_url} alt={post.title} fill style={{ objectFit: 'cover' }} sizes="(max-width: 820px) 100vw, 820px" />
                  </div>
                )}

                {/* Pinned badge */}
                {post.is_pinned && <div className="bl-pinned-badge">📌 Pinned</div>}

                {/* Title row */}
                <div className="bl-post-meta-row">
                  <h2 className="bl-post-title">{post.title}</h2>
                  {userRole === 'admin' && (
                    <button className="bl-pin-btn" onClick={() => handlePinPost(post.id, post.is_pinned)}>
                      {post.is_pinned ? 'Unpin' : 'Pin 📌'}
                    </button>
                  )}
                </div>

                <p className="bl-post-date">
                  {new Date(post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>

                <p className="bl-post-preview">{cleanPreview(post.content)}</p>

                {/* Actions */}
                <div className="bl-post-actions">
                  <Link href={`/blog/${post.id}`} className="bl-btn bl-btn-primary">Read More</Link>

                  <div className="bl-sub-wrap">
                    {session && subscriptions.some(sub => sub.post_id === post.id) ? (
                      <button className="bl-btn bl-btn-subscribed" onClick={() => handleUnsubscribe('post', post.id)}>✓ Subscribed</button>
                    ) : (
                      <button className="bl-btn bl-btn-ghost" onClick={() => { if (!session) window.location.href = `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`; else handleSubscribe('post', post.id); }}>
                        Subscribe
                      </button>
                    )}
                    <span className="bl-sub-count">
                      {post.subscriptions?.[0]?.count || 0} {post.subscriptions?.[0]?.count === 1 ? 'subscriber' : 'subscribers'}
                    </span>
                  </div>

                  {userRole === 'admin' && (
                    <>
                      <button className="bl-btn bl-btn-ghost" onClick={() => openEditPostModal(post)}>Edit</button>
                      <button className="bl-btn bl-btn-danger" onClick={() => handleDeletePost(post.id)}>Delete</button>
                    </>
                  )}
                </div>

                {/* Toggle Comments */}
                <button className="bl-toggle-comments" onClick={() => togglePostComments(post.id)}>
                  <span className="bl-comment-count">{post.comments.length}</span>
                  {expandedPostComments.includes(post.id) ? 'Hide Comments ↑' : 'View Comments ↓'}
                </button>

                {/* Comments Section */}
                {expandedPostComments.includes(post.id) && (
                  <div className="bl-comments">
                    <div className="bl-comments-header">
                      <h3 className="bl-comments-title">Discussion</h3>
                    </div>

                    {/* Add Comment */}
                    {session && commentFormOpen !== post.id && (
                      <button className="bl-btn bl-btn-ghost" style={{ marginBottom: '1.25rem' }} onClick={() => setCommentFormOpen(post.id)}>
                        ✍️ &nbsp;Add a Comment
                      </button>
                    )}

                    {session && commentFormOpen === post.id && (
                      <form className="bl-comment-form" onSubmit={(e) => handleCreateMainComment(e, post.id)}>
                        <textarea
                          className="bl-textarea"
                          placeholder="Add a comment..."
                          value={mainCommentContent}
                          onChange={(e) => setMainCommentContent(e.target.value)}
                          required
                        />
                        <div className="bl-form-actions">
                          <button type="submit" className="bl-btn bl-btn-primary" style={{ padding: '.5rem 1.1rem', fontSize: '.52rem' }}>Post Comment</button>
                          <button type="button" className="bl-btn bl-btn-ghost" style={{ padding: '.5rem 1.1rem', fontSize: '.52rem' }} onClick={() => { setCommentFormOpen(null); setMainCommentContent(''); }}>Cancel</button>
                        </div>
                      </form>
                    )}

                    {/* Comment List */}
                    <div>
                      {post.comments
                        .sort((a, b) => b.is_pinned - a.is_pinned)
                        .filter(c => !c.parent_id)
                        .map(comment => (
                          <CommentNode key={comment.id} comment={comment} postId={post.id} />
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── New Post Modal ── */}
        {isNewPostModalOpen && (
          <div className="bl-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) closeNewPostModal(); }}>
            <div className="bl-modal">
              <div className="bl-modal-top">
                <h2 className="bl-modal-title">New Post</h2>
                <button className="bl-modal-close" onClick={closeNewPostModal}>✕</button>
              </div>
              <form className="bl-modal-body" onSubmit={handleCreatePost}>
                <PostFormFields />
                <div className="bl-modal-actions">
                  <button type="button" className="bl-form-cancel" onClick={closeNewPostModal}>Cancel</button>
                  <button type="submit" className="bl-form-submit">Publish Post</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Edit Post Modal ── */}
        {isEditPostModalOpen && editingPost && (
          <div className="bl-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) closeEditPostModal(); }}>
            <div className="bl-modal">
              <div className="bl-modal-top">
                <h2 className="bl-modal-title">Edit Post</h2>
                <button className="bl-modal-close" onClick={closeEditPostModal}>✕</button>
              </div>
              <form className="bl-modal-body" onSubmit={handleUpdatePost}>
                <PostFormFields />
                <div className="bl-modal-actions">
                  <button type="button" className="bl-form-cancel" onClick={closeEditPostModal}>Cancel</button>
                  <button type="submit" className="bl-form-submit">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}