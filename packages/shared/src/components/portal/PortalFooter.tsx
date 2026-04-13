import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Workflow, Users, Shield, Lock, Layers, Play, ExternalLink, FileText, Scale } from 'lucide-react';
import { PORTAL_LOGO_SRC } from './portalBrand';

const WEBSITE = 'https://www.vendorsoluce.com';

const PortalFooter: React.FC = () => {
  const [logoError, setLogoError] = useState(false);

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-6">
          {/* Brand — same logo as main app; link to portal home */}
          <div className="col-span-2 sm:col-span-1">
            <Link to="/" className="flex items-center mb-1.5 group">
              {logoError ? (
                <span className="h-10 w-10 flex-shrink-0 rounded flex items-center justify-center bg-vendorsoluce-green/10 dark:bg-vendorsoluce-green/20 text-vendorsoluce-green dark:text-vendorsoluce-light-green text-sm font-bold">
                  VS
                </span>
              ) : (
                <img
                  src={PORTAL_LOGO_SRC}
                  alt="VendorSoluce™"
                  className="h-10 w-10 flex-shrink-0 object-contain transition-transform group-hover:scale-105"
                  onError={() => setLogoError(true)}
                />
              )}
              <span className="ml-1.5 min-w-0">
                <span className="block text-base font-bold text-vendorsoluce-green dark:text-white leading-tight">VendorSoluce™</span>
                <span className="block text-xs italic text-vendorsoluce-green/80 dark:text-vendorsoluce-light-green leading-tight tracking-tighter tagline-text">
                  Supply Chain Risk Intelligence
                </span>
              </span>
            </Link>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug max-w-xs mt-0.5">
              Structured vendor security assessments for organizations managing supply chain risk.
            </p>
          </div>

          {/* Portal links */}
          <div>
            <h4 className="text-[11px] font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-1.5">Portal</h4>
            <ul className="space-y-0.5">
              {[
                { label: 'How It Works', to: '/how-it-works', icon: Workflow },
                { label: 'For Buyers', to: '/for-buyers', icon: Users },
                { label: 'For Vendors', to: '/for-vendors', icon: Shield },
                { label: 'Security & Privacy', to: '/security', icon: Lock },
                { label: 'Frameworks', to: '/frameworks', icon: Layers },
                { label: 'Interactive Demo', to: '/demo', icon: Play },
              ].map(({ label, to, icon: Icon }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors py-0.5"
                  >
                    <Icon className="w-3 h-3 flex-shrink-0 text-gray-400" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform link */}
          <div>
            <h4 className="text-[11px] font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-1.5">Platform</h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1.5 leading-snug">
              Buyers manage vendor portfolios, create assessments, and review results from the VendorSoluce platform.
            </p>
            <a
              href="https://www.platform.vendorsoluce.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-vendorsoluce-green dark:text-vendorsoluce-light-green hover:underline"
            >
              Go to platform
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-[11px] font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-1.5">Legal</h4>
            <ul className="space-y-0.5">
              <li>
                <a href={`${WEBSITE}/legal/terms.html`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors py-0.5">
                  <Scale className="w-3 h-3 flex-shrink-0 text-gray-400" />
                  Terms of Service
                </a>
              </li>
              <li>
                <a href={`${WEBSITE}/legal/privacy-policy.html`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors py-0.5">
                  <Shield className="w-3 h-3 flex-shrink-0 text-gray-400" />
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href={`${WEBSITE}/legal/cookie-policy.html`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors py-0.5">
                  <FileText className="w-3 h-3 flex-shrink-0 text-gray-400" />
                  Cookie Policy
                </a>
              </li>
              <li>
                <a href={`${WEBSITE}/legal/acceptable-use-policy.html`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors py-0.5">
                  <Shield className="w-3 h-3 flex-shrink-0 text-gray-400" />
                  Acceptable Use Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} VendorSoluce by ERMITS. All rights reserved.
          </p>
          <a href={WEBSITE} className="text-[11px] text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            vendorsoluce.com
          </a>
        </div>
      </div>
    </footer>
  );
};

export default PortalFooter;
