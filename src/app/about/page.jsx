"use client";
import Link from 'next/link';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="section" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div className="dashboard-header" style={{ marginBottom: '3rem' }}>
        <div className="dashboard-title">
          <h1 style={{ fontSize: '2.5rem', color: 'var(--white)', marginBottom: '0.5rem' }}>About Us</h1>
          <p className="dashboard-subtitle" style={{ fontSize: '1.1rem', color: 'var(--fog)' }}>
            Architecting the intersection of Interactive Fiction, Blockchain, and Digital Storytelling.
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
                <h2 className="about-section-title" style={{ fontSize: '1.5rem', color: 'var(--white)', margin: 0 }}>The Engineering</h2>
              </div>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--ash)', marginBottom: '1rem' }}>
                I'm <strong>Lotanna</strong>, a Senior Product Engineer and the Founder of Lota Labs. I specialize in building 
                complex, stateful systems and <strong>highly immersive interactive experiences</strong>.
              </p>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--ash)' }}>
                I'm not the sort of dev that just writes code; Nope, I engineer reliability. Currently, I am a Core Contributor to Hive (YC S24), 
                where I built an offline analysis tool called <code>hive diff</code> to streamline complex system evaluations. I merge this rigorous backend engineering with high-performance frontend product design to build worlds where your choices actually matter.
              </p>
            </div>

            <div className="about-section">
              <div className="about-section-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <span className="about-section-icon" style={{ fontSize: '1.5rem' }}>🚀</span>
                <h2 className="about-section-title" style={{ fontSize: '1.5rem', color: 'var(--white)', margin: 0 }}>The Lota Labs Vision</h2>
              </div>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--ash)', marginBottom: '1rem' }}>
                Lota Labs is our flagship studio and technical proof of work. It is a vertically integrated 
                <strong> "Story-to-Chain" platform</strong> designed to solve the ownership gap in interactive media. 
              </p>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--ash)', marginBottom: '2rem' }}>
                It features a custom-built Node-Based Runtime that compiles standard fiction scripts into 
                interactive React components, triggering real-time Web3 events based on user choices. 
                This isn't a template; it's a proprietary engine built on <strong>Next.js 15, PostgreSQL,</strong> and <strong>Graph Theory</strong>.
              </p>
            </div>

            {/* --- MANIFESTO BLOCK --- */}
            <div className="about-section" style={{ padding: '2.5rem', border: '1px solid var(--slate)', borderRadius: '8px', background: 'var(--deep)' }}>
              <div className="about-section-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <span className="about-section-icon" style={{ fontSize: '1.5rem' }}>📖</span>
                <h2 className="about-section-title" style={{ fontSize: '1.5rem', color: 'var(--white)', margin: 0 }}>Our Philosophy</h2>
              </div>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--ash)', marginBottom: '2rem' }}>
                We believe interactive fiction is one of the most underexplored art forms of our time. We are building narratives where your choices carry moral weight, where characters breathe, and where the world responds to who you are.
              </p>

              <div style={{ marginBottom: '2.5rem', padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderLeft: '4px solid var(--gold)', borderRadius: '4px' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--gold-bright)', marginBottom: '0.75rem', fontFamily: 'var(--font-title)' }}>
                  ✦ True Ownership of Your Story
                </h3>
                <p style={{ fontSize: '1.05rem', lineHeight: '1.7', color: 'var(--bone)' }}>
                  We are pioneering the bridge between interactive narrative and true digital ownership. For traditional players, it is a seamless, immersive RPG. But for those who want to go deeper, you can connect your wallet and forge your choices into the blockchain. The artifacts you earn actually belong to you. <strong>No friction, no forced jargon. Just absolute player agency.</strong>
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div style={{ background: 'var(--abyss)', padding: '1.5rem', border: '1px solid var(--slate)', borderRadius: '4px' }}>
                  <div style={{ fontFamily: 'var(--font-title)', fontSize: '0.9rem', color: 'var(--white)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>⚔️ Dark Narrative</div>
                  <p style={{ color: 'var(--fog)', fontSize: '0.95rem', lineHeight: '1.5' }}>Stories for adults. Moral ambiguity, real consequence, earned catharsis.</p>
                </div>
                <div style={{ background: 'var(--abyss)', padding: '1.5rem', border: '1px solid var(--slate)', borderRadius: '4px' }}>
                  <div style={{ fontFamily: 'var(--font-title)', fontSize: '0.9rem', color: 'var(--white)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>🎭 Player Agency</div>
                  <p style={{ color: 'var(--fog)', fontSize: '0.95rem', lineHeight: '1.5' }}>Your identity, your choices, your story. No two playthroughs are the same.</p>
                </div>
                <div style={{ background: 'var(--abyss)', padding: '1.5rem', border: '1px solid var(--slate)', borderRadius: '4px' }}>
                  <div style={{ fontFamily: 'var(--font-title)', fontSize: '0.9rem', color: 'var(--white)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>🌐 Community-First</div>
                  <p style={{ color: 'var(--fog)', fontSize: '0.95rem', lineHeight: '1.5' }}>Built in public. Lota Labs is as much the players' studio as ours.</p>
                </div>
                <div style={{ background: 'var(--abyss)', padding: '1.5rem', border: '1px solid var(--slate)', borderRadius: '4px' }}>
                  <div style={{ fontFamily: 'var(--font-title)', fontSize: '0.9rem', color: 'var(--white)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>✨ Craft Over Clicks</div>
                  <p style={{ color: 'var(--fog)', fontSize: '0.95rem', lineHeight: '1.5' }}>Every word earns its place. Quality of story above quantity of content.</p>
                </div>
              </div>
            </div>

            {/* --- RESUME --- */}
            <div className="about-section">
              <div className="about-section-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <span className="about-section-icon" style={{ fontSize: '1.5rem' }}>🛠️</span>
                <h2 className="about-section-title" style={{ fontSize: '1.5rem', color: 'var(--white)', margin: 0 }}>The Stack</h2>
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
                <div className="feature-icon" style={{ fontSize: '2rem', marginBottom: '1rem' }}>📈</div>
                <h3 style={{ color: 'var(--white)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Digital Strategy</h3>
                <p style={{ color: 'var(--fog)', fontSize: '0.9rem', lineHeight: '1.5' }}>Translating complex narrative mechanics into engaging community content.</p>
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
                <h2 className="about-section-title" style={{ fontSize: '1.5rem', color: 'var(--gold-bright)', margin: 0 }}>Partner With Us</h2>
              </div>
              <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: 'var(--bone)' }}>
               While scaling Lota Labs, we remain open to strategic collaborations. Whether you need a technical architect for production-grade AI/Web3 features, or a digital strategist to elevate your brand's content, let's talk.
              </p>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                <a href="mailto:lotanna8900@gmail.com" className="btn btn-primary" style={{ background: 'linear-gradient(135deg, var(--ember) 0%, var(--ember-hot) 100%)', padding: '0.75rem 1.5rem', fontWeight: 'bold', textDecoration: 'none', color: 'var(--white)', borderRadius: '4px' }}>
                  📧 Contact Lota Labs
                </a>
                <a href="https://github.com/lotanna8900" target="_blank" rel="noopener noreferrer" className="btn" style={{ background: 'transparent', border: '1px solid var(--fog)', padding: '0.75rem 1.5rem', textDecoration: 'none', color: 'var(--white)', borderRadius: '4px' }}>
                  🔗 View GitHub
                </a>
              </div>
            </div>
          </div> 

          {/* --- Sidebar (Right - The Team) --- */}
          <div className="about-sidebar" style={{ position: 'sticky', top: '2rem', height: 'fit-content', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
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
              <p className="profile-title" style={{ fontSize: '0.9rem', color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1.5rem' }}>Founder & Technical Architect</p>
              
              <div className="profile-stats" style={{ display: 'flex', justifyContent: 'center', gap: '2rem', padding: '1rem 0', borderTop: '1px solid var(--slate)' }}>
                <div className="profile-stat">
                  <div className="stat-value" style={{ fontSize: '1.5rem', color: 'var(--white)', fontWeight: 'bold' }}>4+</div>
                  <div className="stat-label" style={{ fontSize: '0.75rem', color: 'var(--fog)', textTransform: 'uppercase' }}>Years Exp</div>
                </div>
                <div className="profile-stat">
                  <div className="stat-value" style={{ fontSize: '1.5rem', color: 'var(--white)', fontWeight: 'bold' }}>5+</div>
                  <div className="stat-label" style={{ fontSize: '0.75rem', color: 'var(--fog)', textTransform: 'uppercase' }}>Major Projects</div>
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
  );
}