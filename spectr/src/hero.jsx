import React from 'react';
import './components/hero.css';
import ModelaLarge from './assets/modelav2large.png';
import ModelaSmall from './assets/modelav2small.png';

export default function Hero() {
  return (
    <section className="hero">
      {/* Background Media */}
      <div className="hero-bg">
        <picture>
          <source media="(max-width: 500px)" srcSet={ModelaSmall} />
          <img
            src={ModelaLarge}
            alt="Campaign Visual"
            className="hero-bg-media"
          />
        </picture>
        <div className="hero-overlay"></div>
      </div>

      <div className="hero-content">
        {/* Editorial Subtext Block on Left */}
        <div className="campaign-editorial">
          {/* Upper Action Link */}
          <div className="editorial-eyebrow">
            <a href="/store" className="btn-primary">EXPLORE COLLECTION <span className="arrow">→</span></a>
          </div>
          
          {/* Core Slogan Slogan */}
          <h2 className="editorial-headline">
            DESIGNED<br />
            FOR WHAT'S<br />
            <span className="italic-text">NEXT</span>
          </h2>
        </div>
      </div>
    </section>
  );
}
