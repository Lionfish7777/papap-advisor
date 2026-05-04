import React, { useState } from 'react';
import './LandingPage.css';

const QUOTES = [
  "The stock market is a device for transferring money from the impatient to the patient.",
  "Your dollars are soldiers. Send them to work.",
  "Compound interest is the eighth wonder of the world. He who understands it, earns it.",
  "I've never seen a wealthy man who didn't first become wealthy in his mind."
];

function LandingPage({ onStart }) {
  const [quote] = useState(() => QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  return (
    <div className="landing">
      <div className="landing-bg-glow" />

      <nav className="landing-nav">
        <div className="landing-nav-logo">P</div>
        <span className="landing-nav-name">Papap</span>
      </nav>

      <main className="landing-main">
        <div className="landing-avatar-wrap">
          <div className="landing-avatar">P</div>
          <div className="landing-avatar-ring" />
        </div>

        <h1 className="landing-title">Papap</h1>
        <p className="landing-subtitle">The Legendary Financial Advisor</p>

        <div className="landing-divider">
          <span className="landing-divider-line" />
          <span className="landing-divider-icon">◆</span>
          <span className="landing-divider-line" />
        </div>

        <p className="landing-tagline">Wisdom from 1942. Vision for 2042.</p>

        <p className="landing-bio">
          Born in 1942, Papap has witnessed every market cycle — from the postwar boom to crypto and AI.
          He's survived every crash and compounded through every era.
          Now he's here to teach you how to think like the wealthy.
        </p>

        <button className="landing-cta" onClick={onStart}>
          Talk to Papap
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginLeft: 8 }}>
            <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <p className="landing-note">Free demo · No sign-up required</p>
      </main>

      <footer className="landing-footer">
        <p className="landing-quote">"{quote}"</p>
        <p className="landing-credit">— Papap · Created by Lionfish7777</p>
      </footer>
    </div>
  );
}

export default LandingPage;
