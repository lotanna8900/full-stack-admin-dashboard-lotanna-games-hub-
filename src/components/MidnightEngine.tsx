"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { Story } from 'inkjs';
import { supabase } from '../app/utils/supabaseClient';

interface MidnightEngineProps {
  storyContent: any;
  session?: any;
}

interface StoryBlock {
  type: 'text' | 'image';
  content: string;
  id: string;
}

interface Toast {
  id: string;
  message: string;
  delta: number;
  visible: boolean;
}

const GAME_ID = 'midnight_suspect';
const STRING_STATS = ['mood']; // We track the 'mood' variable from your Inky file

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=Cinzel:wght@400;500;600;700&family=Cormorant:ital,wght@0,400;1,400&display=swap');
  @import url('https://fonts.cdnfonts.com/css/opendyslexic');

  :root {
    --void: #06080f;
    --abyss: #0a0d1a;
    --murk: #141929;
    --slate: #1e2640;
    --mist: #2a3350;
    --ash: #3d4d6b;
    --fade: #5a6a8a;
    --silver: #8899bb;
    --bone: #c8d4e8;
    --parchment: #e8dfc8;
    --ember: #c8692a;
    --ember-bright: #e07830;
    --gold: #c8a84a;
    --crimson: #c0292a;
    --font-display: 'Cinzel', serif;
    --font-body: 'Cormorant Garamond', serif;
  }

  .midnight-root {
    position: relative;
    overflow: hidden;
    height: 100%;
    width: 100%;
    background-color: var(--theme-bg, var(--void));
    font-family: var(--theme-font, var(--font-body));
    color: var(--theme-text, var(--bone));
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  .midnight-root::before {
    content: '';
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 1000;
    opacity: 0.035;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    background-repeat: repeat;
    background-size: 128px;
  }

  .hud-bar {
    position: absolute;
    top: 0; left: 0; right: 0; z-index: 100;
    display: flex; justify-content: space-between; align-items: center;
    padding: 1rem 1.5rem;
    background: linear-gradient(to bottom, rgba(6,8,15,0.98) 60%, transparent);
    pointer-events: none;
  }

  .hud-title {
    font-family: var(--font-display); font-size: 0.65rem; font-weight: 600;
    letter-spacing: 0.35em; color: var(--ash); text-transform: uppercase;
    pointer-events: none;
  }

  .hud-actions { display: flex; gap: 0.6rem; pointer-events: all; }

  .btn-hud {
    display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1rem;
    border-radius: 2px; font-family: var(--font-display); font-size: 0.6rem;
    font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase;
    cursor: pointer; transition: all 0.2s ease; border: 1px solid;
    position: relative; overflow: hidden;
  }
  .btn-hud::before { content: ''; position: absolute; inset: 0; opacity: 0; transition: opacity 0.2s ease; }
  .btn-hud:hover::before { opacity: 1; }

  .btn-restart { background: transparent; color: var(--fade); border-color: var(--mist); }
  .btn-restart:hover { color: var(--bone); border-color: var(--bone); }

  .btn-stats {
    background: linear-gradient(135deg, rgba(200,105,42,0.15), rgba(200,168,74,0.15));
    color: var(--gold); border-color: rgba(200,168,74,0.4);
  }
  .btn-stats:hover {
    background: linear-gradient(135deg, rgba(200,105,42,0.3), rgba(200,168,74,0.3));
    border-color: var(--gold); color: var(--gold);
    box-shadow: 0 0 20px rgba(200,168,74,0.2);
  }

  /* ── OVERLAYS (Stats & Settings) ── */
  .stats-overlay {
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%; z-index: 200;
    background: var(--theme-bg, var(--abyss)); 
    display: flex; flex-direction: column;
    transform: translateY(-100%);
    transition: transform 0.45s cubic-bezier(0.76, 0, 0.24, 1), background-color 0.3s ease;
    overflow-y: auto;
  }
  .stats-overlay.open { transform: translateY(0); }
  .stats-overlay-inner { max-width: 680px; margin: 0 auto; width: 100%; padding: 2rem 2rem 4rem; }

  .stats-header {
    display: flex; justify-content: space-between; align-items: center;
    padding: 1.5rem 0 1rem; border-bottom: 1px solid var(--slate); margin-bottom: 1.5rem;
  }
  .stats-title { font-family: var(--font-display); font-size: 0.65rem; letter-spacing: 0.4em; font-weight: 600; color: var(--ember); text-transform: uppercase; }
  .btn-close {
    background: transparent; border: 1px solid var(--mist); color: var(--fade);
    width: 36px; height: 36px; border-radius: 2px; font-size: 1rem; cursor: pointer;
    display: flex; align-items: center; justify-content: center; transition: all 0.2s;
  }
  .btn-close:hover { border-color: var(--crimson); color: var(--crimson); }

  /* ── SLIDER RESET ── */
  input[type=range] { -webkit-appearance: none; width: 100%; background: transparent; }
  input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none; height: 20px; width: 20px; border-radius: 50%;
    background: var(--gold); cursor: pointer; margin-top: -8px; box-shadow: 0 0 10px rgba(200,168,74,0.4);
  }
  input[type=range]::-webkit-slider-runnable-track { width: 100%; height: 4px; cursor: pointer; background: var(--slate); border-radius: 2px; }

  .section-label {
    font-family: var(--font-display); font-size: 0.55rem; letter-spacing: 0.4em;
    font-weight: 600; color: var(--ember); text-transform: uppercase; margin: 2rem 0 1rem;
    padding-bottom: 0.5rem; border-bottom: 1px solid rgba(200,105,42,0.2); display: flex; align-items: center; gap: 0.75rem;
  }
  .section-label::after { content: ''; flex: 1; height: 1px; background: linear-gradient(to right, rgba(200,105,42,0.2), transparent); }

  .profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 0.5rem; }
  .profile-field { background: rgba(20, 25, 41, 0.4); border: 1px solid var(--slate); padding: 0.8rem 1rem; border-radius: 2px; }
  .profile-field-label { font-family: var(--font-display); font-size: 0.5rem; letter-spacing: 0.3em; color: var(--ash); text-transform: uppercase; margin-bottom: 0.3rem; display: block; }
  .profile-field-value { font-family: var(--font-body); font-size: 1.1rem; color: var(--parchment); font-style: italic; text-transform: capitalize; }

  /* ── STORY COLUMN & TEXT ── */
  .story-column { height: 100%; overflow-y: auto; padding: 0 2rem 6rem; scroll-behavior: smooth; }
  .story-column::-webkit-scrollbar { width: 3px; }
  .story-column::-webkit-scrollbar-track { background: transparent; }
  .story-column::-webkit-scrollbar-thumb { background: var(--mist); }

  .story-text-container { max-width: 640px; margin: 0 auto; padding-top: 5rem; }

  @keyframes fadeInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes inkBleed { 0% { opacity: 0; filter: blur(3px); transform: translateY(4px); } 40% { filter: blur(0.5px); } 100% { opacity: 1; filter: blur(0); transform: translateY(0); } }

  .story-paragraph {
    font-family: var(--theme-font, var(--font-body));
    font-size: var(--theme-size, 1.2rem);
    line-height: 1.9;
    color: var(--theme-text, var(--bone));
    margin-bottom: 1.5rem;
    opacity: 0;
    animation: inkBleed 0.7s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    transition: color 0.3s ease, font-size 0.2s ease;
  }

  .story-image-wrap { margin: 2.5rem 0; text-align: center; opacity: 0; animation: fadeInUp 0.8s ease forwards; }
  .story-image { max-width: 100%; border-radius: 2px; border: 1px solid var(--slate); box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(200,168,74,0.1); filter: grayscale(100%); transition: filter 0.4s ease; }
  .story-image:hover { filter: grayscale(0%); }

  .story-divider { display: flex; align-items: center; gap: 1rem; margin: 2.5rem 0; color: var(--mist); opacity: 0; animation: fadeInUp 0.6s ease forwards; }
  .story-divider::before, .story-divider::after { content: ''; flex: 1; height: 1px; background: linear-gradient(to right, transparent, var(--slate)); }
  .story-divider::after { background: linear-gradient(to left, transparent, var(--slate)); }
  .divider-glyph { font-size: 0.6rem; letter-spacing: 0.5em; font-family: var(--font-display); color: var(--ash); text-transform: uppercase; }

  /* ── CHOICES ── */
  .choices-wrapper { max-width: 640px; margin: 2.5rem auto 0; display: flex; flex-direction: column; gap: 0; }
  .choice-item { position: relative; opacity: 0; animation: fadeInUp 0.5s ease forwards; }
  .choice-btn {
    width: 100%; background: transparent; border: 1px solid var(--slate); border-top: none;
    color: var(--theme-text-muted, var(--silver)); padding: 1.1rem 1.5rem; text-align: left; cursor: pointer;
    font-family: var(--theme-font, var(--font-body)); font-size: 1.05rem; font-style: italic; line-height: 1.5;
    transition: all 0.25s ease; position: relative; overflow: hidden; display: flex; align-items: flex-start; gap: 1rem;
  }
  .choice-item:first-child .choice-btn { border-top: 1px solid var(--slate); border-top-left-radius: 2px; border-top-right-radius: 2px; }
  .choice-item:last-child .choice-btn { border-bottom-left-radius: 2px; border-bottom-right-radius: 2px; }
  .choice-btn::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 2px; background: var(--ember); transform: scaleY(0); transition: transform 0.2s ease; }
  .choice-btn:hover::before { transform: scaleY(1); }
  .choice-btn:hover { background: rgba(200,105,42,0.06); color: var(--theme-text-bold, var(--parchment)); border-color: rgba(200,105,42,0.3); padding-left: 2rem; }
  .choice-glyph { font-family: var(--font-display); font-size: 0.55rem; letter-spacing: 0.2em; color: var(--ash); text-transform: uppercase; padding-top: 0.3rem; transition: color 0.2s; }
  .choice-btn:hover .choice-glyph { color: var(--ember); }

  .loading-screen { display: flex; align-items: center; justify-content: center; height: 100%; background: var(--void); }
  @keyframes pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
  .loading-text { font-family: var(--font-display); font-size: 0.6rem; letter-spacing: 0.5em; color: var(--ash); text-transform: uppercase; animation: pulse 2s ease infinite; }
