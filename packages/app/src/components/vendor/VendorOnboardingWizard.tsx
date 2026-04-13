import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import {
  Building,
  User,
  FileText,
  Shield,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Upload,
  AlertTriangle,
  Info,
  Users,
  FileCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useVendorStore } from '../../stores/vendorStore';
import { loadImportOnboardingHints } from '../../utils/vendorImportIntegration';
import { MR } from 'shared/constants/routes';
import { uploadAssessmentEvidence } from '../../utils/supabaseStorage';
import { logger } from '../../utils/logger';

/** Map free-text industry from profile/vendor onto wizard select values when possible. */
function mapIndustryToOption(raw: string | undefined | null): string {
  if (!raw) return '';
  const s = raw.toLowerCase();
  if (/(tech|software|saas|it\b|cloud)/i.test(s)) return 'technology';
  if (/(health|medical|hipaa)/i.test(s)) return 'healthcare';
  if (/(financ|bank|insurance)/i.test(s)) return 'financial';
  if (/(manufact|industrial)/i.test(s)) return 'manufacturing';
  if (/(gov|public|federal)/i.test(s)) return 'government';
  if (/(defense|aerospace|military)/i.test(s)) return 'defense';
  if (/(energy|utility|utilities)/i.test(s)) return 'energy';
  if (/(retail|e-?commerce|commerce)/i.test(s)) return 'retail';
  return 'other';
}

function mapCompanySizeToOption(raw: string | undefined | null): string {
  if (!raw) return '';
  const s = raw.toLowerCase();
  if (/(1-50|startup|small team)/i.test(s)) return 'startup';
  if (/(51-200|small business)/i.test(s)) return 'small';
  if (/(201-1000|medium)/i.test(s)) return 'medium';
  if (/(1000\+|enterprise|large)/i.test(s)) return 'large';
  if (s.includes('startup')) return 'startup';
  if (s.includes('small')) return 'small';
  if (s.includes('medium')) return 'medium';
  if (s.includes('large') || s.includes('enterprise')) return 'large';
  return '';
}

interface VendorOnboardingData {
  // Company Information
  companyName: string;
  legalName: string;
  website: string;
  industry: string;
  companySize: string;
  foundedYear: string;
  headquarters: string;
  description: string;
  
  // Contact Information
  primaryContact: {
    name: string;
    title: string;
    email: string;
    phone: string;
  };
  securityContact: {
    name: string;
    title: string;
    email: string;
    phone: string;
  };
  billingContact: {
    name: string;
    title: string;
    email: string;
    phone: string;
  };
  
  // Business Information
  businessType: string;
  certifications: string[];
  complianceFrameworks: string[];
  dataProcessingActivities: string[];
  securityMeasures: string[];
  
  // Documents
  documents: {
    businessLicense?: File;
    insuranceCertificate?: File;
    securityPolicy?: File;
    complianceCertificate?: File;
    financialStatement?: File;
  };
  
  // Assessment Preferences
  preferredAssessmentType: string;
  assessmentFrequency: string;
  reportingPreferences: string[];
  communicationPreferences: string[];
}

interface VendorOnboardingWizardProps {
  onComplete?: () => void;
}

