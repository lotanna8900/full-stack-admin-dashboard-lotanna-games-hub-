"use client";
import Link from 'next/link';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="section">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>About Me</h1>
          <p className="dashboard-subtitle">A little bit about who I am and what Lota Labs is all about.</p>
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
                I'm <strong>Lotanna</strong>, a Full-Stack Product Engineer who builds complex, production-grade 
                applications from scratch. I specialize in the <strong>Next.js ecosystem (App Router, Server Actions), 
                TypeScript,</strong> and <strong>Supabase</strong>, merging rigorous software engineering with intuitive user experiences.
              </p>
              <p>
                I don’t just write code; I engineer systems. Whether it’s reverse-engineering narrative engines for <strong>Lota Labs</strong> 
                or building custom revenue platforms for clients, I focus on shipping clean, scalable, and high-performance 
                software that solves actual business problems.
              </p>
            </div>

            <div className="about-section">
              <div className="about-section-header">
                <span className="about-section-icon">🚀</span>
                <h2 className="about-section-title">What is Lota Labs?</h2>
              </div>
              <p>
                You are looking at it. Lota Labs is my proof of work, a vertically integrated 
                <strong>"Story-to-Chain" platform</strong> I architected to solve the ownership gap in interactive media. 
                It is built with <strong>Next.js 15, PostgreSQL,</strong> and <strong>Web3 technologies (Wagmi/Viem)</strong>. It features 
                a custom-built React interpreter that parses standard fiction scripts and triggers real-time 
                blockchain events. This isn't a template; it's a custom engine.
              </p>

              <div className="about-section-header">
                <span className="about-section-icon">🛠️</span>
                <h2 className="about-section-title">My Stack</h2>
              </div>
              
              <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
                <li>Core: Next.js (App Router), React, Typescript, Node.js</li>
                <li>Backend: Supabase (Auth, DB, Realtime), PostgreSQL, Edge Functions</li>
                <li>Web3: Wagmi, Viem, Solidity Integration</li>
                <li>Tools: Git, Docker, Paystack, Resend</li>
              </ul>
            </div>

            <div className="about-features-grid">
              <div className="about-feature-card">
                <div className="feature-icon">📝</div>
                <h3>Blog</h3>
                <p>Deep dives into engineering challenges, Web3 integration, and the architecture behind interactive fiction.</p>
              </div>
              <div className="about-feature-card">
                <div className="feature-icon">💼</div>
                <h3>Projects</h3>
                <p>A curated list of my deployed applications, client work, and game engines.</p>
              </div>
              <div className="about-feature-card">
                <div className="feature-icon">⚡</div>
                <h3>Snippets</h3>
                <p>Links to demo or nearly finished games.</p>
              </div>
            </div>

            <div className="about-section">
              <div className="about-section-header">
                <span className="about-section-icon">💬</span>
                <h2 className="about-section-title">Work with me</h2>
              </div>
              <p>
               I am currently available for contract work and full-time remote roles. If you are looking for a developer who can take a feature from database design to UI implementation with minimal hand-holding, let's talk.
                You can also submit a <Link href="/support" className="inline-link">support ticket</Link> if you find any bugs on the site.
              </p>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                <Link href="/support" className="btn btn-primary">
                  📧 Get Support
                </Link>
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
              <p className="profile-title">Full-Stack Product Engineer</p>
              
              <div className="profile-stats">
                <div className="profile-stat">
                  <div className="stat-value">4+</div>
                  <div className="stat-label">Years Experience</div>
                </div>
                <div className="profile-stat">
                  <div className="stat-value">5+</div>
                  <div className="stat-label">Projects Built</div>
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