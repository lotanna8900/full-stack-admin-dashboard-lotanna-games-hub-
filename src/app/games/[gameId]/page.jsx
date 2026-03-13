"use client";
import { useState, useEffect, use } from 'react';
import { supabase } from '../../utils/supabaseClient';
import Link from 'next/link';
import Image from 'next/image';

// Engines & Data
import StoryEngine from '../../../components/StoryEngine';
import demoData from '../../../app/data/demo.json';
import MidnightEngine from '../../../components/MidnightEngine';
import midnightData from '../../../app/data/midnight.json';
import WalletConnect from '../../../components/WalletConnect';
import FugitiveEngine from '../../../components/FugitiveEngine';
import fugitiveData from '../../../app/data/fugitive.json';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&display=swap');

  :root {
    --void:        #04060d;
    --abyss:       #070b14;
    --deep:        #0c1120;
    --slate:       #1e2d45;
    --mist:        #2b3f5c;
    --ash:         #8ca0c0;
    --bone:        #c5d4e8;
    --white:       #eef3f9;
    --ember:       #b85c1a;
    --ember-hot:   #f08030;
    --gold:        #c4922a;
    --crimson:     #b02020;

    --font-title:  'Cinzel', serif;
    --font-body:   'Cormorant Garamond', serif;
  }

  .gd-page {
    background: var(--void);
    min-height: 100vh;
    font-family: var(--font-body);
    color: var(--bone);
    position: relative;
    overflow-x: hidden;
  }

  /* ── BACKGROUND BLUR ── */
  .gd-bg {
    position: absolute;
    inset: 0;
    z-index: 0;
    overflow: hidden;
  }
  .gd-bg-img {
    object-fit: cover;
    width: 100%;
    height: 100%;
    filter: blur(40px) brightness(0.25) saturate(1.2);
    transform: scale(1.1);
  }
  .gd-bg-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, rgba(4,6,13,0.4) 0%, rgba(4,6,13,0.95) 80%, var(--void) 100%);
  }

  /* ── MAIN CONTENT ── */
  .gd-content {
    position: relative;
    z-index: 10;
    max-width: 1200px;
    margin: 0 auto;
    padding: 6rem 2rem;
    display: grid;
    grid-template-columns: 1fr 1.5fr;
    gap: 4rem;
    align-items: center;
    min-height: 90vh;
  }

  /* ── POSTER ART ── */
  .gd-poster-wrap {
    position: relative;
    width: 100%;
    aspect-ratio: 3 / 4;
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 30px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05);
  }
  .gd-poster-wrap::after {
    content: '';
    position: absolute;
    inset: 0;
    box-shadow: inset 0 0 0 1px rgba(192,144,40,0.2);
    pointer-events: none;
  }

  /* ── DETAILS ── */
  .gd-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .gd-back {
    display: inline-flex;
    align-items: center;
    color: var(--gold);
    font-family: var(--font-title);
    font-size: 0.6rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    text-decoration: none;
    margin-bottom: 2rem;
    transition: color 0.2s;
  }
  .gd-back:hover { color: var(--ember-hot); }

  .gd-title {
    font-family: var(--font-title);
    font-size: clamp(2.5rem, 5vw, 4rem);
    font-weight: 700;
    color: var(--white);
    line-height: 1.1;
    margin: 0 0 1rem;
    text-shadow: 0 4px 20px rgba(0,0,0,0.5);
  }

  .gd-meta {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
    font-family: var(--font-title);
    font-size: 0.6rem;
    letter-spacing: 0.2em;
    color: var(--ash);
    text-transform: uppercase;
  }

  .gd-desc {
    font-size: 1.25rem;
    color: var(--bone);
    line-height: 1.7;
    margin-bottom: 3rem;
    white-space: pre-wrap;
  }

  /* ── CTA BUTTONS ── */
  .gd-actions {
    display: flex;
    gap: 1.5rem;
    align-items: center;
    flex-wrap: wrap;
  }

  .gd-btn-play {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1.2rem 3rem;
    background: linear-gradient(135deg, var(--ember), var(--ember-hot));
    color: var(--white);
    font-family: var(--font-title);
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    border: none;
    cursor: pointer;
    text-decoration: none;
    border-radius: 2px;
    box-shadow: 0 10px 30px rgba(184,92,26,0.3);
    transition: all 0.3s ease;
  }
  .gd-btn-play:hover {
    background: linear-gradient(135deg, var(--ember-hot), var(--gold));
    box-shadow: 0 0 30px rgba(240,128,48,0.5);
    transform: translateY(-2px);
  }

  .gd-btn-blog {
    display: inline-flex;
    align-items: center;
    padding: 1.1rem 2rem;
    background: rgba(255,255,255,0.03);
    border: 1px solid var(--slate);
    color: var(--ash);
    font-family: var(--font-title);
    font-size: 0.7rem;
    font-weight: 500;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    text-decoration: none;
    border-radius: 2px;
    backdrop-filter: blur(10px);
    transition: all 0.2s;
  }
  .gd-btn-blog:hover {
    background: rgba(255,255,255,0.08);
    border-color: var(--mist);
    color: var(--white);
  }

  /* ── GAME PLAYER OVERLAY (Reused from Games Page) ── */
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
    padding: .85rem 1.5rem;
    background: var(--abyss);
    border-bottom: 1px solid var(--slate);
    flex-shrink: 0;
  }
  .gl-player-title {
    font-family: var(--font-title);
    font-size: .9rem;
    color: var(--white);
    display: flex;
    align-items: center;
    gap: .75rem;
  }
  .gl-player-controls { display: flex; align-items: center; gap: 1rem; }
  .gl-player-close {
    width: 36px; height: 36px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(176,32,32,.15);
    border: 1px solid rgba(176,32,32,.35);
    color: #e07070;
    cursor: pointer;
    border-radius: 2px;
    transition: all .2s;
  }
  .gl-player-close:hover { background: rgba(176,32,32,.3); color: var(--white); }
  .gl-player-body { flex: 1; overflow: hidden; display: flex; flex-direction: column; }

  @media (max-width: 900px) {
    .gd-content { grid-template-columns: 1fr; gap: 2rem; padding: 4rem 1.5rem; }
    .gd-poster-wrap { max-width: 400px; margin: 0 auto; }
    .gd-title { text-align: center; }
    .gd-meta { justify-content: center; }
    .gd-desc { text-align: center; }
    .gd-actions { justify-content: center; }
  }
