import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../../components/ui/Button';
import { config } from '../../utils/config';

const Contact: React.FC = () => {
  const { t } = useTranslation();
  const websiteBase = (config.app.websiteUrl || 'https://www.vendorsoluce.com').replace(/\/+$/, '');
  const websiteContactUrl = `${websiteBase}/contact`;

  useEffect(() => {
    // Contact is handled on the marketing website (Netlify form + website JS handler).
    // The React app page exists only as a redirect to avoid duplicate/broken form implementations.
    window.location.replace(websiteContactUrl);
  }, [websiteContactUrl]);

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          {t('contact.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Redirecting you to the VendorSoluce contact page…
        </p>
        <Button variant="primary" size="lg" onClick={() => window.location.assign(websiteContactUrl)}>
          Go to contact page
        </Button>
      </div>
    </div>
  );
};

export default Contact;