import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { VendorRisk } from '../../types';
import RiskBadge from '../ui/RiskBadge';
import { useTranslation } from 'react-i18next';
import { Edit, Trash2, Eye, Radar, Shield } from 'lucide-react';
import { Button } from '../ui/Button';
import BulkDataOperations from '../data/BulkDataOperations';
import './VendorRiskTable.css';

interface VendorRiskTableProps {
  vendors: VendorRisk[];
  onEdit?: (vendor: VendorRisk) => void;
  onDelete?: (vendorId: string) => void;
  onView?: (vendor: VendorRisk) => void;
  onRefresh?: () => void;
}

const VendorRiskTable: React.FC<VendorRiskTableProps> = ({ 
  vendors,
  onEdit,
  onDelete,
  onView,
  onRefresh
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  
  // Portal status is determined by real assessment data; returns null when no assessment exists
  const getPortalStatus = (_vendorId: string): string | null => {
    return null;
  };
  
  const handleSelectAll = (checked: boolean) => {
    setSelectedVendors(checked ? vendors.map(v => v.id) : []);
  };
  
  const handleSelectVendor = (vendorId: string, checked: boolean) => {
    if (checked) {
      setSelectedVendors(prev => [...prev, vendorId]);
    } else {
      setSelectedVendors(prev => prev.filter(id => id !== vendorId));
    }
  };
  
  if (vendors.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No vendors found.
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      // Try to parse as ISO date string
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }).format(date);
      }
      // If it's not a valid date, just return the original string
      return dateString;
    } catch {
      return dateString;
    }
  };
  
  return (
    <div>
      <BulkDataOperations
        dataType="vendors"
        selectedItems={selectedVendors}
        onSelectionChange={setSelectedVendors}
        onOperationComplete={() => {
          if (onRefresh) onRefresh();
        }}
      />
      
    <div className="vendor-risk-table-wrapper w-full min-w-0 overflow-hidden">
      <table className="w-full table-fixed divide-y divide-gray-200 dark:divide-gray-700">
        <caption className="sr-only">Vendor risk assessment table</caption>
        <colgroup>
          <col />
          <col />
          <col />
          <col />
          <col />
          <col />
          <col />
          <col />
          {(onEdit || onDelete || onView) && <col />}
        </colgroup>
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th scope="col" className="px-3 py-2 sm:px-4 sm:py-3 text-left">
              <input
                type="checkbox"
                checked={selectedVendors.length === vendors.length && vendors.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="h-4 w-4 text-vendorsoluce-green focus:ring-vendorsoluce-green border-gray-300 rounded"
                aria-label="Select all vendors"
                title="Select all vendors"
              />
            </th>
            <th scope="col" className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t('vendorRisk.table.vendor')}
            </th>
            <th scope="col" className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t('vendorRisk.table.riskScore')}
            </th>
            <th scope="col" className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t('vendorRisk.table.riskLevel')}
            </th>
            <th scope="col" className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t('vendorRisk.table.complianceStatus')}
            </th>
            <th scope="col" className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t('vendorRisk.table.lastAssessment')}
            </th>
            <th scope="col" className="px-3 py-2 sm:px-4 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Portal
            </th>
            <th scope="col" className="px-3 py-2 sm:px-4 sm:py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Quick
            </th>
            {(onEdit || onDelete || onView) && (
              <th scope="col" className="px-3 py-2 sm:px-4 sm:py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {vendors.map((vendor) => (
            <tr key={vendor.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <td className="px-3 py-2 sm:px-4 sm:py-3 align-top">
                <input
                  type="checkbox"
                  checked={selectedVendors.includes(vendor.id)}
                  onChange={(e) => handleSelectVendor(vendor.id, e.target.checked)}
                  className="h-4 w-4 text-vendorsoluce-green focus:ring-vendorsoluce-green border-gray-300 rounded"
                  aria-label={`Select ${vendor.name}`}
                  title={`Select ${vendor.name}`}
                />
              </td>
              <td className="px-3 py-2 sm:px-4 sm:py-3 min-w-0">
                <div className="min-w-0">
                  <div className="font-medium text-gray-900 dark:text-white truncate" title={vendor.name}>{vendor.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">Last updated {formatDate(vendor.lastAssessment)}</div>
                </div>
              </td>
              <td className="px-3 py-2 sm:px-4 sm:py-3">
                <div className="flex items-center min-w-0">
                  <div className="vendor-risk-table__score-track">
                    <div
                      data-score={vendor.riskScore}
                      className={`vendor-risk-table__score-fill ${
                        vendor.riskScore >= 80 ? 'vendor-risk-table__score-fill--high' :
                        vendor.riskScore >= 60 ? 'vendor-risk-table__score-fill--medium' :
                        vendor.riskScore >= 40 ? 'vendor-risk-table__score-fill--low' : 'vendor-risk-table__score-fill--critical'
                      }`}
                    />
                  </div>
                  <span className="ml-2 text-gray-900 dark:text-white font-medium text-sm">{vendor.riskScore}</span>
                </div>
              </td>
              <td className="px-3 py-2 sm:px-4 sm:py-3">
                <div className="min-w-0">
                  <RiskBadge level={vendor.riskLevel} />
                  {vendor.riskLevel === 'Critical' && (
                    <div className="text-xs text-red-600 dark:text-red-400 mt-1 whitespace-nowrap" title="Immediate action required">Action required</div>
                  )}
                </div>
              </td>
              <td className="px-3 py-2 sm:px-4 sm:py-3">
                <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap inline-block ${
                  vendor.complianceStatus === 'Compliant' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                  vendor.complianceStatus === 'Partial' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400' :
                  'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                }`}>
                  {vendor.complianceStatus}
                </span>
              </td>
              <td className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {formatDate(vendor.lastAssessment)}
              </td>
              <td className="px-3 py-2 sm:px-4 sm:py-3">
                {(() => {
                  const portalStatus = getPortalStatus(vendor.id);
                  if (!portalStatus) {
                    return (
                      <span className="text-xs text-gray-400 dark:text-gray-500">No assessment</span>
                    );
                  }
                  const statusConfig = {
                    pending: { label: 'Pending', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400', icon: '⏳' },
                    in_progress: { label: 'In Progress', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400', icon: '🔄' },
                    completed: { label: 'Completed', color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400', icon: '✓' },
                  };
                  const config = statusConfig[portalStatus as keyof typeof statusConfig] || statusConfig.pending;
                  return (
                    <span className={`px-2 py-1 text-xs rounded-full ${config.color} inline-flex items-center gap-1 whitespace-nowrap`} title={config.label}>
                      <span>{config.icon}</span>
                      {config.label}
                    </span>
                  );
                })()}
              </td>
              <td className="px-3 py-2 sm:px-4 sm:py-3">
                <div className="flex items-center justify-center gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/vendor-risk-radar?vendor=${vendor.id}`)}
                    className="text-purple-500 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-200"
                    aria-label={`View ${vendor.name} in Radar`}
                    title="View in Radar"
                  >
                    <Radar className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(import.meta.env.VITE_VENDOR_PORTAL_URL || 'https://www.portal.vendorsoluce.com', '_blank')}
                    className="text-orange-500 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-200"
                    aria-label={`View ${vendor.name} portal`}
                    title="View Portal"
                  >
                    <Shield className="h-4 w-4" />
                  </Button>
                </div>
              </td>
              {(onEdit || onDelete || onView) && (
                <td className="px-3 py-2 sm:px-4 sm:py-3 text-right text-sm font-medium">
                  <div className="flex justify-end gap-1">
                    {onView && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(vendor)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        aria-label={`View details for ${vendor.name}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(vendor)}
                        className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200"
                        aria-label={`Edit ${vendor.name}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(vendor.id)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200"
                        aria-label={`Delete ${vendor.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  );
};

export default VendorRiskTable;