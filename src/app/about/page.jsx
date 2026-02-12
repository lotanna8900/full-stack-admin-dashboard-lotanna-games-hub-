"use client";
import Link from 'next/link';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="section">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>About Me</h1>
          <p className="dashboard-subtitle">Architecting the intersection of Interactive Fiction, Blockchain, and AI.</p>
        </div>
      </div>

      <div className="content-card about-content-wrapper">
        <div className="about-grid">

          {/* --- Main Content (Left) --- */}
          <div className="about-main-content">
            <div className="about-section">
              <div className="about-section-header">
                <span className="about-section-icon">👋</span>
                <h2 className="about-section-title">Who I Am</h2>
              </div>
              <p>
                I'm <strong>Lotanna</strong>, a Senior Product Engineer & AI Systems Architect. I specialize in building 
                complex, stateful systems, from <strong>self-evolving AI agents</strong> to <strong>blockchain-integrated narrative engines</strong>.
              </p>
              <p>
                I don’t just write code; I engineer reliability. Currently, I am a <strong>Core Contributor to Hive (YC S24)</strong>, 
                where I architected the <em>EvolutionGuard</em> safety protocol, a transactional rollback system that prevents 
                autonomous AI agents from breaking themselves. I merge this rigorous backend engineering with high-performance 
                frontend product work.
              </p>
            </div>

            <div className="about-section">
              <div className="about-section-header">
                <span className="about-section-icon">🚀</span>
                <h2 className="about-section-title">What is Lota Labs?</h2>
              </div>
              <p>
                Lota Labs is my proof of work. It is a vertically integrated 
                <strong>"Story-to-Chain" platform</strong> designed to solve the ownership gap in interactive media. 
              </p>
              <p>
                It features a custom-built <strong>Node-Based Runtime</strong> that compiles standard fiction scripts into 
                interactive React components, triggering real-time blockchain events (Wagmi/Viem) based on user choices. 
                This isn't a template; it's a custom engine built on <strong>Next.js 15, PostgreSQL,</strong> and <strong>Graph Theory</strong>.
              </p>

              <div className="about-section-header">
                <span className="about-section-icon">🛠️</span>
                <h2 className="about-section-title">My Stack</h2>
              </div>
              
              <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                <li><strong>Core:</strong> Next.js (App Router), TypeScript, Python (Asyncio)</li>
                <li><strong>AI & Data:</strong> AI Agent Frameworks, Graph Algorithms, Supabase/PostgreSQL</li>
                <li><strong>Web3:</strong> Wagmi, Viem, Solidity Integration</li>
                <li><strong>Infra:</strong> Docker, Git, CI/CD Pipelines</li>
              </ul>
            </div>

            <div className="about-features-grid">
              <div className="about-feature-card">
                <div className="feature-icon">🧠</div>
                <h3>AI Engineering</h3>
                <p>Architecting safety layers and state management for autonomous agent systems.</p>
              </div>
              <div className="about-feature-card">
                <div className="feature-icon">💼</div>
                <h3>Projects</h3>
                <p>A curated list of my deployed applications, open-source contributions, and game engines.</p>
              </div>
              <div className="about-feature-card">
                <div className="feature-icon">⚡</div>
                <h3>Snippets</h3>
                <p>Links to demo or nearly finished games and tools.</p>
              </div>
            </div>

            <div className="about-section">
              <div className="about-section-header">
                <span className="about-section-icon">💬</span>
                <h2 className="about-section-title">Partner with me</h2>
              </div>
              <p>
               I am currently available for Senior Engineering roles (Remote). If you need an engineer who can architect 
               secure backend logic, build intuitive frontends, and ship production-grade AI/Web3 features, let's talk.
              </p>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                <a 
                  href="mailto:lotanna8900@gmail.com" 
                  className="btn btn-primary"
                >
                  📧 Contact Me
                </a>
                <a 
                  href="https://github.com/lotanna8900" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn"
                >
                  🔗 View GitHub
                </a>
              </div>
            </div>
          </div> 

          {/* --- Sidebar (Right) --- */}
          <div className="about-sidebar">
            <div className="about-profile-card">
              <div className="profile-image-wrapper">
                <Image
                  src="https://rkhmjcwqsmgzqtmvdblm.supabase.co/storage/v1/object/public/admin-assets/1763221434080_2a79acc0-f2bd-4c69-beb9-1e89ecf625e1.jpeg"
                  alt="Lotanna"
                  width={200}
                  height={200}
                  className="profile-image"
                  style={{ objectFit: 'cover', objectPosition: 'top' }}
                />
              </div>
              
              <h3 className="profile-name">Lotanna</h3>
              <p className="profile-title">Senior Product Engineer<br/>& AI Architect</p>
              
              <div className="profile-stats">
                <div className="profile-stat">
                  <div className="stat-value">4+</div>
                  <div className="stat-label">Years Experience</div>
                </div>
                <div className="profile-stat">
                  <div className="stat-value">5+</div>
                  <div className="stat-label">Major Projects</div>
                </div>
              </div>

              <a 
                href="https://buymeacoffee.com/lotalabs"
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-primary support-button"
              >
                <span>☕</span>
                Support My Work
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}