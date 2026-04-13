import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CheckCircle, ArrowRight, ArrowLeft, Target, AlertCircle } from 'lucide-react';

interface DemoVendor {
  name: string;
  domain: string;
  industry: string;
  riskScore: number;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
}

const DEMO_VENDORS: DemoVendor[] = [
  { name: 'AWS Cloud Services', domain: 'aws.amazon.com', industry: 'Cloud', riskScore: 32, riskLevel: 'low' },
  { name: 'Salesforce CRM', domain: 'salesforce.com', industry: 'SaaS', riskScore: 45, riskLevel: 'medium' },
  { name: 'Okta Identity', domain: 'okta.com', industry: 'Security', riskScore: 38, riskLevel: 'low' },
  { name: 'Legacy Vendor Inc', domain: 'legacyvendor.com', industry: 'Software', riskScore: 87, riskLevel: 'critical' },
  { name: 'DataCorp Analytics', domain: 'datacorp.io', industry: 'Analytics', riskScore: 76, riskLevel: 'high' },
  { name: 'SecureComm Solutions', domain: 'securecomm.com', industry: 'Telecom', riskScore: 82, riskLevel: 'critical' },
  { name: 'CloudBackup Pro', domain: 'cloudbackup.net', industry: 'Backup', riskScore: 68, riskLevel: 'high' },
  { name: 'PaymentGateway Global', domain: 'paymentgateway.com', industry: 'Finance', riskScore: 91, riskLevel: 'critical' },
];

const DemoPage: React.FC = () => {
  const [currentStage, setCurrentStage] = useState<1 | 2 | 3>(1);

  const criticalCount = DEMO_VENDORS.filter(v => v.riskLevel === 'critical').length;
  const highCount = DEMO_VENDORS.filter(v => v.riskLevel === 'high').length;
  const avgScore = Math.round(DEMO_VENDORS.reduce((sum, v) => sum + v.riskScore, 0) / DEMO_VENDORS.length);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-vendorsoluce-green/10 text-vendorsoluce-green border border-vendorsoluce-green/30">
              🚀 Interactive Demo
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-4 text-gray-900 dark:text-white">
            Experience the 3-Stage Journey
          </h1>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            From exposure discovery to risk elimination - walk through the complete outcome-driven workflow. 
            No signup required. All data stays in your browser.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <div className={`flex-1 text-center ${currentStage >= 1 ? 'opacity-100' : 'opacity-50'}`}>
              <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                currentStage >= 1 ? 'bg-vendorsoluce-green text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
              }`}>
                {currentStage > 1 ? <CheckCircle className="w-6 h-6" /> : '1'}
              </div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">Stage 1</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Discover Your Exposure</div>
            </div>
            <div className={`flex-1 h-1 mx-4 ${currentStage >= 2 ? 'bg-vendorsoluce-green' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
            <div className={`flex-1 text-center ${currentStage >= 2 ? 'opacity-100' : 'opacity-50'}`}>
              <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                currentStage >= 2 ? 'bg-vendorsoluce-green text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
              }`}>
                {currentStage > 2 ? <CheckCircle className="w-6 h-6" /> : '2'}
              </div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">Stage 2</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Understand Your Gaps</div>
            </div>
            <div className={`flex-1 h-1 mx-4 ${currentStage >= 3 ? 'bg-vendorsoluce-green' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
            <div className={`flex-1 text-center ${currentStage >= 3 ? 'opacity-100' : 'opacity-50'}`}>
              <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                currentStage >= 3 ? 'bg-vendorsoluce-green text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
              }`}>
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">Stage 3</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Close the Gaps</div>
            </div>
          </div>
        </div>

        {/* Stage 1: Discover Your Exposure */}
        {currentStage === 1 && (
          <Card className="mb-6">
            <CardContent className="p-8">
              <div className="mb-6 p-4 bg-vendorsoluce-pale-green dark:bg-vendorsoluce-green/10 rounded-lg border border-vendorsoluce-green/30">
                <div className="text-sm font-semibold text-vendorsoluce-green dark:text-vendorsoluce-light-green mb-2 inline-flex items-center gap-2">
                  <Target className="h-4 w-4 shrink-0" aria-hidden />
                  STAGE 1 OUTCOME
                </div>
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  "I know exactly which vendors pose the greatest risk"
                </p>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-gray-900 dark:text-white">
                Stage 1: Discover Your Exposure
              </h2>
              <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                Upload your vendor list and instantly see which vendors pose the greatest risk. 
                This demo shows 8 sample vendors with pre-calculated risk scores.
              </p>

              {/* Demo Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg text-center border border-gray-200 dark:border-gray-600">
                  <div className="text-3xl font-bold text-vendorsoluce-green mb-2">{DEMO_VENDORS.length}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Vendors</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg text-center border border-red-200 dark:border-red-800/30">
                  <div className="text-3xl font-bold text-red-600 mb-2">{criticalCount}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Critical Risk</div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg text-center border border-orange-200 dark:border-orange-800/30">
                  <div className="text-3xl font-bold text-orange-600 mb-2">{highCount}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">High Risk</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg text-center border border-gray-200 dark:border-gray-600">
                  <div className="text-3xl font-bold text-vendorsoluce-green mb-2">{avgScore}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Avg Risk Score</div>
                </div>
              </div>

              {/* Demo Vendor Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {DEMO_VENDORS.map((vendor, idx) => (
                  <Card key={idx} className="p-4 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-lg text-gray-900 dark:text-white">{vendor.name}</div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        vendor.riskLevel === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                        vendor.riskLevel === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                        vendor.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                        {vendor.riskLevel}
                      </span>
                    </div>
                    <div className="text-3xl font-bold text-vendorsoluce-green mb-2">{vendor.riskScore}/100</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {vendor.industry} • {vendor.domain}
                    </div>
                  </Card>
                ))}
              </div>

              <div className="flex justify-end">
                <Button
                  variant="primary"
                  onClick={() => setCurrentStage(2)}
                  className="flex items-center gap-2"
                >
                  Continue to Stage 2
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stage 2: Understand Your Gaps */}
        {currentStage === 2 && (
          <Card className="mb-6">
            <CardContent className="p-8">
              <div className="mb-6 p-4 bg-vendorsoluce-pale-green dark:bg-vendorsoluce-green/10 rounded-lg border border-vendorsoluce-green/30">
                <div className="text-sm font-semibold text-vendorsoluce-green dark:text-vendorsoluce-light-green mb-2 inline-flex items-center gap-2">
                  <Target className="h-4 w-4 shrink-0" aria-hidden />
                  STAGE 2 OUTCOME
                </div>
                <p className="text-base font-medium text-gray-900 dark:text-white">
                  "I know exactly what controls I need from each vendor"
                </p>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-gray-900 dark:text-white">
                Stage 2: Understand Your Gaps
              </h2>
              <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                Based on the risk levels identified in Stage 1, here are the specific requirements for your critical vendors. 
                Each vendor tier has different evidence requirements.
              </p>

              {/* Requirements for Critical Vendors */}
              <div className="space-y-4 mb-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Requirements for Critical Vendors ({criticalCount} vendors)
                </h3>
                {[
                  { name: 'SOC 2 Type II Certification', description: 'Current certification (< 12 months old)', status: 'missing' },
                  { name: 'Cyber Insurance', description: 'Minimum $5M coverage', status: 'missing' },
                  { name: 'Incident Response Plan', description: '24-hour breach notification requirement', status: 'missing' },
                  { name: 'Multi-Factor Authentication', description: 'MFA enforced for all access', status: 'collected' },
                  { name: 'Annual Security Assessment', description: 'Third-party penetration testing', status: 'missing' },
                ].map((req, idx) => (
                  <Card key={idx} className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        req.status === 'collected' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {req.status === 'collected' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" aria-hidden />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">{req.name}</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{req.description}</p>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          req.status === 'collected'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {req.status === 'collected' ? 'Evidence Collected' : 'Missing Evidence'}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStage(1)}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Stage 1
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setCurrentStage(3)}
                  className="flex items-center gap-2"
                >
                  Continue to Stage 3
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stage 3: Close the Gaps */}
        {currentStage === 3 && (
          <Card className="mb-6">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <div className="mb-6 p-4 bg-vendorsoluce-pale-green dark:bg-vendorsoluce-green/10 rounded-lg border border-vendorsoluce-green/30 max-w-2xl mx-auto">
                  <div className="text-sm font-semibold text-vendorsoluce-green dark:text-vendorsoluce-light-green mb-2 inline-flex items-center gap-2">
                    <Target className="h-4 w-4 shrink-0" aria-hidden />
                    STAGE 3 OUTCOME
                  </div>
                  <p className="text-base font-medium text-gray-900 dark:text-white">
                    "I have evidence-based proof of vendor compliance"
                  </p>
                </div>
                <div className="mb-4 flex justify-center">
                  <CheckCircle className="h-16 w-16 text-vendorsoluce-green" aria-hidden />
                </div>
                <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Stage 3: Close the Gaps - Demo Complete!
                </h2>
                <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                  You've experienced the complete 3-stage VendorSoluce journey:<br />
                  <strong>Stage 1:</strong> Discover Your Exposure → <strong>Stage 2:</strong> Understand Your Gaps → <strong>Stage 3:</strong> Close the Gaps
                </p>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="p-6 text-center">
                  <div className="text-3xl font-bold text-vendorsoluce-green mb-2">70%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Faster Onboarding</div>
                </Card>
                <Card className="p-6 text-center">
                  <div className="text-3xl font-bold text-vendorsoluce-green mb-2">95%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</div>
                </Card>
                <Card className="p-6 text-center">
                  <div className="text-3xl font-bold text-vendorsoluce-green mb-2">$180K</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Annual Savings</div>
                </Card>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStage(1)}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Restart Demo
                </Button>
                <Link to="/trial">
                  <Button variant="primary" className="flex items-center gap-2">
                    Try Stage 1 With Your Data
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/vendor-risk-radar">
                  <Button variant="primary" className="flex items-center gap-2">
                    Continue to Full Platform
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline" className="flex items-center gap-2">
                    Schedule Full Demo
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DemoPage;
