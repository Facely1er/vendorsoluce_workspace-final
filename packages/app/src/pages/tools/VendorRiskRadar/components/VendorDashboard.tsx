import React, { useState, useMemo } from 'react';
import { Button } from '../../../../components/ui/Button';
import { WORKSPACE_PAGE_BODY_STACK_CLASS } from '../../../../components/vendorsoluce-intelligence/WorkspacePageShell';
import RiskBadge from '../../../../components/ui/RiskBadge';
import { AlertTriangle, Target, Filter } from 'lucide-react';
import type { VendorRadar } from '../../../../types/vendorRadar';

interface VendorDashboardProps {
  vendors: VendorRadar[];
  filters: {
    category: string;
    riskLevel: string;
  };
  onFilterChange: (filters: { category: string; riskLevel: string }) => void;
  onVendorSelect: (vendor: VendorRadar) => void;
}

const VendorDashboard: React.FC<VendorDashboardProps> = ({
  vendors,
  filters,
  onFilterChange,
  onVendorSelect
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>('high-risk');

  // Filter vendors
  const filteredVendors = useMemo(() => {
    return vendors.filter(v => {
      const categoryMatch = filters.category === 'all' || v.category === filters.category;
      const riskMatch = filters.riskLevel === 'all' || 
        (filters.riskLevel === 'critical' && (v.residualRisk || v.inherentRisk) >= 90) ||
        (filters.riskLevel === 'high' && (v.residualRisk || v.inherentRisk) >= 70) ||
        (filters.riskLevel === 'medium' && (v.residualRisk || v.inherentRisk) >= 40);
      return categoryMatch && riskMatch;
    });
  }, [vendors, filters]);

  // Group vendors
  const highRiskVendors = useMemo(() => {
    return filteredVendors.filter(v => (v.residualRisk || v.inherentRisk) >= 70);
  }, [filteredVendors]);

  const criticalCategoryVendors = useMemo(() => {
    return filteredVendors.filter(v => v.category === 'critical');
  }, [filteredVendors]);

  const getRiskLevel = (risk: number): 'Low' | 'Medium' | 'High' | 'Critical' => {
    if (risk <= 40) return 'Low';
    if (risk <= 60) return 'Medium';
    if (risk <= 80) return 'High';
    return 'Critical';
  };

  const VendorCard = ({ vendor }: { vendor: VendorRadar }) => {
    const risk = vendor.residualRisk || vendor.inherentRisk || 0;
    return (
      <div
        className="rounded-xl border border-gray-200/70 bg-white hover:shadow-md transition-all cursor-pointer shadow-sm dark:border-gray-800 dark:bg-gray-900"
        onClick={() => onVendorSelect(vendor)}
      >
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {vendor.name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  vendor.category === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                  vendor.category === 'strategic' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                  vendor.category === 'tactical' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                }`}>
                  {vendor.category}
                </span>
                <span>{vendor.sector}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {risk}
              </div>
              <RiskBadge level={getRiskLevel(risk)} />
            </div>
          </div>
          {vendor.dataTypes && vendor.dataTypes.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {vendor.dataTypes.slice(0, 3).map((dt, i) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                >
                  {dt}
                </span>
              ))}
              {vendor.dataTypes.length > 3 && (
                <span className="px-1.5 py-0.5 text-xs text-gray-500">
                  +{vendor.dataTypes.length - 3}
                </span>
              )}
            </div>
          )}
          {vendor.sbomProfile?.providesSoftware && !vendor.sbomProfile?.sbomAvailable && (
            <div className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400">
              <AlertTriangle className="w-3 h-3" />
              SBOM Gap
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={WORKSPACE_PAGE_BODY_STACK_CLASS}>
      {/* Filters */}
      <div className="rounded-xl border border-gray-200/70 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters:</span>
            </div>
            <select
              value={filters.category}
              onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
              aria-label="Filter by category"
            >
              <option value="all">All Categories</option>
              <option value="critical">Critical</option>
              <option value="strategic">Strategic</option>
              <option value="tactical">Tactical</option>
              <option value="commodity">Commodity</option>
            </select>
            <select
              value={filters.riskLevel}
              onChange={(e) => onFilterChange({ ...filters, riskLevel: e.target.value })}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm"
              aria-label="Filter by risk level"
            >
              <option value="all">All Risk Levels</option>
              <option value="critical">Critical Risk (90+)</option>
              <option value="high">High Risk (70+)</option>
              <option value="medium">Medium Risk (40+)</option>
            </select>
          </div>
        </div>
      </div>

      {/* High Risk Vendors */}
      <div className="rounded-xl border border-gray-200/70 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <div className="font-semibold text-gray-900 dark:text-white">High Risk Vendors</div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                ({highRiskVendors.length})
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpandedSection(expandedSection === 'high-risk' ? null : 'high-risk')}
            >
              {expandedSection === 'high-risk' ? 'Collapse' : 'Expand'}
            </Button>
          </div>
        </div>
        {expandedSection === 'high-risk' && (
          <div>
            {highRiskVendors.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                No high-risk vendors found.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {highRiskVendors.map(vendor => (
                  <VendorCard key={vendor.id} vendor={vendor} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Critical Category Vendors */}
      <div className="rounded-xl border border-gray-200/70 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-red-600" />
              <div className="font-semibold text-gray-900 dark:text-white">Critical Category Vendors</div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                ({criticalCategoryVendors.length})
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpandedSection(expandedSection === 'critical' ? null : 'critical')}
            >
              {expandedSection === 'critical' ? 'Collapse' : 'Expand'}
            </Button>
          </div>
        </div>
        {expandedSection === 'critical' && (
          <div>
            {criticalCategoryVendors.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                No critical category vendors found.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {criticalCategoryVendors.map(vendor => (
                  <VendorCard key={vendor.id} vendor={vendor} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* All Vendors */}
      <div className="rounded-xl border border-gray-200/70 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-gray-900 dark:text-white">All Vendors ({filteredVendors.length})</div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpandedSection(expandedSection === 'all' ? null : 'all')}
            >
              {expandedSection === 'all' ? 'Collapse' : 'Expand'}
            </Button>
          </div>
        </div>
        {expandedSection === 'all' && (
          <div>
            {filteredVendors.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                No vendors found matching the filters.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredVendors.map(vendor => (
                  <VendorCard key={vendor.id} vendor={vendor} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDashboard;
