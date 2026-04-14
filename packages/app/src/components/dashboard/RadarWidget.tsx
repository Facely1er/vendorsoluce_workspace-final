import React from 'react';
import { Link } from 'react-router-dom';
import Card, { CardHeader, CardTitle, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import { Radar, ExternalLink } from 'lucide-react';
import { VendorRisk } from '../../types';

interface RadarWidgetProps {
  vendors: VendorRisk[];
  onVendorClick?: (vendor: VendorRisk) => void;
}

const RadarWidget: React.FC<RadarWidgetProps> = ({ vendors, onVendorClick }) => {
  // Calculate risk distribution for visualization
  const riskDistribution = {
    critical: vendors.filter(v => v.riskLevel === 'Critical').length,
    high: vendors.filter(v => v.riskLevel === 'High').length,
    medium: vendors.filter(v => v.riskLevel === 'Medium').length,
    low: vendors.filter(v => v.riskLevel === 'Low').length,
  };

  const totalVendors = vendors.length;
  const highRiskCount = riskDistribution.critical + riskDistribution.high;

  return (
    <Card className="h-full rounded-2xl border-gray-200/70 shadow-sm dark:border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Radar className="h-5 w-5 mr-2 text-vendorsoluce-green" />
            <CardTitle>Vendor Risk Radar</CardTitle>
          </div>
          <Link to="/vendor-risk-radar">
            <Button variant="ghost" size="sm" className="text-vendorsoluce-green hover:text-vendorsoluce-light-green">
              Full View <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {totalVendors > 0 ? (
          <>
            {/* Mini Radar Visualization */}
            <div className="h-48 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg mb-4 relative overflow-hidden p-4 sm:p-5">
              {/* Simplified radar visualization */}
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Radar grid circles */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 border-2 border-gray-300 dark:border-gray-600 rounded-full"></div>
                  <div className="absolute w-24 h-24 border border-gray-300 dark:border-gray-600 rounded-full"></div>
                  <div className="absolute w-16 h-16 border border-gray-300 dark:border-gray-600 rounded-full"></div>
                </div>
                
                {/* Risk indicators */}
                <div className="relative z-10">
                  {vendors.slice(0, 8).map((vendor, index) => {
                    const angle = (index * 45) * (Math.PI / 180);
                    const radius = 40 + (vendor.riskScore / 100) * 20;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    const color = 
                      vendor.riskLevel === 'Critical' ? 'bg-red-500' :
                      vendor.riskLevel === 'High' ? 'bg-orange-500' :
                      vendor.riskLevel === 'Medium' ? 'bg-yellow-500' : 'bg-green-500';
                    
                    return (
                      <div
                        key={vendor.id}
                        className={`absolute w-3 h-3 ${color} rounded-full cursor-pointer hover:scale-150 transition-transform`}
                        style={{
                          left: `calc(50% + ${x}px)`,
                          top: `calc(50% + ${y}px)`,
                          transform: 'translate(-50%, -50%)'
                        }}
                        title={`${vendor.name}: ${vendor.riskScore} (${vendor.riskLevel})`}
                        onClick={() => onVendorClick?.(vendor)}
                      />
                    );
                  })}
                </div>
              </div>
              
              {/* Legend */}
              <div className="absolute bottom-2 left-2 right-2 flex justify-center gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-gray-600 dark:text-gray-400">High</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-600 dark:text-gray-400">Medium</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600 dark:text-gray-400">Low</span>
                </div>
              </div>
            </div>

            {/* Risk Summary */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              <div className="text-center p-2 rounded bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <div className="text-lg font-bold text-red-600 dark:text-red-400">{riskDistribution.critical}</div>
                <div className="text-xs text-red-600 dark:text-red-400">Critical</div>
              </div>
              <div className="text-center p-2 rounded bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{riskDistribution.high}</div>
                <div className="text-xs text-orange-600 dark:text-orange-400">High</div>
              </div>
              <div className="text-center p-2 rounded bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{riskDistribution.medium}</div>
                <div className="text-xs text-yellow-600 dark:text-yellow-400">Medium</div>
              </div>
              <div className="text-center p-2 rounded bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="text-lg font-bold text-green-600 dark:text-green-400">{riskDistribution.low}</div>
                <div className="text-xs text-green-600 dark:text-green-400">Low</div>
              </div>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
              {totalVendors} vendor{totalVendors !== 1 ? 's' : ''} visualized
              {highRiskCount > 0 && (
                <span className="text-red-600 dark:text-red-400 ml-1">
                  • {highRiskCount} require attention
                </span>
              )}
            </div>
          </>
        ) : (
          <div className="h-48 flex flex-col items-center justify-center text-center">
            <Radar className="h-12 w-12 text-gray-400 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">No vendors to visualize</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Add vendors to see them in the radar</p>
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Link to="/vendor-risk-radar" className="block">
            <Button variant="outline" className="w-full">
              <Radar className="h-4 w-4 mr-1.5" />
              Open Full Vendor Risk Radar
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default RadarWidget;
