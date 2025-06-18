import React, { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './Home';
import Events from './Events';
import Jobs from './Jobs';
import Contact from './Contact';
import Blog from './Blog';
import { BlogProvider } from './BlogContext';
import './App.css';
import AdvertisersSection from './AdvertisersSection';

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <BlogProvider>
      <div className="app-root">
        <header>
          <nav className="main-nav responsive-nav">
            <div className="nav-logo">AAU Nightlife</div>
            <button className="nav-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">
              <span className="nav-toggle-bar" />
              <span className="nav-toggle-bar" />
              <span className="nav-toggle-bar" />
            </button>
            <div className={`nav-links${menuOpen ? ' open' : ''}`}>
              <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
              <Link to="/events" onClick={() => setMenuOpen(false)}>Upcoming Events</Link>
              <Link to="/jobs" onClick={() => setMenuOpen(false)}>Jobs</Link>
              <Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
            </div>
          </nav>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Events />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/blog/:id" element={<Blog />} />
          </Routes>
          <AdvertisersSection />
        </main>
        <footer>
          <div style={{maxWidth: 700, margin: '0 auto'}}>
            <div className="footer-row">
              <a
                href="https://wa.me/message/5W4ZNNNXXO7CJ1"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-link"
              >
                WhatsApp: 09065302907
              </a>
              <a
                href="mailto:eraskid6@gmail.com"
                className="footer-link email"
              >
                Gmail: eraskid6@gmail.com
              </a>
              <span className="footer-address">
                Address: 123 Main Street, Ekpoma, Edo State
              </span>
            </div>
            <div className="footer-copy">
              &copy; {new Date().getFullYear()} AAU Nightlife Ekpoma. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </BlogProvider>
  );
}

export default App;

// Replace all API URLs from localhost:5000 to the deployed Railway backend
// Example: fetch('https://aau-nightlife-production.up.railway.app/api/events')
