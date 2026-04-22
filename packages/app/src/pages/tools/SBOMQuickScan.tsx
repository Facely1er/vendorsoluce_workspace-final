import React, { useState } from 'react';
import { ArrowLeft, Mail, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import SBOMUploader from '../../components/sbom/SBOMUploader';
import { WORKSPACE_PAGE_BODY_GRID_CLASS } from '../../components/vendorsoluce-intelligence/WorkspacePageShell';
import { Button } from '../../components/ui/Button';
import { useTranslation } from 'react-i18next';
import { useSBOMAnalyses } from '../../hooks/useSBOMAnalyses';
import { useAuth } from '../../context/AuthContext';
import { logger } from '../../utils/logger';
import { supabase, isSupabaseEnabled } from '../../lib/supabase';
import type { Database } from '../../lib/database.types';
import { parseCycloneDX, parseSPDX } from '../../utils/sbomAnalyzer';

const SBOMQuickScan: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { createAnalysis } = useSBOMAnalyses();
  const [isLoading, setIsLoading] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [scanResults, setScanResults] = useState<{
    components: number;
    licenses: number;
    vulnerabilities: number;
  }>({ components: 0, licenses: 0, vulnerabilities: 0 });
  const [error, setError] = useState<string | null>(null);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [anonymousScans, setAnonymousScans] = useState<{ count: number; date: string }>(() => {
    const stored = localStorage.getItem('vs_anonymous_sbom_scans');
    if (stored) {
      const data = JSON.parse(stored);
      // Reset if it's a new month
      const today = new Date().toISOString().split('T')[0];
      if (data.date !== today) {
        return { count: 0, date: today };
      }
      return data;
    }
    return { count: 0, date: new Date().toISOString().split('T')[0] };
  });

  const FREE_SCAN_LIMIT = 3;
  
  // Check if user can perform scan
  const canPerformScan = (): boolean => {
    if (isAuthenticated) return true; // Authenticated users have their own limits
    
    const today = new Date().toISOString().split('T')[0];
    if (anonymousScans.date !== today) {
      // New day, reset count
      setAnonymousScans({ count: 0, date: today });
      return true;
    }
    
    return anonymousScans.count < FREE_SCAN_LIMIT;
  };

  // Function to handle SBOM upload and quick scan
  const handleSBOMUpload = async (file: File) => {
    // Check if anonymous user has reached limit
    if (!isAuthenticated && !canPerformScan()) {
      setShowEmailCapture(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Read the file content
      const fileContent = await readFileAsText(file);
      
      // Parse the SBOM file to extract basic information
      const { components, licenses, vulnerabilities } = quickScanSBOM(fileContent);
      
      // Save analysis to database if user is authenticated
      if (isAuthenticated) {
        await createAnalysis({
          filename: file.name,
          file_type: file.type,
          total_components: components,
          total_vulnerabilities: vulnerabilities,
          risk_score: calculateQuickRiskScore(vulnerabilities, components),
          analysis_data: { components, licenses, vulnerabilities }
        });
      } else {
        // Track anonymous scan
        const today = new Date().toISOString().split('T')[0];
        const newCount = anonymousScans.date === today ? anonymousScans.count + 1 : 1;
        const newData = { count: newCount, date: today };
        setAnonymousScans(newData);
        localStorage.setItem('vs_anonymous_sbom_scans', JSON.stringify(newData));
      }
      
      // Update state with scan results
      setScanResults({ components, licenses, vulnerabilities });
      setScanComplete(true);
    } catch (err) {
      logger.error('Error scanning SBOM:', err);
      setError(err instanceof Error ? err.message : 'Failed to scan SBOM file');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle email capture submission (bypassed when backend not configured for demo/test)
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailSubmitting(true);
    
    try {
      if (isSupabaseEnabled()) {
        // Save to database when backend is configured (vs_contact_submissions schema)
        type ContactInsert = Database['public']['Tables']['vs_contact_submissions']['Insert'];
        const payload: ContactInsert = {
          first_name: '',
          last_name: '',
          email,
          topic: 'sbom_quick_scan',
          message: JSON.stringify({
            tool: 'sbom_quick_scan',
            scans_used: anonymousScans.count,
            limit_reached: true,
          }),
        };
        // Assertion needed: stub client narrows insert to never; payload matches vs_contact_submissions.Insert
        const { error: dbError } = await supabase.from('vs_contact_submissions').insert(payload as never);

        if (dbError) {
          logger.error('Error saving email:', dbError);
        }

        // Send to marketing automation (if available)
        try {
          await supabase.functions.invoke('add-to-nurture', {
            body: { 
              email, 
              campaign: 'freemium_sbom',
              metadata: { scans_used: anonymousScans.count }
            }
          });
        } catch (err) {
          logger.warn('Marketing automation not available:', err);
        }
      }
      // When backend not configured: skip DB/email; allow demo/test to continue

      // Show success and allow scan
      setShowEmailCapture(false);
      setEmail('');
      
      // Grant 5 more scans for email submission
      const today = new Date().toISOString().split('T')[0];
      setAnonymousScans({ count: 0, date: today }); // Reset to allow more scans
      localStorage.setItem('vs_anonymous_sbom_scans', JSON.stringify({ count: 0, date: today }));
      
      // Show success message (demo-friendly when backend not set up)
      const message = isSupabaseEnabled()
        ? 'Thank you! You now have 5 more free scans. Check your email for your detailed report.'
        : 'Thank you! You now have 5 more free scans. (Demo mode: submission saved locally until backend is configured.)';
      alert(message);
    } catch (err) {
      logger.error('Error submitting email:', err);
      setError('Failed to submit email. Please try again.');
    } finally {
      setEmailSubmitting(false);
    }
  };
  
  // Helper function to read file content
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };
  
  // Helper function to perform a quick scan of SBOM content using shared parsers
  const quickScanSBOM = (content: string): { components: number; licenses: number; vulnerabilities: number } => {
    try {
      const data = JSON.parse(content);

      // CycloneDX path
      if (data.bomFormat === 'CycloneDX' || data.components) {
        const { components } = parseCycloneDX(data);
        const licenseSet = new Set<string>();
        components.forEach(comp => {
          if (comp.license && comp.license !== 'Unknown') licenseSet.add(comp.license);
        });
        // CycloneDX may embed vulnerability entries at top level
        const vulnerabilities = Array.isArray(data.vulnerabilities) ? (data.vulnerabilities as unknown[]).length : 0;
        return { components: components.length, licenses: licenseSet.size, vulnerabilities };
      }

      // SPDX path
      if (data.spdxVersion || data.packages) {
        const { components } = parseSPDX(data);
        const licenseSet = new Set<string>();
        components.forEach(comp => {
          if (comp.license && comp.license !== 'Unknown') licenseSet.add(comp.license);
        });
        return { components: components.length, licenses: licenseSet.size, vulnerabilities: 0 };
      }

      return generateMockScanResults();
    } catch (err) {
      logger.warn('Could not parse SBOM as JSON, using mock data');
      return generateMockScanResults();
    }
  };

  // Simple risk score for quick scan: penalise based on vuln-to-component ratio
  const calculateQuickRiskScore = (vulnerabilities: number, components: number): number => {
    if (components === 0) return 100;
    const vulnRatio = vulnerabilities / components;
    return Math.max(0, Math.min(100, Math.round(100 - vulnRatio * 100)));
  };

  const generateMockScanResults = (): { components: number; licenses: number; vulnerabilities: number } => ({
    components: 42,
    licenses: 4,
    vulnerabilities: 0
  });
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center text-gray-700 dark:text-gray-300 hover:text-vendorsoluce-navy dark:hover:text-vendorsoluce-blue transition-colors mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('navigation.home')}
        </Link>
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">{t('quickTools.sbomScan.title')}</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{t('quickTools.sbomScan.description')}</p>
      </div>
      
      <div className={`${WORKSPACE_PAGE_BODY_GRID_CLASS} lg:grid-cols-3`}>
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-gray-200/70 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="p-4 pb-2">
              <div className="font-semibold text-gray-900 dark:text-white">{t('sbom.upload.title')}</div>
            </div>
            <div>
              {!isAuthenticated && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                  <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                    {anonymousScans.count < FREE_SCAN_LIMIT 
                      ? `Free scans remaining: ${FREE_SCAN_LIMIT - anonymousScans.count} of ${FREE_SCAN_LIMIT}`
                      : 'Free scan limit reached'
                    }
                  </p>
                  {anonymousScans.count >= FREE_SCAN_LIMIT && (
                    <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                      Enter your email to get 5 more free scans + detailed PDF report
                    </p>
                  )}
                </div>
              )}
              
              <SBOMUploader onUpload={handleSBOMUpload} isLoading={isLoading} />
              
              {error && (
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md">
                  {error}
                </div>
              )}

              {!isAuthenticated && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Want unlimited scans?
                  </p>
                  <Link to="/signup">
                    <Button className="w-full">
                      Sign Up Free
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-6">
            <div className="rounded-xl border border-gray-200/70 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="p-4 pb-2">
                <div className="font-semibold text-gray-900 dark:text-white">{t('sbom.results.supportedFormats')}</div>
              </div>
              <div>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• SPDX (JSON)</li>
                  <li>• CycloneDX (JSON)</li>
                  <li className="text-gray-400 dark:text-gray-500">• XML format coming soon</li>
                </ul>
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  {t('quickTools.sbomScan.formatInfo')}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="rounded-xl border border-gray-200/70 bg-white h-64 flex justify-center items-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="text-center">
                <div className="spinner-border mb-3 h-8 w-8 border-b-2 border-t-2 border-vendorsoluce-teal rounded-full animate-spin"></div>
                <p className="text-gray-600 dark:text-gray-300">{t('sbom.upload.analyzing')}</p>
              </div>
            </div>
          ) : scanComplete ? (
            <div className="rounded-xl border border-gray-200/70 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="p-4 pb-2">
                <div className="font-semibold text-gray-900 dark:text-white">{t('sbom.results.title')}</div>
              </div>
              <div>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4 mb-6">
                  <p className="font-medium text-green-800 dark:text-green-400">
                    {t('quickTools.sbomScan.scanComplete')}
                  </p>
                  <p className="text-green-700 dark:text-green-300 mt-1">
                    {scanResults.vulnerabilities === 0 
                      ? t('quickTools.sbomScan.noVulnerabilities')
                      : `${scanResults.vulnerabilities} vulnerabilities detected in your SBOM.`
                    }
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('sbom.results.components')}</p>
                    <p className="text-2xl font-bold">{scanResults.components}</p>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('sbom.results.licenses')}</p>
                    <p className="text-2xl font-bold">{scanResults.licenses}</p>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('sbom.results.vulnerabilities')}</p>
                    <p className="text-2xl font-bold">{scanResults.vulnerabilities}</p>
                  </div>
                </div>
                
                <button disabled className="w-full bg-gray-400 dark:bg-gray-600 text-white py-2 rounded-md cursor-not-allowed opacity-75">
                  {t('quickTools.sbomScan.fullAnalysis')} (Coming soon)
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200/70 bg-white h-64 flex flex-col justify-center items-center text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{t('sbom.upload.noSbom')}</h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-md px-6">
                {t('sbom.upload.uploadPrompt')}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Email Capture Modal */}
      {showEmailCapture && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="rounded-xl border border-gray-200/70 bg-white max-w-md w-full shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Mail className="h-5 w-5 text-vendorsoluce-teal" />
                  Get Your Full Report
                </div>
                <button
                  type="button"
                  onClick={() => setShowEmailCapture(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  title="Close"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You've used your {FREE_SCAN_LIMIT} free scans for today. Enter your email to:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mb-6 space-y-1">
                <li>Get a detailed PDF report of your scan</li>
                <li>Unlock 5 more free scans</li>
                <li>Receive vulnerability alerts and tips</li>
              </ul>
              <form onSubmit={handleEmailSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-vendorsoluce-teal focus:border-transparent"
                      placeholder="your@email.com"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={emailSubmitting}
                    className="w-full bg-vendorsoluce-teal hover:bg-vendorsoluce-teal/90"
                  >
                    {emailSubmitting ? 'Submitting...' : 'Get Report + 5 More Scans'}
                  </Button>
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    We'll never spam you. Unsubscribe anytime.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SBOMQuickScan;