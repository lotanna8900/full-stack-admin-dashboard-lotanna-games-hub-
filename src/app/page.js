"use client";
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from './utils/supabaseClient';
import Link from 'next/link';
import Image from 'next/image';

// ─── STYLES ──────────────────────────────────────────────────────────────────
const pageStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cinzel:wght@400;500;600;700&family=Crimson+Pro:ital,wght@0,300;0,400;0,500;1,300;1,400&display=swap');

  :root {
    --ink:        #04060d;
    --void:       #070b14;
    --abyss:      #0c1120;
    --deep:       #111827;
    --navy:       #162035;
    --slate:      #1e2d45;
    --mist:       #2b3f5c;
    --steel:      #3d5278;
    
    --fog:        #7c93b8; 
    --ash:        #a5b6cf; 
    --bone:       #e2e8f0; 
    --white:      #ffffff;

    --ember:      #b85c1a;
    --ember-mid:  #d4711f;
    --ember-hot:  #f08030;
    
    --gold:       #d4a83b; 
    --gold-mid:   #eebb4d;
    --gold-bright:#f4cd67;

    --soul-deep:  #2d1a5c;
    --soul:       #5535a0;
    --soul-mid:   #7b52c8;
    --soul-bright:#a07ae0;

    --blood:      #7a1515;
    --crimson:    #b02020;

    --font-display: 'Cinzel Decorative', serif;
    --font-title:   'Cinzel', serif;
    --font-body:    'Crimson Pro', serif;

    --glow-gold:  0 0 30px rgba(212,168,59,0.35), 0 0 60px rgba(212,168,59,0.15);
    --glow-soul:  0 0 30px rgba(115,80,200,0.4),  0 0 70px rgba(115,80,200,0.15);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .ll-page {
    background: var(--void);
    color: var(--bone);
    font-family: var(--font-body);
    overflow-x: hidden;
    position: relative;
  }

  .ll-page::before {
    content: '';
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 9999;
    opacity: 0.04;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 128px;
  }

  .ll-loading {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--void);
  }
  @keyframes pulse { 0%,100%{opacity:.2} 50%{opacity:1} }
  .ll-loading-text {
    font-family: var(--font-title);
    font-size: 0.85rem;
    letter-spacing: .3em;
    color: var(--fog);
    text-transform: uppercase;
    animation: pulse 2.2s ease infinite;
  }

  /* ══════════════════════════════════════════════════
     HERO & SHARED BUTTONS
  ══════════════════════════════════════════════════ */
  .ll-hero {
    position: relative;
    min-height: 100vh;
    display: grid;
    /* CHANGED: Gave the image column more space (1.2fr) so it isn't hidden on PC */
    grid-template-columns: 1fr 1.2fr; 
    align-items: center;
    overflow: hidden;
  }
  .ll-hero-bg {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 80% 60% at 70% 50%, rgba(45,26,92,0.55) 0%, transparent 65%),
      radial-gradient(ellipse 50% 80% at 100% 80%, rgba(184,92,26,0.18) 0%, transparent 55%),
      radial-gradient(ellipse 100% 100% at 0% 0%, rgba(22,32,53,0.9) 0%, transparent 50%),
      var(--void);
    z-index: 0;
  }
  .ll-hero-bg::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px);
    background-size: 60px 60px;
    mask-image: radial-gradient(ellipse at center, black 20%, transparent 75%);
  }

  .ll-hero-left {
    position: relative;
    z-index: 2;
    padding: 8rem 3rem 6rem 5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .ll-studio-badge {
    display: inline-flex;
    align-items: center;
    gap: .6rem;
    width: fit-content;
    padding: .35rem .9rem;
    border: 1px solid rgba(115,80,200,.4);
    background: rgba(85,53,160,.12);
    border-radius: 2px;
  }
  .ll-studio-badge-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--soul-bright);
    box-shadow: 0 0 6px var(--soul-bright);
    animation: pulse 2s ease infinite;
  }
  .ll-studio-badge-text {
    font-family: var(--font-title);
    font-size: 0.75rem;
    letter-spacing: .2em;
    color: var(--soul-bright);
    text-transform: uppercase;
  }

  .ll-hero-headline {
    font-family: var(--font-display);
    font-size: clamp(2.5rem, 5vw, 5rem); 
    font-weight: 700;
    line-height: 1.05;
    color: var(--white);
    text-shadow: 0 2px 40px rgba(0,0,0,.8);
  }

  .ll-hero-actions { display: flex; gap: 1rem; flex-wrap: wrap; padding-top: .5rem; }

  .ll-btn-soul {
    display: inline-flex;
    align-items: center;
    gap: .6rem;
    padding: 1rem 2.25rem;
    background: linear-gradient(135deg, var(--soul-deep), var(--soul));
    color: var(--bone);
    font-family: var(--font-title);
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: .15em;
    text-transform: uppercase;
    text-decoration: none;
    border: 1px solid rgba(115,80,200,.6);
    border-radius: 4px;
    cursor: pointer;
    box-shadow: var(--glow-soul);
    transition: all .25s ease;
  }
  .ll-btn-soul:hover {
    background: linear-gradient(135deg, var(--soul), var(--soul-mid));
    transform: translateY(-1px);
    box-shadow: 0 0 40px rgba(115,80,200,.5), 0 0 80px rgba(115,80,200,.2);
  }

  .ll-btn-ghost {
    display: inline-flex;
    align-items: center;
    gap: .6rem;
    padding: 1rem 1.75rem;
    background: transparent;
    color: var(--bone);
    font-family: var(--font-title);
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: .15em;
    text-transform: uppercase;
    text-decoration: none;
    border: 1px solid var(--fog);
    border-radius: 4px;
    cursor: pointer;
    transition: all .25s ease;
  }
  .ll-btn-ghost:hover { border-color: var(--white); color: var(--white); background: rgba(255,255,255,.08); }

  .ll-hero-right { position: relative; z-index: 2; height: 100%; min-height: 100vh; display: flex; align-items: stretch; }
  .ll-hero-image-wrap { position: relative; width: 100%; overflow: hidden; }
  
  .ll-hero-image-wrap::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 15%; background: linear-gradient(to right, var(--void), transparent); z-index: 2; }
  .ll-hero-image-wrap::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 20%; background: linear-gradient(to top, var(--void), transparent); z-index: 2; }
  
  .ll-hero-cover-img { object-fit: cover; object-position: center; width: 100%; height: 100%; }
  
  .ll-hero-cover-placeholder {
    width: 100%; height: 100%; min-height: 100vh;
    background: radial-gradient(ellipse 80% 100% at 50% 30%, rgba(85,53,160,.5) 0%, transparent 60%), linear-gradient(to bottom, var(--abyss), var(--void));
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-title); font-size: 0.85rem; letter-spacing: .2em; color: var(--fog); text-transform: uppercase;
  }

  /* ══════════════════════════════════════════════════
     SECTION 2 — GAME LIBRARY
  ══════════════════════════════════════════════════ */
  .ll-games-library { padding: 6rem 2rem; background: var(--abyss); position: relative; border-top: 1px solid var(--slate); }
  .ll-games-inner { max-width: 1200px; margin: 0 auto; }
  .ll-section-eyebrow { font-family: var(--font-title); font-size: 0.85rem; letter-spacing: .2em; color: var(--ember-mid); text-transform: uppercase; margin-bottom: 1rem; display: flex; align-items: center; gap: .6rem; }
  .ll-section-eyebrow::before { content: ''; display: inline-block; width: 24px; height: 2px; background: var(--ember-mid); }
  .ll-manifesto-heading { font-family: var(--font-display); font-size: 2rem; font-weight: 700; line-height: 1.25; color: var(--white); margin-bottom: 1rem; }
  .ll-manifesto-heading em { font-style: normal; display: block; background: linear-gradient(135deg, var(--soul-mid), var(--soul-bright)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

  .ll-games-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-top: 3rem; }

  .ll-game-card { background: var(--void); border: 1px solid var(--slate); border-radius: 6px; padding: 2.5rem; display: flex; flex-direction: column; position: relative; overflow: hidden; transition: border-color .3s; }
  .ll-game-card:hover { border-color: rgba(192,144,40,.4); }

  .ll-btn-primary { display: inline-flex; align-items: center; gap: .6rem; padding: 1rem 2rem; background: linear-gradient(135deg, var(--ember) 0%, var(--ember-hot) 100%); color: var(--white); font-family: var(--font-title); font-size: 0.85rem; font-weight: 600; letter-spacing: .15em; text-transform: uppercase; text-decoration: none; border: none; border-radius: 4px; cursor: pointer; box-shadow: 0 4px 24px rgba(184,92,26,.4), inset 0 1px 0 rgba(255,255,255,.15); transition: all .25s ease; }
  .ll-btn-primary:hover { box-shadow: 0 6px 32px rgba(240,128,48,.5); transform: translateY(-1px); }

  /* ══════════════════════════════════════════════════
     SECTION 3 — NEWSLETTER & DASHBOARD
  ══════════════════════════════════════════════════ */
  .ll-newsletter { padding: 5rem 2rem; background: var(--void); border-top: 1px solid var(--slate); border-bottom: 1px solid var(--slate); text-align: center; }
  .ll-newsletter-inner { max-width: 600px; margin: 0 auto; }
  .ll-newsletter-form { display: flex; gap: 0.5rem; margin-top: 2rem; justify-content: center; flex-wrap: wrap; }
  .ll-input { flex: 1; min-width: 250px; padding: 1rem 1.5rem; background: var(--abyss); border: 1px solid var(--slate); color: var(--bone); border-radius: 4px; font-family: var(--font-body); font-size: 1rem; outline: none; }
  .ll-input:focus { border-color: var(--gold-mid); }

  .ll-dashboard { padding: 6rem 2rem; background: var(--abyss); }
  .ll-dashboard-inner { max-width: 1200px; margin: 0 auto; }
  .ll-dashboard-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2.5rem; }
  .ll-greeting-sub { font-family: var(--font-title); font-size: 0.85rem; letter-spacing: .2em; color: var(--ember-mid); text-transform: uppercase; display: flex; align-items: center; gap: .6rem; margin-bottom: .6rem; }
  .ll-greeting-sub::before { content: ''; display: inline-block; width: 24px; height: 2px; background: var(--ember-mid); }
  .ll-greeting-title { font-family: var(--font-display); font-size: 2rem; color: var(--white); line-height: 1.1; }
  
  .ll-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem; margin-bottom: 2rem; }
  .ll-stat-card { background: var(--deep); border: 1px solid var(--slate); border-radius: 6px; padding: 2rem; display: flex; flex-direction: column; gap: .75rem; text-decoration: none; color: inherit; transition: all .2s; }
  .ll-stat-card:hover { background: var(--navy); border-color: var(--steel); }
  .ll-stat-card-wide { grid-column: span 2; }
  
  .ll-stat-icon-wrap { width: 44px; height: 44px; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; margin-bottom: .5rem; }
  .ll-stat-label { font-family: var(--font-title); font-size: 0.75rem; letter-spacing: .15em; color: var(--fog); text-transform: uppercase; }
  .ll-stat-value { font-family: var(--font-display); font-size: 2.5rem; font-weight: 700; color: var(--white); line-height: 1; }

  .ll-social-links-container { display: flex; gap: 1rem; margin-top: 1rem; flex-wrap: wrap; }
  .ll-social-badge { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: var(--void); border: 1px solid var(--slate); border-radius: 4px; color: var(--bone); text-decoration: none; font-family: var(--font-title); font-size: 0.75rem; text-transform: uppercase; transition: all .2s; }
  .ll-social-badge:hover { background: var(--navy); border-color: var(--gold-mid); color: var(--gold-bright); }

  .ll-panel { background: var(--deep); border: 1px solid var(--slate); border-radius: 6px; padding: 2.5rem; }
  .ll-panel-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--slate); }
  .ll-panel-title { font-family: var(--font-title); font-size: 0.85rem; letter-spacing: .15em; color: var(--bone); text-transform: uppercase; }
  .ll-activity-item { display: flex; align-items: flex-start; gap: 1.25rem; padding: 1.25rem 0; border-bottom: 1px solid var(--slate); text-decoration: none; color: inherit; transition: background .15s; margin: 0 -1.5rem; padding-left: 1.5rem; padding-right: 1.5rem; }
  .ll-activity-item:hover { background: rgba(255,255,255,.03); }
  .ll-activity-icon { width: 36px; height: 36px; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0; border: 1px solid var(--slate); }

  /* ADDED: Missing text styles to prevent long titles from breaking the layout */
  .ll-activity-text { 
    font-size: 1.05rem; 
    color: var(--ash); 
    line-height: 1.5; 
    word-wrap: break-word; 
    min-width: 0; /* Critical: forces flex children to wrap text instead of pushing wide */
    flex: 1;
  }
  .ll-activity-text strong { color: var(--bone); font-weight: 500; }
  .ll-activity-time { font-size: 0.85rem; color: var(--fog); margin-top: 0.35rem; }

  /* ── RESPONSIVE OVERRIDES ── */
  @media (max-width: 900px) {
    .ll-hero { grid-template-columns: 1fr; }
    
    /* MOBILE IMAGE FIX */
    .ll-hero-right { 
        position: absolute; 
        inset: 0; 
        z-index: 1; 
        opacity: 0.25; 
        display: block; 
    }
    .ll-hero-image-wrap { height: 100%; width: 100%; position: absolute; inset: 0; }
    .ll-hero-cover-img { height: 100% !important; object-fit: cover; }
    .ll-hero-image-wrap::before, .ll-hero-image-wrap::after { display: none; }
    .ll-hero-game-tag { display: none; }
    
    .ll-hero-left { z-index: 2; padding: 7rem 2rem 5rem; }

    /* Forces the Follow Us grid card to stack cleanly */
    .ll-stat-card-wide { grid-column: span 1; }
  }

  /* ADDED: Deep mobile cleanup for the Community Hub */
  @media (max-width: 600px) {
    /* Reduce massive paddings so mobile screens can actually fit the content */
    .ll-dashboard { padding: 4rem 1.25rem; }
    .ll-stat-card { padding: 1.5rem; }
    .ll-panel { padding: 1.5rem; }
    
    /* Adjust the negative margins on the activity feed so they don't clip */
    .ll-activity-item { 
      margin: 0 -1rem; 
      padding-left: 1rem; 
      padding-right: 1rem; 
      gap: 1rem; 
    }
    
    /* Stack the social buttons neatly on top of each other */
    .ll-social-links-container { 
      flex-direction: column; 
      align-items: stretch; 
    }
    .ll-social-badge { 
      justify-content: center; 
    }
    
    .ll-greeting-title { font-size: 1.75rem; }
  }

  @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  .ll-fade-up { opacity: 0; animation: fadeUp .7s ease forwards; }
  .ll-delay-1 { animation-delay: .1s; } .ll-delay-2 { animation-delay: .2s; } .ll-delay-3 { animation-delay: .35s; } .ll-delay-4 { animation-delay: .5s; }
