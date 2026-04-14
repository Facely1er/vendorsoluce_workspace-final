// Enhanced Pricing Page with Complete Stripe Integration
// File: src/pages/Pricing.tsx

import React, { useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Crown, Calculator, Check, Server, Download } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Link } from 'react-router-dom';
import { StripePricingCard } from '../../components/pricing/StripePricingCard';
import { 
  getMainProducts, 
  getAddonProducts, 
  getBundleProducts,
  MONTHLY_PRODUCTS,
  ANNUAL_PRODUCTS,
  ONE_TIME_MAIN_PRODUCTS
} from '../../lib/stripeProducts';
import { DeploymentModelsSection } from '../../components/deployment/DeploymentModelsSection';
import WorkspacePageShell from '../../components/vendorsoluce-intelligence/WorkspacePageShell';

const Pricing: React.FC = () => {
  const { t } = useTranslation();
  const [isAnnual, setIsAnnual] = useState(false);
  const [showAddons, setShowAddons] = useState(false);

  const billingInterval = isAnnual ? 'annual' : 'monthly';
  const mainProducts = getMainProducts(billingInterval);
  const addonProducts = getAddonProducts(billingInterval);
  const bundleProducts = getBundleProducts(billingInterval);



  // Calculate annual savings dynamically (Starter is one-time, no savings; Pro/Enterprise have 20% off)
  const calculateAnnualSavings = (productName: string): number => {
    const monthlyProduct = MONTHLY_PRODUCTS.find(p =>
      p.name.toLowerCase().includes(productName.toLowerCase()) && p.billingModel === 'monthly'
    );
    const annualProduct = ANNUAL_PRODUCTS.find(p =>
      p.name.toLowerCase().includes(productName.toLowerCase()) && p.billingModel === 'annual'
    );

    if (!monthlyProduct || !annualProduct) return 0;

    const monthlyTotal = monthlyProduct.price * 12;
    const savings = monthlyTotal - annualProduct.price;
    return Math.round(savings / 100); // Convert cents to dollars
  };

  const formatCurrency = (cents: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(cents / 100);
  };

  // Get product data for comparison table (includes one-time Starter)
  const getProductData = (tier: 'starter' | 'professional' | 'enterprise' | 'federal') => {
    const allMain = [...MONTHLY_PRODUCTS, ...ANNUAL_PRODUCTS, ...ONE_TIME_MAIN_PRODUCTS];
    return allMain.find(p => p.name.toLowerCase().includes(tier.toLowerCase()));
  };

  const starterProduct = getProductData('starter');
  const professionalProduct = getProductData('professional');
  const enterpriseProduct = getProductData('enterprise');
  const federalProduct = getProductData('federal');

  // Helper to format limits
  const formatLimit = (value: number | string): string => {
    if (typeof value === 'string') return value;
    if (value === -1) return 'Unlimited';
    return value.toString();
  };

  // Helper to check if framework is included
  const hasFramework = (product: typeof starterProduct, framework: string): boolean => {
    if (!product) return false;
    return product.complianceFrameworks.some(f => 
      f.toLowerCase().includes(framework.toLowerCase())
    );
  };

  // Helper to render table cell content
  const renderTableCell = (value: string) => {
    if (value === '✓') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-vendorsoluce-pale-green text-vendorsoluce-dark-green dark:bg-vendorsoluce-green/15 dark:text-vendorsoluce-light-green">
          {value}
        </span>
      );
    }
    if (value === '✗') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
          {value}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
        {value}
      </span>
    );
  };

  const handleSubscribe = async (productId: string) => {
    const product = mainProducts.find(p => p.id === productId);
    const planMatch = productId.match(/^(starter|professional|enterprise|federal)/);
    const plan = planMatch ? planMatch[1] : 'professional';
    const interval = product?.billingModel === 'annual' ? 'year' : product?.billingModel === 'monthly' ? 'month' : undefined;
    const checkoutUrl = interval ? `/checkout?plan=${plan}&interval=${interval}` : `/checkout?plan=${plan}`;
    window.location.href = checkoutUrl;
  };

  const billingToggle = (
    <div className="flex flex-shrink-0 flex-wrap items-center justify-end gap-3">
      <span
        className={`text-sm font-medium ${!isAnnual ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
      >
        Monthly
      </span>
      <button
        type="button"
        onClick={() => setIsAnnual(!isAnnual)}
        aria-label={isAnnual ? 'Switch to monthly billing' : 'Switch to annual billing'}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          isAnnual ? 'bg-vendorsoluce-green' : 'bg-gray-200 dark:bg-gray-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isAnnual ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      <span
        className={`text-sm font-medium ${isAnnual ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
      >
        Annual
      </span>
      {isAnnual ? (
        <Badge className="border border-vendorsoluce-green/30 bg-vendorsoluce-pale-green text-vendorsoluce-dark-green dark:border-vendorsoluce-green/40 dark:bg-vendorsoluce-green/15 dark:text-vendorsoluce-light-green">
          <Crown className="mr-1 h-3 w-3" />
          Save 20%
        </Badge>
      ) : null}
    </div>
  );

  return (
    <WorkspacePageShell
      eyebrow="Plans & billing"
      title="Choose your compliance solution"
      description={t('deployment.pricingPage.heroSubtitle')}
      headerActionsSlot={billingToggle}
    >
      <div className="flex min-w-0 flex-col gap-12 lg:gap-16">
        {!isAnnual ? (
          <div className="rounded-2xl bg-gradient-to-r from-vendorsoluce-green to-vendorsoluce-dark-green p-6 text-white shadow-lg">
            <div className="flex flex-col items-stretch justify-between gap-4 md:flex-row md:items-center">
              <div className="flex items-center gap-3">
                <Crown className="h-8 w-8 shrink-0 text-white/95" />
                <div>
                  <h3 className="mb-1 text-xl font-semibold tracking-tight">Save 20% with annual billing</h3>
                  <p className="text-white/90">
                    Switch to annual billing and save up to {formatCurrency(calculateAnnualSavings('enterprise') * 100)}{' '}
                    per year on Enterprise plans.
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={() => setIsAnnual(true)}
                className="whitespace-nowrap border-0 bg-white px-6 py-3 font-semibold text-vendorsoluce-navy hover:bg-gray-50 dark:bg-white dark:text-vendorsoluce-navy dark:hover:bg-gray-50"
              >
                View annual plans →
              </Button>
            </div>
          </div>
        ) : null}

        {isAnnual ? (
          <Card className="mx-auto max-w-2xl border-vendorsoluce-green/25 bg-gradient-to-r from-vendorsoluce-pale-green/80 to-white dark:from-vendorsoluce-green/10 dark:to-gray-900/40 dark:border-vendorsoluce-green/30">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-center space-x-2 text-vendorsoluce-green dark:text-vendorsoluce-light-green">
                <Calculator className="h-6 w-6" />
                <span className="text-lg font-semibold">Annual savings calculator</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(calculateAnnualSavings('starter') * 100)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Starter Annual Savings</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(calculateAnnualSavings('professional') * 100)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Professional Annual Savings</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(calculateAnnualSavings('enterprise') * 100)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Enterprise Annual Savings</div>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
                Switch to annual billing and save up to 20% on all plans
              </div>
            </CardContent>
          </Card>
        ) : null}

        <DeploymentModelsSection variant="full" clientBackendPlanHref="#choose-plan" className="mb-16" />

      {/* Main Products */}
      <div className="mb-16" id="choose-plan">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-950 dark:text-white sm:text-3xl mb-3 text-center">
          {t('deployment.pricingPage.choosePlanTitle')}
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
          <Trans
            i18nKey="deployment.pricingPage.choosePlanLead"
            components={{ strong: <strong className="font-semibold text-gray-800 dark:text-gray-200" /> }}
          />
        </p>
        {mainProducts.length === 0 ? (
          <div className="text-center text-red-500">
            <p>No products found for {billingInterval} billing</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {mainProducts.map((product) => (
              <StripePricingCard
                key={product.id}
                product={product}
                isAnnual={isAnnual}
                showAddons={showAddons}
                onSubscribe={handleSubscribe}
              />
            ))}
          </div>
        )}
      </div>

      {/* On-Premise / Download — aligned with SaaS plans */}
      <div className="mb-16">
        <Card className="mx-auto max-w-6xl border-2 border-dashed border-vendorsoluce-green/40 bg-gradient-to-br from-gray-50 to-vendorsoluce-pale-green/40 dark:border-vendorsoluce-green/50 dark:from-gray-800/50 dark:to-vendorsoluce-green/10">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-vendorsoluce-green/20 dark:bg-vendorsoluce-green/30 flex items-center justify-center">
                  <Server className="h-7 w-7 text-vendorsoluce-green" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      On-Premise &amp; Download
                    </h3>
                    <Badge className="bg-vendorsoluce-green/20 text-vendorsoluce-dark-green dark:text-vendorsoluce-light-green border-0">
                      <Download className="h-3 w-3 mr-1" />
                      No subscription
                    </Badge>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    Primary deliverable for the <strong>standalone (no backend)</strong> path: full platform and the VendorSoluce™ Portal
                    (vendor assurance &amp; due diligence) as a downloadable build. Tier entitlements ship with the bundle or license key—no VendorSoluce™-hosted
                    database required. Ideal for air-gapped or self-hosted use; Enterprise-class scope via license pricing.
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Available on the <Link to="/download" className="text-vendorsoluce-green hover:underline">Downloads</Link> page. Contact sales for license terms.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                <Link to="/download">
                  <Button variant="primary" className="w-full sm:w-auto bg-vendorsoluce-green hover:bg-vendorsoluce-dark-green text-white">
                    <Download className="h-4 w-4 mr-2" />
                    {t('deployment.onPremise.goToDownloads')}
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline" className="w-full sm:w-auto">
                    {t('deployment.onPremise.contactSales')}
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add-ons Section */}
      <div className="mb-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold tracking-tight text-gray-950 dark:text-white sm:text-3xl mb-4">
            Add-on Services
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Enhance your plan with additional features
          </p>
          <Button
            variant="outline"
            onClick={() => setShowAddons(!showAddons)}
            className="mb-4"
          >
            {showAddons ? 'Hide' : 'Show'} Add-ons
          </Button>
        </div>
        
        {showAddons && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {addonProducts.map((product) => (
              <StripePricingCard
                key={product.id}
                product={product}
                isAnnual={isAnnual}
                onSubscribe={handleSubscribe}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bundle Deals */}
      <div className="mb-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold tracking-tight text-gray-950 dark:text-white sm:text-3xl mb-4">
            Bundle Deals
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Complete compliance packages with multiple frameworks
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {bundleProducts.map((product) => (
            <StripePricingCard
              key={product.id}
              product={product}
              isAnnual={isAnnual}
              onSubscribe={handleSubscribe}
            />
          ))}
        </div>
      </div>

      {/* Premium Features - Add-ons */}
      <div className="mb-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold tracking-tight text-gray-950 dark:text-white sm:text-3xl mb-4">
            Premium Features & Add-ons
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Advanced solutions available as premium add-ons (Professional and above)
          </p>
        </div>

        <Card className="border-2 border-vendorsoluce-green/25 bg-gradient-to-br from-vendorsoluce-pale-green/60 to-white dark:border-vendorsoluce-green/35 dark:from-vendorsoluce-green/10 dark:to-gray-900">
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-vendorsoluce-green/15 dark:bg-vendorsoluce-green/25">
                <Crown className="h-8 w-8 text-vendorsoluce-green dark:text-vendorsoluce-light-green" />
              </div>
              <div className="flex-1">
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <h3 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
                    Vendor Security Assessments
                  </h3>
                  <Badge className="border-0 bg-vendorsoluce-green/15 text-vendorsoluce-dark-green dark:bg-vendorsoluce-green/25 dark:text-vendorsoluce-light-green">
                    Premium
                  </Badge>
                  <Badge variant="outline" className="border-vendorsoluce-navy/25 bg-vendorsoluce-navy/5 text-vendorsoluce-navy dark:border-vendorsoluce-light-green/30 dark:bg-vendorsoluce-navy/20 dark:text-vendorsoluce-light-green">
                    VendorSoluce™ Portal
                  </Badge>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  <strong>VendorSoluce™</strong> includes premium vendor security assessments: 
                  send CMMC and NIST Privacy Framework assessments to your vendors through the <strong>VendorSoluce™ Portal</strong>
                  —the vendor-facing site for <strong>vendor assurance</strong>, <strong>due diligence</strong>, and assessment completion (questionnaires, evidence, and status). 
                  Track progress, collect evidence, and automate compliance scoring.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">CMMC Assessments</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Pre-built CMMC Level 1 & 2 assessment templates with automated scoring
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">VendorSoluce™ Portal</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Vendor assurance and due diligence in one place: vendors use secure links to complete questionnaires, upload evidence, and track remediation
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Analytics & Reporting</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Advanced analytics and executive reporting for vendor compliance status
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Link to="/vendor-assessments">
                    <Button variant="primary" className="bg-vendorsoluce-green text-white hover:bg-vendorsoluce-dark-green">
                      Learn More
                    </Button>
                  </Link>
                  <Link to="/checkout?plan=professional">
                    <Button variant="outline">
                      Get Professional
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features Comparison */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-950 dark:text-white sm:text-3xl mb-8 text-center">
          Features Comparison
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-x-auto min-w-0 overscroll-x-contain">
              <table className="w-full min-w-[52rem] divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white min-w-[11rem]">
                      Features
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                      Starter
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                      Professional
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                      Enterprise
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                      Federal
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {[
                    { 
                      feature: 'Team Members', 
                      starter: formatLimit(starterProduct?.limits.users || 0), 
                      professional: formatLimit(professionalProduct?.limits.users || 0), 
                      enterprise: formatLimit(enterpriseProduct?.limits.users || 0), 
                      federal: formatLimit(federalProduct?.limits.users || 0) 
                    },
                    { 
                      feature: 'Vendor Assessments', 
                      starter: formatLimit(starterProduct?.limits.vendors || 0), 
                      professional: formatLimit(professionalProduct?.limits.vendors || 0), 
                      enterprise: formatLimit(enterpriseProduct?.limits.vendors || 0), 
                      federal: formatLimit(federalProduct?.limits.vendors || 0) 
                    },
                    { 
                      feature: 'Storage', 
                      starter: starterProduct?.limits.storage || 'N/A', 
                      professional: professionalProduct?.limits.storage || 'N/A', 
                      enterprise: enterpriseProduct?.limits.storage || 'N/A', 
                      federal: federalProduct?.limits.storage || 'N/A' 
                    },
                    { 
                      feature: 'NIST SP 800-161', 
                      starter: hasFramework(starterProduct, 'NIST') ? '✓' : '✗', 
                      professional: hasFramework(professionalProduct, 'NIST') ? '✓' : '✗', 
                      enterprise: hasFramework(enterpriseProduct, 'NIST') ? '✓' : '✗', 
                      federal: hasFramework(federalProduct, 'NIST') ? '✓' : '✗' 
                    },
                    { 
                      feature: 'CMMC 2.0', 
                      starter: hasFramework(starterProduct, 'CMMC') ? '✓' : '✗', 
                      professional: hasFramework(professionalProduct, 'CMMC') ? '✓' : '✗', 
                      enterprise: hasFramework(enterpriseProduct, 'CMMC') ? '✓' : '✗', 
                      federal: hasFramework(federalProduct, 'CMMC') ? '✓' : '✗' 
                    },
                    { 
                      feature: 'SOC2 Support', 
                      starter: hasFramework(starterProduct, 'SOC2') ? '✓' : '✗', 
                      professional: hasFramework(professionalProduct, 'SOC2') ? '✓' : '✗', 
                      enterprise: hasFramework(enterpriseProduct, 'SOC2') ? '✓' : '✗', 
                      federal: hasFramework(federalProduct, 'SOC2') ? '✓' : '✗' 
                    },
                    { 
                      feature: 'ISO 27001 Support', 
                      starter: hasFramework(starterProduct, 'ISO27001') ? '✓' : '✗', 
                      professional: hasFramework(professionalProduct, 'ISO27001') ? '✓' : '✗', 
                      enterprise: hasFramework(enterpriseProduct, 'ISO27001') ? '✓' : '✗', 
                      federal: hasFramework(federalProduct, 'ISO27001') ? '✓' : '✗' 
                    },
                    { 
                      feature: 'FedRAMP Support', 
                      starter: hasFramework(starterProduct, 'FEDRAMP') ? '✓' : '✗', 
                      professional: hasFramework(professionalProduct, 'FEDRAMP') ? '✓' : '✗', 
                      enterprise: hasFramework(enterpriseProduct, 'FEDRAMP') ? '✓' : '✗', 
                      federal: hasFramework(federalProduct, 'FEDRAMP') ? '✓' : '✗' 
                    },
                    { 
                      feature: 'FISMA Support', 
                      starter: hasFramework(starterProduct, 'FISMA') ? '✓' : '✗', 
                      professional: hasFramework(professionalProduct, 'FISMA') ? '✓' : '✗', 
                      enterprise: hasFramework(enterpriseProduct, 'FISMA') ? '✓' : '✗', 
                      federal: hasFramework(federalProduct, 'FISMA') ? '✓' : '✗' 
                    },
                    { 
                      feature: 'Vendor assessments (per month)', 
                      starter: '10', 
                      professional: '50', 
                      enterprise: formatLimit(-1), 
                      federal: formatLimit(-1) 
                    },
                    { 
                      feature: 'API Access', 
                      starter: starterProduct?.features.some(f => f.toLowerCase().includes('api')) ? '✓' : '✗', 
                      professional: professionalProduct?.features.some(f => f.toLowerCase().includes('api')) ? '✓' : '✗', 
                      enterprise: enterpriseProduct?.features.some(f => f.toLowerCase().includes('api')) ? '✓' : '✗', 
                      federal: federalProduct?.features.some(f => f.toLowerCase().includes('api')) ? '✓' : '✗' 
                    },
                    { 
                      feature: 'White-Label', 
                      starter: starterProduct?.whiteLabel ? '✓' : '✗', 
                      professional: professionalProduct?.whiteLabel ? '✓' : '✗', 
                      enterprise: enterpriseProduct?.whiteLabel ? '✓' : '✗', 
                      federal: federalProduct?.whiteLabel ? '✓' : '✗' 
                    },
                    { 
                      feature: 'SSO/SAML', 
                      starter: starterProduct?.features.some(f => f.toLowerCase().includes('sso') || f.toLowerCase().includes('saml')) ? '✓' : '✗', 
                      professional: professionalProduct?.features.some(f => f.toLowerCase().includes('sso') || f.toLowerCase().includes('saml')) ? '✓' : '✗', 
                      enterprise: enterpriseProduct?.features.some(f => f.toLowerCase().includes('sso') || f.toLowerCase().includes('saml')) ? '✓' : '✗', 
                      federal: federalProduct?.features.some(f => f.toLowerCase().includes('sso') || f.toLowerCase().includes('saml')) ? '✓' : '✗' 
                    },
                    { 
                      feature: 'Custom Integrations', 
                      starter: starterProduct?.features.some(f => f.toLowerCase().includes('integration')) ? '✓' : '✗', 
                      professional: professionalProduct?.features.some(f => f.toLowerCase().includes('integration')) ? '✓' : '✗', 
                      enterprise: enterpriseProduct?.features.some(f => f.toLowerCase().includes('integration')) ? '✓' : '✗', 
                      federal: federalProduct?.features.some(f => f.toLowerCase().includes('integration')) ? '✓' : '✗' 
                    },
                    { 
                      feature: 'Dedicated Support', 
                      starter: starterProduct?.features.some(f => f.toLowerCase().includes('dedicated') || f.toLowerCase().includes('account manager')) ? '✓' : '✗', 
                      professional: professionalProduct?.features.some(f => f.toLowerCase().includes('dedicated') || f.toLowerCase().includes('account manager')) ? '✓' : '✗', 
                      enterprise: enterpriseProduct?.features.some(f => f.toLowerCase().includes('dedicated') || f.toLowerCase().includes('account manager')) ? '✓' : '✗', 
                      federal: federalProduct?.features.some(f => f.toLowerCase().includes('dedicated') || f.toLowerCase().includes('account manager')) ? '✓' : '✗' 
                    },
                    { 
                      feature: 'SLA Support', 
                      starter: starterProduct?.features.some(f => f.toLowerCase().includes('sla')) ? '✓' : '✗', 
                      professional: professionalProduct?.features.some(f => f.toLowerCase().includes('sla')) ? '✓' : '✗', 
                      enterprise: enterpriseProduct?.features.some(f => f.toLowerCase().includes('sla')) ? '✓' : '✗', 
                      federal: federalProduct?.features.some(f => f.toLowerCase().includes('sla')) ? '✓' : '✗' 
                    }
                  ].map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {row.feature}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-900 dark:text-white">
                        {renderTableCell(row.starter)}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-900 dark:text-white">
                        {renderTableCell(row.professional)}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-900 dark:text-white">
                        {renderTableCell(row.enterprise)}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-900 dark:text-white">
                        {renderTableCell(row.federal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-950 dark:text-white sm:text-3xl mb-8 text-center">
          Frequently Asked Questions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">What's included in each plan?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Each plan includes vendor assessment tools, compliance frameworks, 
                risk scoring, and reporting. Higher tiers include more users, 
                vendors, storage, and advanced features like API access and white-labeling.
              </p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Can I change plans later?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Yes! You can upgrade or downgrade your plan at any time. 
                Changes are prorated, so you only pay the difference for the 
                remaining billing period.
              </p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">What compliance frameworks are supported?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                We support NIST SP 800-161, CMMC 2.0, SOC2 Type II, ISO 27001, FedRAMP, 
                and FISMA. Different plans include different frameworks - 
                check the features comparison above.
              </p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Is there a free trial?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                Yes! All plans come with a 14-day free trial with full Professional tier access. No credit card 
                required to start. You can cancel anytime during the trial period.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                <strong>Trial includes:</strong> Supply Chain Risk Assessment (NIST SP 800-161), Vendor Risk Radar,
                Vendor Risk Monitoring, Risk Scoring, and Compliance Tracking.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Can I try before I buy?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                Yes! All plans come with a 14-day free trial with full Professional tier access. No credit card 
                required to start. You can explore all features, run assessments, and manage vendors during your trial.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                <strong>Trial includes:</strong> Full dashboard access, Supply Chain Risk Assessment, Vendor Risk Radar, 
                Vendor Risk Monitoring, and all Professional tier features. Start your 14-day free trial today.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">How does annual billing work?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Annual billing offers a 20% discount compared to monthly billing. 
                You'll be charged once per year and can cancel anytime. 
                Changes to your plan are prorated.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Do you offer custom pricing?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Yes! For large organizations with specific needs, we offer custom 
                pricing and enterprise solutions. Contact our sales team to discuss 
                your requirements.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">What support do you provide?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Starter plans include email support. Professional plans get priority 
                support. Enterprise and Federal plans include 24/7 dedicated support 
                and account managers.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Is my data secure?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                We implement enterprise-grade security measures including encryption at rest and in transit, 
                regular security audits, and access controls. Our platform is designed to support 
                various compliance frameworks including SOC2 and FedRAMP requirements.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg">What about Vendor Risk Assessments?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400">
                Vendor Risk Assessments and the <strong>VendorSoluce™ Portal</strong> (vendor-facing assessments and due diligence) are <strong>VendorSoluce™</strong> premium capabilities. 
                VendorSoluce™ also covers supply chain risk assessment, vendor risk monitoring, and tools such as Vendor Risk Radar. Contact sales to learn about plans and integration options.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="rounded-2xl bg-gradient-to-r from-vendorsoluce-pale-green/90 via-white to-vendorsoluce-teal/10 p-10 text-center dark:from-gray-900 dark:via-gray-900 dark:to-vendorsoluce-teal/15 sm:p-12">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-gray-950 dark:text-white sm:text-3xl">
            Ready to transform your compliance program?
          </h2>
          <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
            Join organizations using VendorSoluce to streamline vendor risk management and ship evidence-backed
            assurance.
          </p>
          <div className="mb-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link to="/checkout?plan=professional">
              <Button
                size="lg"
                className="bg-vendorsoluce-green px-8 py-4 text-lg text-white hover:bg-vendorsoluce-dark-green"
              >
                Get Professional
              </Button>
            </Link>
          </div>
          <div className="flex flex-col items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400 sm:flex-row">
            <div className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-vendorsoluce-green" />
              No credit card required
            </div>
            <div className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-vendorsoluce-green" />
              14-day free trial
            </div>
            <div className="flex items-center">
              <Check className="mr-2 h-4 w-4 text-vendorsoluce-green" />
              Cancel anytime
            </div>
          </div>
        </div>
      </div>
      </div>
    </WorkspacePageShell>
  );
};

export default Pricing;
