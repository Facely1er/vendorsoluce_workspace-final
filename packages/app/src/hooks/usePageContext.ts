import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export interface PageContext {
  page: string;
  feature?: string;
  section?: string;
}

export const usePageContext = (): PageContext => {
  const location = useLocation();
  const [context, setContext] = useState<PageContext>({ page: 'home' });

  useEffect(() => {
    const pathname = location.pathname;

    const pageContextSentence = (() => {
      if (pathname.includes('vendor-risk-radar'))   return 'The user is on the Vendor Risk Radar page, which visualizes portfolio-wide risk scores.';
      if (pathname.includes('supply-chain'))        return 'The user is on the Supply Chain Assessment page.';
      if (pathname.includes('vendor-assessments'))  return 'The user is on the Vendor Security Assessments page, where they send and track assessments.';
      if (pathname.includes('vira-reports'))        return 'The user is on the VIRA Reports page, which generates vendor intelligence reports.';
      if (pathname.includes('fedramp'))             return 'The user is on the FedRAMP/FISMA Evidence collection page.';
      if (pathname.includes('compliance-roadmap'))  return 'The user is on the Compliance Roadmap page.';
      if (pathname.includes('program/nist'))        return 'The user is on the NIST C-SCRM implementation program page.';
      if (pathname.includes('program/vira'))        return 'The user is on the VIRA Due Diligence program page.';
      if (pathname.includes('asset-management'))    return 'The user is on the Asset Management page.';
      if (pathname.includes('vendor-requirements')) return 'The user is on the Vendor Requirements definition page.';
      if (pathname.includes('platform-setup'))      return 'The user is on the Platform Setup page.';
      if (pathname === '/' || pathname.includes('dashboard')) return 'The user is on the main workspace dashboard.';
      return 'The user is in the VendorSoluce workspace.';
    })();
    
    // Map routes to page contexts
    const pageMap: Record<string, PageContext> = {
      '/': { page: 'home' },
      '/dashboard': { page: 'dashboard', feature: 'overview' },
      '/vendors': { page: 'vendor-risk-dashboard', feature: 'vendor-management' },
      '/vendor-risk-dashboard': { page: 'vendor-risk-dashboard', feature: 'vendor-management' },
      '/sbom-analyzer': { page: 'sbom-analyzer', feature: 'sbom-analysis' },
      '/supply-chain-assessment': { page: 'supply-chain-assessment', feature: 'assessment' },
      '/supply-chain-results': { page: 'supply-chain-results', feature: 'assessment-results' },
      '/vendor-assessments': { page: 'vendor-assessments', feature: 'vendor-assessment-management' },
      '/download': { page: 'downloads', feature: 'downloads-hub' },
      '/templates': { page: 'templates', feature: 'template-library' },
      '/how-it-works': { page: 'tutorial', feature: 'product-overview' },
      '/tutorial': { page: 'tutorial', feature: 'product-overview' },
      '/pricing': { page: 'pricing', feature: 'subscription' },
      '/contact': { page: 'contact', feature: 'support' },
      '/api-docs': { page: 'api-docs', feature: 'api-documentation' },
      '/integration-guides': { page: 'integration-guides', feature: 'integrations' },
      '/profile': { page: 'profile', feature: 'user-settings' },
      '/account': { page: 'account', feature: 'account-management' },
      '/billing': { page: 'billing', feature: 'billing-management' },
      '/onboarding': { page: 'onboarding', feature: 'user-onboarding' },
      '/tools/nist-checklist': { page: 'nist-checklist', feature: 'compliance-tool' },
      '/tools/sbom-quick-scan': { page: 'sbom-quick-scan', feature: 'quick-analysis' },
      '/vendor-risk-radar': { page: 'vendor-risk-radar', feature: 'risk-visualization' },
      '/tools/vendor-risk-calculator': { page: 'vendor-risk-calculator', feature: 'risk-calculation' }
    };

    // Find exact match or closest match
    let pageContext = pageMap[pathname];
    
    if (!pageContext) {
      // Try to match by prefix for dynamic routes
      for (const [route, ctx] of Object.entries(pageMap)) {
        if (pathname.startsWith(route) && route !== '/') {
          pageContext = ctx;
          break;
        }
      }
    }

    // Default to home if no match found
    if (!pageContext) {
      pageContext = { page: 'home' };
    }

    setContext({ ...pageContext, section: pageContextSentence });
  }, [location.pathname]);

  return context;
};
