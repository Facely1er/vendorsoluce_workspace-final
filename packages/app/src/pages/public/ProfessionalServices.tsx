/**
 * Professional Services Page for VendorSoluce™
 * B2B enterprise services and consulting offerings
 */

import React from 'react';
import { Check, Shield, Zap, Building2, ArrowRight, Code, HeadphonesIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const ProfessionalServices: React.FC = () => {
  const navigate = useNavigate();

  const services = [
    {
      id: 'premium-reports',
      name: 'Premium Reports',
      price: 49,
      duration: 'Per Report',
      description: 'Professional PDF reports with executive summaries and detailed analytics',
      features: [
        'Custom branded PDF reports',
        'Executive summary dashboard',
        'Detailed vulnerability analysis',
        'Compliance gap analysis',
        'Remediation recommendations',
        'Shareable with stakeholders',
      ],
      icon: <Shield className="w-6 h-6" />,
      color: 'green',
      popular: true,
    },
    {
      id: 'priority-support',
      name: 'Priority Support',
      price: 49,
      duration: 'Monthly',
      description: 'Faster response times and priority access to support',
      features: [
        'Response within 4 hours (vs 24 hours)',
        'Priority email support',
        'Direct access to technical team',
        'Feature request prioritization',
        'Monthly check-in calls',
        'Dedicated support channel',
      ],
      icon: <HeadphonesIcon className="w-6 h-6" />,
      color: 'blue',
      popular: false,
    },
    {
      id: 'white-label',
      name: 'White-Label Branding',
      price: 99,
      duration: 'Monthly',
      description: 'Remove VendorSoluce™ branding and add your own logo',
      features: [
        'Custom logo and branding',
        'Remove VendorSoluce™ branding',
        'Custom color scheme',
        'Branded email templates',
        'Custom domain support (Enterprise)',
        'Branded PDF reports',
      ],
      icon: <Code className="w-6 h-6" />,
      color: 'purple',
      popular: false,
    },
    {
      id: 'additional-storage',
      name: 'Additional Storage',
      price: 10,
      duration: 'Monthly per 10GB',
      description: 'Add more storage for documents and evidence',
      features: [
        '10GB additional storage',
        'Unlimited file uploads',
        'Long-term evidence retention',
        'Document versioning',
        'Secure cloud storage',
        'Easy file management',
      ],
      icon: <Zap className="w-6 h-6" />,
      color: 'orange',
      popular: false,
    },
  ];

  const handleContactSales = () => {
    navigate('/contact');
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string; text: string; button: string }> = {
      blue: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800',
        text: 'text-blue-600 dark:text-blue-400',
        button: 'bg-blue-600 hover:bg-blue-700',
      },
      green: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-200 dark:border-green-800',
        text: 'text-green-600 dark:text-green-400',
        button: 'bg-green-600 hover:bg-green-700',
      },
      purple: {
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        border: 'border-purple-200 dark:border-purple-800',
        text: 'text-purple-600 dark:text-purple-400',
        button: 'bg-purple-600 hover:bg-purple-700',
      },
      orange: {
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        border: 'border-orange-200 dark:border-orange-800',
        text: 'text-orange-600 dark:text-orange-400',
        button: 'bg-orange-600 hover:bg-orange-700',
      },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
            <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Premium Add-Ons
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Enhance your VendorSoluce™ experience with premium features and priority support.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {services.map((service) => {
            const colors = getColorClasses(service.color);
            return (
              <div
                key={service.id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 ${
                  service.popular ? 'border-blue-500 dark:border-blue-600' : 'border-gray-200 dark:border-gray-700'
                } p-8 relative`}
              >
                {service.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className={`inline-flex items-center justify-center w-12 h-12 ${colors.bg} rounded-lg mb-4`}>
                  <div className={colors.text}>
                    {service.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {service.name}
                </h3>
                <div className="flex items-center gap-4 mb-4">
                  {service.price ? (
                    <div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-white">
                        ${service.price}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {service.duration}
                      </div>
                    </div>
                  ) : (
                    <div className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                      Contact for pricing
                    </div>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {service.description}
                </p>
                <ul className="space-y-3 mb-8">
                  {service.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleContactSales()}
                  className={`w-full py-3 px-4 ${colors.button} text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2`}
                >
                  {service.id === 'premium-reports' ? 'Purchase Report' : 'Add to Plan'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Why Add Premium Features?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Professional Reports
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Impress stakeholders with branded, executive-ready compliance reports.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <HeadphonesIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Faster Support
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Get help when you need it with priority support and faster response times.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Code className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Custom Branding
                </h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                White-label the platform with your own branding and logo.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
            All add-ons can be purchased directly or added to your existing subscription.
          </p>
          <Link to="/pricing">
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-vendorsoluce-teal hover:bg-vendorsoluce-teal/90 text-white rounded-lg font-medium transition-colors">
              View All Plans
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>

        {/* Legal Disclaimer */}
        <div className="mt-12 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-yellow-600 dark:text-yellow-400" />
            Important Disclaimers
          </h3>
          <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
            <p><strong>Premium Reports:</strong> Reports are for informational purposes only and do not constitute legal, compliance, or professional consulting advice. Results are based on user-provided inputs and third-party data sources.</p>
            <p><strong>Priority Support:</strong> Response time targets (e.g., "within 4 hours") are goals and may vary based on issue severity, volume, and business hours. Actual response times are not guaranteed.</p>
            <p><strong>White-Label Branding:</strong> Custom branding is subject to technical limitations and may require additional setup time. Branding changes may take effect after deployment.</p>
            <p><strong>Additional Storage:</strong> Storage limits are maximum allocations. Data may be subject to retention policies and fair use limits.</p>
            <p className="mt-4 text-xs">For complete terms and limitations, please review our <a href="/legal/terms" className="text-vendorsoluce-green dark:text-vendorsoluce-light-green underline">Terms of Service</a>.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalServices;

