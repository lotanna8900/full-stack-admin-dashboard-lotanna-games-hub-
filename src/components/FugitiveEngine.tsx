"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { Story } from 'inkjs';
import { supabase } from '../app/utils/supabaseClient';

interface FugitiveEngineProps {
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

const GAME_ID = 'supernatural_fugitive';
const ABILITY_STATS = ['strength', 'agility', 'combat', 'intelligence'];
const STRING_STATS = ['player_name', 'surname', 'hair', 'eyecolor'];
const ALL_NUMERIC_STATS = ['strength', 'agility', 'combat', 'intelligence', 'aggression', 'meekness', 'ruthlessness', 'pride', 'Ramiel'];

// Placeholder global choice analytics data
const MOCK_CHOICE_ANALYTICS: Record<number, number> = {
  0: 68,
  1: 22,
  2: 10,
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=Cinzel:wght@400;500;600;700&family=Cormorant:ital,wght@0,400;1,400&display=swap');
  @import url('https://fonts.cdnfonts.com/css/opendyslexic');

  :root {
    --void: #06080f;
    --abyss: #0a0d1a;
    --depths: #0f1326;
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
    --ember-glow: #f0903a;
    --gold: #c8a84a;
    --gold-bright: #e0bc5a;
    --blood: #8b1a1a;
    --crimson: #c0292a;
    --soul: #6b4fa8;
    --soul-bright: #8b6fc8;
    --font-display: 'Cinzel', serif;
    --font-body: 'Cormorant Garamond', serif;
  }

  /* ── DYNAMIC READER VARIABLES APPLIED HERE ── */
  .fugitive-root {
    position: relative;
    overflow: hidden;
    height: 100%;
    width: 100%;
    background-color: var(--theme-bg, var(--void));
    font-family: var(--theme-font, var(--font-body));
    color: var(--theme-text, var(--bone));
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  .fugitive-root::before {
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
    border-color: var(--gold-bright); color: var(--gold-bright);
    box-shadow: 0 0 20px rgba(200,168,74,0.2);
  }

  /* ── OVERLAYS (Stats & Settings) ── */
  .stats-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 200;
    background: var(--theme-bg, var(--abyss)); 
    display: flex;
    flex-direction: column;
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
  input[type=range] {
    -webkit-appearance: none; width: 100%; background: transparent;
  }
  input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none; height: 20px; width: 20px; border-radius: 50%;
    background: var(--gold); cursor: pointer; margin-top: -8px; box-shadow: 0 0 10px rgba(200,168,74,0.4);
  }
  input[type=range]::-webkit-slider-runnable-track {
    width: 100%; height: 4px; cursor: pointer; background: var(--slate); border-radius: 2px;
  }

  .tab-bar { display: flex; gap: 0; margin-bottom: 2rem; border-bottom: 1px solid var(--slate); }
  .tab-btn {
    background: transparent; border: none; border-bottom: 2px solid transparent;
    padding: 0.6rem 1.2rem; font-family: var(--font-display); font-size: 0.6rem;
    letter-spacing: 0.25em; text-transform: uppercase; color: var(--ash); cursor: pointer;
    transition: all 0.2s; margin-bottom: -1px;
  }
  .tab-btn.active { color: var(--gold); border-bottom-color: var(--ember); }
  .tab-btn:hover:not(.active) { color: var(--bone); }

  .section-label {
    font-family: var(--font-display); font-size: 0.55rem; letter-spacing: 0.4em;
    font-weight: 600; color: var(--ember); text-transform: uppercase; margin: 2rem 0 1rem;
    padding-bottom: 0.5rem; border-bottom: 1px solid rgba(200,105,42,0.2); display: flex; align-items: center; gap: 0.75rem;
  }
  .section-label::after { content: ''; flex: 1; height: 1px; background: linear-gradient(to right, rgba(200,105,42,0.2), transparent); }

  .profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 0.5rem; }
  .profile-field { background: var(--murk); border: 1px solid var(--slate); padding: 0.6rem 0.75rem; border-radius: 2px; }
  .profile-field-label { font-family: var(--font-display); font-size: 0.5rem; letter-spacing: 0.3em; color: var(--ash); text-transform: uppercase; margin-bottom: 0.2rem; display: block; }
  .profile-field-value { font-family: var(--font-body); font-size: 0.95rem; color: var(--parchment); font-style: italic; }

