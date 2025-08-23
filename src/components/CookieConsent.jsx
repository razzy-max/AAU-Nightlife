import React, { useState, useEffect } from 'react';
import './CookieConsent.css';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(true);  // Set initial state to true

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookieConsent');
    console.log('Cookie consent status:', consent);
    if (consent) {
      setIsVisible(false);  // Hide only if user has made a choice
      console.log('Cookie banner hidden - user already made choice');
    } else {
      console.log('Cookie banner should be visible - no choice made yet');
    }
  }, []);

  // Function to disable non-essential cookies
  const disableNonEssentialCookies = () => {
    // Disable Google Analytics if it exists
    if (window['ga-disable-GA_MEASUREMENT_ID']) {
      window['ga-disable-GA_MEASUREMENT_ID'] = true;
    }
    
    // Set AdSense to non-personalized ads
    if (window.googletag) {
      window.googletag.pubads().setRequestNonPersonalizedAds(1);
    }
    
    // Clear any existing non-essential cookies
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name] = cookie.split('=');
      // Skip essential cookies (like session cookies)
      if (!name.trim().startsWith('_sess')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
      }
    }
  };

  // Function to enable all cookies
  const enableAllCookies = () => {
    // Enable Google Analytics
    if (window['ga-disable-GA_MEASUREMENT_ID']) {
      window['ga-disable-GA_MEASUREMENT_ID'] = false;
    }
    
    // Set AdSense to personalized ads
    if (window.googletag) {
      window.googletag.pubads().setRequestNonPersonalizedAds(0);
    }
  };

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setIsVisible(true);
      // Default to non-essential cookies disabled until user accepts
      disableNonEssentialCookies();
    } else if (consent === 'declined') {
      // Keep non-essential cookies disabled
      disableNonEssentialCookies();
    } else if (consent === 'accepted') {
      // Enable all cookies
      enableAllCookies();
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
    enableAllCookies();
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setIsVisible(false);
    disableNonEssentialCookies();
  };

  if (!isVisible) return null;

  return (
    <div className="cookie-consent">
      <div className="cookie-content">
        <p>
          We use cookies to enhance your experience and analyze site usage. 
          By clicking "Accept", you consent to our use of cookies for analytics 
          and personalized ads. You can manage your preferences at any time.
        </p>
        <div className="cookie-buttons">
          <button 
            onClick={handleDecline}
            className="cookie-button decline"
          >
            Decline Non-Essential
          </button>
          <button 
            onClick={handleAccept}
            className="cookie-button accept"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
