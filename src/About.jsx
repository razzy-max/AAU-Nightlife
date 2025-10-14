import React from 'react';

export default function About() {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="hero-bg-anim" />
        <div className="about-hero-content">
          <h1 className="about-hero-title">About AAU Nightlife Ekpoma</h1>
          <p className="about-hero-subtitle">
            Connecting the vibrant AAU student community with unforgettable experiences,
            opportunities, and meaningful connections in Ekpoma.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="about-mission">
        <div className="about-container">
          <div className="mission-card">
            <div className="mission-icon">🎯</div>
            <h2>Our Mission</h2>
            <p>
              AAU Nightlife Ekpoma is dedicated to connecting the vibrant student community of
              Ambrose Alli University (AAU) with exciting events, valuable job opportunities,
              and meaningful experiences that enhance campus life in Ekpoma, Edo State.
            </p>
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="about-services">
        <div className="about-container">
          <h2 className="section-title">What We Do</h2>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">🎉</div>
              <h3>Event Promotion</h3>
              <p>Showcasing the best student events, parties, concerts, and social gatherings</p>
            </div>
            <div className="service-card">
              <div className="service-icon">💼</div>
              <h3>Job Opportunities</h3>
              <p>Connecting students with part-time jobs, internships, and career opportunities</p>
            </div>
            <div className="service-card">
              <div className="service-icon">🤝</div>
              <h3>Community Building</h3>
              <p>Fostering connections between students, local businesses, and the broader Ekpoma community</p>
            </div>
            <div className="service-card">
              <div className="service-icon">📢</div>
              <h3>Information Sharing</h3>
              <p>Providing a reliable source for campus news, updates, and announcements</p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="about-story">
        <div className="about-container">
          <div className="story-content">
            <div className="story-text">
              <h2>Our Story</h2>
              <p>
                Founded by students for students, AAU Nightlife Ekpoma was created to address the need
                for a centralized platform where the AAU community could discover events, find opportunities,
                and stay connected.
              </p>
              <p>
                We understand the unique challenges and excitement of student life, and we're committed
                to making every student's experience at AAU memorable and rewarding.
              </p>
            </div>
            <div className="story-visual">
              <div className="story-card">
                <div className="story-stat">
                  <span className="stat-number">1000+</span>
                  <span className="stat-label">Students Connected</span>
                </div>
              </div>
              <div className="story-card">
                <div className="story-stat">
                  <span className="stat-number">50+</span>
                  <span className="stat-label">Events Promoted</span>
                </div>
              </div>
              <div className="story-card">
                <div className="story-stat">
                  <span className="stat-number">100+</span>
                  <span className="stat-label">Job Opportunities</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="about-values">
        <div className="about-container">
          <h2 className="section-title">Our Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">🏆</div>
              <h3>Community First</h3>
              <p>Everything we do is centered around serving the AAU student community</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🌟</div>
              <h3>Safety & Inclusivity</h3>
              <p>We promote safe, welcoming spaces for all students regardless of background</p>
            </div>
            <div className="value-card">
              <div className="value-icon">✨</div>
              <h3>Authenticity</h3>
              <p>We provide genuine, reliable information and opportunities</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🚀</div>
              <h3>Student Success</h3>
              <p>We're committed to helping students thrive academically, socially, and professionally</p>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="about-audience">
        <div className="about-container">
          <div className="audience-grid">
            <div className="audience-card">
              <div className="audience-icon">🎪</div>
              <h3>For Event Organizers</h3>
              <p>
                Are you organizing an event for the AAU community? We offer promotion services
                to help you reach your target audience. Our platform ensures your events get
                the visibility they deserve among engaged students.
              </p>
              <div className="audience-cta">
                <a href="/contact" className="cta-button">Get Started</a>
              </div>
            </div>
            <div className="audience-card">
              <div className="audience-icon">🏢</div>
              <h3>For Employers</h3>
              <p>
                Looking to hire talented AAU students? Our job board connects you with motivated
                students seeking part-time work, internships, and entry-level positions. We
                understand the local market.
              </p>
              <div className="audience-cta">
                <a href="/contact" className="cta-button">Post Jobs</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="about-contact">
        <div className="about-container">
          <div className="contact-content">
            <h2>Get In Touch</h2>
            <p>We'd love to hear from you! Connect with us through any of these channels:</p>
            <div className="contact-methods">
              <a href="mailto:aaunightlife@gmail.com" className="contact-method">
                <div className="contact-icon">📧</div>
                <span>aaunightlife@gmail.com</span>
              </a>
              <a href="https://wa.me/2349037558818" className="contact-method">
                <div className="contact-icon">📱</div>
                <span>+234 903 755 8818</span>
              </a>
              <a href="https://www.instagram.com/aau_nightlife" className="contact-method">
                <div className="contact-icon">📷</div>
                <span>@aau_nightlife</span>
              </a>
              <a href="https://www.tiktok.com/@aau_nightlife" className="contact-method">
                <div className="contact-icon">🎵</div>
                <span>@aau_nightlife</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="about-footer-cta">
        <div className="about-container">
          <div className="footer-cta-content">
            <h2>Ready to Join the Community?</h2>
            <p>Discover events, find opportunities, and connect with the AAU community today!</p>
            <div className="footer-cta-buttons">
              <a href="/events" className="cta-button primary">Explore Events</a>
              <a href="/jobs" className="cta-button secondary">Find Jobs</a>
            </div>
          </div>
        </div>
      </section>

      {/* Inline Styles */}
      <style>{`
        .about-page {
          background: var(--gradient-bg);
          color: var(--text-primary);
          font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
          min-height: 100vh;
        }

        .about-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        /* Hero Section */
        .about-hero {
          position: relative;
          min-height: 60vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 5rem 1rem 3rem 1rem;
          overflow: hidden;
        }

        .about-hero-content {
          position: relative;
          z-index: 2;
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
        }

        .about-hero-title {
          font-size: 3.2rem;
          font-weight: 800;
          margin-bottom: 1.5rem;
          line-height: 1.1;
          letter-spacing: 1px;
          background: linear-gradient(135deg, #7bffb6 0%, #4e5cf0 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .about-hero-subtitle {
          font-size: 1.4rem;
          font-weight: 400;
          color: var(--text-secondary);
          line-height: 1.6;
          max-width: 600px;
          margin: 0 auto;
        }

        /* Mission Section */
        .about-mission {
          padding: 4rem 1rem;
          background: rgba(255,255,255,0.6);
        }

        .mission-card {
          background: rgba(255,255,255,0.98);
          border-radius: 24px;
          padding: 2.5rem 1.5rem;
          text-align: center;
          box-shadow: var(--shadow-md);
          border: 1px solid var(--border-color);
          max-width: 800px;
          margin: 0 auto;
          position: relative;
          overflow: hidden;
        }

        .mission-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #7bffb6 0%, #4e5cf0 100%);
        }

        .mission-icon {
          font-size: 3rem;
          margin-bottom: 1.5rem;
          display: block;
        }

        .mission-card h2 {
          font-size: 2.2rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: var(--accent-tertiary);
        }

        .mission-card p {
          font-size: 1.1rem;
          line-height: 1.6;
          color: var(--text-secondary);
        }

        /* Services Section */
        .about-services {
          padding: 5rem 1rem;
        }

        .section-title {
          text-align: center;
          font-size: 2.8rem;
          font-weight: 700;
          margin-bottom: 3rem;
          color: var(--text-primary);
          position: relative;
        }

        .section-title::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 80px;
          height: 3px;
          background: linear-gradient(90deg, #7bffb6 0%, #4e5cf0 100%);
          border-radius: 2px;
        }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
          margin-top: 3rem;
        }

        .service-card {
          background: rgba(255,255,255,0.98);
          border-radius: 20px;
          padding: 2rem 1.25rem;
          text-align: center;
          transition: all 0.3s ease;
          border: 1px solid var(--border-color);
          position: relative;
          overflow: hidden;
        }

        .service-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(123, 255, 182, 0.1), transparent);
          transition: left 0.5s ease;
        }

        .service-card:hover::before {
          left: 100%;
        }

        .service-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 40px rgba(123, 255, 182, 0.2);
          border-color: rgba(123, 255, 182, 0.3);
        }

        .service-icon {
          font-size: 2.5rem;
          margin-bottom: 1.5rem;
          display: block;
        }

        .service-card h3 {
          font-size: 1.4rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          color: var(--accent-tertiary);
        }

        .service-card p {
          color: var(--text-secondary);
          line-height: 1.6;
        }

        /* Story Section */
        .about-story {
          padding: 5rem 1rem;
          background: rgba(35, 36, 74, 0.2);
        }

        .story-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .story-text h2 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 2rem;
          color: #7bffb6;
        }

        .story-text p {
          font-size: 1.1rem;
          line-height: 1.7;
          color: #d2d6f6;
          margin-bottom: 1.5rem;
        }

        .story-visual {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }

        .story-card {
          background: rgba(255,255,255,0.98);
          border-radius: 16px;
          padding: 1.5rem;
          text-align: center;
          border: 1px solid var(--border-color);
          transition: all 0.3s ease;
        }

        .story-card:hover {
          transform: scale(1.05);
          box-shadow: 0 8px 32px rgba(123, 255, 182, 0.2);
        }

        .story-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .stat-number {
          font-size: 2.5rem;
          font-weight: 800;
          color: var(--accent-primary);
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 1rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        /* Values Section */
        .about-values {
          padding: 5rem 1rem;
        }

        .values-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin-top: 3rem;
        }

        .value-card {
          background: rgba(255,255,255,0.98);
          border-radius: 20px;
          padding: 2rem 1.25rem;
          text-align: center;
          transition: all 0.3s ease;
          border: 1px solid var(--border-color);
          position: relative;
          overflow: hidden;
        }

        .value-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(78, 92, 240, 0.1), transparent);
          transition: left 0.5s ease;
        }

        .value-card:hover::before {
          left: 100%;
        }

        .value-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 40px rgba(78, 92, 240, 0.2);
          border-color: rgba(78, 92, 240, 0.3);
        }

        .value-icon {
          font-size: 2.5rem;
          margin-bottom: 1.5rem;
          display: block;
        }

        .value-card h3 {
          font-size: 1.4rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: var(--accent-secondary);
        }

        .value-card p {
          color: var(--text-secondary);
          line-height: 1.6;
        }

        /* Audience Section */
        .about-audience {
          padding: 5rem 1rem;
          background: rgba(255,255,255,0.6);
        }

        .audience-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 3rem;
          margin-top: 2rem;
        }

        .audience-card {
          background: rgba(255,255,255,0.98);
          border-radius: 20px;
          padding: 2rem 1.5rem;
          text-align: center;
          border: 1px solid var(--border-color);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .audience-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #7bffb6 0%, #4e5cf0 100%);
        }

        .audience-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 48px rgba(123, 255, 182, 0.2);
        }

        .audience-icon {
          font-size: 3rem;
          margin-bottom: 1.5rem;
          display: block;
        }

        .audience-card h3 {
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          color: #7bffb6;
        }

        .audience-card p {
          font-size: 1.1rem;
          line-height: 1.7;
          color: #d2d6f6;
          margin-bottom: 2rem;
        }

        .audience-cta {
          margin-top: 2rem;
        }

        /* Contact Section */
        .about-contact {
          padding: 5rem 1rem;
        }

        .contact-content {
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
        }

        .contact-content h2 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          color: #7bffb6;
        }

        .contact-content p {
          font-size: 1.2rem;
          color: #d2d6f6;
          margin-bottom: 3rem;
        }

        .contact-methods {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .contact-method {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1.5rem 1rem;
          background: rgba(255,255,255,0.98);
          border-radius: 12px;
          text-decoration: none;
          color: var(--text-primary);
          transition: all 0.3s ease;
          border: 1px solid var(--border-color);
        }

        .contact-method:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 32px rgba(123, 255, 182, 0.2);
          color: #7bffb6;
          border-color: rgba(123, 255, 182, 0.3);
        }

        .contact-icon {
          font-size: 2rem;
          margin-bottom: 1rem;
        }

        .contact-method span {
          font-weight: 500;
        }

        /* Footer CTA Section */
        .about-footer-cta {
          padding: 5rem 1rem;
          background: rgba(255,255,255,0.98);
          border-top: 1px solid var(--border-color);
        }

        .footer-cta-content {
          text-align: center;
          max-width: 600px;
          margin: 0 auto;
        }

        .footer-cta-content h2 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          color: var(--text-primary);
        }

        .footer-cta-content p {
          font-size: 1.2rem;
          color: var(--text-secondary);
          margin-bottom: 3rem;
        }

        .footer-cta-buttons {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        /* Button Styles */
        .cta-button {
          padding: 1rem 2.5rem;
          border-radius: 32px;
          font-size: 1.1rem;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
          display: inline-block;
          position: relative;
          overflow: hidden;
        }

        .cta-button.primary {
          background: linear-gradient(135deg, #0074D9 0%, #005fa3 100%);
          color: #fff;
          box-shadow: 0 4px 20px rgba(0, 116, 217, 0.3);
        }

        .cta-button.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(0, 116, 217, 0.4);
          background: linear-gradient(135deg, #005fa3 0%, #004080 100%);
        }

        .cta-button.secondary {
          background: linear-gradient(135deg, #7bffb6 0%, #4e5cf0 100%);
          color: var(--text-primary);
          box-shadow: 0 4px 20px rgba(123, 255, 182, 0.3);
        }

        .cta-button.secondary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(123, 255, 182, 0.4);
          background: linear-gradient(135deg, #4e5cf0 0%, #7bffb6 100%);
          color: #fff;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .about-hero-title {
            font-size: 2.5rem;
          }

          .about-hero-subtitle {
            font-size: 1.2rem;
          }

          .section-title {
            font-size: 2.2rem;
          }

          .story-content {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .audience-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .audience-card {
            min-width: auto;
          }

          .footer-cta-buttons {
            flex-direction: column;
            align-items: center;
          }

          .cta-button {
            width: 100%;
            max-width: 300px;
          }

          .contact-methods {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .about-hero {
            padding: 3rem 1rem 2rem 1rem;
            min-height: 50vh;
          }

          .about-hero-title {
            font-size: 2rem;
          }

          .mission-card {
            padding: 2rem 1.5rem;
          }

          .service-card, .value-card {
            padding: 2rem 1rem;
          }

          .audience-card {
            padding: 2rem 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
