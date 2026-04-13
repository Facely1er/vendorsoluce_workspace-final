import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import WorkspacePageShell from '../../components/vendorsoluce-intelligence/WorkspacePageShell';
import WorkspacePageBody from '../../components/workspace/WorkspacePageBody';
import PanelCard from '../../components/vendorsoluce-intelligence/PanelCard';
import { Badge } from '../../components/ui/Badge';
import { 
  Shield, 
  Users, 
  Plus,
  FileCheck,
  Clock,
  AlertTriangle,
  CheckCircle,
  Send,
  Eye,
  Search,
  Download,
  BarChart3,
  Crown,
  Copy,
  ExternalLink,
  Check,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useVendors } from '../../hooks/useVendors';
import { useVendorAssessments } from '../../hooks/useVendorAssessments';
import { useVendorRequirements } from '../../hooks/useVendorRequirements';
import CreateAssessmentModal from '../../components/vendor-assessments/CreateAssessmentModal';
import AssessmentProgressTracker from '../../components/vendor-assessments/AssessmentProgressTracker';
import JourneyProgress from '../../components/journey/JourneyProgress';
import { logger } from '../../utils/logger';
import { 
  createAssessmentWithPortal, 
  sendExistingAssessmentToPortal,
  getAssessmentPortalLink,
  copyPortalLinkToClipboard 
} from '../../services/assessmentService';
import { useAuth } from '../../context/AuthContext';
import { useAppStore } from '../../stores/appStore';
import type { ControlRequirement } from '../../types/requirements';

// Component to handle progress bar fill without inline styles
const ProgressBarFill: React.FC<{ progress: number }> = ({ progress }) => {
  const fillRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (fillRef.current) {
      fillRef.current.style.setProperty('--progress-width', `${progress}%`);
    }
  }, [progress]);

  return (
    <div 
      ref={fillRef}
      className="bg-vendorsoluce-green h-2 rounded-full progress-width" 
    />
  );
};

