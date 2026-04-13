import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  Upload, 
  CheckCircle, 
  AlertTriangle,
  FileText,
  Lock,
  Download,
  Shield,
  ArrowLeft,
  ExternalLink,
  Trophy,
  Info,
} from 'lucide-react';
import { uploadAssessmentEvidence } from '../../utils/supabaseStorage';
import { logger } from '../../utils/logger';
import JourneyProgress from '../../components/journey/JourneyProgress';
import { isSupabaseEnabled } from '../../lib/supabase';
import {
  fetchPortalAssessmentBundle,
  savePortalAnswerRpc,
  submitPortalAssessmentRpc,
} from '../../services/portalAssessmentService';
import type { PortalQuestionSnapshot } from '../../services/portalQuestionBuilder';
import { isVendorPortalDomain, getPlatformAppUrl } from '../../utils/domainDetection';
import { loadPdfCore } from 'shared/utils/lazyModules';
import { PORTAL_LOGO_SRC } from 'shared/components/portal/portalBrand';

type AnswerValue = string | number | boolean | null;

interface AssessmentQuestion {
  id: string;
  section: string;
  question: string;
  type: 'yes_no' | 'yes_no_na' | 'text' | 'file_upload' | 'scale' | 'multiple_choice';
  required: boolean;
  guidance?: string;
  evidenceRequired?: boolean;
  options?: { label: string; value: string }[];
}

interface AssessmentData {
  id: string;
  vendorName: string;
  organizationName: string;
  frameworkName: string;
  contactEmail: string;
  dueDate: string;
  estimatedTime: string;
  questions: AssessmentQuestion[];
  isSecure: boolean;
  portalAccess: boolean;
  customMessage?: string | null;
}

