/**
 * Requirement Card Component
 * Displays individual control requirement details
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { 
  Shield, 
  FileText, 
  CheckCircle, 
  FileCheck,
  Award,
  ExternalLink
} from 'lucide-react';
import type { ControlRequirement, RequirementCategory, EvidenceType, RequirementPriority } from '../../types/requirements';

interface RequirementCardProps {
  requirement: ControlRequirement;
  showDetails?: boolean;
  onToggleDetails?: () => void;
}

const RequirementCard: React.FC<RequirementCardProps> = ({
  requirement,
  showDetails = false,
  onToggleDetails
}) => {
  const getCategoryIcon = (category: RequirementCategory) => {
    switch (category) {
      case 'Security': return <Shield className="w-4 h-4" />;
      case 'Compliance': return <Award className="w-4 h-4" />;
      case 'Operational': return <FileCheck className="w-4 h-4" />;
      case 'Technical': return <CheckCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: RequirementCategory) => {
    switch (category) {
      case 'Security': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'Compliance': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'Operational': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Technical': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priority: RequirementPriority) => {
    switch (priority) {
      case 'Critical': return 'border-red-500 text-red-700 dark:text-red-400';
      case 'High': return 'border-orange-500 text-orange-700 dark:text-orange-400';
      case 'Medium': return 'border-yellow-500 text-yellow-700 dark:text-yellow-400';
      case 'Low': return 'border-green-500 text-green-700 dark:text-green-400';
      default: return 'border-gray-500 text-gray-700 dark:text-gray-400';
    }
  };

  const getEvidenceTypeIcon = (evidenceType: EvidenceType) => {
    switch (evidenceType) {
      case 'Document': return <FileText className="w-4 h-4" />;
      case 'Certificate': return <Award className="w-4 h-4" />;
      case 'Assessment': return <FileCheck className="w-4 h-4" />;
      case 'Attestation': return <CheckCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <Card className={`border-l-4 ${getPriorityColor(requirement.priority)} hover:shadow-md transition-shadow`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getCategoryIcon(requirement.category)}
              <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
                {requirement.controlName}
              </CardTitle>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={getCategoryColor(requirement.category)}>
                {requirement.category}
              </Badge>
              <Badge variant="outline" className={getPriorityColor(requirement.priority)}>
                {requirement.priority} Priority
              </Badge>
              <Badge variant="outline" className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                {getEvidenceTypeIcon(requirement.evidenceType)}
                <span className="ml-1">{requirement.evidenceType}</span>
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {requirement.description}
        </p>

        {showDetails && (
          <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div>
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                NIST Reference
              </div>
              <div className="text-sm font-mono text-vendorsoluce-green dark:text-vendorsoluce-light-green">
                {requirement.nistReference}
              </div>
            </div>

            {requirement.evidenceRequired && requirement.evidenceRequired.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                  Required Evidence
                </div>
                <ul className="space-y-1">
                  {requirement.evidenceRequired.map((evidence, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle className="w-4 h-4 text-vendorsoluce-green mt-0.5 flex-shrink-0" />
                      <span>{evidence}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Control ID: <span className="font-mono">{requirement.controlId}</span>
              </div>
              {requirement.required && (
                <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-300">
                  Required
                </Badge>
              )}
            </div>
          </div>
        )}

        {!showDetails && onToggleDetails && (
          <button
            onClick={onToggleDetails}
            className="text-xs text-vendorsoluce-green hover:text-vendorsoluce-dark-green font-medium mt-2 flex items-center gap-1"
          >
            Show Details
            <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </CardContent>
    </Card>
  );
};

export default RequirementCard;
