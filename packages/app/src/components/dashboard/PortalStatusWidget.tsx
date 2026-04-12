import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import { Shield, ExternalLink, CheckCircle, Clock, AlertCircle, ArrowRight } from 'lucide-react';

interface PortalAssessment {
  id: string;
  vendorName: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  dueDate?: string;
  framework?: string;
}

interface PortalStatusWidgetProps {
  assessments?: PortalAssessment[];
}

const PortalStatusWidget: React.FC<PortalStatusWidgetProps> = ({ assessments = [] }) => {
  const [portalStats, setPortalStats] = useState({
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
    total: 0
  });

  useEffect(() => {
    // Calculate stats from assessments
    const stats = {
      pending: assessments.filter(a => a.status === 'pending').length,
      inProgress: assessments.filter(a => a.status === 'in_progress').length,
      completed: assessments.filter(a => a.status === 'completed').length,
      overdue: assessments.filter(a => a.status === 'overdue').length,
      total: assessments.length
    };
    setPortalStats(stats);
  }, [assessments]);

  // Mock data if no assessments provided (for demo)
  const hasData = assessments.length > 0;
  const displayStats = hasData ? portalStats : {
    pending: 3,
    inProgress: 5,
    completed: 12,
    overdue: 1,
    total: 21
  };

  // VendorSoluce™ Portal — vendor assurance & due diligence at www.portal.vendorsoluce.com
  const portalUrl = import.meta.env.VITE_VENDOR_PORTAL_URL || 'https://www.portal.vendorsoluce.com';

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-vendorsoluce-green" />
            <CardTitle>VendorSoluce™ Portal</CardTitle>
          </div>
          <a 
            href={portalUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-vendorsoluce-green hover:text-vendorsoluce-light-green"
            title="Open VendorSoluce™ Portal (vendor assurance & due diligence) in a new tab"
            aria-label="Open VendorSoluce™ Portal in a new tab"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
        <CardDescription className="text-sm text-gray-600 dark:text-gray-400 pr-8">
          Vendor-facing vendor assurance and due diligence—assessments, evidence, and status for your third-party risk program.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Status Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center justify-between mb-1">
              <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {displayStats.pending}
              </span>
            </div>
            <div className="text-xs text-yellow-700 dark:text-yellow-300 font-medium">Pending</div>
          </div>
          
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-1">
              <ArrowRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {displayStats.inProgress}
              </span>
            </div>
            <div className="text-xs text-blue-700 dark:text-blue-300 font-medium">In Progress</div>
          </div>
          
          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-1">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                {displayStats.completed}
              </span>
            </div>
            <div className="text-xs text-green-700 dark:text-green-300 font-medium">Completed</div>
          </div>
          
          {displayStats.overdue > 0 && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <div className="flex items-center justify-between mb-1">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {displayStats.overdue}
                </span>
              </div>
              <div className="text-xs text-red-700 dark:text-red-300 font-medium">Overdue</div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Total Assessments</span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {displayStats.total}
            </span>
          </div>
          {displayStats.completed > 0 && (
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-500">Completion Rate</span>
              <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                {Math.round((displayStats.completed / displayStats.total) * 100)}%
              </span>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <a href={portalUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="w-full">
              <Shield className="h-4 w-4 mr-2" />
              Manage Portal Assessments
              <ExternalLink className="h-3 w-3 ml-2" />
            </Button>
          </a>
          
          <Link to="/vendor-assessments?action=create">
            <Button variant="primary" className="w-full">
              Create New Assessment
            </Button>
          </Link>
        </div>

        {!hasData && (
          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
            Demo data shown. Connect to portal for live updates.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PortalStatusWidget;
