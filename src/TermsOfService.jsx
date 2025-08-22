import React from 'react';

export default function TermsOfService() {
  return (
    <div className="legal-page-container">
      {/* Modern Hero Section */}
      <section className="legal-hero">
        <div className="legal-hero-bg" />
        <div className="legal-hero-content">
          <h1 className="legal-hero-title">Terms of Service</h1>
          <p className="legal-hero-subtitle">
            Please read these terms carefully before using our platform and services.
          </p>
          <div className="legal-last-updated">
            <span>Last updated: {new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </section>

      {/* Modern Content Section */}
      <section className="legal-content">
        <div className="legal-content-wrapper">
          <div className="legal-section">
            <h2 className="legal-section-title">1. Acceptance of Terms</h2>
            <div className="legal-section-content">
              <p>
                By accessing and using AAU Nightlife Ekpoma ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </div>
          </div>

          <div className="legal-section">
            <h2 className="legal-section-title">2. Description of Service</h2>
            <div className="legal-section-content">
              <p>
                AAU Nightlife Ekpoma is a platform that provides information about student events, job opportunities, and campus culture for the Ambrose Alli University community in Ekpoma, Edo State, Nigeria.
              </p>
            </div>
          </div>

          <div className="legal-section">
            <h2 className="legal-section-title">3. User Responsibilities and Content Guidelines</h2>
            <div className="legal-section-content">
              <p>Users agree to:</p>
              <ul className="legal-list">
                <li>Provide accurate and truthful information</li>
                <li>Use the service for lawful purposes only</li>
                <li>Respect the rights and dignity of other users</li>
                <li>Be relevant to the AAU student community</li>
                <li>Not post harmful, offensive, or inappropriate content</li>
                <li>Not engage in spam or fraudulent activities</li>
              </ul>
              <p>The following content is strictly prohibited:</p>
              <ul className="legal-list">
                <li>Illegal activities or content</li>
                <li>Hate speech or discriminatory content</li>
                <li>Adult or explicit content</li>
                <li>Violence or threats</li>
                <li>Spam or fraudulent content</li>
                <li>Copyright infringement</li>
              </ul>
            </div>
          </div>

          <div className="legal-section">
            <h2 className="legal-section-title">4. Content Moderation</h2>
            <div className="legal-section-content">
              <p>
                We reserve the right to review, edit, or remove any content that violates these terms or is deemed inappropriate for our platform.
              </p>
            </div>
          </div>

          <div className="legal-section">
            <h2 className="legal-section-title">5. Intellectual Property Rights</h2>
            <div className="legal-section-content">
              <p>
                All content on AAU Nightlife Ekpoma, including text, graphics, logos, and images, is the property of AAU Nightlife Ekpoma or its content suppliers and is protected by copyright laws. You may not use, reproduce, or distribute any content without our written permission.
              </p>
              <p>
                Users retain ownership of content they submit but grant us a license to use, display, and distribute such content on our platform.
              </p>
            </div>
          </div>

          <div className="legal-section">
            <h2 className="legal-section-title">6. Disclaimer and Limitation of Liability</h2>
            <div className="legal-section-content">
              <p>
                AAU Nightlife Ekpoma is provided "as is" without warranties of any kind. We do not guarantee the accuracy, completeness, or reliability of any content. We are not liable for any damages or losses resulting from your use of the service, including but not limited to direct, indirect, incidental, or consequential damages.
              </p>
            </div>
          </div>

          <div className="legal-section">
            <h2 className="legal-section-title">7. Privacy</h2>
            <div className="legal-section-content">
              <p>
                Your privacy is important to us. Please review our Privacy Policy to understand how we collect and use your information.
              </p>
            </div>
          </div>

          <div className="legal-section">
            <h2 className="legal-section-title">8. Account Termination</h2>
            <div className="legal-section-content">
              <p>
                We reserve the right to suspend or terminate your access to the service immediately, without prior notice, for conduct that we believe violates these terms or is harmful to other users or the service.
              </p>
            </div>
          </div>

          <div className="legal-section">
            <h2 className="legal-section-title">9. Changes to Terms</h2>
            <div className="legal-section-content">
              <p>
                We may update these Terms of Service from time to time. Changes will be posted on this page with an updated date. Continued use of the service after changes constitutes acceptance of the new terms.
              </p>
            </div>
          </div>

          <div className="legal-section">
            <h2 className="legal-section-title">10. Governing Law</h2>
            <div className="legal-section-content">
              <p>
                These terms shall be governed by and construed in accordance with the laws of Nigeria.
              </p>
            </div>
          </div>

          <div className="legal-section">
            <h2 className="legal-section-title">11. Contact Information</h2>
            <div className="legal-section-content">
              <p>
                For questions about these terms, please contact us:
              </p>
              <ul className="legal-list">
                <li>Email: aaunightlife@gmail.com</li>
                <li>WhatsApp: +234 903 755 8818</li>
                <li>Address: Ekpoma, Edo State, Nigeria</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Reuse the same modern styling from Privacy Policy */}
      <style>{`
        .legal-page-container {
          min-height: 100vh;
          background: var(--gradient-bg);
          color: var(--text-primary);
        }

        .legal-hero {
          position: relative;
          padding: var(--space-3xl) var(--space-md) var(--space-2xl) var(--space-md);
          text-align: center;
          overflow: hidden;
        }

        .legal-hero-bg {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background:
            radial-gradient(circle at 30% 20%, var(--accent-secondary) 0%, transparent 50%),
            radial-gradient(circle at 70% 80%, var(--accent-primary) 0%, transparent 50%);
          opacity: 0.1;
          z-index: 1;
        }

        .legal-hero-content {
          position: relative;
          z-index: 2;
          max-width: 800px;
          margin: 0 auto;
        }

        .legal-hero-title {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 900;
          margin-bottom: var(--space-lg);
          background: var(--gradient-accent);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.1;
        }

        .legal-hero-subtitle {
          font-size: clamp(1.1rem, 2.5vw, 1.4rem);
          color: var(--text-secondary);
          margin-bottom: var(--space-xl);
          line-height: 1.6;
        }

        .legal-last-updated {
          display: inline-flex;
          align-items: center;
          padding: var(--space-sm) var(--space-lg);
          background: rgba(22, 33, 62, 0.6);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-2xl);
          font-size: 0.9rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .legal-content {
          padding: 0 var(--space-md) var(--space-3xl) var(--space-md);
        }

        .legal-content-wrapper {
          max-width: 900px;
          margin: 0 auto;
        }

        .legal-section {
          background: rgba(22, 33, 62, 0.4);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          padding: var(--space-xl);
          margin-bottom: var(--space-xl);
          transition: all 0.3s ease;
        }

        .legal-section:hover {
          border-color: var(--accent-primary);
          box-shadow: var(--shadow-lg), 0 0 20px rgba(0, 212, 255, 0.1);
        }

        .legal-section-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--accent-primary);
          margin-bottom: var(--space-lg);
          line-height: 1.3;
        }

        .legal-section-content p {
          font-size: 1.1rem;
          line-height: 1.7;
          color: var(--text-secondary);
          margin-bottom: var(--space-md);
        }

        .legal-list {
          list-style: none;
          padding: 0;
          margin: var(--space-md) 0;
        }

        .legal-list li {
          position: relative;
          padding: var(--space-sm) 0 var(--space-sm) var(--space-xl);
          font-size: 1.05rem;
          line-height: 1.6;
          color: var(--text-secondary);
        }

        .legal-list li::before {
          content: '→';
          position: absolute;
          left: 0;
          top: var(--space-sm);
          color: var(--accent-tertiary);
          font-weight: bold;
          font-size: 1.2rem;
        }

        @media (max-width: 768px) {
          .legal-hero {
            padding: var(--space-2xl) var(--space-md) var(--space-xl) var(--space-md);
          }

          .legal-section {
            padding: var(--space-lg);
            margin-bottom: var(--space-lg);
          }

          .legal-section-title {
            font-size: 1.3rem;
          }

          .legal-section-content p {
            font-size: 1rem;
          }

          .legal-list li {
            padding-left: var(--space-lg);
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
