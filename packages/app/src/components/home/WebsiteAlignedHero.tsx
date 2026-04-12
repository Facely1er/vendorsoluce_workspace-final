/**
 * Hero aligned with website homepage: same headline, problem statement, and CTAs.
 * Copy matches packages/website index.html #hero (no translation for now).
 */

import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import './HeroSection.css';

const WebsiteAlignedHero: React.FC = () => {
  return (
    <section className="hero-section relative text-white pt-4 md:pt-6 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 z-0 hero-background" />
      <div className="absolute inset-0 z-10 hero-overlay" />
      <div className="max-w-7xl mx-auto relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="pt-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-white leading-tight">
              Which of Your Vendors Should You Worry About First?
            </h1>
            <h2 className="text-xl md:text-2xl font-semibold mb-4 text-red-400 leading-tight">
              The Hidden Vendor Risk Problem
            </h2>
            <p className="text-base md:text-lg text-gray-300 mb-8 leading-relaxed">
              Make defensible vendor decisions — before risk becomes a breach.
              <br />
              VendorSoluce transforms unclear third-party risk into prioritized decisions, evidence-backed approvals, and continuous oversight.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/how-it-works">
                <Button variant="primary" size="lg" className="bg-vendorsoluce-green text-white hover:bg-vendorsoluce-dark-green w-full sm:w-auto">
                  Reveal Vendor Risk Exposure
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white/10 w-full sm:w-auto">
                  See How It Works
                </Button>
              </Link>
            </div>
          </div>
          <div className="pt-8 lg:pt-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20">
              <div className="mb-4">
                <span className="text-sm font-medium text-gray-300 uppercase tracking-wide">What you get</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">Vendor decisions you can audit.</h2>
              <p className="text-base text-gray-300 mb-8 leading-relaxed">
                A practical workflow for intake, validation, and governance — built for procurement and security teams.
              </p>
              <div className="space-y-6">
                <div className="pb-6 border-b border-white/20">
                  <h3 className="text-lg font-bold mb-2 text-white">Intake Packet</h3>
                  <p className="text-sm text-gray-300">Consistent onboarding, scope, and ownership.</p>
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2 text-white">Remediation Tracker</h3>
                  <p className="text-sm text-gray-300">Gaps → actions → due dates → evidence.</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {['NIST SP 800-161 aligned', 'Evidence-ready decisions', 'Continuous monitoring loop', 'Built for audit defense'].map((tag) => (
                  <span key={tag} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 backdrop-blur-sm text-gray-200 border border-white/20">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WebsiteAlignedHero;
