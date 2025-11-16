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
                I'm <strong>Lotanna</strong>, a full-stack developer and creative writer who enjoys building products 
                that blend solid engineering with thoughtful storytelling. My technical work revolves around Next.js, 
                TypeScript, React, and Supabase, along with the wider ecosystem around them, and I use these tools to bring ideas to life. 
                From web apps to interactive experiences.
              </p>
              <p>
                I’ve always approached development creatively. Writing taught me how to think in systems, structure ideas, 
                and design experiences that feel intentional. Today, that combination helps me build <strong>clean, 
                scalable applications while keeping the human side of technology front and center.</strong>.
              </p>
            </div>

            <div className="about-section">
              <div className="about-section-header">
                <span className="about-section-icon">🚀</span>
                <h2 className="about-section-title">What is Lota Labs?</h2>
              </div>
              <p>
                I’m also growing Lota Labs into a space where creativity, engineering, and experimentation meet. 
                Whether it’s collaborating with others, developing new tools, or crafting narrative-driven projects, 
                I enjoy working with people who care about building meaningful things.
              </p>
              
              <div className="about-features-grid">
                <div className="about-feature-card">
                  <div className="feature-icon">📝</div>
                  <h3>Blog</h3>
                  <p>Devlogs, discussions, and thoughts on games and the industry</p>
                </div>
                <div className="about-feature-card">
                  <div className="feature-icon">💼</div>
                  <h3>Projects</h3>
                  <p>A curated list of my completed and in-progress games</p>
                </div>
                <div className="about-feature-card">
                  <div className="feature-icon">⚡</div>
                  <h3>Snippets</h3>
                  <p>Links to demo or nearly finished games.</p>
                </div>
              </div>
            </div>

            <div className="about-section">
              <div className="about-section-header">
                <span className="about-section-icon">💬</span>
                <h2 className="about-section-title">Get In Touch</h2>
              </div>
              <p>
                If you're looking to work together, whether it's a project, a product idea, or something experimental, I'm open to connecting.
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
              <p className="profile-title">Full-Stack Developer and Creative Writer</p>
              
              <div className="profile-stats">
                <div className="profile-stat">
                  <div className="stat-value">3+</div>
                  <div className="stat-label">Years Experience</div>
                </div>
                <div className="profile-stat">
                  <div className="stat-value">20+</div>
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