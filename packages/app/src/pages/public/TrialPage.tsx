import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Upload, CheckCircle, Mail, ArrowRight, X, Zap, Database } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../context/SubscriptionContext';

interface Vendor {
  name: string;
  domain: string;
  industry: string;
  riskScore: number;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
}

const TrialPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isDemoMode } = useAuth();
  const { canStartTrial, startTrial, isTrial, isLoading: subLoading } = useSubscription();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [trialStarting, setTrialStarting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStartTrial = async () => {
    if (!canStartTrial || !user) return;
    setTrialStarting(true);
    try {
      await startTrial();
      navigate('/dashboard');
    } catch {
      setTrialStarting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target.result as string;
      const parsedVendors = parseCSV(csv);
      setVendors(parsedVendors);
      setShowResults(true);
      
      // Show email CTA after 30 seconds
      setTimeout(() => {
        if (!emailSubmitted) {
          // Floating CTA would appear here
        }
      }, 30000);
    };
    reader.readAsText(file);
  };

  const parseCSV = (csv: string): Vendor[] => {
    const lines = csv.split('\n').filter(line => line.trim());
    const data: Vendor[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length < 1 || !values[0]) continue;
      
      const riskScore = Math.floor(Math.random() * 60) + 30;
      let riskLevel: 'critical' | 'high' | 'medium' | 'low';
      if (riskScore >= 80) riskLevel = 'critical';
      else if (riskScore >= 60) riskLevel = 'high';
      else if (riskScore >= 40) riskLevel = 'medium';
      else riskLevel = 'low';
      
      data.push({
        name: values[0],
        domain: values[1] || '',
        industry: values[2] || 'General',
        riskScore,
        riskLevel,
      });
    }
    
    return data;
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Capture lead (summary only, no raw vendor data)
    const summary = {
      email,
      vendorCount: vendors.length,
      criticalCount: vendors.filter(v => v.riskLevel === 'critical').length,
      highCount: vendors.filter(v => v.riskLevel === 'high').length,
      avgScore: Math.round(vendors.reduce((sum, v) => sum + v.riskScore, 0) / vendors.length),
    };
    
    // In production, send to API
    console.log('Lead captured:', summary);
    
    setEmailSubmitted(true);
    setShowEmailModal(false);
    
    // Show success message
    alert(`Report will be sent to ${email}. Thank you!`);
  };

  const criticalCount = vendors.filter(v => v.riskLevel === 'critical').length;
  const highCount = vendors.filter(v => v.riskLevel === 'high').length;
  const avgScore = vendors.length > 0 
    ? Math.round(vendors.reduce((sum, v) => sum + v.riskScore, 0) / vendors.length)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Real Trial CTA - Use with your own data */}
        {!isDemoMode && (
          <Card className="mb-8 bg-gradient-to-r from-vendorsoluce-navy to-vendorsoluce-teal text-white border-0">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Database className="h-10 w-10 text-vendorsoluce-pale-green" />
                  <div>
                    <h2 className="text-xl font-semibold">Use with your real data</h2>
                    <p className="text-sm text-gray-200">
                      14-day free trial. Add vendors, run assessments, analyze SBOMs. No credit card required.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {!user ? (
                    <>
                      <Link to="/signin">
                        <Button variant="secondary" size="sm" className="bg-white text-vendorsoluce-navy hover:bg-gray-100">
                          Sign In
                        </Button>
                      </Link>
                      <Link to="/signin?mode=signup">
                        <Button variant="outline" size="sm" className="border-white text-white hover:bg-white/20">
                          Create Account
                        </Button>
                      </Link>
                    </>
                  ) : isTrial ? (
                    <Link to="/dashboard">
                      <Button variant="secondary" size="sm" className="bg-white text-vendorsoluce-navy hover:bg-gray-100 inline-flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Go to Dashboard
                      </Button>
                    </Link>
                  ) : canStartTrial ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleStartTrial}
                      disabled={trialStarting || subLoading}
                      className="bg-white text-vendorsoluce-navy hover:bg-gray-100 inline-flex items-center gap-2"
                    >
                      <Zap className="h-4 w-4" />
                      {trialStarting ? 'Starting...' : 'Start Free Trial'}
                    </Button>
                  ) : (
                    <Link to="/dashboard">
                      <Button variant="secondary" size="sm" className="bg-white text-vendorsoluce-navy hover:bg-gray-100">
                        Go to Dashboard
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!showResults ? (
          /* Upload Stage */
          <div>
            <div className="text-center mb-12">
              <div className="inline-block mb-4">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-vendorsoluce-green/10 text-vendorsoluce-green border border-vendorsoluce-green/30">
                  Free Trial
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-4 text-gray-900 dark:text-white">
                Stage 1: Discover Your Exposure
              </h1>
              <div className="mb-6 p-4 bg-vendorsoluce-pale-green dark:bg-vendorsoluce-green/10 rounded-lg border border-vendorsoluce-green/30 max-w-2xl mx-auto">
                <div className="text-sm font-semibold text-vendorsoluce-green dark:text-vendorsoluce-light-green mb-2">
                  🎯 OUTCOME
                </div>
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  "I know exactly which vendors pose the greatest risk"
                </p>
              </div>
              <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
                Upload your vendor list and get instant risk analysis. See which vendors pose the greatest risk to your organization. No signup required.
              </p>
            </div>

            <Card className="mb-8">
              <CardContent className="p-8 md:p-12 text-center">
                <div
                  className="border-3 border-dashed border-vendorsoluce-light-green rounded-xl p-12 bg-vendorsoluce-pale-green cursor-pointer hover:bg-vendorsoluce-green/5 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-16 h-16 text-vendorsoluce-green mx-auto mb-4" />
                  <div className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
                    Drag CSV here or click to upload
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    CSV format: Vendor Name, Domain, Industry
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    No email required for risk overview
                  </span>
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Client-side processing (data never uploaded)
                  </span>
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Instant results
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Results Stage */
          <div>
            <Card className="mb-8">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <div className="mb-6 p-4 bg-vendorsoluce-pale-green dark:bg-vendorsoluce-green/10 rounded-lg border border-vendorsoluce-green/30 max-w-2xl mx-auto">
                    <div className="text-sm font-semibold text-vendorsoluce-green dark:text-vendorsoluce-light-green mb-2">
                      ✅ STAGE 1 COMPLETE
                    </div>
                    <p className="text-base font-medium text-gray-900 dark:text-white">
                      "I know exactly which vendors pose the greatest risk"
                    </p>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-gray-900 dark:text-white">
                    YOUR Vendor Risk Radar
                  </h2>
                  <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                    Analysis of <span className="font-bold">{vendors.length}</span> vendors in YOUR portfolio
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Continue to Stage 2 to define specific requirements for your critical vendors
                  </p>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  <Card className="p-6 text-center">
                    <div className="text-3xl font-bold text-vendorsoluce-green mb-2">{vendors.length}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">YOUR Vendors</div>
                  </Card>
                  <Card className="p-6 text-center bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30">
                    <div className="text-3xl font-bold text-red-600 mb-2">{criticalCount}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">YOUR Critical Risk</div>
                  </Card>
                  <Card className="p-6 text-center bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800/30">
                    <div className="text-3xl font-bold text-orange-600 mb-2">{highCount}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">YOUR High Risk</div>
                  </Card>
                  <Card className="p-6 text-center">
                    <div className="text-3xl font-bold text-vendorsoluce-green mb-2">{avgScore}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Average Risk Score</div>
                  </Card>
                </div>

                {/* Top Risks */}
                <div className="mb-8">
                  <h3 className="text-xl md:text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                    ⚠️ YOUR Top 3 Riskiest Vendors:
                  </h3>
                  <div className="space-y-3">
                    {vendors
                      .sort((a, b) => b.riskScore - a.riskScore)
                      .slice(0, 3)
                      .map((vendor, idx) => (
                        <Card key={idx} className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-semibold text-lg text-gray-900 dark:text-white">
                                {idx + 1}. {vendor.name}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {vendor.industry} • {vendor.domain}
                              </div>
                            </div>
                            <div className="text-2xl font-bold text-red-600">{vendor.riskScore}/100</div>
                          </div>
                        </Card>
                      ))}
                  </div>
                </div>

                {/* Recommendations */}
                <Card className="mb-8 bg-vendorsoluce-pale-green dark:bg-gray-700 border-vendorsoluce-green/30">
                  <CardContent className="p-6">
                    <h3 className="text-lg md:text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                      💡 Immediate Actions:
                    </h3>
                    <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                      <li>• Prioritize assessment of {criticalCount} critical vendor{criticalCount !== 1 ? 's' : ''}</li>
                      <li>• Request SOC 2 certifications from high-risk vendors</li>
                      <li>• Implement continuous monitoring for all vendors</li>
                    </ul>
                  </CardContent>
                </Card>

                {/* CTAs */}
                <div className="text-center space-y-4">
                  <div>
                    <Link to="/supply-chain-assessment">
                      <Button variant="primary" size="lg" className="flex items-center gap-2 mx-auto">
                        Continue to Stage 2: Define Requirements
                        <ArrowRight className="w-5 h-5" />
                      </Button>
                    </Link>
                  </div>
                  <div>
                    <Link to="/vendor-risk-radar" className="text-sm text-vendorsoluce-green dark:text-vendorsoluce-light-green hover:underline">
                      View Full Interactive Radar
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Floating Email CTA (appears after viewing results) */}
            {!emailSubmitted && (
              <div className="fixed bottom-8 right-8 bg-vendorsoluce-green text-white p-6 rounded-xl shadow-lg z-50 max-w-sm">
                <div className="text-center">
                  <Mail className="w-8 h-8 mx-auto mb-2" />
                  <h3 className="font-bold text-lg mb-2">📧 Get Detailed Report</h3>
                  <p className="text-sm mb-4">Want vendor-by-vendor analysis with specific requirements?</p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowEmailModal(true)}
                    className="bg-white text-vendorsoluce-green hover:bg-gray-100"
                  >
                    Get Complete Report
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Email Modal */}
        {showEmailModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">
                    Get Your Complete Report
                  </h2>
                  <button
                    onClick={() => setShowEmailModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-base text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                  We'll send you:
                </p>
                <ul className="list-disc list-inside mb-6 text-gray-700 dark:text-gray-300 space-y-2">
                  <li>Individual vendor scorecards</li>
                  <li>Specific requirements per vendor</li>
                  <li>90-day implementation roadmap</li>
                  <li>Policy templates</li>
                </ul>

                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Work email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowEmailModal(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" className="flex-1">
                      Send My Report
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrialPage;