`;

export default function HomePage() {
  const router = useRouter();

  // --- STATE ---
  const [projectCount, setProjectCount] = useState(0);
  const [memberCount, setMemberCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');

  // Newsletter State
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState('idle'); 
  
  // Dynamic Game State & Carousel
  const [featuredGames, setFeaturedGames] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [libraryGames, setLibraryGames] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase.from('profiles').select('username').eq('id', session.user.id).single();
        setUsername(profile?.username || 'User');
      } else {
        setUsername('Guest');
      }

      // Fetch dynamic games (snippets)
      const { data: snippetsData } = await supabase
        .from('snippets')
        .select('*')
        .order('created_at', { ascending: false });

      if (snippetsData && snippetsData.length > 0) {
        // Split data into Pinned (Carousel) and Unpinned (Library)
        const pinned = snippetsData.filter(game => game.is_pinned);
        const unpinned = snippetsData.filter(game => !game.is_pinned);

        setFeaturedGames(pinned.length > 0 ? pinned : [snippetsData[0]]); // Fallback to newest if none pinned
        setLibraryGames(unpinned.slice(0, 3)); // Show up to 3 unpinned games in library
      }

      const { count: projCount } = await supabase.from('projects').select('*', { count: 'exact', head: true });
      setProjectCount(projCount || 0);
      const { data: memCount } = await supabase.rpc('get_public_member_count');
      setMemberCount(memCount || 0);

      const { data: recentCommentsData } = await supabase.from('comments').select('*, post:posts(id, title), author:profiles(username)').order('created_at', { ascending: false }).limit(5);
      setRecentActivity(recentCommentsData ? recentCommentsData.map(c => ({ ...c, type: 'comment' })) : []);

      setLoading(false);
    };
    fetchDashboardData();
  }, []);

  // CAROUSEL LOGIC: Cycle games every 7 seconds
  useEffect(() => {
    if (featuredGames.length <= 1) return; 
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredGames.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [featuredGames]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };
  const getRelativeTime = (dateString) => {
    const diff = Math.floor((new Date() - new Date(dateString)) / 1000);
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) return <><style>{pageStyles}</style><div className="ll-loading"><span className="ll-loading-text">Loading Hub</span></div></>;

  const activeFeature = featuredGames[currentSlide];

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribeStatus('loading');

    try {

      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        await supabase
          .from('profiles')
          .update({ email_on_newsletter: true })
          .eq('id', session.user.id);
      }

      const { error } = await supabase
        .from('subscribers')
        .insert([{ email }]);

      if (error && error.code !== '23505') throw error;

      setSubscribeStatus('success');
      setEmail('');
      
      setTimeout(() => setSubscribeStatus('idle'), 3000);
      
    } catch (error) {
      console.error('Subscription error:', error);
      setSubscribeStatus('error');
      setTimeout(() => setSubscribeStatus('idle'), 3000);
    }
  };

  return (
    <>
    
      <style>{pageStyles}</style>
      <div className="ll-page">

        {/* 1. DYNAMIC ROTATING HERO SECTION */}
        {activeFeature && (
          <section className="ll-hero">
            <div className="ll-hero-bg" />
            
            
            <div className="ll-hero-left" key={`text-${activeFeature.id}`}>
              <div className="ll-studio-badge ll-fade-up ll-delay-1">
                <span className="ll-studio-badge-dot" />
                <span className="ll-studio-badge-text">
                  {activeFeature.game_url === '#local-demo' ? 'Free Demo Available' : 'Featured Release'}
                </span>
              </div>
              <h1 className="ll-hero-headline ll-fade-up ll-delay-2">
                {activeFeature.title}
              </h1>
              
              <div className="ll-hero-actions ll-fade-up ll-delay-3">
                <Link href={`/games/${activeFeature.slug || activeFeature.id}`} className="ll-btn-soul">
                  <span>▶ Play Now</span>
                </Link>
              </div>
            </div>

            <div className="ll-hero-right" key={`img-${activeFeature.id}`}>
              <div className="ll-hero-image-wrap">
                {activeFeature.image_url ? (
                  <Image src={activeFeature.image_url} alt={activeFeature.title} fill priority className="ll-hero-cover-img ll-fade-up" />
                ) : (
                  <div className="ll-hero-cover-placeholder ll-fade-up">Cover Art Placeholder</div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* 2. MORE GAMES LIBRARY */}
        {libraryGames.length > 0 && (
          <section id="library" className="ll-games-library">
            <div className="ll-games-inner">
              <p className="ll-section-eyebrow">Explore</p>
              <h2 className="ll-manifesto-heading">More <em>Titles.</em></h2>
              
              <div className="ll-games-grid">
                {libraryGames.map(game => (
                  <div key={game.id} className="ll-game-card">
                    <div style={{fontFamily: 'var(--font-title)', fontSize: '0.75rem', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '1rem'}}>
                      {game.game_url === '#local-demo' ? 'Free Demo' : 'Full Release'}
                    </div>
                    <h3 style={{fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: 'var(--white)', marginBottom: '0.5rem'}}>{game.title}</h3>
                    <p style={{color: 'var(--ash)', lineHeight: '1.6', marginBottom: '2rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {game.description}
                    </p>
                    <div style={{display: 'flex', gap: '0.75rem', flexWrap: 'wrap'}}>
                      <Link href={`/games/${game.slug || game.id}`} className="ll-btn-primary" style={{width: '100%', justifyContent: 'center'}}>
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                <Link href="/games" className="ll-btn-ghost">Browse Full Library →</Link>
              </div>
            </div>
          </section>
        )}

        {/* 3. NEWSLETTER SIGNUP */}
        <section className="ll-newsletter">
          <div className="ll-newsletter-inner">
            <h2 className="ll-manifesto-heading">Join the <em>Vanguard.</em></h2>
            <p style={{color: 'var(--ash)', fontSize: '1.1rem', marginTop: '0.5rem'}}>
              Get notified when new chapters, games, and lore drop. No spam, just stories.
            </p>
            <form className="ll-newsletter-form" onSubmit={handleSubscribe}>
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="ll-input" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={subscribeStatus === 'loading' || subscribeStatus === 'success'}
                required 
              />
              <button 
                type="submit" 
                className="ll-btn-primary"
                disabled={subscribeStatus === 'loading' || subscribeStatus === 'success'}
              >
                {subscribeStatus === 'loading' ? 'Joining...' : 
                 subscribeStatus === 'success' ? '✓ Welcome to the Vanguard' : 
                 subscribeStatus === 'error' ? 'Error. Try Again' : 
                 'Subscribe'}
              </button>
            </form>
          </div>
        </section>

        {/* 4. DASHBOARD & SOCIALS */}
        <section className="ll-dashboard">
          <div className="ll-dashboard-inner">
            <div className="ll-dashboard-header">
              <div>
                <p className="ll-greeting-sub">Community Hub</p>
                <h2 className="ll-greeting-title">The Lab</h2>
                <p className="ll-greeting-body">{getGreeting()}, {username}. Here's what's happening.</p>
              </div>
            </div>

            <div className="ll-stats-grid">
              <div className="ll-stat-card">
                <div className="ll-stat-icon-wrap" style={{ background: 'rgba(139,92,246,.15)', border: '1px solid rgba(139,92,246,.3)' }}>📁</div>
                <div className="ll-stat-label">Active Projects</div>
                <div className="ll-stat-value">{projectCount}</div>
              </div>
              <div className="ll-stat-card">
                <div className="ll-stat-icon-wrap" style={{ background: 'rgba(59,130,246,.15)', border: '1px solid rgba(59,130,246,.3)' }}>👥</div>
                <div className="ll-stat-label">Community Members</div>
                <div className="ll-stat-value">{memberCount}</div>
              </div>

              <div className="ll-stat-card ll-stat-card-wide">
                <div className="ll-stat-icon-wrap" style={{ background: 'rgba(245,158,11,.15)', border: '1px solid rgba(245,158,11,.3)' }}>🌐</div>
                <div className="ll-stat-label">Follow The Studio</div>
                <div className="ll-social-links-container">
                  <a href="https://x.com/LotaLabs" target="_blank" rel="noreferrer" className="ll-social-badge">🐦 Twitter / X</a>
                  <a href="https://youtube.com/@playlotalabs" target="_blank" rel="noreferrer" className="ll-social-badge">📺 YouTube</a>
                  <a href="https://instagram.com/lota_labs" target="_blank" rel="noreferrer" className="ll-social-badge">📸 Instagram</a>
                </div>
              </div>
            </div>

            <div className="ll-panel">
              <div className="ll-panel-header">
                <div>
                  <div className="ll-panel-title">Recent Activity</div>
                  <div className="ll-panel-meta">Latest across the platform</div>
                </div>
                <Link href="/blog" className="ll-panel-link">View All Forum Posts →</Link>
              </div>
              <div className="ll-activity-feed">
                {recentActivity.length === 0 ? (
                  <div style={{padding: '3rem', textAlign: 'center', color: 'var(--fog)'}}>No recent activity</div>
                ) : (
                  recentActivity.map((activity) => (
                    <Link key={activity.id} href={`/blog/${activity.post?.id}`} className="ll-activity-item">
                      <div className="ll-activity-icon" style={{background: 'rgba(59,130,246,.15)', borderColor: 'rgba(59,130,246,.3)'}}>💬</div>
                      <div>
                        <div className="ll-activity-text">
                          <span><strong>{activity.author?.username || 'Anonymous'}</strong> commented on <strong>"{activity.post?.title || 'a post'}"</strong></span>
                        </div>
                        <div className="ll-activity-time">{getRelativeTime(activity.created_at)}</div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}