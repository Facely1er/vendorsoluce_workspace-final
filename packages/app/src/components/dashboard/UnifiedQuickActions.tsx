import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card, { CardHeader, CardTitle, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import { Plus, FileCheck, Radar, Shield, Users, BarChart3, Calculator } from 'lucide-react';

interface UnifiedQuickActionsProps {
  onAddVendor?: () => void;
  onScoreVendor?: () => void;
  onCreateAssessment?: () => void;
}

const UnifiedQuickActions: React.FC<UnifiedQuickActionsProps> = ({
  onAddVendor,
  onScoreVendor,
  onCreateAssessment
}) => {
  const navigate = useNavigate();

  const handleAddVendor = () => {
    if (onAddVendor) {
      onAddVendor();
    } else {
      navigate('/admin/vendors?action=add');
    }
  };

  const handleCreateAssessment = () => {
    if (onCreateAssessment) {
      onCreateAssessment();
    } else {
      navigate('/vendor-assessments?action=create');
    }
  };

  const actions = [
    {
      id: 'add-vendor',
      label: 'Add Vendor',
      description: 'Add a new vendor to your portfolio',
      icon: <Plus className="h-5 w-5" />,
      onClick: handleAddVendor,
      color: 'bg-blue-500 hover:bg-blue-600',
      variant: 'primary' as const
    },
    ...(onScoreVendor
      ? [{
          id: 'score-vendor',
          label: 'Score & add vendor',
          description: 'Calculate inherent risk and add to radar',
          icon: <Calculator className="h-5 w-5" />,
          onClick: onScoreVendor,
          color: 'bg-teal-500 hover:bg-teal-600',
          variant: 'primary' as const
        }]
      : []),
    {
      id: 'create-assessment',
      label: 'Create Assessment',
      description: 'Send assessment to vendor portal',
      icon: <FileCheck className="h-5 w-5" />,
      onClick: handleCreateAssessment,
      color: 'bg-green-500 hover:bg-green-600',
      variant: 'primary' as const
    },
    {
      id: 'open-radar',
      label: 'Open Radar',
      description: 'View vendor risk visualization',
      icon: <Radar className="h-5 w-5" />,
      onClick: () => navigate('/vendor-risk-radar'),
      color: 'bg-purple-500 hover:bg-purple-600',
      variant: 'outline' as const
    },
    {
      id: 'vendor-portal',
      label: 'Vendor Assurance Portal',
      description: 'Manage vendor assessments',
      icon: <Shield className="h-5 w-5" />,
      onClick: () => window.open(import.meta.env.VITE_VENDOR_PORTAL_URL || 'https://www.portal.vendorsoluce.com', '_blank'),
      color: 'bg-orange-500 hover:bg-orange-600',
      variant: 'outline' as const
    },
    {
      id: 'manage-vendors',
      label: 'Manage Vendors',
      description: 'View and edit vendor list',
      icon: <Users className="h-5 w-5" />,
      onClick: () => navigate('/admin/vendors'),
      color: 'bg-indigo-500 hover:bg-indigo-600',
      variant: 'outline' as const
    },
    {
      id: 'view-dashboard',
      label: 'View Dashboard',
      description: 'Go to main dashboard',
      icon: <BarChart3 className="h-5 w-5" />,
      onClick: () => navigate('/dashboard'),
      color: 'bg-gray-500 hover:bg-gray-600',
      variant: 'outline' as const
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {actions.map((action) => (
            <Button
              key={action.id}
              variant={action.variant}
              onClick={action.onClick}
              className="w-full h-auto p-3 text-left !justify-start"
            >
              <div className="flex items-start gap-3 w-full">
                <div className={`p-2 rounded-lg ${action.color} text-white shrink-0`}>
                  <span className="block h-5 w-5">{action.icon}</span>
                </div>
                <div className="min-w-0">
                  <span className="block font-semibold text-sm leading-5 break-words">
                    {action.label}
                  </span>
                  <span
                    className={`block text-xs mt-1 leading-4 break-words ${
                      action.variant === 'primary'
                        ? 'text-white/95'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {action.description}
                  </span>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default UnifiedQuickActions;
