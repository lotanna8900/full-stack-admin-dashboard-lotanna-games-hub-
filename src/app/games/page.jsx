"use client";
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import Link from 'next/link';
import Image from 'next/image';
import StoryEngine from '../../components/StoryEngine';
import demoData from '../../app/data/demo.json';
import MidnightEngine from '../../components/MidnightEngine';
import midnightData from '../../app/data/midnight.json';
import FugitiveEngine from '../../components/FugitiveEngine';
import fugitiveData from '../../app/data/fugitive.json';

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Cinzel+Decorative:wght@400;700&display=swap');

  :root {
    --void:        #04060d;
    --abyss:       #070b14;
    --deep:        #0c1120;
    --navy:        #111827;
    --slate:       #1e2d45;
    --mist:        #2b3f5c;
    --steel:       #3d5278;
    
    --fog:        #7c93b8; 
    --ash:        #a5b6cf; 
    --bone:       #e2e8f0; 
    --white:      #ffffff;

    --ember:       #b85c1a;
    --ember-mid:   #d4711f;
    --ember-hot:   #f08030;
    --gold:        #d4a83b; 
    --gold-mid:    #eebb4d;
    --gold-bright: #f4cd67;

    --soul-deep:   #2d1a5c;
    --soul:        #5535a0;
    --soul-mid:    #7b52c8;
    --soul-bright: #a07ae0;
    --crimson:     #b02020;

    --font-display: 'Cinzel Decorative', serif;
    --font-title:   'Cinzel', serif;
    --font-body:    'Cormorant Garamond', serif;

    --glow-gold:   0 0 20px rgba(212,168,59,0.5), 0 0 50px rgba(212,168,59,0.2);
    --glow-soul:   0 0 20px rgba(115,80,200,0.5), 0 0 50px rgba(115,80,200,0.2);
    --glow-ember:  0 0 20px rgba(184,92,26,0.5),  0 0 50px rgba(184,92,26,0.2);
  }

  /* ── GRAIN ────────────────────────────────────────── */
  .gl-page {
    background: var(--void);
    min-height: 100vh;
    font-family: var(--font-body);
    position: relative;
  }
  .gl-page::before {
    content: '';
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 9999;
    opacity: 0.035;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 128px;
  }

  /* ── LOADING ──────────────────────────────────────── */
  .gl-loading {
    min-height: 80vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  @keyframes gl-pulse { 0%,100%{opacity:.2} 50%{opacity:1} }
  .gl-loading-text {
    font-family: var(--font-title);
    font-size: 0.85rem;
    letter-spacing: .2em;
    color: var(--fog);
    text-transform: uppercase;
    animation: gl-pulse 2s ease infinite;
  }

  /* ── LIBRARY HEADER ───────────────────────────────── */
  .gl-header {
    position: relative;
    padding: 5rem 3rem 3rem;
    overflow: hidden;
  }

  .gl-header-bg {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 70% 100% at 50% 0%, rgba(45,26,92,0.45) 0%, transparent 60%),
      radial-gradient(ellipse 100% 50% at 0% 100%, rgba(22,32,53,0.6) 0%, transparent 50%),
      var(--abyss);
  }

  .gl-header-bg::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(115,80,200,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(115,80,200,0.025) 1px, transparent 1px);
    background-size: 50px 50px;
    mask-image: radial-gradient(ellipse 80% 100% at 50% 0%, black 0%, transparent 70%);
  }

  .gl-header-inner {
    position: relative;
    z-index: 2;
    max-width: 1400px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }

  .gl-eyebrow {
    font-family: var(--font-title);
    font-size: 0.85rem;
    letter-spacing: .2em;
    color: var(--ember-mid);
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: .6rem;
    margin-bottom: .75rem;
  }
  .gl-eyebrow::before {
    content: '';
    display: inline-block;
    width: 24px; height: 2px;
    background: var(--ember-mid);
  }

  .gl-title {
    font-family: var(--font-display);
    font-size: clamp(2.5rem, 4vw, 3.5rem);
    font-weight: 700;
    color: var(--white);
    line-height: 1.1;
    margin-bottom: .5rem;
  }

  .gl-subtitle {
    font-family: var(--font-body);
    font-size: 1.25rem;
    color: var(--ash);
    font-style: italic;
  }

  .gl-count-badge {
    font-family: var(--font-title);
    font-size: 0.75rem;
    letter-spacing: .15em;
    color: var(--ash);
    text-transform: uppercase;
    border: 1px solid var(--slate);
    padding: .5rem 1rem;
    background: rgba(255,255,255,.03);
    border-radius: 4px;
  }

  /* ── DIVIDER ──────────────────────────────────────── */
  .gl-divider {
    height: 1px;
    background: linear-gradient(to right, transparent, var(--slate) 30%, var(--slate) 70%, transparent);
    margin: 0 3rem;
  }

  /* ── LIBRARY GRID ─────────────────────────────────── */
  .gl-library {
    max-width: 1400px;
    margin: 0 auto;
    padding: 3rem 3rem 6rem;
  }

  .gl-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5px;
    background: var(--slate);
    border: 1px solid var(--slate);
  }

  /* ── GAME CARD ────────────────────────────────────── */
  @keyframes gl-fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .gl-card {
    position: relative;
    background: var(--deep);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    cursor: pointer;
    opacity: 0;
    animation: gl-fadeUp .6s ease forwards;
    transition: background .3s ease;
  }
  .gl-card:hover { background: var(--navy); }

  /* Cinematic cover-art area */
  .gl-card-cover {
    position: relative;
    width: 100%;
    aspect-ratio: 3 / 4;
    overflow: hidden;
    flex-shrink: 0;
  }

  /* Hover glow border */
  .gl-card::before {
    content: '';
    position: absolute;
    inset: 0;
    border: 1px solid transparent;
    z-index: 20;
    pointer-events: none;
    transition: border-color .35s ease, box-shadow .35s ease;
  }
  .gl-card:hover::before {
    border-color: rgba(212,168,59,0.5);
    box-shadow: inset 0 0 30px rgba(212,168,59,0.08), var(--glow-gold);
  }
  .gl-card.gl-pinned:hover::before {
    border-color: rgba(115,80,200,0.5);
    box-shadow: inset 0 0 30px rgba(115,80,200,0.08), var(--glow-soul);
  }

  /* Cover image */
  .gl-card-img {
    object-fit: cover;
    object-position: center top;
    transition: transform .6s cubic-bezier(0.25,0.46,0.45,0.94), filter .4s ease;
    filter: brightness(.85) saturate(.9);
  }
  .gl-card:hover .gl-card-img {
    transform: scale(1.04);
    filter: brightness(.7) saturate(1.1);
  }

  /* Cover gradient overlay */
  .gl-card-cover-overlay {
    position: absolute;
    inset: 0;
    z-index: 2;
    background: linear-gradient(
      to bottom,
      transparent 40%,
      rgba(12,17,32,0.5) 65%,
      rgba(7,11,20,0.95) 100%
    );
    transition: background .35s ease;
  }
  .gl-card:hover .gl-card-cover-overlay {
    background: linear-gradient(
      to bottom,
      rgba(7,11,20,0.2) 0%,
      rgba(7,11,20,0.5) 40%,
      rgba(7,11,20,0.97) 100%
    );
  }

  /* No-image placeholder */
  .gl-card-no-cover {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background:
      radial-gradient(ellipse 80% 80% at 50% 40%, rgba(45,26,92,.6), transparent),
      linear-gradient(to bottom, var(--navy), var(--deep));
  }
  .gl-card-no-cover-icon {
    font-size: 3rem;
    opacity: .2;
  }

  /* Pinned badge */
  .gl-pinned-tag {
    position: absolute;
    top: 1rem;
    left: 1rem;
    z-index: 15;
    font-family: var(--font-title);
    font-size: 0.75rem;
    letter-spacing: .15em;
    color: var(--gold-bright);
    text-transform: uppercase;
    background: rgba(7,11,20,0.75);
    border: 1px solid rgba(212,168,59,.4);
    padding: .4rem .75rem;
    border-radius: 4px;
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    gap: .35rem;
  }
  .gl-pinned-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--gold-bright);
    box-shadow: 0 0 6px var(--gold-bright);
    animation: gl-pulse 2s infinite;
  }

  /* Over-image CTA buttons */
  .gl-card-hover-actions {
    position: absolute;
    bottom: 1.25rem;
    left: 1.25rem;
    right: 1.25rem;
    z-index: 10;
    display: flex;
    flex-direction: column;
    gap: .6rem;
    opacity: 0;
    transform: translateY(10px);
    transition: opacity .3s ease, transform .3s ease;
  }
  .gl-card:hover .gl-card-hover-actions {
    opacity: 1;
    transform: translateY(0);
  }

  .gl-btn-play {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: .6rem;
    padding: 1rem 1.25rem;
    background: linear-gradient(135deg, var(--ember), var(--ember-hot));
    color: var(--white);
    font-family: var(--font-title);
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: .15em;
    text-transform: uppercase;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    text-decoration: none;
    transition: all .2s ease;
    box-shadow: 0 4px 16px rgba(184,92,26,.4);
  }
  .gl-btn-play:hover {
    background: linear-gradient(135deg, var(--ember-hot), var(--gold));
    box-shadow: var(--glow-ember);
  }

  .gl-btn-devlog {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: .5rem;
    padding: 0.85rem 1.25rem;
    background: rgba(7,11,20,0.7);
    color: var(--bone);
    font-family: var(--font-title);
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: .15em;
    text-transform: uppercase;
    border: 1px solid var(--steel);
    border-radius: 4px;
    cursor: pointer;
    text-decoration: none;
    backdrop-filter: blur(4px);
    transition: all .2s ease;
  }
  .gl-btn-devlog:hover {
    background: rgba(255,255,255,.06);
    color: var(--white);
    border-color: var(--ash);
  }

  /* ── CARD FOOT: TEXT INFO ─────────────────────────── */
  .gl-card-foot {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: .5rem;
    flex: 1;
    border-top: 1px solid var(--slate);
  }

  .gl-card-title {
    font-family: var(--font-display);
    font-size: 1.25rem;
    font-weight: 600;
    letter-spacing: .05em;
    color: var(--white);
    line-height: 1.2;
    transition: color .2s;
  }
  .gl-card:hover .gl-card-title { color: var(--gold-bright); }

  .gl-card-date {
    font-family: var(--font-title);
    font-size: 0.75rem;
    letter-spacing: .15em;
    color: var(--fog);
    text-transform: uppercase;
  }

  .gl-card-desc {
    font-family: var(--font-body);
    font-size: 1.1rem;
    color: var(--ash);
    line-height: 1.6;
    font-style: italic;
    margin-top: .2rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Admin controls */
  .gl-card-admin {
    display: flex;
    align-items: center;
    gap: .5rem;
    padding-top: 1rem;
    margin-top: auto;
    border-top: 1px solid var(--slate);
  }

  .gl-admin-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px; height: 36px;
    background: transparent;
    border: 1px solid var(--slate);
    color: var(--fog);
    font-size: 1rem;
    cursor: pointer;
    transition: all .2s;
    border-radius: 4px;
  }
  .gl-admin-btn:hover {
    background: rgba(255,255,255,.06);
    border-color: var(--steel);
    color: var(--bone);
  }
  .gl-admin-btn.gl-admin-pin:hover { border-color: var(--gold); color: var(--gold); }
  .gl-admin-btn.gl-admin-edit:hover { border-color: var(--soul-mid); color: var(--soul-mid); }
  .gl-admin-btn.gl-admin-delete:hover { border-color: var(--crimson); color: var(--crimson); }

  .gl-add-btn {
    display: inline-flex;
    align-items: center;
    gap: .5rem;
    padding: .85rem 1.5rem;
    background: linear-gradient(135deg, rgba(184,92,26,.2), rgba(212,168,59,.15));
    border: 1px solid rgba(212,168,59,.35);
    color: var(--gold);
    font-family: var(--font-title);
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: .15em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all .25s;
    border-radius: 4px;
  }
  .gl-add-btn:hover {
    background: linear-gradient(135deg, rgba(184,92,26,.35), rgba(212,168,59,.3));
    border-color: var(--gold);
    box-shadow: var(--glow-gold);
  }

  /* ── EMPTY STATE ──────────────────────────────────── */
  .gl-empty {
    grid-column: 1 / -1;
    background: var(--deep);
    padding: 8rem 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    text-align: center;
  }
  .gl-empty-icon { font-size: 4rem; opacity: .5; }
  .gl-empty-title {
    font-family: var(--font-title);
    font-size: 0.85rem;
    letter-spacing: .2em;
    color: var(--bone);
    text-transform: uppercase;
  }
  .gl-empty-body { font-size: 1.1rem; color: var(--fog); font-style: italic; }

  /* ── MODALS ───────────────────────────────────────── */
  .gl-modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 1000;
    background: rgba(4,6,13,0.88);
    backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }

  .gl-modal {
    background: var(--deep);
    border: 1px solid var(--slate);
    width: 100%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    border-radius: 6px;
    box-shadow: 0 40px 80px rgba(0,0,0,.8), var(--glow-soul);
  }

  .gl-modal-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2.5rem;
    border-bottom: 1px solid var(--slate);
  }

  .gl-modal-title {
    font-family: var(--font-title);
    font-size: 0.85rem;
    letter-spacing: .15em;
    color: var(--bone);
    text-transform: uppercase;
  }

  .gl-modal-close {
    width: 36px; height: 36px;
    display: flex; align-items: center; justify-content: center;
    background: transparent;
    border: 1px solid var(--mist);
    color: var(--fog);
    font-size: 1.25rem;
    cursor: pointer;
    transition: all .2s;
    border-radius: 4px;
    flex-shrink: 0;
  }
  .gl-modal-close:hover { border-color: var(--crimson); color: var(--crimson); }

  .gl-modal-body { padding: 2.5rem; }

  .gl-form-group { display: flex; flex-direction: column; gap: .5rem; margin-bottom: 1.5rem; }

  .gl-form-label {
    font-family: var(--font-title);
    font-size: 0.75rem;
    letter-spacing: .15em;
    color: var(--fog);
    text-transform: uppercase;
  }

  .gl-form-input,
  .gl-form-textarea {
    background: var(--abyss);
    border: 1px solid var(--slate);
    color: var(--bone);
    font-family: var(--font-body);
    font-size: 1.1rem;
    padding: 0.85rem 1.25rem;
    transition: border-color .2s, box-shadow .2s;
    outline: none;
    width: 100%;
    box-sizing: border-box;
    border-radius: 4px;
  }
  .gl-form-input:focus,
  .gl-form-textarea:focus {
    border-color: rgba(212,168,59,.5);
    box-shadow: 0 0 0 2px rgba(212,168,59,.1);
  }
  .gl-form-input::placeholder,
  .gl-form-textarea::placeholder { color: var(--steel); font-style: italic; }
  .gl-form-textarea { min-height: 120px; resize: vertical; white-space: pre-wrap; }
  .gl-form-hint { font-size: 0.9rem; color: var(--fog); font-style: italic; margin-top: .25rem; }

  .gl-form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    padding-top: 1rem;
    margin-top: 1.5rem;
    border-top: 1px solid var(--slate);
  }

  .gl-form-cancel {
    padding: 0.85rem 1.75rem;
    background: transparent;
    border: 1px solid var(--mist);
    color: var(--bone);
    font-family: var(--font-title);
    font-size: 0.75rem;
    letter-spacing: .15em;
    text-transform: uppercase;
    cursor: pointer;
    border-radius: 4px;
    transition: all .2s;
  }
  .gl-form-cancel:hover { border-color: var(--white); color: var(--white); }

  .gl-form-submit {
    padding: 0.85rem 2rem;
    background: linear-gradient(135deg, var(--ember), var(--ember-hot));
    border: none;
    color: var(--white);
    font-family: var(--font-title);
    font-size: 0.75rem;
    letter-spacing: .15em;
    text-transform: uppercase;
    cursor: pointer;
    border-radius: 4px;
    box-shadow: 0 4px 16px rgba(184,92,26,.35);
    transition: all .2s;
  }
  .gl-form-submit:hover {
    background: linear-gradient(135deg, var(--ember-hot), var(--gold));
    box-shadow: var(--glow-ember);
  }

  /* ── GAME PLAYER MODAL ────────────────────────────── */
  .gl-player-overlay {
    position: fixed;
    inset: 0;
    z-index: 2000;
    background: rgba(4,6,13,0.96);
    backdrop-filter: blur(8px);
    display: flex;
    flex-direction: column;
  }

  .gl-player-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    background: var(--abyss);
    border-bottom: 1px solid var(--slate);
    flex-shrink: 0;
    gap: 1rem;
  }

  .gl-player-title {
    font-family: var(--font-display);
    font-size: 1.1rem;
    color: var(--white);
    display: flex;
    align-items: center;
    gap: .75rem;
  }
  .gl-player-title::before {
    content: '▶';
    font-size: 0.75rem;
    color: var(--ember-hot);
    font-family: var(--font-title);
  }

  .gl-player-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-shrink: 0;
  }

  .gl-player-close {
    width: 40px; height: 40px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(176,32,32,.15);
    border: 1px solid rgba(176,32,32,.35);
    color: #e07070;
    font-size: 1.25rem;
    cursor: pointer;
    border-radius: 4px;
    transition: all .2s;
    flex-shrink: 0;
  }
  .gl-player-close:hover {
    background: rgba(176,32,32,.3);
    border-color: var(--crimson);
    color: var(--white);
  }

  .gl-player-body {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  /* ── RESPONSIVE ───────────────────────────────────── */
  @media (max-width: 700px) {
    .gl-header { padding: 4rem 1.5rem 2rem; }
    .gl-header-inner { flex-direction: column; align-items: flex-start; gap: 1rem; }
    .gl-library { padding: 2rem 1.5rem 4rem; }
    .gl-grid { grid-template-columns: 1fr 1fr; }
    .gl-card-hover-actions { opacity: 1; transform: none; }
  }
  @media (max-width: 480px) {
    .gl-grid { grid-template-columns: 1fr; }
  }
`;

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export default function SnippetsPage() {
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNewSnippetModalOpen, setIsNewSnippetModalOpen] = useState(false);
  const [isEditSnippetModalOpen, setIsEditSnippetModalOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState(null);
  const [isGamePlayerOpen, setIsGamePlayerOpen] = useState(false);
  const [activeGameTitle, setActiveGameTitle] = useState('');
  const [newSnippetTitle, setNewSnippetTitle] = useState('');
  const [newSnippetDescription, setNewSnippetDescription] = useState('');
  const [newSnippetGameUrl, setNewSnippetGameUrl] = useState('');
  const [newSnippetImageUrl, setNewSnippetImageUrl] = useState('');
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [newSnippetSlug, setNewSnippetSlug] = useState('');
  const [newSnippetBlogUrl, setNewSnippetBlogUrl] = useState('');

  useEffect(() => {
    setLoading(true);
    const fetchUserData = async (currentSession) => {
      if (!currentSession) { setUserRole('guest'); return; }
      const { data: profile, error } = await supabase.from('profiles').select('role').eq('id', currentSession.user.id).single();
      if (error) setUserRole('guest');
      else setUserRole(profile?.role || 'guest');
    };
    const getSnippets = async () => {
      const { data, error } = await supabase.from('snippets').select('*').order('created_at', { ascending: false });
      if (error) console.error('Error fetching snippets:', error);
      else setSnippets(data || []);
      setLoading(false);
    };
    getSnippets();
    supabase.auth.getSession().then(({ data: { session } }) => { setSession(session); fetchUserData(session); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { setSession(session); fetchUserData(session); });
    return () => subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    if (isGamePlayerOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.height = '';
      document.body.style.touchAction = '';
    }
    return () => { document.body.style.overflow = ''; document.body.style.height = ''; document.body.style.touchAction = ''; };
  }, [isGamePlayerOpen]);

  const openNewSnippetModal = () => { setIsNewSnippetModalOpen(true); setNewSnippetTitle(''); setNewSnippetDescription(''); setNewSnippetGameUrl(''); setNewSnippetImageUrl(''); setNewSnippetSlug(''); setNewSnippetBlogUrl(''); };
  const closeNewSnippetModal = () => { setIsNewSnippetModalOpen(false); setNewSnippetTitle(''); setNewSnippetDescription(''); setNewSnippetGameUrl(''); setNewSnippetImageUrl(''); setNewSnippetSlug(''); setNewSnippetBlogUrl(''); };
  const openEditSnippetModal = (snippet) => { setEditingSnippet(snippet); setNewSnippetTitle(snippet.title); setNewSnippetDescription(snippet.description || ''); setNewSnippetGameUrl(snippet.game_url); setNewSnippetImageUrl(snippet.image_url || ''); setNewSnippetSlug(snippet.slug || ''); setNewSnippetBlogUrl(snippet.blog_url || ''); setIsEditSnippetModalOpen(true); };
  const closeEditSnippetModal = () => { setIsEditSnippetModalOpen(false); setEditingSnippet(null); setNewSnippetTitle(''); setNewSnippetDescription(''); setNewSnippetGameUrl(''); setNewSnippetImageUrl(''); setNewSnippetSlug(''); setNewSnippetBlogUrl(''); };

  const handleCreateSnippet = async (event) => {
    event.preventDefault();
    if (!session) return;
    const { data, error } = await supabase.from('snippets').insert([{ title: newSnippetTitle, slug: newSnippetSlug || null, blog_url: newSnippetBlogUrl || null, description: newSnippetDescription, game_url: newSnippetGameUrl, image_url: newSnippetImageUrl || null, author_id: session.user.id }]).select().single();
    if (error) { console.error('Error creating snippet:', error); alert('Could not create the snippet.'); }
    else { setSnippets([data, ...snippets]); closeNewSnippetModal(); }
  };

  const handleUpdateSnippet = async (event) => {
    event.preventDefault();
    if (!editingSnippet) return;
    const { data, error } = await supabase.from('snippets').update({ title: newSnippetTitle, slug: newSnippetSlug || null, blog_url: newSnippetBlogUrl || null, description: newSnippetDescription, game_url: newSnippetGameUrl, image_url: newSnippetImageUrl || null }).eq('id', editingSnippet.id).select().single();
    if (error) { console.error('Error updating snippet:', error); alert('Could not update the snippet.'); }
    else { setSnippets(snippets.map(s => (s.id === editingSnippet.id ? data : s))); closeEditSnippetModal(); }
  };

  const handleDeleteSnippet = async (snippetId) => {
    if (!window.confirm("Are you sure you want to delete this snippet? This action cannot be undone.")) return;
    const { error } = await supabase.from('snippets').delete().eq('id', snippetId);
    if (error) { console.error('Error deleting snippet:', error); alert('Could not delete snippet.'); }
    else { setSnippets(snippets.filter(snippet => snippet.id !== snippetId)); }
  };

  const handlePinSnippet = async (snippetId, currentStatus) => {
    const { data: updatedSnippet, error } = await supabase.from('snippets').update({ is_pinned: !currentStatus }).eq('id', snippetId).select().single();
    if (error) { console.error('Error pinning snippet:', error); alert('Could not update snippet.'); }
    else if (updatedSnippet) { setSnippets(snippets.map(s => (s.id === snippetId ? updatedSnippet : s))); }
  };

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="gl-page gl-loading">
          <span className="gl-loading-text">Loading the Library</span>
        </div>
      </>
    );
  }

  const sortedSnippets = [...snippets].sort((a, b) => b.is_pinned - a.is_pinned);

  return (
    <>
      <style>{styles}</style>
      <div className="gl-page">

        <div className="gl-header">
          <div className="gl-header-bg" />
          <div className="gl-header-inner">
            <div>
              <p className="gl-eyebrow">Lota Labs</p>
              <h1 className="gl-title">Game Library</h1>
              <p className="gl-subtitle">Playable demos &amp; interactive fiction experiences.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <span className="gl-count-badge">{snippets.length} {snippets.length === 1 ? 'Title' : 'Titles'}</span>
              {userRole === 'admin' && (
                <button className="gl-add-btn" onClick={openNewSnippetModal}>
                  + Add Title
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="gl-divider" />

        <div className="gl-library">
          <div className="gl-grid">
            {sortedSnippets.length === 0 ? (
              <div className="gl-empty">
                <span className="gl-empty-icon">🎮</span>
                <div className="gl-empty-title">The Vault is Empty</div>
                <p className="gl-empty-body">No titles have been added yet. Check back soon.</p>
              </div>
            ) : (
              sortedSnippets.map((snippet, i) => (
                <div
                  key={snippet.id}
                  className={`gl-card ${snippet.is_pinned ? 'gl-pinned' : ''}`}
                  style={{ animationDelay: `${i * 0.07}s` }}
                >
                  <div className="gl-card-cover">
                    <Link href={`/games/${snippet.slug || snippet.id}`} style={{ position: 'absolute', inset: 0, zIndex: 5 }} />

                    {snippet.image_url ? (
                      <Image
                        src={snippet.image_url}
                        alt={snippet.title}
                        fill
                        className="gl-card-img"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="gl-card-no-cover">
                        <span className="gl-card-no-cover-icon">⚔️</span>
                      </div>
                    )}
                    <div className="gl-card-cover-overlay" />

                    {snippet.is_pinned && (
                      <div className="gl-pinned-tag" style={{ zIndex: 10 }}>
                        <span className="gl-pinned-dot" />
                        Featured
                      </div>
                    )}

                    <div className="gl-card-hover-actions" style={{ zIndex: 10 }}>
                      <a
                        href={snippet.game_url}
                        target={snippet.game_url === '#local-demo' ? undefined : '_blank'}
                        rel="noopener noreferrer"
                        className="gl-btn-play"
                        onClick={(e) => {
                          if (snippet.game_url === '#local-demo') {
                            e.preventDefault();
                            setActiveGameTitle(snippet.title);
                            setIsGamePlayerOpen(true);
                          }
                        }}
                      >
                        ▶ Play Now
                      </a>
                      <Link href={snippet.blog_url || "/blog"} className="gl-btn-devlog">
                        Read Devlog →
                      </Link>
                    </div>
                  </div>

                  <div className="gl-card-foot">
                    <div className="gl-card-title">{snippet.title}</div>
                    <div className="gl-card-date">
                      Added {new Date(snippet.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>
                    {snippet.description && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <p className="gl-card-desc">{snippet.description}</p>
                        <Link href={`/games/${snippet.slug || snippet.id}`} style={{ fontSize: '0.85rem', color: 'var(--gold)', textDecoration: 'none', fontStyle: 'italic', alignSelf: 'flex-start' }}>
                          Read more...
                        </Link>
                      </div>
                    )}

                    {userRole === 'admin' && (
                      <div className="gl-card-admin">
                        <button
                          className="gl-admin-btn gl-admin-pin"
                          onClick={() => handlePinSnippet(snippet.id, snippet.is_pinned)}
                          title={snippet.is_pinned ? 'Unpin' : 'Pin'}
                        >
                          {snippet.is_pinned ? '📌' : '📍'}
                        </button>
                        <button
                          className="gl-admin-btn gl-admin-edit"
                          onClick={() => openEditSnippetModal(snippet)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          className="gl-admin-btn gl-admin-delete"
                          onClick={() => handleDeleteSnippet(snippet.id)}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {isNewSnippetModalOpen && (
          <div className="gl-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) closeNewSnippetModal(); }}>
            <div className="gl-modal">
              <div className="gl-modal-top">
                <span className="gl-modal-title">Add New Title</span>
                <button className="gl-modal-close" onClick={closeNewSnippetModal}>✕</button>
              </div>
              <form className="gl-modal-body" onSubmit={handleCreateSnippet}>
                <div className="gl-form-group">
                  <label className="gl-form-label">Title *</label>
                  <input type="text" className="gl-form-input" placeholder="e.g., Chapter 1 Demo" value={newSnippetTitle} onChange={(e) => setNewSnippetTitle(e.target.value)} required />
                </div>
                <div className="gl-form-group">
                  <label className="gl-form-label">Description</label>
                  <textarea className="gl-form-textarea" placeholder="Brief description of what this demo includes..." value={newSnippetDescription} onChange={(e) => setNewSnippetDescription(e.target.value)} />
                </div>
                <div className="gl-form-group">
                  <label className="gl-form-label">Game Demo URL *</label>
                  <input type="text" className="gl-form-input" placeholder="https://dashingdon.com/play/..." value={newSnippetGameUrl} onChange={(e) => setNewSnippetGameUrl(e.target.value)} required />
                  <span className="gl-form-hint">Link to your hosted game demo, or use #local-demo for the built-in engine.</span>
                </div>
                <div className="gl-form-group">
                  <label className="gl-form-label">Cover Image URL (Optional)</label>
                  <input type="url" className="gl-form-input" placeholder="https://..." value={newSnippetImageUrl} onChange={(e) => setNewSnippetImageUrl(e.target.value)} />
                </div>
                <div className="gl-form-group">
                  <label className="gl-form-label">URL Slug (Optional)</label>
                  <input type="text" className="gl-form-input" placeholder="e.g., keepers-vigil" value={newSnippetSlug} onChange={(e) => setNewSnippetSlug(e.target.value)} />
                </div>
                <div className="gl-form-group">
                  <label className="gl-form-label">Devlog Link (Optional)</label>
                  <input type="text" className="gl-form-input" placeholder="e.g., /blog/keepers-vigil-update" value={newSnippetBlogUrl} onChange={(e) => setNewSnippetBlogUrl(e.target.value)} />
                </div>
                <div className="gl-form-actions">
                  <button type="button" className="gl-form-cancel" onClick={closeNewSnippetModal}>Cancel</button>
                  <button type="submit" className="gl-form-submit">Add Title</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isEditSnippetModalOpen && editingSnippet && (
          <div className="gl-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) closeEditSnippetModal(); }}>
            <div className="gl-modal">
              <div className="gl-modal-top">
                <span className="gl-modal-title">Edit Title</span>
                <button className="gl-modal-close" onClick={closeEditSnippetModal}>✕</button>
              </div>
              <form className="gl-modal-body" onSubmit={handleUpdateSnippet}>
                <div className="gl-form-group">
                  <label className="gl-form-label">Title *</label>
                  <input type="text" className="gl-form-input" value={newSnippetTitle} onChange={(e) => setNewSnippetTitle(e.target.value)} required />
                </div>
                <div className="gl-form-group">
                  <label className="gl-form-label">Description</label>
                  <textarea className="gl-form-textarea" value={newSnippetDescription} onChange={(e) => setNewSnippetDescription(e.target.value)} />
                </div>
                <div className="gl-form-group">
                  <label className="gl-form-label">Game Demo URL *</label>
                  <input type="text" className="gl-form-input" value={newSnippetGameUrl} onChange={(e) => setNewSnippetGameUrl(e.target.value)} required />
                </div>
                <div className="gl-form-group">
                  <label className="gl-form-label">Cover Image URL (Optional)</label>
                  <input type="url" className="gl-form-input" value={newSnippetImageUrl} onChange={(e) => setNewSnippetImageUrl(e.target.value)} />
                </div>
                <div className="gl-form-group">
                  <label className="gl-form-label">URL Slug (Optional)</label>
                  <input type="text" className="gl-form-input" placeholder="e.g., keepers-vigil" value={newSnippetSlug} onChange={(e) => setNewSnippetSlug(e.target.value)} />
                </div>
                <div className="gl-form-group">
                  <label className="gl-form-label">Devlog Link (Optional)</label>
                  <input type="text" className="gl-form-input" placeholder="e.g., /blog/keepers-vigil-update" value={newSnippetBlogUrl} onChange={(e) => setNewSnippetBlogUrl(e.target.value)} />
                </div>
                <div className="gl-form-actions">
                  <button type="button" className="gl-form-cancel" onClick={closeEditSnippetModal}>Cancel</button>
                  <button type="submit" className="gl-form-submit">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isGamePlayerOpen && (
          <div
            className="gl-player-overlay"
            onClick={(e) => { if (e.target === e.currentTarget) setIsGamePlayerOpen(false); }}
            onTouchMove={(e) => e.stopPropagation()}
          >
            <div className="gl-player-header">
              <span className="gl-player-title">{activeGameTitle}</span>
              <div className="gl-player-controls">
                <button onClick={() => setIsGamePlayerOpen(false)} className="gl-player-close">✕</button>
              </div>
            </div>

            <div className="gl-player-body">
              {activeGameTitle === 'Supernatural Fugitive' ? (
                <FugitiveEngine storyContent={fugitiveData} session={session} />
              ) : activeGameTitle === 'The Midnight Suspect' ? (
                <MidnightEngine storyContent={midnightData} />
              ) : (
                <StoryEngine storyContent={demoData} />
              )}
            </div>
          </div>
        )}

      </div>
    </>
  );
}