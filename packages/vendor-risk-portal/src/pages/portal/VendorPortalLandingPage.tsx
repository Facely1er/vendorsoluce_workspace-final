import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from 'shared/components/ui/Card';
import { Button } from 'shared/components/ui/Button';
import { 
  Shield, 
  Lock, 
  ArrowRight, 
  AlertCircle,
  CheckCircle,
  FileText,
  Clock,
  Users
} from 'lucide-react';
import { supabase, isSupabaseEnabled } from '../../lib/supabase';
import { logger } from '../../utils/logger';
const VendorPortalLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [assessmentId, setAssessmentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);

  const validateAssessmentId = async (id: string): Promise<boolean> => {
    try {
      // Check if it's a valid UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id.trim())) {
        return false;
      }

      // Try to fetch the assessment (using anon key, so RLS will handle access)
      const { data, error: fetchError } = await (supabase
        .from('vs_vendor_assessments')
        .select('id, status, due_date, framework:vs_assessment_frameworks(name), vendor:vs_vendors(name)')
        .eq('id', id.trim())
        .single()) as { data: { status?: string } | null; error: unknown };

      if (fetchError || !data) {
        return false;
      }

      // Check if assessment is accessible (not cancelled)
      if (data.status === 'cancelled') {
        return false;
      }

      return true;
    } catch (err) {
      logger.error('Error validating assessment ID:', err);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!assessmentId.trim()) {
      setError('Please enter an assessment ID');
      return;
    }

    const trimmedId = assessmentId.trim();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    // Demo mode: when backend is not configured, accept any valid UUID to open the assessment (mock data)
    if (!isSupabaseEnabled()) {
      if (uuidRegex.test(trimmedId)) {
        navigate(`/vendor-assessments/${trimmedId}`);
        return;
      }
      setError('Please enter a valid assessment ID (e.g. 123e4567-e89b-12d3-a456-426614174000). Demo mode: no backend.');
      return;
    }

    setLoading(true);
    setValidating(true);

    try {
      const isValid = await validateAssessmentId(trimmedId);

      if (isValid) {
        navigate(`/vendor-assessments/${trimmedId}`);
      } else {
        setError('Invalid or expired assessment ID. Please check your link and try again.');
        setLoading(false);
        setValidating(false);
      }
    } catch (err) {
      logger.error('Error accessing assessment:', err);
      setError('An error occurred while accessing the assessment. Please try again.');
      setLoading(false);
      setValidating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-vendorsoluce-green mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Vendor Assessment Portal
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Secure portal for completing vendor security assessments
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
            >
              Return to Home
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="h-5 w-5 text-vendorsoluce-green mr-2" />
                  Access Your Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Enter your assessment ID to access your vendor security assessment. 
                    You should have received this ID via email or from your organization.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label 
                        htmlFor="assessmentId" 
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Assessment ID
                      </label>
                      <input
                        id="assessmentId"
                        type="text"
                        value={assessmentId}
                        onChange={(e) => {
                          setAssessmentId(e.target.value);
                          setError(null);
                        }}
                        placeholder="Enter your assessment ID (e.g., 123e4567-e89b-12d3-a456-426614174000)"
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-vendorsoluce-green focus:border-transparent transition-all"
                        disabled={loading}
                        autoFocus
                      />
                      {error && (
                        <div className="mt-2 flex items-center text-sm text-red-600 dark:text-red-400">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          {error}
                        </div>
                      )}
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full"
                      disabled={loading || !assessmentId.trim()}
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {validating ? 'Validating...' : 'Accessing...'}
                        </span>
                      ) : (
                        <span className="flex items-center">
                          Access Assessment
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </span>
                      )}
                    </Button>
                  </form>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Need Help?
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Check your email for the assessment invitation</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Contact your organization's security team</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Ensure you're using the complete assessment ID</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Security Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Shield className="h-5 w-5 text-vendorsoluce-green mr-2" />
                    Secure Portal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Encrypted Connection
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        All data is transmitted securely
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Privacy Protected
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Your responses are confidential
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Save Progress
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Complete at your own pace
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* What to Expect */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <FileText className="h-5 w-5 text-blue-500 mr-2" />
                    What to Expect
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Time Required
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        30 minutes to 3 hours depending on framework
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Users className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Multiple Sections
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Organized by security domains
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FileText className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Evidence Upload
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Attach supporting documents
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorPortalLandingPage;

