import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 w-full flex-shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 w-full min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 min-w-0">

          {/* Left: copyright + local-analysis badge */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 min-w-0">
            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
              {t('footer.copyright', '© 2026 ERMITS LLC. All rights reserved.')}
            </span>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-vendorsoluce-green/10 dark:bg-vendorsoluce-green/20 border border-vendorsoluce-green/25 dark:border-vendorsoluce-green/30">
              <img src="/vendorsoluce.png" alt="" aria-hidden="true" className="w-3 h-3 opacity-90 flex-shrink-0" />
              <span className="text-xs font-medium text-vendorsoluce-green dark:text-vendorsoluce-light-green whitespace-nowrap leading-none">
                Local browser-based analysis
              </span>
            </div>
          </div>

          {/* Right: legal links + version */}
          <nav aria-label="Legal and support" className="flex flex-wrap items-center gap-x-3 gap-y-1 min-w-0">
            <Link
              to="/master-terms-of-service"
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-vendorsoluce-green dark:hover:text-vendorsoluce-light-green transition-colors whitespace-nowrap"
            >
              Terms
            </Link>
            <Link
              to="/master-privacy-policy"
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-vendorsoluce-green dark:hover:text-vendorsoluce-light-green transition-colors whitespace-nowrap"
            >
              Privacy
            </Link>
            <Link
              to="/cookie-policy"
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-vendorsoluce-green dark:hover:text-vendorsoluce-light-green transition-colors whitespace-nowrap"
            >
              Cookies
            </Link>
            <Link
              to="/acceptable-use-policy"
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-vendorsoluce-green dark:hover:text-vendorsoluce-light-green transition-colors whitespace-nowrap"
            >
              Acceptable Use
            </Link>
            <Link
              to="/contact"
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-vendorsoluce-green dark:hover:text-vendorsoluce-light-green transition-colors whitespace-nowrap"
            >
              Support
            </Link>
            <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap select-none">
              v1.0
            </span>
          </nav>

        </div>
      </div>
    </footer>
  );
};

export default Footer;