const generateComplianceReport = async (
  assessment: AssessmentData,
  answers: Record<string, AnswerValue>,
  vendorInfo: { companyName: string; contactName: string; contactEmail: string }
) => {
  const { createPdfDocument } = await loadPdfCore();
  const pdf = createPdfDocument();
  const pageWidth = 210;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const addPage = () => {
    pdf.addPage();
    y = margin;
  };

  const checkPageBreak = (needed: number) => {
    if (y + needed > 280) addPage();
  };

  // Title page
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Vendor Compliance Report', pageWidth / 2, 50, { align: 'center' });

  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  pdf.text(assessment.frameworkName, pageWidth / 2, 65, { align: 'center' });

  pdf.setFontSize(11);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Vendor: ${vendorInfo.companyName || assessment.vendorName}`, pageWidth / 2, 85, { align: 'center' });
  pdf.text(`Requesting Organization: ${assessment.organizationName}`, pageWidth / 2, 93, { align: 'center' });
  pdf.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth / 2, 101, { align: 'center' });

  // Summary stats
  const totalQuestions = assessment.questions.length;
  const answeredCount = Object.keys(answers).length;
  const yesCount = Object.values(answers).filter(a => a === 'yes' || a === true).length;
  const noCount = Object.values(answers).filter(a => a === 'no' || a === false).length;
  const complianceRate = answeredCount > 0 ? Math.round((yesCount / answeredCount) * 100) : 0;

  pdf.setTextColor(0, 0, 0);
  y = 125;
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Executive Summary', margin, y);
  y += 10;

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  const summaryLines = [
    `Total Controls Assessed: ${totalQuestions}`,
    `Controls Answered: ${answeredCount} of ${totalQuestions} (${Math.round((answeredCount / totalQuestions) * 100)}%)`,
    `Compliant Controls: ${yesCount}`,
    `Non-Compliant Controls: ${noCount}`,
    `Not Applicable / Other: ${answeredCount - yesCount - noCount}`,
    `Compliance Rate: ${complianceRate}%`,
  ];
  for (const line of summaryLines) {
    pdf.text(line, margin, y);
    y += 7;
  }

  // Detailed answers by section
  addPage();
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Detailed Assessment Results', margin, y);
  y += 12;

  const sections = [...new Set(assessment.questions.map(q => q.section))];
  for (const section of sections) {
    checkPageBreak(20);
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.text(section, margin, y);
    y += 8;

    const sectionQuestions = assessment.questions.filter(q => q.section === section);
    for (const q of sectionQuestions) {
      checkPageBreak(22);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      const questionLines = pdf.splitTextToSize(`${q.id}: ${q.question}`, contentWidth);
      pdf.text(questionLines, margin, y);
      y += questionLines.length * 5;

      pdf.setFont('helvetica', 'normal');
      const answer = answers[q.id];
      const displayAnswer = answer === null || answer === undefined
        ? 'Not answered'
        : typeof answer === 'boolean'
          ? (answer ? 'Yes' : 'No')
          : String(answer);
      const answerLines = pdf.splitTextToSize(`Answer: ${displayAnswer}`, contentWidth);
      pdf.text(answerLines, margin, y);
      y += answerLines.length * 5 + 4;
    }
    y += 4;
  }

  pdf.save(`compliance-report-${assessment.id}-${Date.now()}.pdf`);
};

function parseQuestionOptions(
  json: unknown
): { label: string; value: string }[] | undefined {
  if (!Array.isArray(json)) return undefined;
  return json.map((o) => {
    if (typeof o === 'string') return { label: o, value: o };
    if (o && typeof o === 'object' && 'value' in o) {
      const x = o as { value: string; label?: string };
      return { label: x.label ?? String(x.value), value: String(x.value) };
    }
    return { label: String(o), value: String(o) };
  });
}

function mapPortalQuestionToUi(q: PortalQuestionSnapshot): AssessmentQuestion {
  const t = q.type;
  const uiType: AssessmentQuestion['type'] =
    t === 'multiple_choice' ||
    t === 'file_upload' ||
    t === 'text' ||
    t === 'scale' ||
    t === 'yes_no_na'
      ? t
      : t === 'yes_no'
        ? 'yes_no'
        : 'text';
  return {
    id: q.id,
    section: q.section || 'General',
    question: q.question,
    type: uiType,
    required: q.required !== false,
    guidance: q.guidance ?? undefined,
    evidenceRequired: q.evidenceRequired,
    options: parseQuestionOptions(q.options),
  };
}

function answerToPersistString(val: AnswerValue): string | null {
  if (val === null || val === undefined) return null;
  if (typeof val === 'boolean') return val ? 'true' : 'false';
  return String(val);
}

function parseStoredAnswer(
  type: AssessmentQuestion['type'],
  raw: string | null
): AnswerValue {
  if (raw == null || raw === '') return null;
  if (type === 'yes_no' || type === 'yes_no_na') {
    if (raw === 'yes' || raw === 'no' || raw === 'na') return raw;
  }
  if (type === 'scale') {
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  }
  return raw;
}

const VendorAssessmentPortal: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File[]>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});
  const [currentSection, setCurrentSection] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [assessmentStatus, setAssessmentStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [usesStage2Snapshot, setUsesStage2Snapshot] = useState(false);
  const [vendorInfo, setVendorInfo] = useState({
    companyName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    securityContactName: '',
    securityContactEmail: ''
  });
  const progressBarRef = useRef<HTMLDivElement>(null);
  const saveDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const answersRef = useRef<Record<string, AnswerValue>>({});

  const platformUrl = getPlatformAppUrl();
  const onPortalHost = isVendorPortalDomain();
  const stage1Href = onPortalHost ? `${platformUrl}/vendor-risk-radar` : '/vendor-risk-radar';
  const stage2Href = onPortalHost ? `${platformUrl}/vendor-requirements` : '/vendor-requirements';
  const stage1NavHref = onPortalHost ? stage1Href : '/vendor-risk-radar';
  const stage2NavHref = onPortalHost ? stage2Href : '/vendor-requirements';

  const canVendorEdit =
    assessmentStatus === 'sent' || assessmentStatus === 'in_progress';
  const isBuyerPreview = assessmentStatus === 'pending';
  const formLocked =
    !assessmentStatus ||
    assessmentStatus === 'pending' ||
    assessmentStatus === 'completed' ||
    assessmentStatus === 'submitted' ||
    assessmentStatus === 'reviewed';

  useEffect(() => {
    let cancelled = false;

    const runMock = () => {
      const mockAssessment: AssessmentData = {
        id: id || 'demo',
        vendorName: 'Example Vendor Corp',
        organizationName: 'VendorSoluce Customer',
        frameworkName: 'CMMC Level 2 Assessment',
        contactEmail: 'security@examplevendor.com',
        dueDate: '2025-02-15',
        estimatedTime: '2-3 hours',
        isSecure: true,
        portalAccess: true,
        questions: [
          {
            id: 'AC-1',
            section: 'Access Control',
            question: 'Does your organization maintain a formal access control policy?',
            type: 'yes_no_na',
            required: true,
            guidance: 'This should include documented procedures for granting, modifying, and revoking access to systems and data.',
            evidenceRequired: true
          },
          {
            id: 'AC-2',
            section: 'Access Control',
            question: 'Do you implement multi-factor authentication for administrative access?',
            type: 'yes_no',
            required: true,
            evidenceRequired: true
          },
          {
            id: 'SI-1',
            section: 'System and Information Integrity',
            question: 'Describe your vulnerability management process',
            type: 'text',
            required: true,
            guidance: 'Include details about scanning frequency, remediation timelines, and responsible parties.'
          },
          {
            id: 'SI-2',
            section: 'System and Information Integrity',
            question: 'Upload your most recent vulnerability scan report',
            type: 'file_upload',
            required: false,
            evidenceRequired: true
          },
          {
            id: 'IR-1',
            section: 'Incident Response',
            question: 'Rate your incident response maturity level',
            type: 'scale',
            required: true,
            guidance: '1 = Ad hoc, 5 = Optimized and continuously improved'
          }
        ]
      };
      setTimeout(() => {
        if (!cancelled) {
          setAssessment(mockAssessment);
          setAssessmentStatus('sent');
          setUsesStage2Snapshot(false);
          setLoading(false);
        }
      }, 400);
    };

    async function load() {
      setLoading(true);
      setLoadError(null);
      setUsesStage2Snapshot(false);
      setAnswers({});
      if (!id) {
        setAssessment(null);
        setAssessmentStatus(null);
        setLoading(false);
        return;
      }

      if (!isSupabaseEnabled()) {
        runMock();
        return;
      }

      try {
        const bundle = await fetchPortalAssessmentBundle(id);
        if (cancelled) return;
        if (!bundle) {
          setAssessment(null);
          setAssessmentStatus(null);
          setLoading(false);
          return;
        }

        const uiQuestions = bundle.questions.map(mapPortalQuestionToUi);
        if (uiQuestions.length === 0) {
          setLoadError('This assessment has no questions configured yet.');
          setAssessment(null);
          setAssessmentStatus(null);
          setLoading(false);
          return;
        }

        const adm: AssessmentData = {
          id: bundle.assessment.id,
          vendorName: bundle.vendor.name,
          organizationName: bundle.requesting_organization,
          frameworkName: bundle.framework.name,
          contactEmail: bundle.assessment.contact_email || '',
          dueDate: bundle.assessment.due_date
            ? new Date(bundle.assessment.due_date).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })
            : '',
          estimatedTime: '',
          questions: uiQuestions,
          isSecure: true,
          portalAccess: true,
          customMessage: bundle.assessment.custom_message
        };

        setAssessment(adm);
        setAssessmentStatus(bundle.assessment.status);
        setUsesStage2Snapshot(Boolean(bundle.assessment.uses_portal_snapshot));

        const nextAnswers: Record<string, AnswerValue> = {};
        for (const q of uiQuestions) {
          const row = bundle.answers[q.id];
          if (!row) continue;
          if (row.answer != null && row.answer !== '') {
            nextAnswers[q.id] = parseStoredAnswer(q.type, row.answer);
          }
          if (row.evidence_urls && row.evidence_urls.length > 0) {
            if (q.type === 'file_upload') {
              nextAnswers[q.id] = row.evidence_urls.join(',');
            }
          }
        }
        setAnswers(nextAnswers);

        setVendorInfo((prev) => ({
          ...prev,
          companyName: bundle.vendor.name || prev.companyName,
          contactEmail: bundle.assessment.contact_email || prev.contactEmail
        }));
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Failed to load assessment');
          setAssessment(null);
          setAssessmentStatus(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const sections = assessment ? [...new Set(assessment.questions.map(q => q.section))] : [];
  const currentSectionQuestions = assessment ? 
    assessment.questions.filter(q => q.section === sections[currentSection]) : [];

  const progressPercentage = assessment
    ? Math.round(
        (Object.keys(answers).length / Math.max(assessment.questions.length, 1)) * 100
      )
    : 0;

  // Update progress bar width via CSS variable when progressPercentage changes
  useEffect(() => {
    if (progressBarRef.current) {
      progressBarRef.current.style.setProperty('--progress-width', `${progressPercentage}%`);
    }
  }, [progressPercentage]);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const persistQuestion = async (
    questionId: string,
    value: AnswerValue,
    evidenceUrls?: string[]
  ) => {
    if (!id || !isSupabaseEnabled() || !canVendorEdit) return;
    try {
      await savePortalAnswerRpc({
        assessmentId: id,
        questionKey: questionId,
        answer: answerToPersistString(value),
        evidenceUrls:
          evidenceUrls && evidenceUrls.length > 0 ? evidenceUrls : undefined
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      logger.error('persistQuestion', err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleAnswer = (questionId: string, answer: AnswerValue) => {
    if (formLocked) return;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer
    }));

    if (!canVendorEdit) return;
    setSaveStatus('saving');
    if (saveDebounceRef.current) clearTimeout(saveDebounceRef.current);
    saveDebounceRef.current = setTimeout(() => {
      void persistQuestion(questionId, answer);
    }, 450);
  };

  const handleFileUpload = (questionId: string, files: FileList) => {
    if (formLocked) return;
    const fileArray = Array.from(files);
    
    // Set uploading state
    setUploading(prev => ({ ...prev, [questionId]: true }));
    setUploadErrors(prev => ({ ...prev, [questionId]: '' }));
    
    const uploadFiles = async () => {
      try {
        const uploadPromises = fileArray.map(async (file) => {
          // Validate file size (limit to 10MB)
          if (file.size > 10 * 1024 * 1024) {
            throw new Error(`File ${file.name} is too large. Maximum size is 10MB.`);
          }
          
          // Validate file type
          const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'image/jpeg',
            'image/png',
            'text/plain'
          ];
          
          if (!allowedTypes.includes(file.type)) {
            throw new Error(`File ${file.name} has an unsupported format. Please use PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, or TXT files.`);
          }
          
          // Upload to Supabase Storage
          const result = await uploadAssessmentEvidence(file, assessment?.id || 'demo', questionId);
          return { file, url: result.url, path: result.path };
        });
        
        const uploadResults = await Promise.all(uploadPromises);
        
        setUploadedFiles(prev => ({
          ...prev,
          [questionId]: fileArray
        }));
        
        const fileUrls = uploadResults.map((result) => result.url).join(',');
        setAnswers((prev) => ({ ...prev, [questionId]: fileUrls }));
        if (canVendorEdit && !formLocked) {
          await persistQuestion(
            questionId,
            fileUrls,
            uploadResults.map((r) => r.url)
          );
        }
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
        
      } catch (error) {
        logger.error('File upload error:', error);
        setUploadErrors(prev => ({
          ...prev,
          [questionId]: error instanceof Error ? error.message : 'Failed to upload files'
        }));
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } finally {
        setUploading(prev => ({ ...prev, [questionId]: false }));
      }
    };
    
    uploadFiles();
  };

  const handleSubmitAssessment = async () => {
    if (!id || !isSupabaseEnabled() || !canVendorEdit) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      const ok = await submitPortalAssessmentRpc(id);
      if (ok) {
        setAssessmentStatus('submitted');
      } else {
        setSubmitError('The assessment could not be submitted. Please ensure at least one answer has been saved and try again.');
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleYesNoEvidenceUpload = (questionId: string, files: FileList) => {
    if (formLocked || !canVendorEdit) return;
    const fileArray = Array.from(files);
    const evKey = `${questionId}-ev`;
    setUploading((prev) => ({ ...prev, [evKey]: true }));
    setUploadErrors((prev) => ({ ...prev, [evKey]: '' }));

    const run = async () => {
      try {
        const uploadResults = await Promise.all(
          fileArray.map(async (file) => {
            if (file.size > 10 * 1024 * 1024) {
              throw new Error(`File ${file.name} is too large. Maximum size is 10MB.`);
            }
            const result = await uploadAssessmentEvidence(
              file,
              assessment?.id || 'demo',
              `${questionId}-evidence`
            );
            return result.url;
          })
        );
        const cur = answersRef.current[questionId];
        await persistQuestion(questionId, cur ?? 'yes', uploadResults);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (error) {
        logger.error('Evidence upload error:', error);
        setUploadErrors((prev) => ({
          ...prev,
          [evKey]: error instanceof Error ? error.message : 'Upload failed'
        }));
      } finally {
        setUploading((prev) => ({ ...prev, [evKey]: false }));
      }
    };
    void run();
  };


  const renderQuestion = (question: AssessmentQuestion) => {
    const currentAnswer = answers[question.id];
    const answerValue = typeof currentAnswer === 'string' ? currentAnswer : 
                       typeof currentAnswer === 'number' ? String(currentAnswer) : 
                       currentAnswer === true ? 'true' :
                       currentAnswer === false ? 'false' : '';
    
    const inputFocusClass =
      'rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-vendorsoluce-green/35 focus:border-vendorsoluce-green';

    return (
      <div
        key={question.id}
        className="border-b border-gray-200 dark:border-gray-700 pb-8 sm:pb-10 last:border-0 last:pb-0"
      >
        <div className="flex flex-col sm:flex-row sm:items-start gap-3 mb-3">
          <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 font-medium px-2.5 py-1 rounded-md text-xs sm:text-sm font-mono shrink-0 w-fit">
            {question.id}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base leading-relaxed">
              {question.question}
              {question.required && (
                <span className="text-red-500 dark:text-red-400 ml-0.5" aria-label="required">
                  *
                </span>
              )}
            </h3>

            {question.guidance && (
              <div className="mt-3 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700/80">
                <div className="flex items-start gap-3">
                  <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed min-w-0">
                    {question.guidance}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-4">
              {question.type === 'yes_no' && (
                <div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={currentAnswer === 'yes' ? 'primary' : 'outline'}
                      size="sm"
                      disabled={formLocked}
                      onClick={() => handleAnswer(question.id, 'yes')}
                      className="min-h-[40px]"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Yes
                    </Button>
                    <Button
                      variant={currentAnswer === 'no' ? 'primary' : 'outline'}
                      size="sm"
                      disabled={formLocked}
                      onClick={() => handleAnswer(question.id, 'no')}
                      className="min-h-[40px]"
                    >
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      No
                    </Button>
                  </div>
                  {question.evidenceRequired && currentAnswer === 'yes' && !formLocked && (
                    <div className="mt-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Upload supporting evidence (optional follow-up)
                      </p>
                      <input
                        type="file"
                        id={`ev-yesno-${question.id}`}
                        multiple
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
                        className="hidden"
                        disabled={uploading[`${question.id}-ev`]}
                        onChange={(e) =>
                          e.target.files && handleYesNoEvidenceUpload(question.id, e.target.files)
                        }
                      />
                      <label
                        htmlFor={`ev-yesno-${question.id}`}
                        className="inline-flex items-center text-sm text-vendorsoluce-navy dark:text-vendorsoluce-light-green cursor-pointer"
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        {uploading[`${question.id}-ev`] ? 'Uploading…' : 'Attach files'}
                      </label>
                      {uploadErrors[`${question.id}-ev`] && (
                        <p className="text-xs text-red-600 mt-2">{uploadErrors[`${question.id}-ev`]}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {question.type === 'yes_no_na' && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={currentAnswer === 'yes' ? 'primary' : 'outline'}
                    size="sm"
                    disabled={formLocked}
                    onClick={() => handleAnswer(question.id, 'yes')}
                    className="min-h-[40px]"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Yes
                  </Button>
                  <Button
                    variant={currentAnswer === 'no' ? 'primary' : 'outline'}
                    size="sm"
                    disabled={formLocked}
                    onClick={() => handleAnswer(question.id, 'no')}
                    className="min-h-[40px]"
                  >
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    No
                  </Button>
                  <Button
                    variant={currentAnswer === 'na' ? 'primary' : 'outline'}
                    size="sm"
                    disabled={formLocked}
                    onClick={() => handleAnswer(question.id, 'na')}
                    className="min-h-[40px]"
                  >
                    N/A
                  </Button>
                </div>
              )}

              {question.type === 'multiple_choice' && question.options && question.options.length > 0 && (
                <select
                  value={answerValue}
                  disabled={formLocked}
                  onChange={(e) => handleAnswer(question.id, e.target.value)}
                  className={`w-full max-w-xl py-2.5 px-3 text-sm ${inputFocusClass}`}
                  aria-label="Select an option"
                >
                  <option value="">Select an option…</option>
                  {question.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              )}
              
              {question.type === 'text' && (
                <textarea
                  value={answerValue}
                  disabled={formLocked}
                  onChange={(e) => handleAnswer(question.id, e.target.value)}
                  className={`w-full p-3 text-sm ${inputFocusClass}`}
                  rows={4}
                  placeholder="Please provide detailed information..."
                />
              )}
              
              {question.type === 'scale' && (
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <Button
                      key={value}
                      variant={currentAnswer === value ? 'primary' : 'outline'}
                      size="sm"
                      disabled={formLocked}
                      onClick={() => handleAnswer(question.id, value)}
                      className="w-11 sm:w-12 min-h-[40px] tabular-nums"
                    >
                      {value}
                    </Button>
                  ))}
                </div>
              )}
              
              {question.type === 'file_upload' && (
                <div className="mt-3">
                  {uploadErrors[question.id] && (
                    <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                      <div className="flex items-start">
                        <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-red-700 dark:text-red-400 text-sm">{uploadErrors[question.id]}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                    <input
                      type="file"
                      id={`file-${question.id}`}
                      multiple
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
                      onChange={(e) => e.target.files && handleFileUpload(question.id, e.target.files)}
                      className="hidden"
                      disabled={uploading[question.id] || formLocked}
                    />
                    <label htmlFor={`file-${question.id}`} className={formLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}>
                      <div className="text-center">
                        {uploading[question.id] ? (
                          <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vendorsoluce-navy mx-auto mb-2"></div>
                            <p className="text-sm text-vendorsoluce-navy font-medium">Uploading files...</p>
                          </div>
                        ) : (
                          <>
                            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Click to upload files or drag and drop
                            </p>
                          </>
                        )}
                      </div>
                      {!uploading[question.id] && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, TXT up to 10MB each
                          </span>
                        </p>
                      )}
                    </label>
                  </div>
                  
                  {uploadedFiles[question.id] && uploadedFiles[question.id].length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-sm font-medium text-green-800 dark:text-green-300">
                        Successfully uploaded files:
                      </p>
                      {uploadedFiles[question.id].map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-green-600 mr-2" />
                            <span className="text-sm text-green-800 dark:text-green-300">{file.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-green-600 dark:text-green-400">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </span>
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vendorsoluce-navy mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {loadError ? 'Could not load assessment' : 'Assessment not found'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {loadError ||
                'The link may be invalid, the assessment may not be available yet, or it may still be in draft (pending). Please check with the requesting organization.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => navigate(onPortalHost ? '/' : '/vendor-portal')}
              >
                {onPortalHost ? 'Portal home' : 'Access portal'}
              </Button>
              <Button variant="outline" onClick={() => navigate('/')}>
                Return to home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Secure Portal Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 mb-4 border-b border-gray-100 dark:border-gray-700/80">
            <Link to="/" className="flex items-center min-w-0 group w-fit">
              <img
                src={PORTAL_LOGO_SRC}
                alt="VendorSoluce™ Logo"
                width={60}
                height={60}
                className="vs-brand-logo h-12 w-12 sm:h-[3.75rem] sm:w-[3.75rem] max-h-[3.75rem] max-w-[3.75rem] flex-shrink-0 transition-transform group-hover:scale-105 object-contain"
                loading="eager"
              />
              <span className="ml-1.5 min-w-0">
                <span className="block text-[1.25rem] sm:text-[1.5rem] md:text-[1.625rem] font-bold text-vendorsoluce-green dark:text-white leading-tight">
                  VendorSoluce™
                </span>
                <span className="block text-xs sm:text-sm italic text-vendorsoluce-green/80 dark:text-vendorsoluce-light-green font-normal leading-tight tracking-tighter tagline-text">
                  Supply Chain Risk Intelligence
                </span>
              </span>
            </Link>
          </div>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-3 min-w-0">
              <div className="flex items-center gap-2 shrink-0 pt-0.5">
                <Lock className="h-5 w-5 text-green-600 dark:text-green-400" aria-hidden />
                <span className="text-sm text-green-700 dark:text-green-400 font-semibold">Secure portal</span>
              </div>
              <div className="min-w-0 flex-1 border-l border-gray-200 dark:border-gray-600 pl-3 sm:pl-4">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white leading-snug break-words">
                  {assessment.frameworkName}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Requested by <span className="font-medium text-gray-800 dark:text-gray-200">{assessment.organizationName}</span>
                </p>
                {assessment.vendorName && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 break-words">
                    Vendor: {assessment.vendorName}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 lg:pt-0.5">
              <div className="text-left sm:text-right">
                <div className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
                  Progress: {progressPercentage}%
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Due: {assessment.dueDate}
                </div>
              </div>
              <div className="w-14 h-14 sm:w-16 sm:h-16 relative shrink-0" aria-hidden>
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 64 64">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    className="stroke-gray-200 dark:stroke-gray-700"
                    strokeWidth="4"
                    fill="none"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    className="stroke-vendorsoluce-green"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${progressPercentage * 1.76} 176`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] sm:text-xs font-bold text-gray-900 dark:text-white tabular-nums">
                    {progressPercentage}%
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                ref={progressBarRef}
                className="bg-vendorsoluce-green h-2 rounded-full transition-all duration-300 progress-width"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isBuyerPreview && (
          <div className="mb-4 p-4 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
            <p className="text-sm text-amber-900 dark:text-amber-100">
              Buyer preview: this assessment is still pending. Send it from Vendor Assessments to open the vendor
              questionnaire and enable saving responses.
            </p>
          </div>
        )}
        {assessment.customMessage && (
          <div className="mb-4 p-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              Message from your customer
            </p>
            <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
              {assessment.customMessage}
            </p>
          </div>
        )}
        {/* Journey Progress */}
        <JourneyProgress 
          currentStage={3} 
          stage1Complete={true}
          stage2Complete={usesStage2Snapshot}
          showNavigation={true}
        />
        
        {/* Stage 3 Header */}
        <div className="mb-6 p-4 bg-vendorsoluce-pale-green dark:bg-vendorsoluce-green/10 rounded-lg border border-vendorsoluce-green/30">
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
            Collecting evidence for vendors identified in Stage 1 and requirements defined in Stage 2. Get evidence-based proof of vendor compliance without drowning in email.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-lg">Assessment Sections</CardTitle>
              </CardHeader>
              <CardContent>
                <nav className="space-y-2">
                  {sections.map((section, index) => {
                    const sectionQuestions = assessment.questions.filter(q => q.section === section);
                    const answeredCount = sectionQuestions.filter(q => answers[q.id]).length;
                    const isComplete = answeredCount === sectionQuestions.length;
                    
                    return (
                      <button
                        key={section}
                        onClick={() => setCurrentSection(index)}
                        className={`w-full text-left p-3 rounded-lg transition-colors border border-transparent ${
                          currentSection === index
                            ? 'bg-vendorsoluce-navy text-white shadow-sm'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700/80 text-gray-900 dark:text-gray-100'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-medium text-sm leading-snug break-words min-w-0 pr-1">{section}</span>
                          <div className="flex items-center shrink-0 gap-1">
                            {isComplete && (
                              <CheckCircle
                                className={`h-4 w-4 ${currentSection === index ? 'text-vendorsoluce-light-green' : 'text-green-600 dark:text-green-400'}`}
                              />
                            )}
                            <span className={`text-xs tabular-nums ${currentSection === index ? 'text-white/90' : 'text-gray-500 dark:text-gray-400'}`}>
                              {answeredCount}/{sectionQuestions.length}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </nav>
                
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Auto-save status:</span>
                    <div className="flex items-center gap-0.5">
                      {saveStatus === 'saving' && (
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-vendorsoluce-navy mr-0.5" />
                      )}
                      {saveStatus === 'saved' && (
                        <CheckCircle className="h-3 w-3 text-green-500 dark:text-green-400 mr-0.5 shrink-0" />
                      )}
                      {saveStatus === 'error' && (
                        <AlertTriangle className="h-3 w-3 text-red-500 dark:text-red-400 mr-0.5 shrink-0" />
                      )}
                      <span
                        className={`text-xs ${
                          saveStatus === 'saved'
                            ? 'text-green-600 dark:text-green-400'
                            : saveStatus === 'saving'
                              ? 'text-gray-600 dark:text-gray-300'
                              : saveStatus === 'error'
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {saveStatus === 'saved'
                          ? 'Saved'
                          : saveStatus === 'saving'
                            ? 'Saving…'
                            : saveStatus === 'error'
                              ? 'Save failed'
                              : 'Ready'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
              <CardHeader className="pb-4 border-b border-gray-100 dark:border-gray-700/80">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white leading-snug pr-2 break-words">
                    {sections[currentSection]}
                    <span className="block sm:inline sm:ml-2 text-sm font-normal text-gray-500 dark:text-gray-400 mt-1 sm:mt-0">
                      Section {currentSection + 1} of {sections.length}
                    </span>
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0 self-start"
                    onClick={() => {
                      if (!assessment) return;
                      void generateComplianceReport(assessment, answers, vendorInfo).catch((err) =>
                        logger.error('Report generation failed:', err)
                      );
                    }}
                  >
                    <Download className="h-4 w-4 mr-2 shrink-0" />
                    Download PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6 sm:pt-8 px-4 sm:px-6">
                {/* Vendor Information Section (only show on first section) */}
                {currentSection === 0 && (
                  <>
                    <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <h3 className="font-medium text-blue-900 dark:text-blue-300 mb-3">
                        Company Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                            Company Name
                          </label>
                          <input
                            type="text"
                            value={vendorInfo.companyName}
                            onChange={(e) => setVendorInfo(prev => ({ ...prev, companyName: e.target.value }))}
                            className="w-full p-2 border border-blue-300 dark:border-blue-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            placeholder="Your Company Name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                            Primary Contact
                          </label>
                          <input
                            type="text"
                            value={vendorInfo.contactName}
                            onChange={(e) => setVendorInfo(prev => ({ ...prev, contactName: e.target.value }))}
                            className="w-full p-2 border border-blue-300 dark:border-blue-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            placeholder="Contact Name"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* CyberCertitude CMMC Preparation Help Section */}
                    {assessment.frameworkName.toLowerCase().includes('cmmc') && (
                      <div className="mb-8 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                        <div className="flex items-start">
                          <Shield className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                              Need Help Preparing for CMMC?
                            </h3>
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                              <strong>CyberCertitude™</strong> provides CMMC readiness tools to help you prepare for assessments. 
                              Use it to conduct self-assessments, generate System Security Plans (SSP), and track 
                              your Plan of Action & Milestones (POA&M) before completing this vendor assessment.
                            </p>
                            <a 
                              href="https://cybercertitude.com" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-sm font-semibold text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 transition-colors"
                            >
                              Learn more about CyberCertitude →
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
                
                <div className="space-y-0">
                  {currentSectionQuestions.map(renderQuestion)}
                </div>

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between sm:items-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentSection(prev => Math.max(0, prev - 1))}
                    disabled={currentSection === 0}
                  >
                    Previous Section
                  </Button>
                  
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Section {currentSection + 1} of {sections.length}
                  </div>
                  
                  {currentSection < sections.length - 1 ? (
                    <Button
                      variant="primary"
                      onClick={() => setCurrentSection(prev => prev + 1)}
                    >
                      Next Section
                    </Button>
                  ) : (
                    <div className="flex flex-col items-end gap-2">
                      {submitError && (
                        <p className="text-sm text-red-600 dark:text-red-400 text-right max-w-xs">
                          {submitError}
                        </p>
                      )}
                      {assessmentStatus === 'submitted' ? (
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium text-sm">
                          <CheckCircle className="h-4 w-4" />
                          Assessment submitted
                        </div>
                      ) : (
                        <Button
                          variant="primary"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={handleSubmitAssessment}
                          disabled={submitting || !canVendorEdit}
                        >
                          {submitting ? (
                            <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-2" />
                          )}
                          {submitting ? 'Submitting…' : 'Submit Assessment'}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Journey Completion Celebration */}
            {progressPercentage === 100 && (
              <Card className="mt-6 border-vendorsoluce-green/30 bg-gradient-to-r from-vendorsoluce-pale-green to-green-50 dark:from-vendorsoluce-green/20 dark:to-green-900/20">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-vendorsoluce-green mb-4">
                      <Trophy className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      🎉 Journey Complete!
                    </h3>
                    <p className="text-base text-gray-600 dark:text-gray-400 mb-4">
                      You've completed all 3 stages and have evidence-based proof of vendor compliance.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-vendorsoluce-green mb-1">Stage 1</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Exposure Discovered</div>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-vendorsoluce-green mb-1">Stage 2</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Gaps Understood</div>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-vendorsoluce-green mb-1">Stage 3</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Gaps Closed</div>
                      </div>
                    </div>
                    
                    {/* Primary Action CTA */}
                    <div className="mb-6">
                      <Button 
                        variant="primary" 
                        size="lg"
                        className="w-full md:w-auto flex items-center gap-2 justify-center"
                        onClick={() => {
                          if (assessment) {
                            generateComplianceReport(assessment, answers, vendorInfo)
                              .catch(err => logger.error('Report generation failed:', err));
                          }
                        }}
                      >
                        <Download className="w-5 h-5" />
                        Generate Compliance Report
                      </Button>
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                        Export evidence-based proof of vendor compliance
                      </p>
                    </div>
                    
                    {/* Navigation Options */}
                    <div className="flex flex-wrap justify-center gap-3 mb-4">
                      <Link to="/demo">
                        <Button variant="outline" className="flex items-center gap-2">
                          <ExternalLink className="w-4 h-4" />
                          See Demo
                        </Button>
                      </Link>
                      <a 
                        href="https://www.vendorsoluce.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" className="flex items-center gap-2">
                          <ExternalLink className="w-4 h-4" />
                          Back to Website
                        </Button>
                      </a>
                    </div>
                    
                    {/* Secondary Navigation */}
                    <div className="flex flex-wrap justify-center gap-2 text-sm">
                      <a href={stage1NavHref} className="text-vendorsoluce-green hover:text-vendorsoluce-dark-green font-medium flex items-center gap-1">
                        <ArrowLeft className="w-3 h-3" />
                        Back to Stage 1
                      </a>
                      <span className="text-gray-300 dark:text-gray-600">•</span>
                      <a href={stage2NavHref} className="text-vendorsoluce-green hover:text-vendorsoluce-dark-green font-medium flex items-center gap-1">
                        <ArrowLeft className="w-3 h-3" />
                        Back to Stage 2
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Cross-Project Links */}
            <Card className="mt-6">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Also try:</span>
                  <Link to="/demo" className="text-vendorsoluce-green hover:text-vendorsoluce-dark-green font-medium flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" />
                    Interactive Demo
                  </Link>
                  <a href={stage1NavHref} className="text-vendorsoluce-green hover:text-vendorsoluce-dark-green font-medium flex items-center gap-1">
                    <ArrowLeft className="w-3 h-3" />
                    Back to Stage 1
                  </a>
                  <a href={stage2NavHref} className="text-vendorsoluce-green hover:text-vendorsoluce-dark-green font-medium flex items-center gap-1">
                    <ArrowLeft className="w-3 h-3" />
                    Back to Stage 2
                  </a>
                  <a 
                    href="https://www.vendorsoluce.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-vendorsoluce-green hover:text-vendorsoluce-dark-green font-medium flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Back to Website
                  </a>
                  <a 
                    href="https://www.vendorsoluce.com/how-it-works.html" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-vendorsoluce-green hover:text-vendorsoluce-dark-green font-medium flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Learn More
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorAssessmentPortal;