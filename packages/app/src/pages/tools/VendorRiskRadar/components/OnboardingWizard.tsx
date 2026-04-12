import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { ENTERPRISE_VENDOR_CATALOG } from '../../../../utils/vendorCatalog';
import type { VendorBase } from '../../../../types/vendorRadar';

interface OnboardingWizardProps {
  onClose: () => void;
  onComplete: (vendors: VendorBase[]) => void;
}

const INDUSTRIES = ['Healthcare', 'Financial Services', 'Retail', 'Technology', 'Manufacturing', 'Education'];
const SSO_PROVIDERS = ['Okta', 'Microsoft Entra ID (Azure AD)', 'Google Workspace', 'Ping Identity', 'OneLogin'];

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onClose, onComplete }) => {
  const [step, setStep] = useState(0);
  const [industry, setIndustry] = useState('');
  const [sso, setSso] = useState('');
  const [selectedVendors, setSelectedVendors] = useState<Set<string>>(new Set());
  const [dataTypes, setDataTypes] = useState<Set<string>>(new Set());
  const [criticality, setCriticality] = useState<'critical' | 'strategic' | 'tactical' | 'commodity'>('tactical');

  const steps = ['Industry', 'SSO Provider', 'Vendors', 'Data Types', 'Review'];

  const getIndustryVendors = () => {
    // Return a subset of vendors based on industry
    // For now, return first 20 vendors as example
    return ENTERPRISE_VENDOR_CATALOG.slice(0, 20);
  };

  const handleToggleVendor = (vendorName: string) => {
    const newSet = new Set(selectedVendors);
    if (newSet.has(vendorName)) {
      newSet.delete(vendorName);
    } else {
      newSet.add(vendorName);
    }
    setSelectedVendors(newSet);
  };

  const handleApply = () => {
    const vendors: VendorBase[] = Array.from(selectedVendors).map(name => {
      const catalogVendor = ENTERPRISE_VENDOR_CATALOG.find(v => v.name === name);
      return catalogVendor || {
        name,
        category: criticality,
        dataTypes: Array.from(dataTypes),
        sector: industry || 'SaaS',
        location: 'United States'
      };
    });

    onComplete(vendors);
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Select Your Industry</h3>
            <div className="grid grid-cols-2 gap-3">
              {INDUSTRIES.map(ind => (
                <button
                  key={ind}
                  onClick={() => setIndustry(ind)}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    industry === ind
                      ? 'border-vendorsoluce-green bg-vendorsoluce-green/10'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                >
                  {ind}
                </button>
              ))}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Select Your SSO Provider</h3>
            <div className="space-y-2">
              {SSO_PROVIDERS.map(provider => (
                <button
                  key={provider}
                  onClick={() => setSso(provider)}
                  className={`w-full p-3 border rounded-lg text-left transition-colors ${
                    sso === provider
                      ? 'border-vendorsoluce-green bg-vendorsoluce-green/10'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                >
                  {provider}
                </button>
              ))}
            </div>
          </div>
        );

      case 2: {
        const availableVendors = getIndustryVendors();
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Select Vendors ({selectedVendors.size} selected)</h3>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {availableVendors.map((vendor, index) => (
                <label
                  key={index}
                  className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <input
                    type="checkbox"
                    checked={selectedVendors.has(vendor.name)}
                    onChange={() => handleToggleVendor(vendor.name)}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="font-medium">{vendor.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{vendor.sector}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        );
      }

      case 3: {
        const dataTypeOptions = ['PII', 'PHI', 'Financial', 'IP', 'Confidential', 'Public'];
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Data Types Handled</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {dataTypeOptions.map(dt => (
                <label
                  key={dt}
                  className="flex items-center px-3 py-2 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <input
                    type="checkbox"
                    checked={dataTypes.has(dt)}
                    onChange={(e) => {
                      const newSet = new Set(dataTypes);
                      if (e.target.checked) {
                        newSet.add(dt);
                      } else {
                        newSet.delete(dt);
                      }
                      setDataTypes(newSet);
                    }}
                    className="mr-2"
                  />
                  {dt}
                </label>
              ))}
            </div>
            <div>
              <label htmlFor="onboarding-criticality" className="block text-sm font-medium mb-2">Default Criticality</label>
              <select
                id="onboarding-criticality"
                value={criticality}
                onChange={(e) => setCriticality((e.target.value as 'critical' | 'strategic' | 'tactical' | 'commodity'))}
                className="w-full p-2 border rounded-lg"
                aria-label="Default criticality"
              >
                <option value="critical">Critical</option>
                <option value="strategic">Strategic</option>
                <option value="tactical">Tactical</option>
                <option value="commodity">Commodity</option>
              </select>
            </div>
          </div>
        );
      }

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Review Your Selections</h3>
            <div className="space-y-3">
              <div>
                <strong>Industry:</strong> {industry || 'Not selected'}
              </div>
              <div>
                <strong>SSO Provider:</strong> {sso || 'Not selected'}
              </div>
              <div>
                <strong>Vendors Selected:</strong> {selectedVendors.size}
              </div>
              <div>
                <strong>Data Types:</strong> {Array.from(dataTypes).join(', ') || 'None'}
              </div>
              <div>
                <strong>Default Criticality:</strong> {criticality}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Onboarding Wizard</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Build a vendor list by selecting your industry and tech stack
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {steps.map((s, i) => (
              <React.Fragment key={i}>
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                      i === step
                        ? 'bg-vendorsoluce-green text-white'
                        : i < step
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span className="ml-2 text-sm font-medium hidden sm:inline">{s}</span>
                </div>
                {i < steps.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {renderStep()}
        </div>

        <div className="flex justify-between items-center p-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div className="flex gap-2">
            {step < steps.length - 1 ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setStep(Math.min(steps.length - 1, step + 1))}
                >
                  Skip
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setStep(Math.min(steps.length - 1, step + 1))}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                onClick={handleApply}
                disabled={selectedVendors.size === 0}
              >
                Generate Vendor List
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;