`;

export default function GameDetailPage({ params: paramsProp }) {
  const params = use(paramsProp);
  const { gameId } = params;

  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Player state
  const [isGamePlayerOpen, setIsGamePlayerOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    
    const fetchGameDetails = async () => {
      if (!gameId) return;
      try {
        // Fetch the game data
        const { data, error: fetchError } = await supabase
          .from('snippets')
          .select('*')
          .eq('id', gameId)
          .single();

        if (fetchError) throw fetchError;
        setGame(data);

        // Increment the view counter
        await supabase.rpc('increment_view_count', {
          item_id: gameId,
          item_type: 'snippet'
        });

      } catch (err) {
        console.error("Error fetching game:", err);
        setError("This title could not be found or may have been removed.");
      } finally {
        setLoading(false);
      }
    };

    fetchGameDetails();
  }, [gameId]);

  // Handle locking body scroll when game is open
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

  const handleMintTrigger = (itemName) => {
    if (!walletAddress) { alert("⚠️ HOLD UP! \n\nYou need to connect your wallet to save this item."); return; }
    alert(`✅ SIGNATURE REQUEST SENT\n\n👤 User: ${walletAddress}\n⚔️ Item: [${itemName}]`);
  };

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="gd-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'var(--font-title)', letterSpacing: '0.3em', color: 'var(--ash)', textTransform: 'uppercase' }}>
            Loading Title...
          </span>
        </div>
      </>
    );
  }

  if (error || !game) {
    return (
      <>
        <style>{styles}</style>
        <div className="gd-page" style={{ padding: '6rem 2rem', textAlign: 'center' }}>
          <h1 className="gd-title">Title Not Found</h1>
          <p className="gd-desc">{error}</p>
          <Link href="/games" className="gd-btn-blog">Return to Library</Link>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="gd-page">
        
        {/* Dynamic Background Blur */}
        {game.image_url && (
          <div className="gd-bg">
            <Image src={game.image_url} alt="bg" fill className="gd-bg-img" unoptimized />
            <div className="gd-bg-overlay" />
          </div>
        )}

        <div className="gd-content">
          {/* Left Column: Details */}
          <div className="gd-info">
            <Link href="/games" className="gd-back">
              &larr; Back to Library
            </Link>
            
            <h1 className="gd-title">{game.title}</h1>
            
            <div className="gd-meta">
              <span>Interactive Fiction</span>
              <span>•</span>
              <span>{game.view_count || 0} Views</span>
            </div>
            
            <p className="gd-desc">{game.description}</p>
            
            <div className="gd-actions">
              {game.game_url === '#local-demo' ? (
                <button className="gd-btn-play" onClick={() => setIsGamePlayerOpen(true)}>
                  ▶ Play Now
                </button>
              ) : (
                <a href={game.game_url} target="_blank" rel="noopener noreferrer" className="gd-btn-play">
                  ▶ Play Externally
                </a>
              )}
              
              <Link href="/blog" className="gd-btn-blog">
                Read Devlogs
              </Link>
            </div>
          </div>

          {/* Right Column: Poster */}
          <div className="gd-poster-wrap">
             {game.image_url ? (
               <Image src={game.image_url} alt={game.title} fill style={{ objectFit: 'cover' }} priority />
             ) : (
               <div style={{ width: '100%', height: '100%', background: 'var(--deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', opacity: 0.3 }}>
                 ⚔️
               </div>
             )}
          </div>
        </div>

        {/* --- GAME PLAYER OVERLAY --- */}
        {isGamePlayerOpen && (
          <div className="gl-player-overlay" onClick={(e) => { if (e.target === e.currentTarget) setIsGamePlayerOpen(false); }}>
            <div className="gl-player-header">
              <span className="gl-player-title">▶ {game.title}</span>
              <div className="gl-player-controls">
                {game.title !== 'The Midnight Suspect' && (
                  <WalletConnect onConnect={(addr) => setWalletAddress(addr)} />
                )}
                <button onClick={() => setIsGamePlayerOpen(false)} className="gl-player-close">✕</button>
              </div>
            </div>

            <div className="gl-player-body">
              {game.title === 'Supernatural Fugitive' || game.title === "Keeper's Vigil" ? (
                <FugitiveEngine storyContent={fugitiveData} session={session} />
              ) : game.title === 'The Midnight Suspect' ? (
                <MidnightEngine storyContent={midnightData} />
              ) : (
                <StoryEngine storyContent={demoData} onMintTrigger={handleMintTrigger} />
              )}
            </div>
          </div>
        )}

      </div>
    </>
  );
}