  .ability-bars { display: flex; flex-direction: column; gap: 0.85rem; }
  .ability-row { display: flex; flex-direction: column; gap: 0.3rem; }
  .ability-label-row { display: flex; justify-content: space-between; align-items: baseline; }
  .ability-name { font-family: var(--font-display); font-size: 0.6rem; letter-spacing: 0.2em; color: var(--silver); text-transform: uppercase; }
  .ability-value { font-family: var(--font-body); font-size: 0.8rem; color: var(--fade); font-variant-numeric: tabular-nums; }
  .bar-track { width: 100%; height: 4px; background: var(--slate); position: relative; overflow: hidden; }
  .bar-fill { height: 100%; background: linear-gradient(to right, var(--soul), var(--soul-bright)); transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1); position: relative; }

  .opposed-bar-wrapper { margin-bottom: 1.25rem; }
  .opposed-labels { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.35rem; }
  .opposed-left { font-family: var(--font-display); font-size: 0.58rem; letter-spacing: 0.15em; color: var(--ember); text-transform: uppercase; display: flex; align-items: center; gap: 0.5rem; }
  .opposed-right { font-family: var(--font-display); font-size: 0.58rem; letter-spacing: 0.15em; color: var(--silver); text-transform: uppercase; display: flex; align-items: center; gap: 0.5rem; flex-direction: row-reverse; }
  .opposed-pct { font-variant-numeric: tabular-nums; color: var(--fade); font-size: 0.55rem; }
  .opposed-track { width: 100%; height: 6px; background: rgba(139,111,200,0.25); position: relative; overflow: hidden; }
  .opposed-fill { height: 100%; background: linear-gradient(to right, var(--ember), var(--ember-glow)); transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1); }

  .character-card { background: var(--murk); border: 1px solid var(--slate); border-left: 2px solid var(--ember); padding: 1.25rem; border-radius: 2px; margin-bottom: 1rem; }
  .character-card-name { font-family: var(--font-display); font-size: 0.7rem; letter-spacing: 0.25em; color: var(--gold); text-transform: uppercase; margin-bottom: 0.75rem; }
  .character-card-body { font-family: var(--font-body); font-size: 1rem; color: var(--silver); line-height: 1.7; font-style: italic; }

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
  .story-paragraph b, .story-paragraph strong {
    font-weight: 600;
    color: var(--theme-text-bold, var(--parchment));
    letter-spacing: 0.05em;
  }
  .story-paragraph i, .story-paragraph em {
    color: var(--theme-text-muted, var(--silver));
    font-style: italic;
  }

  .story-image-wrap { margin: 2.5rem 0; text-align: center; opacity: 0; animation: fadeInUp 0.8s ease forwards; }
  .story-image { max-width: 100%; border-radius: 2px; border: 1px solid var(--slate); box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(200,168,74,0.1); }

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

  /* ── TEXT INPUT ── */
  .input-scene-wrap { max-width: 640px; margin: 0 auto 2rem; }
  .input-field-container { position: relative; border: 1px solid var(--slate); background: var(--murk); transition: border-color 0.2s; opacity: 0; animation: fadeInUp 0.5s ease 0.3s forwards; }
  .input-field-container:focus-within { border-color: var(--ember); box-shadow: 0 0 0 1px rgba(200,105,42,0.2), inset 0 0 20px rgba(200,105,42,0.03); }
  .input-field-label { display: block; font-family: var(--font-display); font-size: 0.5rem; letter-spacing: 0.35em; color: var(--ash); text-transform: uppercase; padding: 0.75rem 1.25rem 0; }
  .input-field { width: 100%; background: transparent; border: none; outline: none; color: var(--theme-text-bold, var(--parchment)); font-family: var(--theme-font, var(--font-body)); font-size: 1.2rem; font-style: italic; padding: 0.25rem 1.25rem 0.75rem; box-sizing: border-box; }
  .input-submit-btn { width: 100%; background: linear-gradient(135deg, rgba(200,105,42,0.15), rgba(200,168,74,0.1)); border: none; border-top: 1px solid rgba(200,105,42,0.3); color: var(--gold); font-family: var(--font-display); font-size: 0.6rem; letter-spacing: 0.35em; text-transform: uppercase; padding: 0.75rem; cursor: pointer; transition: all 0.2s; }
  .input-submit-btn:hover { background: linear-gradient(135deg, rgba(200,105,42,0.3), rgba(200,168,74,0.2)); color: var(--gold-bright); }

  /* ── TOAST ── */
  .toast-container { position: fixed; bottom: 2rem; right: 1.5rem; z-index: 500; display: flex; flex-direction: column; gap: 0.4rem; align-items: flex-end; pointer-events: none; }
  @keyframes toastIn { from { opacity: 0; transform: translateX(20px) translateY(4px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes toastOut { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(20px); } }
  .toast { display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.8rem; background: var(--murk); border: 1px solid var(--slate); border-radius: 2px; font-family: var(--font-display); font-size: 0.55rem; letter-spacing: 0.2em; text-transform: uppercase; animation: toastIn 0.3s ease forwards; box-shadow: 0 4px 20px rgba(0,0,0,0.4); }
  .toast.exiting { animation: toastOut 0.3s ease forwards; }
  .toast-positive { color: var(--gold); border-left: 2px solid var(--ember); }
  .toast-negative { color: var(--silver); border-left: 2px solid var(--ash); }
  .toast-dot { width: 4px; height: 4px; border-radius: 50%; flex-shrink: 0; }
  .toast-positive .toast-dot { background: var(--ember-glow); box-shadow: 0 0 4px var(--ember-glow); }

  .loading-screen { display: flex; align-items: center; justify-content: center; height: 100%; background: var(--void); }
  @keyframes pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
  .loading-text { font-family: var(--font-display); font-size: 0.6rem; letter-spacing: 0.5em; color: var(--ash); text-transform: uppercase; animation: pulse 2s ease infinite; }
`;

const STAT_LABELS: Record<string, string> = {
  strength: 'Strength',
  agility: 'Agility',
  combat: 'Combat',
  intelligence: 'Intelligence',
  aggression: 'Aggression',
  meekness: 'Meekness',
  ruthlessness: 'Ruthlessness',
  pride: 'Pride',
  Ramiel: 'Ramiel Bond',
};

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

export default function FugitiveEngine({ storyContent, session }: FugitiveEngineProps) {
  const [inkStory, setInkStory] = useState<Story | null>(null);
  const [currentBlocks, setCurrentBlocks] = useState<StoryBlock[]>([]);
  const [choices, setChoices] = useState<any[]>([]);

  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // ── NEW SETTINGS STATE
  const [activeTab, setActiveTab] = useState<'stats' | 'info'>('stats');

  // ── NEW READER SETTINGS
  const [readerSettings, setReaderSettings] = useState({
    theme: 'dark', 
    font: 'serif', 
    size: 1.2
  });

  const [isWaitingForInput, setIsWaitingForInput] = useState(false);
  const [currentInputVar, setCurrentInputVar] = useState('');
  const [inputValue, setInputValue] = useState('');

  const [playerStats, setPlayerStats] = useState<Record<string, number>>({});
  const [playerProfile, setPlayerProfile] = useState<Record<string, string>>({});
  const [hasMetMorgan, setHasMetMorgan] = useState(false);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const prevStats = useRef<Record<string, number>>({});
  const storyColumnRef = useRef<HTMLDivElement>(null);

  // ── Load Reader Settings from LocalStorage ──
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

  const fireToast = useCallback((statName: string, delta: number) => {
    const label = STAT_LABELS[statName] || statName;
    const sign = delta > 0 ? '+' : '';
    const message = `${label} ${sign}${delta}`;
    const id = `${Date.now()}-${Math.random()}`;

    setToasts(prev => [...prev, { id, message, delta, visible: true }]);
    setTimeout(() => { setToasts(prev => prev.map(t => t.id === id ? { ...t, visible: false } : t)); }, 2200);
    setTimeout(() => { setToasts(prev => prev.filter(t => t.id !== id)); }, 2600);
  }, []);

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
    const initialNumeric: Record<string, number> = {};
    ALL_NUMERIC_STATS.forEach(statName => {
      initialNumeric[statName] = story.variablesState[statName] as number || 0;
      story.ObserveVariable(statName, (name, newValue) => {
        const nv = newValue as number;
        setPlayerStats(prev => {
          const delta = nv - (prev[name] ?? 0);
          if (delta !== 0) fireToast(name, delta);
          prevStats.current[name] = nv;
          return { ...prev, [name]: nv };
        });
      });
    });
    setPlayerStats(initialNumeric);
    prevStats.current = { ...initialNumeric };

    const initialStrings: Record<string, string> = {};
    STRING_STATS.forEach(statName => {
      initialStrings[statName] = (story.variablesState[statName] as string) || 'Unknown';
      story.ObserveVariable(statName, (name, newValue) => {
        setPlayerProfile(prev => ({ ...prev, [name]: String(newValue) }));
      });
    });
    setPlayerProfile(initialStrings);

    setHasMetMorgan(story.variablesState['meet_morgan'] as boolean || false);
    story.ObserveVariable('meet_morgan', (_name, newValue) => {
      setHasMetMorgan(newValue as boolean);
    });
  };

  useEffect(() => {
    if (storyColumnRef.current && !isWaitingForInput) {
      setTimeout(() => { if (storyColumnRef.current) storyColumnRef.current.scrollTop = 0; }, 50);
    }
  }, [currentBlocks, isWaitingForInput]);

  const continueStory = (story: Story, previousBlocks: StoryBlock[]) => {
    let blockBuffer = [...previousBlocks];
    let pausedForInput = false;
    let blockCounter = Date.now();

    while (story.canContinue && !pausedForInput) {
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
          if (cleanTag.startsWith('input:')) {
            setCurrentInputVar(tag.substring(6).trim());
            setIsWaitingForInput(true);
            pausedForInput = true;
          }
        });
      }

      if (text && text.trim().length > 0) {
        blockBuffer.push({ type: 'text', content: text, id: `block-${blockCounter++}` });
      }
    }

    setCurrentBlocks(blockBuffer);
    setChoices(pausedForInput ? [] : story.currentChoices);
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

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inkStory || !currentInputVar || !inputValue.trim()) return;
    inkStory.variablesState[currentInputVar] = inputValue.trim();
    setInputValue('');
    setIsWaitingForInput(false);
    setCurrentInputVar('');
    const newBlocks = continueStory(inkStory, currentBlocks);
    triggerAutoSave(inkStory, newBlocks);
  };

  const handleRestart = () => {
    if (!inkStory) return;
    if (window.confirm("Are you sure you want to restart? All progress will be lost.")) {
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
      <div className="fugitive-root">
        <div className="loading-screen"><span className="loading-text">Awakening the Narrative</span></div>
      </div>
    </>
  );

  const OpposedBar = ({ leftLabel, rightLabel, leftValue }: { leftLabel: string, rightLabel: string, leftValue: number }) => {
    const clampedLeft = Math.max(0, Math.min(100, leftValue));
    const rightValue = 100 - clampedLeft;
    return (
      <div className="opposed-bar-wrapper">
        <div className="opposed-labels">
          <span className="opposed-left">{leftLabel}<span className="opposed-pct">{clampedLeft}%</span></span>
          <span className="opposed-right">{rightLabel}<span className="opposed-pct">{rightValue}%</span></span>
        </div>
        <div className="opposed-track"><div className="opposed-fill" style={{ width: `${clampedLeft}%` }} /></div>
      </div>
    );
  };

  const inputVarLabel = currentInputVar === 'player_name' ? 'Your Given Name'
    : currentInputVar === 'surname' ? 'Your Family Name' : currentInputVar.replace(/_/g, ' ');

  // ── APPLY DYNAMIC VARIABLES ──
  const currentTheme = THEMES[readerSettings.theme] || THEMES.dark;
  const currentFont = FONTS[readerSettings.font] || FONTS.serif;

  return (
    <>
      <style>{css}</style>
      <div 
        className="fugitive-root"
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
          <span className="hud-title">Supernatural Fugitive</span>
          <div className="hud-actions">
            <button className="btn-hud btn-restart" onClick={() => setIsSettingsOpen(true)}>
              ⚙️ Aa
            </button>
            <button className="btn-hud btn-restart" onClick={handleRestart}>
              ↺ Restart
            </button>
            <button className="btn-hud btn-stats" onClick={() => setIsStatsOpen(true)}>
              ⬡ Character Sheet
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
               <button className={`btn-hud ${readerSettings.theme === 'dark' ? 'btn-stats' : 'btn-restart'}`} style={{ justifyContent: 'center', background: '#0a0d1a', color: '#c8d4e8', borderColor: 'rgba(255,255,255,0.1)' }} onClick={() => updateSetting('theme', 'dark')}>Dark</button>
               <button className={`btn-hud ${readerSettings.theme === 'sepia' ? 'btn-stats' : 'btn-restart'}`} style={{ justifyContent: 'center', background: '#f4ecd8', color: '#5b4636', borderColor: 'rgba(0,0,0,0.1)' }} onClick={() => updateSetting('theme', 'sepia')}>Sepia</button>
               <button className={`btn-hud ${readerSettings.theme === 'light' ? 'btn-stats' : 'btn-restart'}`} style={{ justifyContent: 'center', background: '#f8f9fa', color: '#334155', borderColor: 'rgba(0,0,0,0.1)' }} onClick={() => updateSetting('theme', 'light')}>Light</button>
            </div>
          </div>
        </div>

        {/* ── STATS OVERLAY ── */}
        <div className={`stats-overlay ${isStatsOpen ? 'open' : ''}`}>
          <div className="stats-overlay-inner">
            <div className="stats-header">
              <span className="stats-title">Character Dossier</span>
              <button className="btn-close" onClick={() => setIsStatsOpen(false)}>✕</button>
            </div>

            <div className="tab-bar">
              <button className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>Attributes</button>
              <button className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>Persons of Interest</button>
            </div>

            {activeTab === 'stats' ? (
              <>
                <div className="section-label">Identity</div>
                <div className="profile-grid">
                  {[
                    { label: 'Given Name', value: playerProfile.player_name }, { label: 'Surname', value: playerProfile.surname },
                    { label: 'Hair', value: playerProfile.hair }, { label: 'Eye Color', value: playerProfile.eyecolor },
                  ].map(f => (
                    <div className="profile-field" key={f.label}>
                      <span className="profile-field-label">{f.label}</span>
                      <span className="profile-field-value">{f.value === 'Unknown' || !f.value ? '—' : f.value}</span>
                    </div>
                  ))}
                </div>

                <div className="section-label">Disposition</div>
                <OpposedBar leftLabel="Aggression" rightLabel="Meekness" leftValue={playerStats.aggression ?? 50} />
                <OpposedBar leftLabel="Ruthlessness" rightLabel="Compassion" leftValue={playerStats.ruthlessness ?? 50} />
                <OpposedBar leftLabel="Pride" rightLabel="Humility" leftValue={playerStats.pride ?? 50} />

                <div className="section-label">Capabilities</div>
                <div className="ability-bars">
                  {ABILITY_STATS.map(stat => (
                    <div className="ability-row" key={stat}>
                      <div className="ability-label-row">
                        <span className="ability-name">{STAT_LABELS[stat]}</span>
                        <span className="ability-value">{playerStats[stat] ?? 0}</span>
                      </div>
                      <div className="bar-track"><div className="bar-fill" style={{ width: `${Math.min(100, Math.max(0, playerStats[stat] ?? 0))}%` }} /></div>
                    </div>
                  ))}
                </div>

                <div className="section-label">Celestial Bond</div>
                <div className="ability-row ramiel-bar-wrap">
                  <div className="ability-label-row">
                    <span className="ability-name">Connection to Ramiel</span>
                    <span className="ability-value">{playerStats.Ramiel ?? 0}</span>
                  </div>
                  <div className="bar-track" style={{ height: '6px' }}><div className="ramiel-bar-fill" style={{ width: `${Math.min(100, Math.max(0, playerStats.Ramiel ?? 0))}%` }} /></div>
                </div>
              </>
            ) : (
              <>
                <div className="section-label">Encountered</div>
                {!hasMetMorgan && <p className="info-empty">No persons of interest encountered yet.<br />Continue your story to reveal them.</p>}
                {hasMetMorgan && (
                  <div className="character-card">
                    <div className="character-card-name">Morgan Third Choir</div>
                    <div className="character-card-body">
                      An always impeccably dressed, terrifyingly efficient entity masquerading as a Department of Justice Special Interventions agent. In reality, MTC is a celestial being — an angel of the Third Choir. Morgan possesses a chillingly calm disposition, preferring pragmatic, silent violence over religious zealotry.
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="save-indicator">
              {session ? "◈ Progress synced to Lota Labs cloud" : "◇ Playing as Guest — saves stored locally"}
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

            {isWaitingForInput && (
              <div className="input-scene-wrap">
                <form onSubmit={handleInputSubmit}>
                  <div className="input-field-container">
                    <label className="input-field-label" htmlFor="story-input">{inputVarLabel}</label>
                    <input id="story-input" className="input-field" type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder="Write your answer..." autoFocus autoComplete="off" />
                    <button type="submit" className="input-submit-btn">Confirm ↵</button>
                  </div>
                </form>
              </div>
            )}

            {!isWaitingForInput && choices.length > 0 && (
              <>
                <div className="story-divider" style={{ animationDelay: '0.2s' }}><span className="divider-glyph">Choose</span></div>
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

        <div className="toast-container">
          {toasts.map(toast => (
            <div key={toast.id} className={`toast ${toast.delta > 0 ? 'toast-positive' : 'toast-negative'} ${!toast.visible ? 'exiting' : ''}`}>
              <span className="toast-dot" />{toast.message}
            </div>
          ))}
        </div>

      </div>
    </>
  );
}