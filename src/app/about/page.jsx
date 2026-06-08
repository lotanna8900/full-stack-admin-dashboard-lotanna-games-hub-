"use client";
import Link from 'next/link';
import Image from 'next/image';

// ─── STYLES ────────────────────────
const styles = `
  * { box-sizing: border-box; }

  /* Master Lock to prevent any horizontal scrolling */
  .about-page-root {
    overflow-x: hidden;
    width: 100%;
    position: relative;
  }

  /* Desktop Defaults */
  .about-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 4rem;
    padding: 2rem;
  }
  
  .philosophy-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }

  .about-features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.25rem;
  }

  .philosophy-highlight {
    margin-bottom: 2.5rem;
    padding: 2rem;
    background: var(--deep);
    border: 1px solid var(--slate);
    border-left: 4px solid var(--gold);
    border-radius: 4px;
  }

  .partner-section {
    background: linear-gradient(135deg, rgba(192,144,40,0.1), transparent);
    padding: 2.5rem 2rem;
    border-radius: 8px;
    border: 1px solid rgba(192,144,40,0.3);
  }

  .about-sidebar {
    position: sticky;
    top: 2rem;
    height: fit-content;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  /* ── RESPONSIVE OVERRIDES ── */
  @media (max-width: 900px) {
    .about-grid {
      grid-template-columns: 1fr;
      gap: 3rem;
      padding: 1.5rem 1rem;
    }
    
    .about-sidebar {
      position: static;
      height: auto;
    }

    .philosophy-grid { grid-template-columns: 1fr; }
  }

  /* ── STRICT MOBILE CLEANUP ── */
  @media (max-width: 600px) {
    /* Scale down large paddings so they don't blow out the viewport */
    .philosophy-highlight { padding: 1.25rem; }
    .partner-section { padding: 1.5rem 1.25rem; }
    
    /* Override the 280px minmax so it cleanly stacks to 1 column */
    .about-features-grid { grid-template-columns: 1fr; }
  }
`;

export default function AboutPage() {
  return (
    <>
      <style>{styles}</style>
      <div className="about-page-root">
        <div className="section" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
          <div className="dashboard-header" style={{ marginBottom: '3rem' }}>
            <div className="dashboard-title">
              <h1 style={{ fontSize: '2.5rem', color: 'var(--white)', marginBottom: '0.5rem' }}>About Us</h1>
              <p className="dashboard-subtitle" style={{ fontSize: '1.1rem', color: 'var(--fog)' }}>
                Crafting immersive interactive fiction, deep narratives, and player-driven digital storytelling.
              </p>
            </div>
          </div>

          <div className="content-card about-content-wrapper" style={{ background: 'var(--abyss)', border: '1px solid var(--slate)' }}>
            <div className="about-grid">

              {/* --- Main Content (to the Left) --- */}
              <div className="about-main-content" style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>
                
                <div className="about-section">
                  <div className="about-section-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <span className="about-section-icon" style={{ fontSize: '1.5rem' }}>👋</span>
                    <h2 className="about-section-title" style={{ fontSize: '1.5rem', color: 'var(--white)', margin: 0 }}>The Creator</h2>
                  </div>
                  <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--ash)', marginBottom: '1rem' }}>
                    I'm <strong>Lotanna</strong>, an indie game developer and interactive fiction writer. I specialize in building 
                    <strong> experiences that are highly immersive, and choice-driven.</strong> Experiences that blur the line between traditional reading and dynamic gaming.
                  </p>
                  <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--ash)' }}>
                    I'm not the sort of developer who just writes linear paths. I do way more. I merge deep world-building with intricate narrative mechanics to build worlds where your choices actually matter. My work draws heavily from dark fantasy and noir aesthetics, focusing on character-driven stories where every decision carries weight.
                  </p>
                </div>

                <div className="about-section">
                  <div className="about-section-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <span className="about-section-icon" style={{ fontSize: '1.5rem' }}>🚀</span>
                    <h2 className="about-section-title" style={{ fontSize: '1.5rem', color: 'var(--white)', margin: 0 }}>The Lota Labs Vision</h2>
                  </div>
                  <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--ash)', marginBottom: '1rem' }}>
                    Lota Labs is an ambitious indie game studio dedicated to pushing the boundaries of interactive fiction. It is a platform designed to solve the immersion gap in text-based media, ensuring that readers feel true agency over the stories that they inhabit. 
                  </p>
                  <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--ash)' }}>
                    Over here we don't use cookie-cutter narrative templates. We build custom storytelling engines that allow for complex branching, which means that every decision you make ripples throughout the game. Long-term, our goal is to grow Lota Labs into a collaborative creative studio, partnering with other talented writers and artists to push the boundaries of what interactive storytelling can achieve.
                  </p>
                </div>

                {/* --- MANIFESTO BLOCK --- */}
                <div className="about-section">
                  <div className="about-section-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <span className="about-section-icon" style={{ fontSize: '1.5rem' }}>📖</span>
                    <h2 className="about-section-title" style={{ fontSize: '1.5rem', color: 'var(--white)', margin: 0 }}>Our Philosophy</h2>
                  </div>
                  <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--ash)', marginBottom: '2rem' }}>
                    We believe interactive fiction is one of the most underexplored art forms of our time. We are building narratives where your choices carry moral weight, where characters breathe, and where the world responds to who you are.
                  </p>

                  <div className="philosophy-highlight">
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--gold-bright)', marginBottom: '0.75rem', fontFamily: 'var(--font-title)' }}>
                      ✦ True Player Agency
                    </h3>
                    <p style={{ fontSize: '1.05rem', lineHeight: '1.7', color: 'var(--bone)' }}>
                      We are pioneering a deeper level of interactive narrative. You are not just reading a book; you are forging your own path, and the consequences of your actions belong entirely to you. We design seamless, immersive RPG experiences that respect your time and intelligence. <strong>No illusions of choice. Just absolute player agency.</strong>
                    </p>
                  </div>

                  <div className="philosophy-grid">
                    <div style={{ background: 'var(--deep)', padding: '1.5rem', border: '1px solid var(--slate)', borderRadius: '4px' }}>
                      <div style={{ fontFamily: 'var(--font-title)', fontSize: '0.9rem', color: 'var(--white)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>⚔️ Dark Narrative</div>
                      <p style={{ color: 'var(--fog)', fontSize: '0.95rem', lineHeight: '1.5' }}>Stories for adults. Moral ambiguity, real consequence, earned catharsis.</p>
                    </div>
                    <div style={{ background: 'var(--deep)', padding: '1.5rem', border: '1px solid var(--slate)', borderRadius: '4px' }}>
                      <div style={{ fontFamily: 'var(--font-title)', fontSize: '0.9rem', color: 'var(--white)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>🎭 Player Agency</div>
                      <p style={{ color: 'var(--fog)', fontSize: '0.95rem', lineHeight: '1.5' }}>Your identity, your choices, your story. No two playthroughs are the same.</p>
                    </div>
                    <div style={{ background: 'var(--deep)', padding: '1.5rem', border: '1px solid var(--slate)', borderRadius: '4px' }}>
                      <div style={{ fontFamily: 'var(--font-title)', fontSize: '0.9rem', color: 'var(--white)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>🌐 Community-First</div>
                      <p style={{ color: 'var(--fog)', fontSize: '0.95rem', lineHeight: '1.5' }}>Built in public. Lota Labs is as much the players' studio as ours.</p>
                    </div>
                    <div style={{ background: 'var(--deep)', padding: '1.5rem', border: '1px solid var(--slate)', borderRadius: '4px' }}>
                      <div style={{ fontFamily: 'var(--font-title)', fontSize: '0.9rem', color: 'var(--white)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>✨ Craft Over Clicks</div>
                      <p style={{ color: 'var(--fog)', fontSize: '0.95rem', lineHeight: '1.5' }}>Every word earns its place. Quality of story above quantity of content.</p>
                    </div>
                  </div>
                </div>

                <div className="about-features-grid">
                  <div className="about-feature-card" style={{ background: 'var(--deep)', padding: '1.5rem', border: '1px solid var(--slate)', borderRadius: '4px' }}>
                    <div className="feature-icon" style={{ fontSize: '2rem', marginBottom: '1rem' }}>🖋️</div>
                    <h3 style={{ color: 'var(--white)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>World Building</h3>
                    <p style={{ color: 'var(--fog)', fontSize: '0.9rem', lineHeight: '1.5' }}>Translating complex lore into engaging, multi-layered interactive worlds.</p>
                  </div>
                  <div className="about-feature-card" style={{ background: 'var(--deep)', padding: '1.5rem', border: '1px solid var(--slate)', borderRadius: '4px' }}>
                    <div className="feature-icon" style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎮</div>
                    <h3 style={{ color: 'var(--white)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Games</h3>
                    <p style={{ color: 'var(--fog)', fontSize: '0.9rem', lineHeight: '1.5' }}>Playable demo adventures powered by the Lota Labs narrative engine.</p>
                  </div>
                </div>

                <div className="about-section partner-section">
                  <div className="about-section-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <span className="about-section-icon" style={{ fontSize: '1.5rem' }}>🤝</span>
                    <h2 className="about-section-title" style={{ fontSize: '1.5rem', color: 'var(--gold-bright)', margin: 0 }}>Partner With Us</h2>
                  </div>
                  <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--bone)' }}>
                   While scaling Lota Labs, we remain open to strategic collaborations. Whether you are a writer with a vision, an artist, or need a digital content strategist to elevate your brand's narrative, let's talk.
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                    <a href="mailto:lotanna8900@gmail.com" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, var(--ember) 0%, var(--ember-hot) 100%)', padding: '0.75rem 1.5rem', fontWeight: 'bold', textDecoration: 'none', color: 'var(--white)', borderRadius: '4px' }}>
                      📧 Contact Lota Labs
                    </a>
                  </div>
                </div>
              </div> 

              {/* -- Sidebar (Right -The Team) - */}
              <div className="about-sidebar">
                
                {/* Founder Card */}
                <div className="about-profile-card" style={{ background: 'var(--deep)', padding: '2rem', border: '1px solid var(--slate)', borderRadius: '8px', textAlign: 'center' }}>
                  <div className="profile-image-wrapper" style={{ width: '180px', height: '180px', margin: '0 auto 1.5rem', borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--gold)', boxShadow: 'var(--glow-gold)' }}>
                    <Image
                      src="https://rkhmjcwqsmgzqtmvdblm.supabase.co/storage/v1/object/public/admin-assets/1763221434080_2a79acc0-f2bd-4c69-beb9-1e89ecf625e1.jpeg"
                      alt="Lotanna"
                      width={180}
                      height={180}
                      className="profile-image"
                      style={{ objectFit: 'cover', objectPosition: 'top', width: '100%', height: '100%' }}
                    />
                  </div>
                  
                  <h3 className="profile-name" style={{ fontSize: '1.8rem', color: 'var(--white)', marginBottom: '0.25rem', fontFamily: 'var(--font-display)' }}>Lotanna</h3>
                  <p className="profile-title" style={{ fontSize: '0.9rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1.5rem' }}>Founder & Lead Developer</p>
                  
                  <div className="profile-stats" style={{ display: 'flex', justifyContent: 'center', gap: '2rem', padding: '1rem 0', borderTop: '1px solid var(--slate)' }}>
                    <div className="profile-stat">
                      <div className="stat-value" style={{ fontSize: '1.5rem', color: 'var(--white)', fontWeight: 'bold' }}>100k+</div>
                      <div className="stat-label" style={{ fontSize: '0.75rem', color: 'var(--fog)', textTransform: 'uppercase' }}>Words Written</div>
                    </div>
                    <div className="profile-stat">
                      <div className="stat-value" style={{ fontSize: '1.5rem', color: 'var(--white)', fontWeight: 'bold' }}>5+</div>
                      <div className="stat-label" style={{ fontSize: '0.75rem', color: 'var(--fog)', textTransform: 'uppercase' }}>Projects</div>
                    </div>
                  </div>
                </div>

                {/* Venus Card */}
                <div className="about-profile-card" style={{ background: 'var(--deep)', padding: '2rem', border: '1px solid var(--slate)', borderRadius: '8px', textAlign: 'center' }}>
                  <div className="profile-image-wrapper" style={{ width: '180px', height: '180px', margin: '0 auto 1.5rem', borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--gold)', boxShadow: 'var(--glow-gold)' }}>
                    <Image
                      src="https://rkhmjcwqsmgzqtmvdblm.supabase.co/storage/v1/object/public/admin-assets/1776337197215_Favor_Photo_(1).jpg"
                      alt="Venus"
                      width={180}
                      height={180}
                      className="profile-image"
                      style={{ objectFit: 'cover', objectPosition: 'top', width: '100%', height: '100%' }}
                    />
                  </div>
                  
                  <h3 className="profile-name" style={{ fontSize: '1.8rem', color: 'var(--white)', marginBottom: '0.25rem', fontFamily: 'var(--font-display)' }}>Venus</h3>
                  <p className="profile-title" style={{ fontSize: '0.9rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1.5rem' }}>Content & Digital Manager</p>
                  
                  <div className="profile-stats" style={{ display: 'flex', justifyContent: 'center', gap: '2rem', padding: '1rem 0', borderTop: '1px solid var(--slate)' }}>
                    <div className="profile-stat">
                      <div className="stat-value" style={{ fontSize: '1.5rem', color: 'var(--white)', fontWeight: 'bold' }}>3+</div>
                      <div className="stat-label" style={{ fontSize: '0.75rem', color: 'var(--fog)', textTransform: 'uppercase' }}>Brands Mgd</div>
                    </div>
                    <div className="profile-stat">
                      <div className="stat-value" style={{ fontSize: '1.5rem', color: 'var(--white)', fontWeight: 'bold' }}>100%</div>
                      <div className="stat-label" style={{ fontSize: '0.75rem', color: 'var(--fog)', textTransform: 'uppercase' }}>Engagement</div>
                    </div>
                  </div>
                </div>

                <a 
                  href="https://buymeacoffee.com/lotalabs"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-primary support-button"
                  style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem', background: 'var(--soul-mid)', padding: '1rem', borderRadius: '4px', textDecoration: 'none', color: 'var(--white)' }}
                >
                  <span>☕</span> Support Our Work
                </a>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}