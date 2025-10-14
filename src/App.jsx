import React, { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './Home';
import Events from './Events';
import Jobs from './Jobs';
import Contact from './Contact';
import Blog from './Blog';
import About from './About';
import PrivacyPolicy from './PrivacyPolicy';
import TermsOfService from './TermsOfService';
import AdminPortal from './AdminPortal';
import AdminLogout from './AdminLogout';
import AdminAwards from './AdminAwards';
import Awards from './Awards';
import { BlogProvider } from './BlogContext';
import { AuthProvider, useAuth } from './AuthContext';
import './App.css';
import AdvertisersSection from './AdvertisersSection';
import CookieConsent from './components/CookieConsent';

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Small internal component to show admin link only when logged in
  const AdminNavLink = ({ setMenuOpen }) => {
    try {
      const { isAdmin, isLoading } = useAuth();
      if (isLoading) return null;
      if (!isAdmin) return null;
      return (
        <Link to="/admin-portal" onClick={() => setMenuOpen(false)}>Admin</Link>
      );
    } catch (e) {
      // If used outside provider or any error, silently fail
      return null;
    }
  };

  return (
    <AuthProvider>
      <BlogProvider>
        <div className="app-root">
          <AdminLogout />
          <CookieConsent />
        <header>
          <nav className="main-nav responsive-nav">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="nav-logo">AAU Nightlife</div>
              <Link to="/awards" style={{ fontSize: '0.95rem', color: 'var(--text-primary)', textDecoration: 'none' }}>Awards</Link>
            </div>
            <button className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">
              <span className="nav-toggle-bar" />
              <span className="nav-toggle-bar" />
              <span className="nav-toggle-bar" />
            </button>
            <div className={`nav-links${menuOpen ? ' open' : ''}`}>
              <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
              <Link to="/events" onClick={() => setMenuOpen(false)}>Upcoming Events</Link>
              <Link to="/jobs" onClick={() => setMenuOpen(false)}>Jobs</Link>
              <Link to="/about" onClick={() => setMenuOpen(false)}>About</Link>
              <Link to="/awards" onClick={() => setMenuOpen(false)}>Awards</Link>
              <AdminNavLink setMenuOpen={setMenuOpen} />
              <Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
            </div>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Events />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/admin-portal" element={<AdminPortal />} />
            <Route path="/admin-awards" element={<AdminAwards />} />
            <Route path="/awards" element={<Awards />} />
            <Route path="/blog/:id" element={<Blog />} />
          </Routes>
          <AdvertisersSection />
        </main>
        <footer>
          <div style={{maxWidth: 700, margin: '0 auto'}}>
            <div className="footer-row">
              <span className="footer-socials-label">Connect with us instantly on your favorite platforms:</span>
              <div className="footer-icons-group">
                <a
                  href="https://wa.me/2349037558818"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-icon-link"
                  aria-label="WhatsApp"
                >
                  <svg width="28" height="28" viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 3C9.373 3 4 8.373 4 15c0 2.65.87 5.1 2.36 7.1L4 29l7.18-2.31C13.1 27.37 14.52 27.7 16 27.7c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 22.7c-1.3 0-2.57-.25-3.76-.74l-.27-.11-4.27 1.37 1.4-4.15-.18-.28C7.13 19.01 6.3 17.06 6.3 15c0-5.36 4.36-9.7 9.7-9.7s9.7 4.34 9.7 9.7-4.36 9.7-9.7 9.7zm5.13-7.13c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.44-2.25-1.4-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.34.42-.51.14-.17.18-.29.28-.48.09-.18.05-.36-.02-.5-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47-.16-.01-.36-.01-.56-.01-.2 0-.52.07-.8.36-.28.28-1.06 1.04-1.06 2.54 0 1.5 1.09 2.95 1.24 3.16.15.21 2.14 3.28 5.19 4.47.73.29 1.3.46 1.74.59.73.23 1.39.2 1.91.12.58-.09 1.65-.67 1.88-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.18-.53-.32z"/>
                  </svg>
                </a>
                <a
                  href="mailto:aaunightlife@gmail.com"
                  className="footer-icon-link"
                  aria-label="Gmail"
                >
                  <svg width="28" height="28" viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M27 6H5C3.9 6 3 6.9 3 8v16c0 1.1.9 2 2 2h22c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 2v.01L16 15.13 5 8.01V8h22zM5 24V10.25l10.29 6.86c.23.15.52.15.75 0L27 10.25V24H5z"/>
                  </svg>
                </a>
                <a
                  href="https://www.tiktok.com/@aau_nightlife?_t=ZM-8xN0vouT4cf&_r=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-icon-link"
                  aria-label="TikTok"
                >
                  <svg width="28" height="28" viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M28 10.5v3.25c-2.13 0-4.13-.69-5.75-1.87V21c0 3.87-3.13 7-7 7s-7-3.13-7-7 3.13-7 7-7c.34 0 .67.03 1 .08v3.09c-.33-.09-.66-.17-1-.17-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4v-13h3.25c.41 2.13 2.13 3.75 4.25 3.75z"/>
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/aau_nightlife?igsh=OXMwdXJwZmcyYmhq&utm_source=qr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-icon-link"
                  aria-label="Instagram"
                >
                  <svg width="28" height="28" viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 7c2.76 0 3.09.01 4.18.06 1.08.05 1.67.22 2.06.37.52.2.89.44 1.28.83.39.39.63.76.83 1.28.15.39.32.98.37 2.06.05 1.09.06 1.42.06 4.18s-.01 3.09-.06 4.18c-.05 1.08-.22 1.67-.37 2.06-.2.52-.44.89-.83 1.28-.39.39-.76.63-1.28.83-.39.15-.98.32-2.06.37-1.09.05-1.42.06-4.18.06s-3.09-.01-4.18-.06c-1.08-.05-1.67-.22-2.06-.37-.52-.2-.89-.44-1.28-.83-.39-.39-.63-.76-.83-1.28-.15-.39-.32-.98-.37-2.06C7.01 19.09 7 18.76 7 16s.01-3.09.06-4.18c.05-1.08.22-1.67.37-2.06.2-.52.44-.89.83-1.28.39-.39.76-.63 1.28-.83.39-.15.98-.32 2.06-.37C12.91 7.01 13.24 7 16 7zm0-2C13.19 5 12.84 5.01 11.75 5.06c-1.09.05-1.84.22-2.49.46-.68.25-1.25.59-1.82 1.16-.57.57-.91 1.14-1.16 1.82-.24.65-.41 1.4-.46 2.49C5.01 12.84 5 13.19 5 16s.01 3.16.06 4.25c.05 1.09.22 1.84.46 2.49.25.68.59 1.25 1.16 1.82.57.57 1.14.91 1.82 1.16.65.24 1.4.41 2.49.46C12.84 26.99 13.19 27 16 27s3.16-.01 4.25-.06c1.09-.05 1.84-.22 2.49-.46.68-.25 1.25-.59 1.82-1.16.57-.57.91-1.14 1.16-1.82.24-.65.41-1.4.46-2.49.05-1.09.06-1.44.06-4.25s-.01-3.16-.06-4.25c-.05-1.09-.22-1.84-.46-2.49-.25-.68-.59-1.25-1.16-1.82-.57-.57-1.14-.91-1.82-1.16-.65-.24-1.4-.41-2.49-.46C19.16 5.01 18.81 5 16 5zm0 4.5A6.5 6.5 0 1 0 16 23.5 6.5 6.5 0 0 0 16 9.5zm0 10.7a4.2 4.2 0 1 1 0-8.4 4.2 4.2 0 0 1 0 8.4zm7.25-10.7a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                  </svg>
                </a>
              </div>
              <span className="footer-address">
                Address: Ekpoma, Edo State
              </span>
            </div>
            <div className="footer-copy">
              &copy; {new Date().getFullYear()} AAU Nightlife Ekpoma. All rights reserved.
              <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                <Link to="/privacy-policy" style={{ color: '#ccc', textDecoration: 'none', marginRight: '1rem' }}>
                  Privacy Policy
                </Link>
                <Link to="/terms-of-service" style={{ color: '#ccc', textDecoration: 'none' }}>
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </footer>
        </div>
      </BlogProvider>
    </AuthProvider>
  );
}

export default App;

// Replace all API URLs from localhost:5000 to the deployed Railway backend
// Example: fetch('https://aau-nightlife-production.up.railway.app/api/events')