`;

// ── CUSTOMIZATION DICTIONARIES ──
const THEMES: Record<string, any> = {
  dark: { bg: 'var(--void)', text: 'var(--bone)', textBold: 'var(--parchment)', textMuted: 'var(--silver)' },
  sepia: { bg: '#f4ecd8', text: '#4a3b2c', textBold: '#2c1e12', textMuted: '#8a735c' },
  light: { bg: '#f8f9fa', text: '#334155', textBold: '#0f172a', textMuted: '#64748b' }
};

const FONTS: Record<string, string> = {
  serif: 'var(--font-body)',
  sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  dyslexic: '"OpenDyslexic", sans-serif'
};

export default function MidnightEngine({ storyContent, session }: MidnightEngineProps) {
  const [inkStory, setInkStory] = useState<Story | null>(null);
  const [currentBlocks, setCurrentBlocks] = useState<StoryBlock[]>([]);
  const [choices, setChoices] = useState<any[]>([]);

  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // ── READER SETTINGS
  const [readerSettings, setReaderSettings] = useState({
    theme: 'dark', 
    font: 'serif', 
    size: 1.2
  });

  const [playerProfile, setPlayerProfile] = useState<Record<string, string>>({});
  const storyColumnRef = useRef<HTMLDivElement>(null);

  // Load Reader Settings
  useEffect(() => {
    const savedSettings = localStorage.getItem('lotalabs_reader_settings');
    if (savedSettings) {
      try { setReaderSettings(JSON.parse(savedSettings)); } catch (e) {}
    }
  }, []);

  const updateSetting = (key: string, val: any) => {
    setReaderSettings(prev => {
      const next = { ...prev, [key]: val };
      localStorage.setItem('lotalabs_reader_settings', JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    const initGame = async () => {
      if (!storyContent) return;
      const story = new Story(storyContent);

      let savedState = null;
      if (session) {
        const { data } = await supabase.from('player_saves').select('save_state')
          .eq('user_id', session.user.id).eq('game_id', GAME_ID).single();
        if (data && data.save_state) savedState = data.save_state;
      } else {
        savedState = localStorage.getItem(`lotalabs_save_${GAME_ID}`);
      }

      if (savedState) {
        try {
          const parsedSave = JSON.parse(savedState);
          story.state.LoadJson(parsedSave.inkData);
          setCurrentBlocks(parsedSave.uiHistory || []);
          setChoices(story.currentChoices);
        } catch (e) {
          console.error("Failed to load save state.", e);
          continueStory(story, []);
        }
      } else {
        continueStory(story, []);
      }

      setInkStory(story);
      setupObservers(story);
    };
    initGame();
  }, [storyContent, session]);

  const setupObservers = (story: Story) => {
    // Track the mood variable for the Case File
    const initialStrings: Record<string, string> = {};
    STRING_STATS.forEach(statName => {
      initialStrings[statName] = (story.variablesState[statName] as string) || 'neutral';
      story.ObserveVariable(statName, (name, newValue) => {
        setPlayerProfile(prev => ({ ...prev, [name]: String(newValue) }));
      });
    });
    setPlayerProfile(initialStrings);
  };

  useEffect(() => {
    if (storyColumnRef.current) {
      setTimeout(() => { if (storyColumnRef.current) storyColumnRef.current.scrollTop = 0; }, 50);
    }
  }, [currentBlocks]);

  const continueStory = (story: Story, previousBlocks: StoryBlock[]) => {
    let blockBuffer = [...previousBlocks];
    let blockCounter = Date.now();

    while (story.canContinue) {
      const text = story.Continue();
      const tags = story.currentTags;

      if (tags && tags.includes('clear')) blockBuffer = [];

      if (tags && tags.length > 0) {
        tags.forEach(tag => {
          const cleanTag = tag.trim().toLowerCase();
          if (cleanTag.startsWith('image:')) {
              const imgSrc = tag.substring(tag.indexOf(':') + 1).trim();
              blockBuffer.push({ type: 'image', content: imgSrc, id: `block-${blockCounter++}` });
          }
          if (cleanTag.startsWith('url:')) {
              const linkUrl = tag.substring(tag.indexOf(':') + 1).trim();
              window.location.href = linkUrl; 
          }
        });
      }

      if (text && text.trim().length > 0) {
        blockBuffer.push({ type: 'text', content: text, id: `block-${blockCounter++}` });
      }
    }

    setCurrentBlocks(blockBuffer);
    setChoices(story.currentChoices);
    return blockBuffer;
  };

  const triggerAutoSave = async (story: Story, historyBlocks: StoryBlock[]) => {
    const superSaveData = JSON.stringify({ inkData: story.state.toJson(), uiHistory: historyBlocks });
    if (session) {
      await supabase.from('player_saves').upsert({
        user_id: session.user.id, game_id: GAME_ID, save_state: superSaveData, updated_at: new Date().toISOString()
      }, { onConflict: 'user_id, game_id' });
    } else {
      localStorage.setItem(`lotalabs_save_${GAME_ID}`, superSaveData);
    }
  };

  const handleChoice = (index: number) => {
    if (!inkStory) return;
    inkStory.ChooseChoiceIndex(index);
    const newBlocks = continueStory(inkStory, []);
    triggerAutoSave(inkStory, newBlocks);
  };

  const handleRestart = () => {
    if (!inkStory) return;
    if (window.confirm("Are you sure you want to restart the interrogation? All progress will be lost.")) {
      inkStory.ResetState();
      setIsStatsOpen(false);
      setupObservers(inkStory);
      const newBlocks = continueStory(inkStory, []);
      triggerAutoSave(inkStory, newBlocks);
    }
  };

  if (!inkStory) return (
    <>
      <style>{css}</style>
      <div className="midnight-root">
        <div className="loading-screen"><span className="loading-text">Opening Case File</span></div>
      </div>
    </>
  );

  const currentTheme = THEMES[readerSettings.theme] || THEMES.dark;
  const currentFont = FONTS[readerSettings.font] || FONTS.serif;

  return (
    <>
      <style>{css}</style>
      <div 
        className="midnight-root"
        style={{
          '--theme-bg': currentTheme.bg,
          '--theme-text': currentTheme.text,
          '--theme-text-bold': currentTheme.textBold,
          '--theme-text-muted': currentTheme.textMuted,
          '--theme-font': currentFont,
          '--theme-size': `${readerSettings.size}rem`
        } as React.CSSProperties}
      >

        {/* ── HUD ── */}
        <div className="hud-bar">
          <span className="hud-title">The Midnight Suspect</span>
          <div className="hud-actions">
            <button className="btn-hud btn-restart" onClick={() => setIsSettingsOpen(true)}>
              ⚙️ Aa
            </button>
            <button className="btn-hud btn-restart" onClick={handleRestart}>
              ↺ Restart
            </button>
            <button className="btn-hud btn-stats" onClick={() => setIsStatsOpen(true)}>
              📁 Case File
            </button>
          </div>
        </div>

        {/* ── SETTINGS OVERLAY ── */}
        <div className={`stats-overlay ${isSettingsOpen ? 'open' : ''}`} style={{ zIndex: 300 }}>
          <div className="stats-overlay-inner">
            <div className="stats-header">
              <span className="stats-title">Reader Display</span>
              <button className="btn-close" onClick={() => setIsSettingsOpen(false)}>✕</button>
            </div>

            <div className="section-label">Typography</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <button className={`btn-hud ${readerSettings.font === 'serif' ? 'btn-stats' : 'btn-restart'}`} style={{ justifyContent: 'center', fontFamily: 'var(--font-body)' }} onClick={() => updateSetting('font', 'serif')}>Serif</button>
              <button className={`btn-hud ${readerSettings.font === 'sans' ? 'btn-stats' : 'btn-restart'}`} style={{ justifyContent: 'center', fontFamily: 'sans-serif' }} onClick={() => updateSetting('font', 'sans')}>Sans</button>
              <button className={`btn-hud ${readerSettings.font === 'dyslexic' ? 'btn-stats' : 'btn-restart'}`} style={{ justifyContent: 'center', fontFamily: '"OpenDyslexic", sans-serif' }} onClick={() => updateSetting('font', 'dyslexic')}>Dyslexic</button>
            </div>

            <div className="section-label">Text Size ({readerSettings.size.toFixed(1)}x)</div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem' }}>
              <button className="btn-hud btn-restart" onClick={() => updateSetting('size', Math.max(0.8, readerSettings.size - 0.1))}>A-</button>
              <input type="range" min="0.8" max="1.8" step="0.1" value={readerSettings.size} onChange={(e) => updateSetting('size', parseFloat(e.target.value))} />
              <button className="btn-hud btn-restart" onClick={() => updateSetting('size', Math.min(1.8, readerSettings.size + 0.1))}>A+</button>
            </div>

            <div className="section-label">Theme</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
               <button className={`btn-hud ${readerSettings.theme === 'dark' ? 'btn-stats' : 'btn-restart'}`} style={{ justifyContent: 'center' }} onClick={() => updateSetting('theme', 'dark')}>Dark</button>
               <button className={`btn-hud ${readerSettings.theme === 'sepia' ? 'btn-stats' : 'btn-restart'}`} style={{ justifyContent: 'center' }} onClick={() => updateSetting('theme', 'sepia')}>Sepia</button>
               <button className={`btn-hud ${readerSettings.theme === 'light' ? 'btn-stats' : 'btn-restart'}`} style={{ justifyContent: 'center' }} onClick={() => updateSetting('theme', 'light')}>Light</button>
            </div>
          </div>
        </div>

        {/* ── CASE FILE OVERLAY (Replaced Stats) ── */}
        <div className={`stats-overlay ${isStatsOpen ? 'open' : ''}`}>
          <div className="stats-overlay-inner">
            <div className="stats-header">
              <span className="stats-title">Dossier #404-B</span>
              <button className="btn-close" onClick={() => setIsStatsOpen(false)}>✕</button>
            </div>

            <div className="section-label">Current Interrogation</div>
            <div className="profile-grid">
              <div className="profile-field">
                <span className="profile-field-label">Subject</span>
                <span className="profile-field-value">Unknown Male</span>
              </div>
              <div className="profile-field">
                <span className="profile-field-label">Location</span>
                <span className="profile-field-value">Interrogation Rm 3</span>
              </div>
            </div>
            
            <div className="profile-grid" style={{ gridTemplateColumns: '1fr' }}>
              <div className="profile-field">
                <span className="profile-field-label">Active Detective Tactic</span>
                <span className="profile-field-value" style={{ color: 'var(--ember)' }}>
                  {playerProfile.mood ? playerProfile.mood.toUpperCase() : 'NEUTRAL'}
                </span>
              </div>
            </div>

            <div className="section-label" style={{ marginTop: '3rem' }}>Evidence Log</div>
            <div style={{ padding: '2rem', border: '1px dashed var(--mist)', borderRadius: '2px', textAlign: 'center' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.6rem', color: 'var(--fade)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                Pending Confession...
              </span>
            </div>

            <div className="save-indicator" style={{ marginTop: '3rem', fontSize: '0.7rem', color: 'var(--fade)', textAlign: 'center', fontStyle: 'italic' }}>
              {session ? "◈ Case notes synced to Lota Labs cloud" : "◇ Case notes stored locally"}
            </div>
          </div>
        </div>

        {/* ── MAIN STORY ── */}
        <div className="story-column" ref={storyColumnRef}>
          <div className="story-text-container">

            {currentBlocks.map((block, idx) => {
              const animDelay = `${Math.min(idx * 0.08, 1.2)}s`;
              if (block.type === 'image') {
                return (
                  <div key={block.id} className="story-image-wrap" style={{ animationDelay: animDelay }}>
                    <img
                      className="story-image"
                      src={ block.content.startsWith('http') ? block.content : block.content.includes('supabase.co') ? `https://${block.content}` : `/${block.content}` }
                      alt="Scene"
                    />
                  </div>
                );
              }
              return (
                <p key={block.id} className="story-paragraph" style={{ animationDelay: animDelay }} dangerouslySetInnerHTML={{ __html: block.content }} />
              );
            })}

            {choices.length > 0 && (
              <>
                <div className="story-divider" style={{ animationDelay: '0.2s' }}><span className="divider-glyph">Proceed</span></div>
                <div className="choices-wrapper">
                  {choices.map((choice, idx) => (
                    <div key={idx} className="choice-item" style={{ animationDelay: `${0.15 + idx * 0.1}s` }}>
                      <button className="choice-btn" onClick={() => handleChoice(idx)}>
                        <span className="choice-glyph">{String.fromCharCode(9312 + idx)}</span>
                        {choice.text}
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

          </div>
        </div>

      </div>
    </>
  );
}