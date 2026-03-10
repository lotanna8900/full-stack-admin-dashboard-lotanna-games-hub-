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
    --fog:        #5c7099;
    --ash:        #8ca0c0;
    --bone:       #c5d4e8;
    --white:      #eef3f9;

    --ember:      #b85c1a;
    --ember-mid:  #d4711f;
    --ember-hot:  #f08030;
    --gold:       #c4922a;
    --gold-mid:   #dba93a;
    --gold-bright:#f0c050;

    --soul-deep:  #2d1a5c;
    --soul:       #5535a0;
    --soul-mid:   #7b52c8;
    --soul-bright:#a07ae0;

    --blood:      #7a1515;
    --crimson:    #b02020;

    --font-display: 'Cinzel Decorative', serif;
    --font-title:   'Cinzel', serif;
    --font-body:    'Crimson Pro', serif;

    --glow-gold:  0 0 30px rgba(192,144,40,0.35), 0 0 60px rgba(192,144,40,0.15);
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

  /* ── GRAIN OVERLAY ───────────────────────────────── */
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

  /* ── LOADING ─────────────────────────────────────── */
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
    font-size: .65rem;
    letter-spacing: .5em;
    color: var(--fog);
    text-transform: uppercase;
    animation: pulse 2.2s ease infinite;
  }

  /* ══════════════════════════════════════════════════
     SECTION 1 — HERO
  ══════════════════════════════════════════════════ */
  .ll-hero {
    position: relative;
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    overflow: hidden;
  }

  /* Atmospheric background */
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

  /* Scan-line grid */
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
    border: 1px solid rgba(192,144,40,.35);
    background: rgba(192,144,40,.07);
    border-radius: 2px;
  }
  .ll-studio-badge-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: var(--gold-bright);
    box-shadow: 0 0 6px var(--gold-bright);
    animation: pulse 2s ease infinite;
  }
  .ll-studio-badge-text {
    font-family: var(--font-title);
    font-size: .52rem;
    letter-spacing: .4em;
    color: var(--gold);
    text-transform: uppercase;
  }

  .ll-hero-headline {
    font-family: var(--font-display);
    font-size: clamp(2.2rem, 4.5vw, 4rem);
    font-weight: 700;
    line-height: 1.05;
    color: var(--white);
    text-shadow: 0 2px 40px rgba(0,0,0,.8);
  }

  .ll-hero-headline em {
    font-style: normal;
    background: linear-gradient(135deg, var(--gold-mid) 0%, var(--gold-bright) 50%, var(--ember-hot) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    display: block;
  }

  .ll-hero-sub {
    font-size: 1.15rem;
    color: var(--ash);
    line-height: 1.7;
    max-width: 480px;
  }

  .ll-hero-sub strong {
    color: var(--bone);
    font-weight: 500;
    font-style: italic;
  }

  .ll-hero-actions {
    display: flex;
    gap: .9rem;
    flex-wrap: wrap;
    padding-top: .5rem;
  }

  .ll-btn-primary {
    display: inline-flex;
    align-items: center;
    gap: .6rem;
    padding: .85rem 2rem;
    background: linear-gradient(135deg, var(--ember) 0%, var(--ember-hot) 100%);
    color: var(--white);
    font-family: var(--font-title);
    font-size: .65rem;
    font-weight: 600;
    letter-spacing: .25em;
    text-transform: uppercase;
    text-decoration: none;
    border: none;
    border-radius: 2px;
    cursor: pointer;
    box-shadow: 0 4px 24px rgba(184,92,26,.4), inset 0 1px 0 rgba(255,255,255,.15);
    transition: all .25s ease;
    position: relative;
    overflow: hidden;
  }
  .ll-btn-primary::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, var(--ember-hot), var(--gold));
    opacity: 0;
    transition: opacity .25s;
  }
  .ll-btn-primary:hover::before { opacity: 1; }
  .ll-btn-primary:hover { box-shadow: 0 6px 32px rgba(240,128,48,.5), inset 0 1px 0 rgba(255,255,255,.2); transform: translateY(-1px); }
  .ll-btn-primary span { position: relative; z-index: 1; }

  .ll-btn-ghost {
    display: inline-flex;
    align-items: center;
    gap: .6rem;
    padding: .85rem 1.75rem;
    background: transparent;
    color: var(--ash);
    font-family: var(--font-title);
    font-size: .65rem;
    font-weight: 600;
    letter-spacing: .25em;
    text-transform: uppercase;
    text-decoration: none;
    border: 1px solid var(--mist);
    border-radius: 2px;
    cursor: pointer;
    transition: all .25s ease;
  }
  .ll-btn-ghost:hover {
    border-color: var(--steel);
    color: var(--bone);
    background: rgba(255,255,255,.04);
  }

  /* Cover image side */
  .ll-hero-right {
    position: relative;
    z-index: 2;
    height: 100%;
    min-height: 100vh;
    display: flex;
    align-items: stretch;
  }

  .ll-hero-image-wrap {
    position: relative;
    width: 100%;
    overflow: hidden;
  }

  .ll-hero-image-wrap::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 35%;
    background: linear-gradient(to right, var(--void), transparent);
    z-index: 2;
  }
  .ll-hero-image-wrap::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 30%;
    background: linear-gradient(to top, var(--void), transparent);
    z-index: 2;
  }

  .ll-hero-cover-img {
    object-fit: cover;
    object-position: center top;
    width: 100%;
    height: 100%;
  }

  /* Placeholder cover when no image */
  .ll-hero-cover-placeholder {
    width: 100%;
    height: 100%;
    min-height: 100vh;
    background:
      radial-gradient(ellipse 80% 100% at 50% 30%, rgba(85,53,160,.5) 0%, transparent 60%),
      radial-gradient(ellipse 60% 50% at 80% 80%, rgba(184,92,26,.3) 0%, transparent 50%),
      linear-gradient(to bottom, var(--abyss), var(--void));
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-title);
    font-size: .55rem;
    letter-spacing: .5em;
    color: var(--steel);
    text-transform: uppercase;
  }

  /* Featured game label */
  .ll-hero-game-tag {
    position: absolute;
    bottom: 3rem;
    right: 2.5rem;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: .3rem;
  }
  .ll-hero-game-label {
    font-family: var(--font-title);
    font-size: .5rem;
    letter-spacing: .4em;
    color: var(--fog);
    text-transform: uppercase;
  }
  .ll-hero-game-title {
    font-family: var(--font-display);
    font-size: 1.1rem;
    color: var(--gold-bright);
    text-shadow: var(--glow-gold);
    text-align: right;
  }

  /* Scroll hint */
  @keyframes scrollBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(5px)} }
  .ll-scroll-hint {
    position: absolute;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: .4rem;
    opacity: .4;
  }
  .ll-scroll-hint span {
    font-family: var(--font-title);
    font-size: .45rem;
    letter-spacing: .4em;
    color: var(--fog);
    text-transform: uppercase;
  }
  .ll-scroll-arrow {
    width: 1px;
    height: 28px;
    background: linear-gradient(to bottom, var(--fog), transparent);
    animation: scrollBounce 2s ease infinite;
  }

  /* ══════════════════════════════════════════════════
     SECTION 2 — MANIFESTO
  ══════════════════════════════════════════════════ */
  .ll-manifesto {
    position: relative;
    padding: 8rem 2rem;
    overflow: hidden;
  }

  .ll-manifesto-bg {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 60% 80% at 10% 50%, rgba(22,32,53,.7) 0%, transparent 60%),
      var(--abyss);
  }

  .ll-manifesto-inner {
    position: relative;
    z-index: 2;
    max-width: 900px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 5rem;
    align-items: start;
  }

  .ll-manifesto-left {
    position: sticky;
    top: 6rem;
  }

  .ll-section-eyebrow {
    font-family: var(--font-title);
    font-size: .52rem;
    letter-spacing: .45em;
    color: var(--ember-mid);
    text-transform: uppercase;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: .6rem;
  }
  .ll-section-eyebrow::before {
    content: '';
    display: inline-block;
    width: 24px;
    height: 1px;
    background: var(--ember-mid);
  }

  .ll-manifesto-heading {
    font-family: var(--font-display);
    font-size: 1.8rem;
    font-weight: 700;
    line-height: 1.2;
    color: var(--white);
    margin-bottom: 1rem;
  }

  .ll-manifesto-heading em {
    font-style: normal;
    display: block;
    background: linear-gradient(135deg, var(--soul-mid), var(--soul-bright));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .ll-manifesto-rule {
    width: 40px;
    height: 2px;
    background: linear-gradient(to right, var(--soul-mid), transparent);
    margin-top: 1.5rem;
  }

  .ll-manifesto-right {
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
  }

  .ll-manifesto-body {
    font-size: 1.2rem;
    line-height: 1.85;
    color: var(--ash);
  }

  .ll-manifesto-body strong {
    color: var(--bone);
    font-weight: 500;
  }

  .ll-manifesto-body em {
    color: var(--soul-bright);
    font-style: italic;
  }

  .ll-manifesto-placeholder {
    padding: 1.5rem;
    border: 1px dashed var(--mist);
    border-radius: 2px;
    background: rgba(255,255,255,.02);
  }
  .ll-manifesto-placeholder p {
    font-family: var(--font-title);
    font-size: .5rem;
    letter-spacing: .25em;
    color: var(--steel);
    text-transform: uppercase;
    text-align: center;
  }

  .ll-pillars {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1px;
    background: var(--mist);
    border: 1px solid var(--mist);
    margin-top: .5rem;
  }

  .ll-pillar {
    padding: 1.25rem;
    background: var(--deep);
    transition: background .2s;
  }
  .ll-pillar:hover { background: var(--navy); }

  .ll-pillar-icon {
    font-size: 1.2rem;
    margin-bottom: .5rem;
    display: block;
  }
  .ll-pillar-title {
    font-family: var(--font-title);
    font-size: .6rem;
    letter-spacing: .2em;
    color: var(--gold);
    text-transform: uppercase;
    margin-bottom: .3rem;
  }
  .ll-pillar-text {
    font-size: .95rem;
    color: var(--fog);
    line-height: 1.5;
  }

  /* ══════════════════════════════════════════════════
     SECTION 3 — COMING SOON: KEEPER'S VIGIL
  ══════════════════════════════════════════════════ */
  .ll-coming-soon {
    position: relative;
    padding: 8rem 2rem;
    overflow: hidden;
  }

  .ll-coming-soon-bg {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 100% 60% at 50% 50%, rgba(45,26,92,.6) 0%, transparent 65%),
      radial-gradient(ellipse 40% 40% at 20% 100%, rgba(184,92,26,.15) 0%, transparent 50%),
      var(--void);
  }

  .ll-coming-soon-bg::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(115,80,200,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(115,80,200,0.04) 1px, transparent 1px);
    background-size: 40px 40px;
  }

  .ll-coming-soon-inner {
    position: relative;
    z-index: 2;
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }

  .ll-game-crest {
    width: 72px;
    height: 72px;
    border: 1px solid rgba(115,80,200,.4);
    border-radius: 50%;
    background: radial-gradient(circle, rgba(85,53,160,.3), transparent);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.6rem;
    box-shadow: var(--glow-soul);
    animation: pulse 3s ease infinite;
    margin-bottom: .5rem;
  }

  .ll-cs-eyebrow {
    font-family: var(--font-title);
    font-size: .52rem;
    letter-spacing: .45em;
    color: var(--soul-mid);
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: .6rem;
  }
  .ll-cs-eyebrow::before, .ll-cs-eyebrow::after {
    content: '';
    display: inline-block;
    width: 24px; height: 1px;
    background: var(--soul-mid);
  }

  .ll-cs-title {
    font-family: var(--font-display);
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 900;
    color: var(--white);
    text-shadow: var(--glow-soul);
    line-height: 1.1;
  }

  .ll-cs-subtitle {
    font-size: 1.15rem;
    color: var(--ash);
    line-height: 1.75;
    max-width: 580px;
  }

  .ll-status-badge {
    display: inline-flex;
    align-items: center;
    gap: .6rem;
    padding: .4rem 1rem;
    border: 1px solid rgba(115,80,200,.4);
    background: rgba(85,53,160,.12);
    border-radius: 2px;
  }
  .ll-status-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: var(--soul-bright);
    box-shadow: 0 0 6px var(--soul-bright);
    animation: pulse 2s ease infinite;
  }
  .ll-status-text {
    font-family: var(--font-title);
    font-size: .52rem;
    letter-spacing: .3em;
    color: var(--soul-bright);
    text-transform: uppercase;
  }

  .ll-platforms {
    display: flex;
    gap: 1.5rem;
    justify-content: center;
    align-items: center;
    padding: .75rem 0;
  }
  .ll-platform {
    font-family: var(--font-title);
    font-size: .5rem;
    letter-spacing: .3em;
    color: var(--fog);
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: .4rem;
  }
  .ll-platform::before {
    content: '◆';
    font-size: .3rem;
    color: var(--mist);
  }
  .ll-platform:first-child::before { display: none; }

  .ll-btn-soul {
    display: inline-flex;
    align-items: center;
    gap: .6rem;
    padding: .85rem 2.25rem;
    background: linear-gradient(135deg, var(--soul-deep), var(--soul));
    color: var(--bone);
    font-family: var(--font-title);
    font-size: .65rem;
    font-weight: 600;
    letter-spacing: .25em;
    text-transform: uppercase;
    text-decoration: none;
    border: 1px solid rgba(115,80,200,.4);
    border-radius: 2px;
    cursor: pointer;
    box-shadow: var(--glow-soul);
    transition: all .25s ease;
  }
  .ll-btn-soul:hover {
    background: linear-gradient(135deg, var(--soul), var(--soul-mid));
    transform: translateY(-1px);
    box-shadow: 0 0 40px rgba(115,80,200,.5), 0 0 80px rgba(115,80,200,.2);
  }

  /* ══════════════════════════════════════════════════
     SECTION 4 — COMMUNITY DASHBOARD
  ══════════════════════════════════════════════════ */
  .ll-dashboard {
    padding: 6rem 2rem 8rem;
    background: var(--abyss);
    position: relative;
  }

  .ll-dashboard::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(to right, transparent, var(--slate), transparent);
  }

  .ll-dashboard-inner {
    max-width: 1200px;
    margin: 0 auto;
  }

  .ll-dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 2.5rem;
  }

  .ll-greeting-sub {
    font-family: var(--font-title);
    font-size: .5rem;
    letter-spacing: .4em;
    color: var(--ember-mid);
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: .6rem;
    margin-bottom: .6rem;
  }
  .ll-greeting-sub::before { content: ''; display: inline-block; width: 20px; height: 1px; background: var(--ember-mid); }

  .ll-greeting-title {
    font-family: var(--font-display);
    font-size: 1.6rem;
    color: var(--white);
    line-height: 1.1;
  }

  .ll-greeting-body {
    font-size: 1rem;
    color: var(--fog);
    margin-top: .4rem;
  }

  .ll-admin-actions {
    display: flex;
    gap: .5rem;
  }

  /* Stat cards */
  .ll-stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1px;
    background: var(--slate);
    border: 1px solid var(--slate);
    margin-bottom: 1px;
  }

  .ll-stat-card {
    background: var(--deep);
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: .5rem;
    transition: background .2s;
    text-decoration: none;
    color: inherit;
    position: relative;
    overflow: hidden;
  }
  .ll-stat-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(192,144,40,.06), transparent);
    opacity: 0;
    transition: opacity .25s;
  }
  .ll-stat-card:hover { background: var(--navy); }
  .ll-stat-card:hover::before { opacity: 1; }

  .ll-stat-card-wide {
    grid-column: span 2;
  }

  .ll-stat-icon-wrap {
    width: 36px; height: 36px;
    border-radius: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    flex-shrink: 0;
    margin-bottom: .25rem;
  }

  .ll-stat-label {
    font-family: var(--font-title);
    font-size: .5rem;
    letter-spacing: .3em;
    color: var(--fog);
    text-transform: uppercase;
  }

  .ll-stat-value {
    font-family: var(--font-display);
    font-size: 2rem;
    font-weight: 700;
    color: var(--white);
    line-height: 1;
  }

  .ll-stat-arrow {
    position: absolute;
    top: 1.5rem; right: 1.5rem;
    font-size: .7rem;
    color: var(--steel);
    transition: color .2s, transform .2s;
  }
  .ll-stat-card:hover .ll-stat-arrow { color: var(--gold); transform: translate(2px, -2px); }

  /* Social stats */
  .ll-social-grid {
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
    margin-top: .5rem;
  }
  .ll-social-item {
    display: flex;
    flex-direction: column;
    gap: .2rem;
  }
  .ll-social-platform {
    font-family: var(--font-title);
    font-size: .45rem;
    letter-spacing: .25em;
    color: var(--fog);
    text-transform: uppercase;
  }
  .ll-social-count {
    font-family: var(--font-display);
    font-size: 1.1rem;
    color: var(--gold-bright);
  }

  /* Content grid */
  .ll-content-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 1px;
    background: var(--slate);
    border: 1px solid var(--slate);
    margin-top: 1px;
  }

  .ll-panel {
    background: var(--deep);
    padding: 2rem;
  }

  .ll-panel-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--slate);
  }

  .ll-panel-title {
    font-family: var(--font-title);
    font-size: .65rem;
    letter-spacing: .3em;
    color: var(--bone);
    text-transform: uppercase;
  }

  .ll-panel-meta {
    font-size: .9rem;
    color: var(--fog);
    margin-top: .2rem;
  }

  .ll-panel-link {
    font-family: var(--font-title);
    font-size: .5rem;
    letter-spacing: .2em;
    color: var(--gold);
    text-transform: uppercase;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: .3rem;
    transition: color .2s;
    white-space: nowrap;
  }
  .ll-panel-link:hover { color: var(--gold-bright); }

  /* Activity feed */
  .ll-activity-feed { display: flex; flex-direction: column; gap: 0; }

  .ll-activity-item {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: .85rem 0;
    border-bottom: 1px solid var(--slate);
    text-decoration: none;
    color: inherit;
    transition: background .15s;
    margin: 0 -1rem;
    padding-left: 1rem;
    padding-right: 1rem;
  }
  .ll-activity-item:last-child { border-bottom: none; }
  .ll-activity-item:hover { background: rgba(255,255,255,.02); }

  .ll-activity-icon {
    width: 28px; height: 28px; border-radius: 2px;
    display: flex; align-items: center; justify-content: center;
    font-size: .8rem; flex-shrink: 0;
    border: 1px solid var(--slate);
  }
  .ll-activity-icon-comment { background: rgba(59,130,246,.12); }
  .ll-activity-icon-post    { background: rgba(16,185,129,.12); }
  .ll-activity-icon-project { background: rgba(139,92,246,.12); }

  .ll-activity-text { font-size: 1rem; color: var(--ash); line-height: 1.4; }
  .ll-activity-text strong { color: var(--bone); font-weight: 500; }
  .ll-activity-time { font-size: .85rem; color: var(--fog); margin-top: .1rem; }

  .ll-empty-state {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 3rem; gap: .75rem;
    color: var(--fog);
  }
  .ll-empty-state-icon { font-size: 2rem; opacity: .4; }
  .ll-empty-state-text { font-family: var(--font-title); font-size: .55rem; letter-spacing: .25em; text-transform: uppercase; }

  /* Quick links */
  .ll-quick-links {
    margin-top: 1px;
    background: var(--deep);
    border: 1px solid var(--slate);
    border-top: none;
    padding: 1.75rem 2rem;
  }

  .ll-quick-links-label {
    font-family: var(--font-title);
    font-size: .5rem;
    letter-spacing: .35em;
    color: var(--fog);
    text-transform: uppercase;
    margin-bottom: 1rem;
  }

  .ll-quick-links-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: .75rem;
  }

  .ll-quick-link {
    display: flex;
    align-items: center;
    gap: .75rem;
    padding: .75rem 1rem;
    background: var(--abyss);
    border: 1px solid var(--slate);
    border-radius: 2px;
    text-decoration: none;
    color: var(--ash);
    font-family: var(--font-title);
    font-size: .55rem;
    letter-spacing: .15em;
    text-transform: uppercase;
    transition: all .2s;
  }
  .ll-quick-link:hover {
    background: var(--navy);
    border-color: var(--steel);
    color: var(--bone);
  }
  .ll-quick-link-icon { font-size: 1rem; }

  /* ── RESPONSIVE ──────────────────────────────────── */
  @media (max-width: 900px) {
    .ll-hero { grid-template-columns: 1fr; }
    .ll-hero-right { display: none; }
    .ll-hero-left { padding: 7rem 2rem 5rem; }
    .ll-manifesto-inner { grid-template-columns: 1fr; gap: 2rem; }
    .ll-manifesto-left { position: static; }
    .ll-content-grid { grid-template-columns: 1fr; }
    .ll-stat-card-wide { grid-column: span 1; }
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .ll-fade-up { opacity: 0; animation: fadeUp .7s ease forwards; }
  .ll-delay-1 { animation-delay: .1s; }
  .ll-delay-2 { animation-delay: .2s; }
  .ll-delay-3 { animation-delay: .35s; }
  .ll-delay-4 { animation-delay: .5s; }
  .ll-delay-5 { animation-delay: .65s; }
`;

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export default function HomePage() {
  const router = useRouter();

  // --- EXISTING STATE (untouched) ---
  const [projectCount, setProjectCount] = useState(0);
  const [snippetCount, setSnippetCount] = useState(0);
  const [memberCount, setMemberCount] = useState(0);
  const [totalPostViews, setTotalPostViews] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [username, setUsername] = useState('');
  const [socialStats, setSocialStats] = useState([]);

  // --- NEW STATE FOR DYNAMIC CONTENT (untouched) ---
  const [heroConfig, setHeroConfig] = useState(null);
  const [demoConfig, setDemoConfig] = useState(null);

  // --- EXISTING useEffect (untouched) ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles').select('role, username').eq('id', session.user.id).single();
        setUserRole(profile?.role || 'guest');
        setUsername(profile?.username || 'User');
      } else {
        setUserRole('guest');
        setUsername('Guest');
      }

      const { data: configData } = await supabase
        .from('site_config').select('*').in('section_key', ['home_hero', 'home_demo']);
      if (configData) {
        const hero = configData.find(item => item.section_key === 'home_hero');
        const demo = configData.find(item => item.section_key === 'home_demo');
        setHeroConfig(hero);
        setDemoConfig(demo);
      }

      const { count: projCount } = await supabase.from('projects').select('*', { count: 'exact', head: true });
      setProjectCount(projCount || 0);
      const { count: snipCount } = await supabase.from('snippets').select('*', { count: 'exact', head: true });
      setSnippetCount(snipCount || 0);
      const { data: memCount } = await supabase.rpc('get_public_member_count');
      setMemberCount(memCount || 0);

      const { data: totalViewsData } = await supabase.from('posts').select('view_count');
      if (totalViewsData) {
        const total = totalViewsData.reduce((sum, post) => sum + (post.view_count || 0), 0);
        setTotalPostViews(total);
      }

      let combinedActivity = [];
      const { data: recentCommentsData } = await supabase.from('comments')
        .select('*, post:posts(id, title), author:profiles(username)')
        .order('created_at', { ascending: false }).limit(5);
      if (recentCommentsData) combinedActivity.push(...recentCommentsData.map(c => ({ ...c, type: 'comment' })));

      const { data: latestPostData } = await supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(1);
      const latestPost = latestPostData?.[0];
      const { data: latestProjectData } = await supabase.from('projects').select('*').order('created_at', { ascending: false }).limit(1);
      const latestProject = latestProjectData?.[0];

      let newestContentItem = null;
      if (latestPost && latestProject) {
        newestContentItem = new Date(latestPost.created_at) > new Date(latestProject.created_at)
          ? { ...latestPost, type: 'post' } : { ...latestProject, type: 'project' };
      } else if (latestPost) newestContentItem = { ...latestPost, type: 'post' };
      else if (latestProject) newestContentItem = { ...latestProject, type: 'project' };
      if (newestContentItem) combinedActivity.push(newestContentItem);

      combinedActivity.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setRecentActivity(combinedActivity.slice(0, 6));

      const { data: socialStatsData } = await supabase.from('social_stats').select('*');
      if (socialStatsData) setSocialStats(socialStatsData);

      setLoading(false);
    };
    fetchDashboardData();
  }, []);

  // --- HELPERS (untouched) ---
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };
  const formatNumber = (num) => num >= 1000 ? (num / 1000).toFixed(1) + 'K' : num;
  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <>
        <style>{pageStyles}</style>
        <div className="ll-loading">
          <span className="ll-loading-text">Entering the Dark</span>
        </div>
      </>
    );
  }

  const coverImageSrc = heroConfig?.image_url || null;

  return (
    <>
      <style>{pageStyles}</style>
      <div className="ll-page">

        {/* ════════════════════════════════
            SECTION 1 — HERO
        ════════════════════════════════ */}
        <section className="ll-hero">
          <div className="ll-hero-bg" />

          {/* LEFT: Text */}
          <div className="ll-hero-left">
            <div className="ll-studio-badge ll-fade-up ll-delay-1">
              <span className="ll-studio-badge-dot" />
              <span className="ll-studio-badge-text">Lota Labs Interactive Fiction</span>
            </div>

            <h1 className="ll-hero-headline ll-fade-up ll-delay-2">
              Welcome to<br />
              <em>Lota Labs.</em>
            </h1>

            <p className="ll-hero-sub ll-fade-up ll-delay-3">
              Stories with weight. Choices that echo.<br />
              Our debut chapter, <strong>Supernatural Fugitive</strong>, is live now. It is
              a 40-minute dark-fantasy interactive fiction experience.
            </p>

            <div className="ll-hero-actions ll-fade-up ll-delay-4">
              <Link href="/games" className="ll-btn-primary">
                <span>▶ Play 40-Min Demo</span>
              </Link>
              <Link href="/blog" className="ll-btn-ghost">
                Read the Devlogs
              </Link>
            </div>
          </div>

          {/* RIGHT: Cover Art */}
          <div className="ll-hero-right">
            <div className="ll-hero-image-wrap">
              {coverImageSrc ? (
                <Image
                  src={coverImageSrc}
                  alt="Supernatural Fugitive — Cover Art"
                  fill
                  priority
                  className="ll-hero-cover-img"
                />
              ) : (
                <div className="ll-hero-cover-placeholder">
                  Cover Art Placeholder
                </div>
              )}
              <div className="ll-hero-game-tag">
                <span className="ll-hero-game-label">Featured Title</span>
                <span className="ll-hero-game-title">Supernatural<br />Fugitive</span>
              </div>
            </div>
          </div>

          <div className="ll-scroll-hint">
            <span>Scroll</span>
            <div className="ll-scroll-arrow" />
          </div>
        </section>

        {/* ════════════════════════════════
            SECTION 2 — MANIFESTO
        ════════════════════════════════ */}
        <section className="ll-manifesto">
          <div className="ll-manifesto-bg" />
          <div className="ll-manifesto-inner">

            <div className="ll-manifesto-left">
              <p className="ll-section-eyebrow">Our Mission</p>
              <h2 className="ll-manifesto-heading">
                Building the
                <em>next generation</em>
                of Interactive Fiction.
              </h2>
              <div className="ll-manifesto-rule" />
            </div>

            <div className="ll-manifesto-right">
              <p className="ll-manifesto-body">
                We believe interactive fiction is one of the most <strong>underexplored art forms</strong> of our time.
                At Lota Labs, we're building stories that will not just entertain you but will also <em>stay with you</em>.
                Narratives where your choices carry moral weight, where characters breathe, and where
                the world responds to who you are.
              </p>

              <div className="ll-manifesto-placeholder">

                <div style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
                <h3 style={{ fontFamily: 'var(--font-title)', fontSize: '1.2rem', color: 'var(--white)', marginBottom: '0.75rem' }}>
                  ✦True Ownership of Your Story✦
                </h3>
                <p className="ll-manifesto-body" style={{ marginBottom: '1rem' }}>
                  We are pioneering the bridge between interactive narrative and true digital ownership. In a Lota Labs experience, the artifacts you earn, whether it is a cursed blade or a celestial relic, actually belong to you. 
                </p>
                <p className="ll-manifesto-body">
                  For traditional players, it is a seamless, immersive RPG. But for those who want to go deeper, you can connect your wallet and forge your choices into the blockchain, carrying your inventory across the digital frontier. <strong>No friction, no forced jargon. Just absolute player agency and freedom.</strong>
                </p>
              </div>
              </div>

              <div className="ll-pillars">
                <div className="ll-pillar">
                  <span className="ll-pillar-icon">⚔️</span>
                  <div className="ll-pillar-title">Dark Narrative</div>
                  <p className="ll-pillar-text">Stories for adults. Moral ambiguity, real consequence, earned catharsis.</p>
                </div>
                <div className="ll-pillar">
                  <span className="ll-pillar-icon">🎭</span>
                  <div className="ll-pillar-title">Player Agency</div>
                  <p className="ll-pillar-text">Your identity, your choices, your story. No two playthroughs are the same.</p>
                </div>
                <div className="ll-pillar">
                  <span className="ll-pillar-icon">🌐</span>
                  <div className="ll-pillar-title">Community-First</div>
                  <p className="ll-pillar-text">Built in public. Lota Labs is as much the players' studio as ours.</p>
                </div>
                <div className="ll-pillar">
                  <span className="ll-pillar-icon">✨</span>
                  <div className="ll-pillar-title">Craft Over Clicks</div>
                  <p className="ll-pillar-text">Every word earns its place. Quality of story above quantity of content.</p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ════════════════════════════════
            SECTION 3 — COMING SOON
        ════════════════════════════════ */}
        <section className="ll-coming-soon">
          <div className="ll-coming-soon-bg" />
          <div className="ll-coming-soon-inner">

            <div className="ll-game-crest">🏰</div>

            <p className="ll-cs-eyebrow">Next Title</p>

            <h2 className="ll-cs-title">Keeper's Vigil</h2>

            <p className="ll-cs-subtitle">
              Play as the Harbinger—a mutated monster hunter wielding forbidden necromancy. 
              Stop a plague of Abominations, uncover an ancient Elven conspiracy, and decide 
              the fate of a dying world in this massive 193,000-word dark fantasy epic.
            </p>

            <div className="ll-status-badge">
              <span className="ll-status-dot" />
              <span className="ll-status-text">Coming Q2 2026 · All Platforms</span>
            </div>

            <div className="ll-platforms">
              <span className="ll-platform">Web</span>
              <span className="ll-platform">iOS</span>
              <span className="ll-platform">Android</span>
              <span className="ll-platform">Steam</span>
            </div>

            <Link href="/blog" className="ll-btn-soul">
              Read Devlogs &amp; Join Waitlist →
            </Link>

          </div>
        </section>

        {/* ════════════════════════════════
            SECTION 4 — COMMUNITY DASHBOARD
        ════════════════════════════════ */}
        <section className="ll-dashboard">
          <div className="ll-dashboard-inner">

            <div className="ll-dashboard-header">
              <div>
                <p className="ll-greeting-sub">Community Hub</p>
                <h2 className="ll-greeting-title">The Lab</h2>
                <p className="ll-greeting-body">{getGreeting()}, {username}. Here's what's happening.</p>
              </div>
              {userRole === 'admin' && (
                <div className="ll-admin-actions">
                  <Link href="/games" className="ll-btn-ghost" style={{ fontSize: '.55rem', padding: '.6rem 1.25rem' }}>
                    Upload Snippet
                  </Link>
                  <Link href="/blog" className="ll-btn-primary" style={{ fontSize: '.55rem', padding: '.6rem 1.25rem' }}>
                    New Post
                  </Link>
                </div>
              )}
            </div>

            {/* Stat Cards */}
            <div className="ll-stats-grid">
              <Link href="/projects" className="ll-stat-card">
                <div className="ll-stat-icon-wrap" style={{ background: 'rgba(139,92,246,.15)', border: '1px solid rgba(139,92,246,.3)' }}>📁</div>
                <div className="ll-stat-label">Active Projects</div>
                <div className="ll-stat-value">{projectCount}</div>
                <span className="ll-stat-arrow">↗</span>
              </Link>

              <Link href="/games" className="ll-stat-card">
                <div className="ll-stat-icon-wrap" style={{ background: 'rgba(236,72,153,.15)', border: '1px solid rgba(236,72,153,.3)' }}>🎮</div>
                <div className="ll-stat-label">Games</div>
                <div className="ll-stat-value">{snippetCount}</div>
                <span className="ll-stat-arrow">↗</span>
              </Link>

              <Link href="/blog" className="ll-stat-card">
                <div className="ll-stat-icon-wrap" style={{ background: 'rgba(59,130,246,.15)', border: '1px solid rgba(59,130,246,.3)' }}>👥</div>
                <div className="ll-stat-label">Community Members</div>
                <div className="ll-stat-value">{memberCount}</div>
                <span className="ll-stat-arrow">↗</span>
              </Link>

              <div className="ll-stat-card">
                <div className="ll-stat-icon-wrap" style={{ background: 'rgba(34,197,94,.15)', border: '1px solid rgba(34,197,94,.3)' }}>📖</div>
                <div className="ll-stat-label">Total Reads</div>
                <div className="ll-stat-value">{formatNumber(totalPostViews)}</div>
              </div>

              {socialStats.length > 0 && (
                <a href="https://linktr.ee/lota_labs" target="_blank" rel="noopener noreferrer"
                  className="ll-stat-card ll-stat-card-wide">
                  <div className="ll-stat-icon-wrap" style={{ background: 'rgba(245,158,11,.15)', border: '1px solid rgba(245,158,11,.3)' }}>🌐</div>
                  <div>
                    <div className="ll-stat-label">Social Reach</div>
                    <div className="ll-social-grid">
                      {socialStats.map(stat => (
                        <div key={stat.platform} className="ll-social-item">
                          <span className="ll-social-platform">
                            {stat.platform === 'Instagram' && '📸 '}
                            {stat.platform === 'Tiktok' && '🎵 '}
                            {stat.platform === 'LinkedIn' && '💼 '}
                            {stat.platform === 'Twitter' && '🐦 '}
                            {stat.platform === 'YouTube' && '📺 '}
                            {stat.platform}
                          </span>
                          <strong className="ll-social-count">{formatNumber(stat.count)}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                  <span className="ll-stat-arrow">↗</span>
                </a>
              )}
            </div>

            {/* Activity Feed + Side */}
            <div className="ll-content-grid">
              <div className="ll-panel">
                <div className="ll-panel-header">
                  <div>
                    <div className="ll-panel-title">Recent Activity</div>
                    <div className="ll-panel-meta">Latest across the platform</div>
                  </div>
                  <Link href="/blog" className="ll-panel-link">View All →</Link>
                </div>

                <div className="ll-activity-feed">
                  {recentActivity.length === 0 ? (
                    <div className="ll-empty-state">
                      <span className="ll-empty-state-icon">📭</span>
                      <span className="ll-empty-state-text">No recent activity</span>
                    </div>
                  ) : (
                    recentActivity.map((activity) => (
                      <Link
                        key={activity.id}
                        href={
                          activity.type === 'comment' ? `/blog/${activity.post?.id}?reply=${activity.id}`
                          : activity.type === 'post' ? `/blog/${activity.id}`
                          : `/projects?project=${activity.id}`
                        }
                        className="ll-activity-item"
                      >
                        <div className={`ll-activity-icon ll-activity-icon-${activity.type}`}>
                          {activity.type === 'comment' ? '💬' : activity.type === 'post' ? '✍️' : '📁'}
                        </div>
                        <div>
                          <div className="ll-activity-text">
                            {activity.type === 'comment'
                              ? <span><strong>{activity.author?.username || 'Anonymous'}</strong> commented on <strong>"{activity.post?.title || 'a post'}"</strong></span>
                              : activity.type === 'post'
                              ? <span>New Post: <strong>"{activity.title}"</strong></span>
                              : <span>New Project: <strong>"{activity.title}"</strong></span>
                            }
                          </div>
                          <div className="ll-activity-time">{getRelativeTime(activity.created_at)}</div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>

              {/* Side: quick stats / featured */}
              <div className="ll-panel" style={{ borderLeft: '1px solid var(--slate)', background: 'var(--abyss)' }}>
                <div className="ll-panel-header">
                  <div>
                    <div className="ll-panel-title">Now Playing</div>
                    <div className="ll-panel-meta">Featured experience</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{
                    padding: '1.25rem',
                    border: '1px solid rgba(192,144,40,.25)',
                    background: 'rgba(192,144,40,.05)',
                    borderRadius: '2px',
                  }}>
                    <div style={{
                      fontFamily: 'var(--font-title)', fontSize: '.45rem', letterSpacing: '.3em',
                      color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '.5rem'
                    }}>
                      Chapter 1 Demo
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--white)', marginBottom: '.6rem' }}>
                      Supernatural Fugitive
                    </div>
                    <div style={{ fontSize: '.95rem', color: 'var(--fog)', lineHeight: '1.5', marginBottom: '1rem' }}>
                      You are a first responder. Something inhabits a man on Jonathan Street.
                      And an angel has been waiting for you.
                    </div>
                    <Link href="/games" className="ll-btn-primary" style={{ fontSize: '.55rem', padding: '.6rem 1.25rem', width: '100%', justifyContent: 'center' }}>
                      <span>▶ Play Now</span>
                    </Link>
                  </div>

                  <div style={{
                    padding: '1.25rem',
                    border: '1px solid rgba(85,53,160,.3)',
                    background: 'rgba(45,26,92,.15)',
                    borderRadius: '2px',
                  }}>
                    <div style={{
                      fontFamily: 'var(--font-title)', fontSize: '.45rem', letterSpacing: '.3em',
                      color: 'var(--soul-mid)', textTransform: 'uppercase', marginBottom: '.5rem'
                    }}>
                      Coming Q2 2026
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--white)', marginBottom: '.6rem' }}>
                      Keeper's Vigil
                    </div>
                    <Link href="/blog" className="ll-btn-soul" style={{ fontSize: '.55rem', padding: '.6rem 1.25rem', width: '100%', justifyContent: 'center' }}>
                      Join Waitlist →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="ll-quick-links">
              <div className="ll-quick-links-label">Navigate</div>
              <div className="ll-quick-links-grid">
                <Link href="/projects" className="ll-quick-link"><span className="ll-quick-link-icon">📁</span>Browse Projects</Link>
                <Link href="/games" className="ll-quick-link"><span className="ll-quick-link-icon">🎮</span>Play Games</Link>
                <Link href="/blog" className="ll-quick-link"><span className="ll-quick-link-icon">📝</span>Read Blog</Link>
                <Link href="/profile" className="ll-quick-link"><span className="ll-quick-link-icon">⚙️</span>Profile Settings</Link>
              </div>
            </div>

          </div>
        </section>

      </div>
    </>
  );
}