const VendorSecurityAssessments: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const addNotification = useAppStore((state) => state.addNotification);
  const { vendors, loading: vendorsLoading } = useVendors();
  const { 
    assessments, 
    frameworks, 
    loading: assessmentsLoading, 
    error: assessmentsError,
    createAssessment: _createAssessment,
    sendAssessment: _sendAssessment,
    deleteAssessment,
    getAssessmentProgress,
    refetch,
  } = useVendorAssessments();
  const { requirements: vendorRequirements, loading: _requirementsLoading } = useVendorRequirements();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      case 'in_progress': return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
      case 'sent': return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20';
      case 'pending': return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
      case 'reviewed': return 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'sent': return <Send className="h-4 w-4" />;
      case 'pending': return <FileCheck className="h-4 w-4" />;
      case 'reviewed': return <Eye className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredAssessments = assessments.filter(assessment => {
    const matchesSearch = assessment.vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assessment.framework.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || assessment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateSuccess = async (assessmentData: { 
    vendorId: string; 
    frameworkId: string; 
    dueDate: string; 
    instructions?: string;
    contactEmail?: string;
    sendImmediately?: boolean;
    stage2Controls?: ControlRequirement[];
  }) => {
    try {
      if (!user) {
        // Offline mode: create a local assessment record (no portal send).
        await _createAssessment({
          vendor_id: assessmentData.vendorId,
          framework_id: assessmentData.frameworkId,
          due_date: assessmentData.dueDate,
          instructions: assessmentData.instructions ?? null,
          contact_email: assessmentData.contactEmail ?? null,
          assessment_name: null,
          status: 'pending',
        });
        await refetch();
        setShowCreateModal(false);
        addNotification({
          title: 'Assessment Created (Offline)',
          message: 'Assessment saved in this browser. Sign in to send via VendorSoluce Portal.',
          type: 'success',
          duration: 5000,
        });
        return;
      }

      // Use the new assessment service for portal integration
      const result = await createAssessmentWithPortal(
        {
          vendorId: assessmentData.vendorId,
          frameworkId: assessmentData.frameworkId,
          dueDate: assessmentData.dueDate,
          instructions: assessmentData.instructions,
          contactEmail: assessmentData.contactEmail,
          sendImmediately: assessmentData.sendImmediately || false,
          stage2Controls: assessmentData.stage2Controls,
        },
        user.id,
        user.user_metadata?.organization_name || 'Your Organization'
      );

      // Refresh assessments list
      await refetch();

      setShowCreateModal(false);

      if (assessmentData.sendImmediately) {
        addNotification({
          title: 'Assessment Sent',
          message: `Assessment sent to vendor portal. Portal link: ${result.portalLink}`,
          type: 'success',
          duration: 5000,
        });
      } else {
        addNotification({
          title: 'Assessment Created',
          message: `Assessment created. Portal link: ${result.portalLink}`,
          type: 'success',
          duration: 5000,
        });
      }
    } catch (error) {
      logger.error('Failed to create assessment:', error);
      addNotification({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to create assessment',
        type: 'error',
      });
    }
  };

  const handleSendAssessment = async (assessmentId: string) => {
    try {
      if (!user) {
        // Offline mode: mark as sent locally without portal integration.
        await _sendAssessment(assessmentId);
        await refetch();
        addNotification({
          title: 'Marked as sent (Offline)',
          message: 'This updates local status only. Sign in to send via VendorSoluce Portal.',
          type: 'success',
          duration: 5000,
        });
        return;
      }

      const result = await sendExistingAssessmentToPortal(
        assessmentId,
        user.id,
        user.user_metadata?.organization_name || 'Your Organization'
      );

      // Refresh assessments list
      await refetch();

      addNotification({
        title: 'Assessment Sent',
        message: `Assessment sent to vendor portal. Portal link: ${result.portalLink}`,
        type: 'success',
        duration: 5000,
      });
    } catch (error) {
      logger.error('Failed to send assessment:', error);
      addNotification({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to send assessment',
        type: 'error',
      });
    }
  };

  const handleCopyPortalLink = async (assessmentId: string) => {
    try {
      const portalLink = getAssessmentPortalLink(assessmentId);
      const copied = await copyPortalLinkToClipboard(portalLink);
      
      if (copied) {
        addNotification({
          title: 'Link Copied',
          message: 'Portal link copied to clipboard',
          type: 'success',
        });
      } else {
        addNotification({
          title: 'Error',
          message: 'Failed to copy link. Please copy manually.',
          type: 'error',
        });
      }
    } catch (error) {
      logger.error('Failed to copy portal link:', error);
    }
  };

  const handleDeleteAssessment = async (assessmentId: string) => {
    if (window.confirm('Are you sure you want to delete this assessment?')) {
      try {
        await deleteAssessment(assessmentId);
      } catch (error) {
        logger.error('Failed to delete assessment:', error);
      }
    }
  };

  const loading = vendorsLoading || assessmentsLoading;

  if (loading) {
    return (
      <WorkspacePageShell title="Security Assessments">
        <div className="flex h-64 items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-vendorsoluce-green" />
        </div>
      </WorkspacePageShell>
    );
  }

  if (assessmentsError) {
    return (
      <WorkspacePageShell title="Security Assessments">
        <div className="text-center">
          <p className="mb-4 text-red-600 dark:text-red-400">Error loading assessments: {assessmentsError}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
        </div>
      </WorkspacePageShell>
    );
  }

  // Get requirements for a specific vendor
  const getRequirementsForVendor = (vendorId: string) => {
    return vendorRequirements.find(req => req.vendorId === vendorId);
  };

  // Check if vendor has requirements from Stage 2
  const vendorHasRequirements = (vendorId: string) => {
    return vendorRequirements.some(req => req.vendorId === vendorId);
  };

  return (
    <WorkspacePageShell title={t('vendorAssessments.title')} description="Stage 3 of 3 — Collect evidence, orchestrate portal-based questionnaires, and turn requirements into reviewable proof of vendor compliance." actions={[{ label: t('vendorAssessments.buttons.newAssessment'), onClick: () => setShowCreateModal(true), variant: 'primary' }]} stats={[{ label: 'Assessments', value: assessments.length, hint: 'Tracked across portal and workspace' }, { label: 'Vendors', value: vendors.length, hint: 'Available for evidence collection' }, { label: 'Requirements ready', value: vendorRequirements.length, hint: 'Imported from stage 2' }, { label: 'Frameworks', value: frameworks.length, hint: 'Templates available for launch' }]}><WorkspacePageBody>
      {/* Journey Progress */}
      <JourneyProgress 
        currentStage={3} 
        stage1Complete={vendors.length > 0}
        stage2Complete={vendorRequirements.length > 0}
        showNavigation={true}
      />
      
      <PanelCard title="Stage objective" description="This stage operationalizes evidence collection and moves the journey from defined requirements to proof."><div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/70 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/30">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-vendorsoluce-green dark:text-vendorsoluce-light-green uppercase tracking-wide">
            Stage 3 of 3
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
          <span className="text-xs font-semibold text-vendorsoluce-green dark:text-vendorsoluce-light-green">
            Close the Gaps
          </span>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Outcome: "I have evidence-based proof of vendor compliance"
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Collect evidence from vendors based on requirements defined in Stage 2. Get proof of compliance without drowning in email.
        </p>
        {vendorRequirements.length > 0 && (
          <div className="mt-3 pt-3 border-t border-vendorsoluce-green/30">
            <p className="text-xs text-vendorsoluce-green dark:text-vendorsoluce-light-green inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span>{vendorRequirements.length} vendor(s) have requirements from Stage 2 ready for evidence collection</span>
            </p>
          </div>
        )}
      </div></PanelCard>
      
      {/* Orchestration strip (title/description live in WorkspacePageShell above) */}
      <PanelCard title="Assessment orchestration" description="Keep premium assessment creation, portal routing, and evidence status in the same review frame."><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Crown className="h-6 w-6 text-yellow-500" aria-hidden />
            <span className="rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-2 py-1 text-xs font-medium text-white">
              {t('vendorAssessments.premiumFeature')}
            </span>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
              VendorSoluce Portal
            </Badge>
          </div>
          <p className="max-w-3xl text-sm italic text-gray-500 dark:text-gray-400">
            Premium assessments run in the <strong className="font-medium text-gray-700 dark:text-gray-300">VendorSoluce Portal</strong>
            —vendor-facing assurance, due diligence, and questionnaires with evidence and sign-off in one place.
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={() => setShowCreateModal(true)}
          className="flex shrink-0 items-center self-start sm:self-center"
        >
          <Plus className="mr-2 h-5 w-5" />
          {t('vendorAssessments.buttons.newAssessment')}
        </Button>
      </div></PanelCard>

      {/* Premium Features Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-8">
            <div className="flex items-center mb-4 mt-4">
              <Shield className="h-8 w-8 text-yellow-500 mr-3" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {t('vendorAssessments.features.cmmcAssessments.title')}
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {t('vendorAssessments.features.cmmcAssessments.description')}
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 mb-4">
              <li>• {t('vendorAssessments.features.cmmcAssessments.feature1')}</li>
              <li>• {t('vendorAssessments.features.cmmcAssessments.feature2')}</li>
              <li>• {t('vendorAssessments.features.cmmcAssessments.feature3')}</li>
            </ul>
            {/* CyberCertitude mention for vendor preparation */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                <strong className="text-gray-700 dark:text-gray-300">Tip:</strong> Help your vendors prepare with{' '}
                <a 
                  href="https://cybercertitude.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  CyberCertitude™
                </a>
                {' '}— a CMMC readiness toolkit for self-assessments and documentation.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-8">
            <div className="flex items-center mb-4 mt-4">
              <Users className="h-8 w-8 text-blue-500 mr-3" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {t('vendorAssessments.features.vendorPortal.title')}
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {t('vendorAssessments.features.vendorPortal.description')}
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• {t('vendorAssessments.features.vendorPortal.feature1')}</li>
              <li>• {t('vendorAssessments.features.vendorPortal.feature2')}</li>
              <li>• {t('vendorAssessments.features.vendorPortal.feature3')}</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-8">
            <div className="flex items-center mb-4 mt-4">
              <BarChart3 className="h-8 w-8 text-green-500 mr-3" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {t('vendorAssessments.features.analytics.title')}
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {t('vendorAssessments.features.analytics.description')}
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• {t('vendorAssessments.features.analytics.feature1')}</li>
              <li>• {t('vendorAssessments.features.analytics.feature2')}</li>
              <li>• {t('vendorAssessments.features.analytics.feature3')}</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Progress Tracker */}
      <AssessmentProgressTracker assessments={assessments} />

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('vendorAssessments.search.placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-full md:w-64"
                  aria-label={t('vendorAssessments.search.placeholder')}
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter by assessment status"
                title="Filter by assessment status"
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">{t('vendorAssessments.filters.allStatuses')}</option>
                <option value="pending">{t('vendorAssessments.status.pending')}</option>
                <option value="sent">{t('vendorAssessments.status.sent')}</option>
                <option value="in_progress">{t('vendorAssessments.status.inProgress')}</option>
                <option value="completed">{t('vendorAssessments.status.completed')}</option>
                <option value="reviewed">{t('vendorAssessments.status.reviewed')}</option>
              </select>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={async () => {
                try {
                  const { generateRecommendationsPdf } = await import('../../utils/generatePdf');
                  
                  const recommendations = assessments.map(assessment => ({
                    id: assessment.id,
                    title: `Assessment: ${assessment.vendor.name} - ${assessment.framework.name}`,
                    description: `Status: ${assessment.status || 'pending'}, Progress: ${getAssessmentProgress(assessment)}%, Score: ${assessment.overall_score || 'N/A'}%`,
                    priority: assessment.overall_score && assessment.overall_score < 60 ? 'high' as const : 
                              assessment.overall_score && assessment.overall_score < 80 ? 'medium' as const : 'low' as const,
                    category: 'Vendor Assessment',
                    effort: 'moderate' as const,
                    timeframe: 'short-term' as const,
                    impact: `Assessment for ${assessment.vendor.name} using ${assessment.framework.name} framework.`,
                    steps: [
                      'Review assessment responses',
                      'Validate compliance requirements',
                      'Schedule follow-up if needed',
                      'Update vendor risk profile'
                    ],
                    references: []
                  }));
                  
                  await generateRecommendationsPdf(
                    'Vendor Security Assessments Report',
                    recommendations,
                    new Date().toLocaleDateString(),
                    `vendor-assessments-report-${new Date().toISOString().split('T')[0]}.pdf`
                  );
                } catch (error) {
                  logger.error('Error exporting report:', error);
                  alert('Error generating report. Please try again.');
                }
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              {t('vendorAssessments.actions.exportReport')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Assessments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t('vendorAssessments.table.title')}</span>
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
              {t('vendorAssessments.table.count', { count: filteredAssessments.length })}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAssessments.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {t('vendorAssessments.emptyState.title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchTerm || statusFilter !== 'all' 
                  ? t('vendorAssessments.emptyState.noMatches')
                  : t('vendorAssessments.emptyState.noAssessments')}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('vendorAssessments.buttons.createFirstAssessment')}
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('vendorAssessments.table.headers.vendor')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('vendorAssessments.table.headers.framework')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('vendorAssessments.table.headers.status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('vendorAssessments.table.headers.progress')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('vendorAssessments.table.headers.dueDate')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('vendorAssessments.table.headers.score')}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t('vendorAssessments.table.headers.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredAssessments.map((assessment) => {
                    const progress = getAssessmentProgress(assessment);
                    return (
                      <tr key={assessment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {assessment.vendor.name}
                              </div>
                              {vendorHasRequirements(assessment.vendor.id) && (
                                <Badge variant="outline" className="text-xs bg-vendorsoluce-pale-green border-vendorsoluce-green text-vendorsoluce-green">
                                  Stage 2 Ready
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {assessment.vendor.contact_email || assessment.contact_email}
                            </div>
                            {vendorHasRequirements(assessment.vendor.id) && (
                              <div className="text-xs text-vendorsoluce-green dark:text-vendorsoluce-light-green mt-1">
                                {getRequirementsForVendor(assessment.vendor.id)?.requirements.length || 0} requirements defined
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 dark:text-white">
                            {assessment.framework.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(assessment.status || 'pending')}`}>
                            {getStatusIcon(assessment.status || 'pending')}
                            <span className="ml-1">{t(`vendorAssessments.status.${assessment.status || 'pending'}`)}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                              <ProgressBarFill progress={progress} />
                            </div>
                            <span className="text-sm text-gray-900 dark:text-white font-medium">
                              {progress}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {assessment.due_date ? new Date(assessment.due_date).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {assessment.overall_score ? (
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {assessment.overall_score}%
                            </span>
                          ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Link to={`/vendor-assessments/${assessment.id}`}>
                              <Button variant="ghost" size="sm" title="View Assessment">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            {assessment.status === 'pending' && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleSendAssessment(assessment.id)}
                                title="Send to VendorSoluce Portal"
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            )}
                            {(assessment.status === 'sent' || assessment.status === 'in_progress' || assessment.status === 'completed') && (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleCopyPortalLink(assessment.id)}
                                  title="Copy VendorSoluce Portal link"
                                  className="text-blue-500 hover:text-blue-700"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <a
                                  href={getAssessmentPortalLink(assessment.id)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Open in Vendor Portal"
                                >
                                  <Button variant="ghost" size="sm" className="text-orange-500 hover:text-orange-700">
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                </a>
                              </>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteAssessment(assessment.id)}
                              className="text-red-500 hover:text-red-700"
                              title="Delete Assessment"
                            >
                              <AlertTriangle className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Assessment Modal */}
      {showCreateModal && (
        <CreateAssessmentModal
          vendors={vendors.map(v => ({
            id: v.id,
            name: v.name,
            contact_email: v.contact_email ?? undefined
          }))}
          frameworks={frameworks.map(f => ({
            id: f.id,
            name: f.name,
            description: f.description || '',
            questionCount: f.question_count || 0,
            estimatedTime: f.estimated_time || '',
            framework_type: f.framework_type
          }))}
          vendorRequirements={vendorRequirements}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </WorkspacePageBody></WorkspacePageShell>
  );
};

export default VendorSecurityAssessments;