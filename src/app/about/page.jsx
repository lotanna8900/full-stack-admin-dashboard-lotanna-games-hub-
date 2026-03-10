"use client";
import Link from 'next/link';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="section" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div className="dashboard-header" style={{ marginBottom: '3rem' }}>
        <div className="dashboard-title">
          <h1 style={{ fontSize: '2.5rem', color: 'var(--white)', marginBottom: '0.5rem' }}>About Me</h1>
          <p className="dashboard-subtitle" style={{ fontSize: '1.1rem', color: 'var(--fog)' }}>
            Architecting the intersection of Interactive Fiction, Blockchain, and AI.
          </p>
        </div>
      </div>

      <div className="content-card about-content-wrapper" style={{ background: 'var(--abyss)', border: '1px solid var(--slate)' }}>
        <div className="about-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '4rem', padding: '2rem' }}>

          {/* --- Main Content (Left) --- */}
          <div className="about-main-content" style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            
            <div className="about-section">
              <div className="about-section-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <span className="about-section-icon" style={{ fontSize: '1.5rem' }}>👋</span>
                <h2 className="about-section-title" style={{ fontSize: '1.5rem', color: 'var(--white)', margin: 0 }}>Who I Am</h2>
              </div>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--ash)', marginBottom: '1rem' }}>
                I'm <strong>Lotanna</strong>, a Senior Product Engineer and the Founder of Lota Labs. I specialize in building 
                complex, stateful systems—from <strong>self-evolving AI agents</strong> to <strong>blockchain-integrated narrative engines</strong>.
              </p>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--ash)' }}>
                I don’t just write code; I engineer reliability. Currently, I am a Core Contributor to Hive (YC S24), 
                where I built an offline analysis tool called <code>hive diff</code> to streamline autonomous agent evaluations. I merge this rigorous backend engineering with high-performance frontend product design.
              </p>
            </div>

            <div className="about-section">
              <div className="about-section-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <span className="about-section-icon" style={{ fontSize: '1.5rem' }}>🚀</span>
                <h2 className="about-section-title" style={{ fontSize: '1.5rem', color: 'var(--white)', margin: 0 }}>The Lota Labs Vision</h2>
              </div>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--ash)', marginBottom: '1rem' }}>
                Lota Labs is my flagship studio and technical proof of work. It is a vertically integrated 
                <strong> "Story-to-Chain" platform</strong> designed to solve the ownership gap in interactive media. 
              </p>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--ash)', marginBottom: '2rem' }}>
                It features a custom-built Node-Based Runtime that compiles standard fiction scripts into 
                interactive React components, triggering real-time Web3 events based on user choices. 
                This isn't a template; it's a proprietary engine built on <strong>Next.js 15, PostgreSQL,</strong> and <strong>Graph Theory</strong>.
              </p>

              <div className="about-section-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <span className="about-section-icon" style={{ fontSize: '1.5rem' }}>🛠️</span>
                <h2 className="about-section-title" style={{ fontSize: '1.5rem', color: 'var(--white)', margin: 0 }}>My Stack</h2>
              </div>
              
              <ul style={{ listStyleType: 'none', padding: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', color: 'var(--ash)', fontSize: '1.05rem' }}>
                <li style={{ background: 'var(--deep)', padding: '1rem', borderRadius: '4px', border: '1px solid var(--slate)' }}><strong>Core:</strong> Next.js (App Router), TypeScript, Python</li>
                <li style={{ background: 'var(--deep)', padding: '1rem', borderRadius: '4px', border: '1px solid var(--slate)' }}><strong>AI & Data:</strong> Agent Frameworks, Supabase/PostgreSQL</li>
                <li style={{ background: 'var(--deep)', padding: '1rem', borderRadius: '4px', border: '1px solid var(--slate)' }}><strong>Web3:</strong> Wagmi, Viem, Solidity Integration</li>
                <li style={{ background: 'var(--deep)', padding: '1rem', borderRadius: '4px', border: '1px solid var(--slate)' }}><strong>Infra:</strong> Docker, Git, CI/CD Pipelines</li>
              </ul>
            </div>

            <div className="about-features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="about-feature-card" style={{ background: 'var(--deep)', padding: '1.5rem', border: '1px solid var(--slate)', borderRadius: '4px' }}>
                <div className="feature-icon" style={{ fontSize: '2rem', marginBottom: '1rem' }}>🧠</div>
                <h3 style={{ color: 'var(--white)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>AI Engineering</h3>
                <p style={{ color: 'var(--fog)', fontSize: '0.9rem', lineHeight: '1.5' }}>Architecting safety layers and state management for autonomous systems.</p>
              </div>
              <div className="about-feature-card" style={{ background: 'var(--deep)', padding: '1.5rem', border: '1px solid var(--slate)', borderRadius: '4px' }}>
                <div className="feature-icon" style={{ fontSize: '2rem', marginBottom: '1rem' }}>💼</div>
                <h3 style={{ color: 'var(--white)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Projects</h3>
                <p style={{ color: 'var(--fog)', fontSize: '0.9rem', lineHeight: '1.5' }}>My deployed applications and open-source contributions.</p>
              </div>
              <div className="about-feature-card" style={{ background: 'var(--deep)', padding: '1.5rem', border: '1px solid var(--slate)', borderRadius: '4px' }}>
                <div className="feature-icon" style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎮</div>
                <h3 style={{ color: 'var(--white)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Games</h3>
                <p style={{ color: 'var(--fog)', fontSize: '0.9rem', lineHeight: '1.5' }}>Playable demos powered by the Lota Labs narrative engine.</p>
              </div>
            </div>

            <div className="about-section" style={{ background: 'linear-gradient(135deg, rgba(192,144,40,0.1), transparent)', padding: '2rem', borderRadius: '8px', border: '1px solid rgba(192,144,40,0.3)' }}>
              <div className="about-section-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <span className="about-section-icon" style={{ fontSize: '1.5rem' }}>🤝</span>
                <h2 className="about-section-title" style={{ fontSize: '1.5rem', color: 'var(--gold-bright)', margin: 0 }}>Partner With Me</h2>
              </div>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--bone)' }}>
               While scaling Lota Labs, I remain open to Senior Engineering and high-impact consulting roles (Remote). If you need an architect who can secure backend logic, build premium frontends, and ship production-grade AI/Web3 features, let's talk.
              </p>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                <a href="mailto:lotanna8900@gmail.com" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, var(--ember) 0%, var(--ember-hot) 100%)', padding: '0.75rem 1.5rem', fontWeight: 'bold' }}>
                  📧 Contact Me
                </a>
                <a href="https://github.com/lotanna8900" target="_blank" rel="noopener noreferrer" className="btn" style={{ background: 'transparent', border: '1px solid var(--fog)', padding: '0.75rem 1.5rem' }}>
                  🔗 View GitHub
                </a>
              </div>
            </div>
          </div> 

          {/* --- Sidebar (Right) --- */}
          <div className="about-sidebar" style={{ position: 'sticky', top: '2rem', height: 'fit-content' }}>
            <div className="about-profile-card" style={{ background: 'var(--deep)', padding: '2rem', border: '1px solid var(--slate)', borderRadius: '8px', textAlign: 'center' }}>
              <div className="profile-image-wrapper" style={{ width: '200px', height: '200px', margin: '0 auto 1.5rem', borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--gold)', boxShadow: 'var(--glow-gold)' }}>
                <Image
                  src="https://rkhmjcwqsmgzqtmvdblm.supabase.co/storage/v1/object/public/admin-assets/1763221434080_2a79acc0-f2bd-4c69-beb9-1e89ecf625e1.jpeg"
                  alt="Lotanna"
                  width={200}
                  height={200}
                  className="profile-image"
                  style={{ objectFit: 'cover', objectPosition: 'top', width: '100%', height: '100%' }}
                />
              </div>
              
              <h3 className="profile-name" style={{ fontSize: '1.8rem', color: 'var(--white)', marginBottom: '0.25rem', fontFamily: 'var(--font-display)' }}>Lotanna</h3>
              <p className="profile-title" style={{ fontSize: '1rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '2rem' }}>Founder & Technical Architect</p>
              
              <div className="profile-stats" style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem', padding: '1rem 0', borderTop: '1px solid var(--slate)', borderBottom: '1px solid var(--slate)' }}>
                <div className="profile-stat">
                  <div className="stat-value" style={{ fontSize: '1.8rem', color: 'var(--white)', fontWeight: 'bold' }}>4+</div>
                  <div className="stat-label" style={{ fontSize: '0.8rem', color: 'var(--fog)', textTransform: 'uppercase' }}>Years Exp</div>
                </div>
                <div className="profile-stat">
                  <div className="stat-value" style={{ fontSize: '1.8rem', color: 'var(--white)', fontWeight: 'bold' }}>5+</div>
                  <div className="stat-label" style={{ fontSize: '0.8rem', color: 'var(--fog)', textTransform: 'uppercase' }}>Major Projects</div>
                </div>
              </div>

              <a 
                href="https://buymeacoffee.com/lotalabs"
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-primary support-button"
                style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem', background: 'var(--soul-mid)', padding: '1rem' }}
              >
                <span>☕</span> Support My Work
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}