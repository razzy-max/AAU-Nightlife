import React from 'react';
import Header from './Header';
import Hero from './Hero';
import Marquee from './Marquee';
import FeatureSection from './FeatureSection';
import EventSection from './EventSection';
import BlogSection from './BlogSection';
import AdminDebugger from './AdminDebugger';

export default function Home() {
  return (
    <div className="landing-bg">
      <AdminDebugger />
      <Header />
      <Hero />
      <Marquee text="AAU Nightlife: Where Every Night is an Experience! | Discover the best student events, parties, and job opportunities in Ekpoma. | Connect, celebrate, and grow with the AAU community! | Your adventure starts here." />
      <FeatureSection />
      <EventSection />
      <BlogSection />
    </div>
  );
}
