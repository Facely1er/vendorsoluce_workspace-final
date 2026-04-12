/**
 * Contact sales / enterprise pricing placeholder when VITE_LICENSE_MODE is true.
 * Shown instead of the Stripe pricing page.
 */

import React from 'react';
import { Mail, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { config } from '../../utils/config';

const ContactSalesPage: React.FC = () => {
  const contactUrl = `${config.app.websiteUrl}/contact`.replace(/\/+/g, '/');
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto text-center">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        Enterprise &amp; On-Premise Licensing
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        VendorSoluce is available as a licensed deployment for your organization. Contact us for pricing, proof-of-value, or a custom quote.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 mb-10">
        <a
          href={contactUrl}
          className="flex items-center justify-center gap-3 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-vendorsoluce-green hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <Mail className="w-6 h-6 text-vendorsoluce-green" />
          <span className="font-medium">Contact sales</span>
        </a>
        <a
          href={`${config.app.websiteUrl}/how-it-works`}
          className="flex items-center justify-center gap-3 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-vendorsoluce-green hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <FileText className="w-6 h-6 text-vendorsoluce-green" />
          <span className="font-medium">How it works</span>
        </a>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Starter, Professional, and Enterprise plans • Federal and on-premise options • Volume and multi-year discounts
      </p>
      <Link to="/dashboard">
        <Button variant="outline">Back to dashboard</Button>
      </Link>
    </div>
  );
};

export default ContactSalesPage;
