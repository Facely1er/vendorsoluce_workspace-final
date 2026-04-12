import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/Card';
import LazyChart from '../../../../components/charts/LazyChart';
import type { VendorRadar } from '../../../../types/vendorRadar';

interface RadarVisualizationProps {
  vendors: VendorRadar[];
}

const RadarVisualization: React.FC<RadarVisualizationProps> = ({ vendors }) => {
  // Create radar visualization data from vendor portfolio
  const radarData = useMemo(() => {
    if (vendors.length === 0) return [];

    // Calculate average risk by category
    const categoryRisks: Record<string, number[]> = {
      'Critical': [],
      'High': [],
      'Medium': [],
      'Low': []
    };

    vendors.forEach(vendor => {
      const risk = vendor.residualRisk || vendor.inherentRisk || 0;
      if (risk >= 80) categoryRisks['Critical'].push(risk);
      else if (risk >= 60) categoryRisks['High'].push(risk);
      else if (risk >= 40) categoryRisks['Medium'].push(risk);
      else categoryRisks['Low'].push(risk);
    });

    // Calculate averages
    const dimensions = ['Critical', 'High', 'Medium', 'Low'].map(category => {
      const risks = categoryRisks[category];
      const avg = risks.length > 0
        ? Math.round(risks.reduce((sum, r) => sum + r, 0) / risks.length)
        : 0;
      return {
        dimension: category,
        risk: avg,
        required: category === 'Critical' ? 90 : category === 'High' ? 70 : category === 'Medium' ? 50 : 30,
        fullMark: 100
      };
    });

    return dimensions;
  }, [vendors]);

  if (vendors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vendor Risk Radar</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400 text-center py-8">
            Add vendors to see the risk radar visualization
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendor Risk Radar</CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Portfolio risk distribution across risk levels
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <LazyChart
            type="radar"
            data={radarData as unknown as Array<{ [key: string]: string | number }>}
            height={320}
            className="w-full"
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-4 justify-center text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Critical Risk (80-100)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span>High Risk (60-79)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Medium Risk (40-59)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Low Risk (0-39)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RadarVisualization;