const VendorOnboardingWizard: React.FC<VendorOnboardingWizardProps> = ({ onComplete }) => {
  const { user, profile } = useAuth();
  const selectedVendor = useVendorStore((s) => s.selectedVendor);
  const graphImportHints = loadImportOnboardingHints();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<VendorOnboardingData>({
    companyName: '',
    legalName: '',
    website: '',
    industry: '',
    companySize: '',
    foundedYear: '',
    headquarters: '',
    description: '',
    primaryContact: {
      name: '',
      title: '',
      email: '',
      phone: '',
    },
    securityContact: {
      name: '',
      title: '',
      email: '',
      phone: '',
    },
    billingContact: {
      name: '',
      title: '',
      email: '',
      phone: '',
    },
    businessType: 'vendor',
    certifications: [],
    complianceFrameworks: [],
    dataProcessingActivities: [],
    securityMeasures: [],
    documents: {},
    preferredAssessmentType: 'guided-assessment',
    assessmentFrequency: 'annually',
    reportingPreferences: ['Executive Summary', 'Compliance Dashboard'],
    communicationPreferences: ['Email Notifications', 'Dashboard Updates'],
  });

  /** Security / billing default to the same person as primary unless the user expands them. */
  const [mirrorSecurityToPrimary, setMirrorSecurityToPrimary] = useState(true);
  const [mirrorBillingToPrimary, setMirrorBillingToPrimary] = useState(true);
  const [stepError, setStepError] = useState<string | null>(null);

  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** One-time prefill from last successful dependency graph import (localStorage). */
  useEffect(() => {
    const importHints = loadImportOnboardingHints();
    if (!importHints) return;
    setFormData((prev) => {
      const next = { ...prev, primaryContact: { ...prev.primaryContact } };
      const importName = importHints.primaryVendorName?.trim();
      if (importName && !next.companyName.trim()) next.companyName = importName;
      if (!next.legalName.trim() && importName) next.legalName = importName;
      if (!next.description.trim()) {
        next.description = `Dependency graph import (${importHints.vendorCount} vendor row(s), ${importHints.insertedNodes} nodes / ${importHints.insertedEdges} edges). Complete onboarding to align assessments and evidence with this portfolio snapshot.`;
      }
      return next;
    });
  }, []);

  /** Fill empty fields when profile or selected vendor updates—never overwrites user edits. */
  useEffect(() => {
    setFormData((prev) => {
      const next = { ...prev, primaryContact: { ...prev.primaryContact } };
      const companyFromProfile = profile?.company?.trim();
      const vendorName = selectedVendor?.name?.trim();
      const vendorWebsite = selectedVendor?.website?.trim();
      const vendorIndustry = selectedVendor?.industry?.trim();

      if (vendorName && !next.companyName) next.companyName = vendorName;
      else if (companyFromProfile && !next.companyName) next.companyName = companyFromProfile;

      if (!next.legalName.trim() && (vendorName || companyFromProfile)) {
        next.legalName = vendorName || companyFromProfile || '';
      }
      if (vendorWebsite && !next.website.trim()) {
        next.website = vendorWebsite.startsWith('http') ? vendorWebsite : `https://${vendorWebsite}`;
      }

      const ind = vendorIndustry || profile?.industry;
      if (ind && !next.industry) next.industry = mapIndustryToOption(ind) || 'other';

      const cs = profile?.company_size;
      if (cs && !next.companySize) next.companySize = mapCompanySizeToOption(cs) || next.companySize;

      const vendorEmail = selectedVendor?.contact_email?.trim();
      if (vendorEmail && !next.primaryContact.email.trim()) {
        next.primaryContact.email = vendorEmail;
      } else if (user?.email && !next.primaryContact.email.trim()) {
        next.primaryContact.email = user.email;
      }
      if (profile?.full_name && !next.primaryContact.name.trim()) {
        next.primaryContact.name = profile.full_name;
      }
      return next;
    });
  }, [user, profile, selectedVendor]);

  const steps = [
    {
      id: 'company-info',
      title: 'Company Information',
      icon: Building,
      description: 'Basic company details and business information'
    },
    {
      id: 'contacts',
      title: 'Contact Information',
      icon: Users,
      description: 'Primary, security, and billing contacts'
    },
    {
      id: 'business-details',
      title: 'Business Details',
      icon: FileText,
      description: 'Industry, certifications, and compliance information'
    },
    {
      id: 'documents',
      title: 'Document Upload',
      icon: Upload,
      description: 'Optional uploads — add when you have them'
    },
    {
      id: 'preferences',
      title: 'Assessment Preferences',
      icon: Shield,
      description: 'Configure your assessment and communication preferences'
    },
    {
      id: 'review',
      title: 'Review & Submit',
      icon: CheckCircle,
      description: 'Review all information before submission'
    }
  ];

  const handleInputChange = (field: string, value: string | number) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof VendorOnboardingData] as Record<string, unknown>),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleArrayChange = (field: string, value: string, checked: boolean) => {
    setFormData(prev => {
      const currentArray = prev[field as keyof VendorOnboardingData] as string[];
      if (checked) {
        return {
          ...prev,
          [field]: [...currentArray, value]
        };
      } else {
        return {
          ...prev,
          [field]: currentArray.filter(item => item !== value)
        };
      }
    });
  };

  const handleFileUpload = async (field: string, files: FileList) => {
    const file = files[0];
    if (!file) return;

    setUploading(prev => ({ ...prev, [field]: true }));
    setUploadErrors(prev => ({ ...prev, [field]: '' }));

    try {
      // Validate file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB');
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png'
      ];

      if (!allowedTypes.includes(file.type)) {
        throw new Error('Please upload PDF, DOC, DOCX, JPG, or PNG files only');
      }

      // Upload to Supabase Storage
      await uploadAssessmentEvidence(file, 'vendor-onboarding', field);
      
      // Update form data with file
      setFormData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [field]: file
        }
      }));

    } catch (error) {
      logger.error('File upload error:', error);
      setUploadErrors(prev => ({
        ...prev,
        [field]: error instanceof Error ? error.message : 'Upload failed'
      }));
    } finally {
      setUploading(prev => ({ ...prev, [field]: false }));
    }
  };

  const validateCurrentStep = useCallback((): boolean => {
    setStepError(null);
    if (currentStep === 0) {
      if (!formData.companyName.trim()) {
        setStepError('Add a company name to continue (other fields are optional and can be refined later).');
        return false;
      }
      return true;
    }
    if (currentStep === 1) {
      const email = formData.primaryContact.email.trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setStepError('A valid primary contact email is required for notifications.');
        return false;
      }
      return true;
    }
    return true;
  }, [currentStep, formData.companyName, formData.primaryContact.email]);

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    if (currentStep === 1) {
      setFormData((prev) => ({
        ...prev,
        securityContact: mirrorSecurityToPrimary ? { ...prev.primaryContact } : prev.securityContact,
        billingContact: mirrorBillingToPrimary ? { ...prev.primaryContact } : prev.billingContact,
      }));
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handlePrevious = () => {
    setStepError(null);
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const legalName = formData.legalName.trim() || formData.companyName.trim();
      const securityContact = mirrorSecurityToPrimary ? { ...formData.primaryContact } : formData.securityContact;
      const billingContact = mirrorBillingToPrimary ? { ...formData.primaryContact } : formData.billingContact;
      const payload = { ...formData, legalName, securityContact, billingContact };
      logger.log('Submitting vendor onboarding data:', payload);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success message or redirect
      alert('Vendor onboarding submitted successfully!');
      
      // Call onComplete callback if provided
      if (onComplete) {
        onComplete();
      }
      
    } catch (error) {
      logger.error('Submission error:', error);
      alert('Failed to submit vendor onboarding. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Company Information
        return (
          <div className="space-y-6">
            <div className="rounded-lg border border-emerald-200/80 bg-emerald-50/80 p-4 text-sm text-emerald-950 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-100">
              <div className="flex gap-2">
                <Sparkles className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
                <p>
                  We pull what we can from your <strong>profile</strong>, <strong>selected vendor</strong>, and{' '}
                  <strong>last dependency graph import</strong> (vendors.csv) when present. Only <strong>company name</strong> is
                  required—you can refine the rest anytime.
                </p>
              </div>
            </div>
            {graphImportHints ? (
              <div className="rounded-lg border border-blue-200/80 bg-blue-50/80 p-3 text-xs text-blue-950 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-100">
                Graph import on {new Date(graphImportHints.importedAt).toLocaleString()}:{' '}
                <strong>{graphImportHints.vendorCount}</strong> vendor row(s), <strong>{graphImportHints.insertedNodes}</strong> nodes /{' '}
                <strong>{graphImportHints.insertedEdges}</strong> edges.
                {graphImportHints.primaryVendorName ? (
                  <>
                    {' '}
                    Primary vendor row: <strong>{graphImportHints.primaryVendorName}</strong>.
                  </>
                ) : null}
              </div>
            ) : null}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  onBlur={(e) => {
                    const name = e.target.value.trim();
                    if (!name) return;
                    setFormData((prev) => (!prev.legalName.trim() ? { ...prev, legalName: name } : prev));
                  }}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Enter company name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Legal name <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.legalName}
                  onChange={(e) => handleInputChange('legalName', e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Defaults to company name if left blank"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="https://example.com"
                />
              </div>
              
              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Industry <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <select
                  id="industry"
                  value={formData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">Select industry</option>
                  <option value="technology">Technology</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="financial">Financial Services</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="government">Government/Public Sector</option>
                  <option value="defense">Defense/Aerospace</option>
                  <option value="energy">Energy/Utilities</option>
                  <option value="retail">Retail/E-commerce</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="companySize" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Company size <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <select
                  id="companySize"
                  value={formData.companySize}
                  onChange={(e) => handleInputChange('companySize', e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">Select size</option>
                  <option value="startup">Startup (1-50 employees)</option>
                  <option value="small">Small Business (51-200 employees)</option>
                  <option value="medium">Medium Business (201-1000 employees)</option>
                  <option value="large">Large Enterprise (1000+ employees)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Founded Year
                </label>
                <input
                  type="number"
                  value={formData.foundedYear}
                  onChange={(e) => handleInputChange('foundedYear', e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="2020"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Headquarters <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={formData.headquarters}
                onChange={(e) => handleInputChange('headquarters', e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="City, State, Country"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                rows={4}
                placeholder="Brief description of your company and services..."
              />
            </div>
          </div>
        );

      case 1: // Contact Information
        return (
          <div className="space-y-8">
            <div className="rounded-lg border border-emerald-200/80 bg-emerald-50/80 p-4 text-sm text-emerald-950 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-100">
              <div className="flex gap-2">
                <Sparkles className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
                <p>
                  Only the <strong>primary email</strong> is required. We pre-fill from your workspace profile and selected vendor record when
                  available—you can edit everything later.
                </p>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-medium text-blue-900 dark:text-blue-300 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Primary contact
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="primaryContact-name" className="block text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                    Full name <span className="text-gray-500 font-normal">(optional)</span>
                  </label>
                  <input
                    id="primaryContact-name"
                    type="text"
                    value={formData.primaryContact.name}
                    onChange={(e) => handleInputChange('primaryContact.name', e.target.value)}
                    className="w-full border border-blue-300 dark:border-blue-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label htmlFor="primaryContact-title" className="block text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                    Title <span className="text-gray-500 font-normal">(optional)</span>
                  </label>
                  <input
                    id="primaryContact-title"
                    type="text"
                    value={formData.primaryContact.title}
                    onChange={(e) => handleInputChange('primaryContact.title', e.target.value)}
                    className="w-full border border-blue-300 dark:border-blue-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Enter job title"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="primaryContact-email" className="block text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="primaryContact-email"
                    type="email"
                    value={formData.primaryContact.email}
                    onChange={(e) => handleInputChange('primaryContact.email', e.target.value)}
                    className="w-full border border-blue-300 dark:border-blue-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Enter email address"
                    autoComplete="email"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="primaryContact-phone" className="block text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                    Phone <span className="text-gray-500 font-normal">(optional)</span>
                  </label>
                  <input
                    id="primaryContact-phone"
                    type="tel"
                    value={formData.primaryContact.phone}
                    onChange={(e) => handleInputChange('primaryContact.phone', e.target.value)}
                    className="w-full border border-blue-300 dark:border-blue-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Enter phone number"
                    autoComplete="tel"
                  />
                </div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-medium text-green-900 dark:text-green-300 flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Security contact
                </h3>
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-green-900 dark:text-green-200">
                  <input
                    type="checkbox"
                    className="rounded border-green-400"
                    checked={mirrorSecurityToPrimary}
                    onChange={(e) => setMirrorSecurityToPrimary(e.target.checked)}
                  />
                  Same as primary contact
                </label>
              </div>
              {!mirrorSecurityToPrimary ? (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="securityContact-name" className="block text-sm font-medium text-green-800 dark:text-green-300 mb-2">
                      Full name
                    </label>
                    <input
                      id="securityContact-name"
                      type="text"
                      value={formData.securityContact.name}
                      onChange={(e) => handleInputChange('securityContact.name', e.target.value)}
                      className="w-full border border-green-300 dark:border-green-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="securityContact-title" className="block text-sm font-medium text-green-800 dark:text-green-300 mb-2">
                      Title
                    </label>
                    <input
                      id="securityContact-title"
                      type="text"
                      value={formData.securityContact.title}
                      onChange={(e) => handleInputChange('securityContact.title', e.target.value)}
                      className="w-full border border-green-300 dark:border-green-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="securityContact-email" className="block text-sm font-medium text-green-800 dark:text-green-300 mb-2">
                      Email
                    </label>
                    <input
                      id="securityContact-email"
                      type="email"
                      value={formData.securityContact.email}
                      onChange={(e) => handleInputChange('securityContact.email', e.target.value)}
                      className="w-full border border-green-300 dark:border-green-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="securityContact-phone" className="block text-sm font-medium text-green-800 dark:text-green-300 mb-2">
                      Phone
                    </label>
                    <input
                      id="securityContact-phone"
                      type="tel"
                      value={formData.securityContact.phone}
                      onChange={(e) => handleInputChange('securityContact.phone', e.target.value)}
                      className="w-full border border-green-300 dark:border-green-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-sm text-green-800/90 dark:text-green-300/90">
                  Uses the primary contact for security questions and evidence requests.
                </p>
              )}
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-medium text-purple-900 dark:text-purple-300 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Billing contact
                </h3>
                <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-purple-900 dark:text-purple-200">
                  <input
                    type="checkbox"
                    className="rounded border-purple-400"
                    checked={mirrorBillingToPrimary}
                    onChange={(e) => setMirrorBillingToPrimary(e.target.checked)}
                  />
                  Same as primary contact
                </label>
              </div>
              {!mirrorBillingToPrimary ? (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="billingContact-name" className="block text-sm font-medium text-purple-800 dark:text-purple-300 mb-2">
                      Full name
                    </label>
                    <input
                      id="billingContact-name"
                      type="text"
                      value={formData.billingContact.name}
                      onChange={(e) => handleInputChange('billingContact.name', e.target.value)}
                      className="w-full border border-purple-300 dark:border-purple-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="billingContact-title" className="block text-sm font-medium text-purple-800 dark:text-purple-300 mb-2">
                      Title
                    </label>
                    <input
                      id="billingContact-title"
                      type="text"
                      value={formData.billingContact.title}
                      onChange={(e) => handleInputChange('billingContact.title', e.target.value)}
                      className="w-full border border-purple-300 dark:border-purple-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="billingContact-email" className="block text-sm font-medium text-purple-800 dark:text-purple-300 mb-2">
                      Email
                    </label>
                    <input
                      id="billingContact-email"
                      type="email"
                      value={formData.billingContact.email}
                      onChange={(e) => handleInputChange('billingContact.email', e.target.value)}
                      className="w-full border border-purple-300 dark:border-purple-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="billingContact-phone" className="block text-sm font-medium text-purple-800 dark:text-purple-300 mb-2">
                      Phone
                    </label>
                    <input
                      id="billingContact-phone"
                      type="tel"
                      value={formData.billingContact.phone}
                      onChange={(e) => handleInputChange('billingContact.phone', e.target.value)}
                      className="w-full border border-purple-300 dark:border-purple-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-sm text-purple-800/90 dark:text-purple-300/90">
                  Uses the primary contact for billing and subscription notices.
                </p>
              )}
            </div>
          </div>
        );

      case 2: // Business Details
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Business type <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <select
                id="businessType"
                value={formData.businessType}
                onChange={(e) => handleInputChange('businessType', e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">Select business type</option>
                <option value="vendor">Vendor/Supplier</option>
                <option value="service-provider">Service Provider</option>
                <option value="contractor">Contractor</option>
                <option value="partner">Business Partner</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Certifications & Standards
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  'ISO 27001',
                  'SOC 2 Type II',
                  'PCI DSS',
                  'HIPAA',
                  'GDPR',
                  'CMMC',
                  'NIST 800-171',
                  'FedRAMP',
                  'FISMA',
                  'Other'
                ].map((cert) => (
                  <label key={cert} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.certifications.includes(cert)}
                      onChange={(e) => handleArrayChange('certifications', cert, e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{cert}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Compliance Frameworks
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  'NIST SP 800-161',
                  'NIST Cybersecurity Framework',
                  'CIS Controls',
                  'ISO 27001',
                  'COBIT',
                  'ITIL',
                  'Other'
                ].map((framework) => (
                  <label key={framework} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.complianceFrameworks.includes(framework)}
                      onChange={(e) => handleArrayChange('complianceFrameworks', framework, e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{framework}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Data Processing Activities
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  'Personal Data Processing',
                  'Financial Data Processing',
                  'Health Information Processing',
                  'Government Data Processing',
                  'Intellectual Property Handling',
                  'Customer Data Management',
                  'Employee Data Processing',
                  'Other Sensitive Data'
                ].map((activity) => (
                  <label key={activity} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.dataProcessingActivities.includes(activity)}
                      onChange={(e) => handleArrayChange('dataProcessingActivities', activity, e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{activity}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Security Measures
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  'Multi-Factor Authentication',
                  'Encryption at Rest',
                  'Encryption in Transit',
                  'Regular Security Audits',
                  'Incident Response Plan',
                  'Data Backup & Recovery',
                  'Access Controls',
                  'Network Security',
                  'Employee Security Training',
                  'Vulnerability Management'
                ].map((measure) => (
                  <label key={measure} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.securityMeasures.includes(measure)}
                      onChange={(e) => handleArrayChange('securityMeasures', measure, e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{measure}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 3: // Document Upload
        return (
          <div className="space-y-6">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-2 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                    Documents (optional)
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                    Upload when available—nothing here blocks your onboarding. PDF, DOC, DOCX, JPG, or PNG under 10MB.
                  </p>
                </div>
              </div>
            </div>

            {[
              {
                key: 'businessLicense',
                title: 'Business License',
                description: 'Valid business license or registration certificate',
                required: false,
              },
              {
                key: 'insuranceCertificate',
                title: 'Insurance Certificate',
                description: 'Professional liability or general liability insurance',
                required: false,
              },
              {
                key: 'securityPolicy',
                title: 'Security Policy',
                description: 'Information security policy document',
                required: false
              },
              {
                key: 'complianceCertificate',
                title: 'Compliance Certificate',
                description: 'Relevant compliance certifications (ISO, SOC, etc.)',
                required: false
              },
              {
                key: 'financialStatement',
                title: 'Financial Statement',
                description: 'Most recent financial statement or annual report',
                required: false
              }
            ].map((doc) => (
              <div key={doc.key} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {doc.title}
                      {doc.required && <span className="text-red-500 ml-1">*</span>}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{doc.description}</p>
                  </div>
                  {formData.documents[doc.key as keyof typeof formData.documents] && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </div>

                {uploadErrors[doc.key] && (
                  <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                    <div className="flex items-start">
                      <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-red-700 dark:text-red-400 text-sm">{uploadErrors[doc.key]}</span>
                    </div>
                  </div>
                )}

                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                  <input
                    type="file"
                    id={`file-${doc.key}`}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => e.target.files && handleFileUpload(doc.key, e.target.files)}
                    className="hidden"
                    disabled={uploading[doc.key]}
                  />
                  <label htmlFor={`file-${doc.key}`} className="cursor-pointer">
                    <div className="text-center">
                      {uploading[doc.key] ? (
                        <div className="flex flex-col items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vendorsoluce-navy mx-auto mb-2"></div>
                          <p className="text-sm text-vendorsoluce-navy font-medium">Uploading...</p>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            PDF, DOC, DOCX, JPG, PNG up to 10MB
                          </p>
                        </>
                      )}
                    </div>
                  </label>
                </div>

                {formData.documents[doc.key as keyof typeof formData.documents] && (
                  <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                    <div className="flex items-center">
                      <FileCheck className="h-4 w-4 text-green-600 dark:text-green-400 mr-2" />
                      <span className="text-sm text-green-800 dark:text-green-300">
                        {formData.documents[doc.key as keyof typeof formData.documents]?.name}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        );

      case 4: // Assessment Preferences
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="preferredAssessmentType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Preferred assessment type <span className="text-gray-400 font-normal">(defaults work)</span>
              </label>
              <select
                id="preferredAssessmentType"
                value={formData.preferredAssessmentType}
                onChange={(e) => handleInputChange('preferredAssessmentType', e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">Select assessment type</option>
                <option value="self-assessment">Self-Assessment</option>
                <option value="guided-assessment">Guided Assessment</option>
                <option value="third-party-audit">Third-Party Audit</option>
                <option value="hybrid">Hybrid Approach</option>
              </select>
            </div>

            <div>
              <label htmlFor="assessmentFrequency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Assessment frequency <span className="text-gray-400 font-normal">(defaults work)</span>
              </label>
              <select
                id="assessmentFrequency"
                value={formData.assessmentFrequency}
                onChange={(e) => handleInputChange('assessmentFrequency', e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">Select frequency</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="semi-annually">Semi-Annually</option>
                <option value="annually">Annually</option>
                <option value="as-needed">As Needed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Reporting Preferences
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  'Executive Summary',
                  'Detailed Technical Report',
                  'Compliance Dashboard',
                  'Risk Score Report',
                  'Remediation Recommendations',
                  'Trend Analysis',
                  'Custom Reports'
                ].map((pref) => (
                  <label key={pref} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.reportingPreferences.includes(pref)}
                      onChange={(e) => handleArrayChange('reportingPreferences', pref, e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{pref}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Communication Preferences
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  'Email Notifications',
                  'SMS Alerts',
                  'Dashboard Updates',
                  'Weekly Reports',
                  'Monthly Reviews',
                  'Quarterly Meetings',
                  'Annual Assessments'
                ].map((pref) => (
                  <label key={pref} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.communicationPreferences.includes(pref)}
                      onChange={(e) => handleArrayChange('communicationPreferences', pref, e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{pref}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 5: // Review & Submit
        return (
          <div className="space-y-6">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-green-800 dark:text-green-300">
                    Ready to Submit
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                    Please review all information before submitting your vendor onboarding application.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Company Information</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Company:</span> {formData.companyName}</div>
                  <div><span className="font-medium">Industry:</span> {formData.industry}</div>
                  <div><span className="font-medium">Size:</span> {formData.companySize}</div>
                  <div><span className="font-medium">Headquarters:</span> {formData.headquarters}</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Primary Contact</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Name:</span> {formData.primaryContact.name}</div>
                  <div><span className="font-medium">Title:</span> {formData.primaryContact.title}</div>
                  <div><span className="font-medium">Email:</span> {formData.primaryContact.email}</div>
                  <div><span className="font-medium">Phone:</span> {formData.primaryContact.phone}</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Assessment Preferences</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Type:</span> {formData.preferredAssessmentType}</div>
                  <div><span className="font-medium">Frequency:</span> {formData.assessmentFrequency}</div>
                  <div><span className="font-medium">Certifications:</span> {formData.certifications.length} selected</div>
                  <div><span className="font-medium">Documents:</span> {Object.values(formData.documents).filter(Boolean).length} uploaded</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Security Measures</h3>
                <div className="text-sm">
                  <div><span className="font-medium">Measures:</span> {formData.securityMeasures.length} selected</div>
                  <div><span className="font-medium">Frameworks:</span> {formData.complianceFrameworks.length} selected</div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-950 shadow-sm dark:border-emerald-800/70 dark:bg-emerald-950/40 dark:text-emerald-50">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
            <span className="inline-flex items-center gap-1.5 font-semibold uppercase tracking-wide text-emerald-900 dark:text-emerald-100">
              <Zap className="h-4 w-4 shrink-0" aria-hidden />
              Execution
            </span>
            <span className="hidden text-emerald-700/80 sm:inline dark:text-emerald-300/80" aria-hidden>
              |
            </span>
            <span className="text-emerald-950/95 dark:text-emerald-100/95">
              Vendor intake wizard — SIPOC-wide activity completion stays in the{' '}
              <Link
                to={MR.VENDOR_ACTIVITY_CATALOG}
                className="font-semibold text-emerald-800 underline decoration-emerald-600/60 underline-offset-2 hover:text-emerald-900 dark:text-emerald-200 dark:hover:text-white"
              >
                Activity catalog
              </Link>{' '}
              and program workflows after intake.
            </span>
          </div>
        </div>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Vendor Onboarding
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Fewer required fields—we pre-fill from your workspace when possible. You can add detail later.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isCompleted 
                      ? 'bg-vendorsoluce-green border-vendorsoluce-green text-white'
                      : isActive
                      ? 'border-vendorsoluce-navy bg-vendorsoluce-navy text-white'
                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-2 ${
                      isCompleted ? 'bg-vendorsoluce-green' : 'bg-gray-300 dark:bg-gray-600'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 text-center">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              {steps[currentStep].title}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {steps[currentStep].description}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <Card>
          <CardContent className="p-8">
            {renderStepContent()}
            {stepError ? (
              <div
                role="alert"
                className="mt-6 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
              >
                {stepError}
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            Step {currentStep + 1} of {steps.length}
          </div>

          {currentStep < steps.length - 1 ? (
            <Button
              variant="primary"
              onClick={handleNext}
              className="flex items-center"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Submit Application
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorOnboardingWizard;