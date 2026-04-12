import { useState, useEffect } from 'react';
import { config } from '../utils/config';

const SESSION_KEY = 'vs_from_website';

/**
 * Detects if the user arrived at the platform from the marketing website,
 * so we can unrestrict access to platform features (dashboard, vendors, etc.)
 * similar to the supply-chain-assessment page.
 *
 * Sets sessionStorage so that once "from website" is true, it stays true for
 * the session (e.g. after navigating between platform pages).
 */
function getIsFromWebsite(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = sessionStorage.getItem(SESSION_KEY);
  if (stored === '1') return true;
  const websiteUrl = config.app.websiteUrl || 'https://www.vendorsoluce.com';
  let websiteHost: string;
  try {
    websiteHost = new URL(websiteUrl).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    websiteHost = 'vendorsoluce.com';
  }
  const referrer = document.referrer || '';
  let fromReferrer = false;
  if (referrer) {
    try {
      const referrerHost = new URL(referrer).hostname.toLowerCase().replace(/^www\./, '');
      fromReferrer = referrerHost === websiteHost || referrerHost.endsWith('.vendorsoluce.com');
    } catch {
      fromReferrer = referrer.includes('vendorsoluce.com');
    }
  }
  const params = new URLSearchParams(window.location.search);
  const fromParam = params.get('from') === 'website' || params.get('ref') === 'website';
  return fromReferrer || fromParam;
}

export function useFromWebsite(): boolean {
  const [fromWebsite, setFromWebsite] = useState<boolean>(getIsFromWebsite);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isFromWebsite = getIsFromWebsite();
    if (isFromWebsite) {
      setFromWebsite(true);
      sessionStorage.setItem(SESSION_KEY, '1');
    }
  }, []);

  return fromWebsite;
}
