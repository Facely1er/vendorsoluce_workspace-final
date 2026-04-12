import React from 'react';
import { Card, CardContent } from '../../../../components/ui/Card';
import { AlertTriangle, Shield, TrendingUp, Database, Target } from 'lucide-react';
import type { PortfolioStats } from '../../../../types/vendorRadar';

interface StatsOverviewProps {
  stats: PortfolioStats;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  const statCards = [
    {
      label: 'TOTAL VENDORS',
      value: stats.total > 0 ? stats.total : '--',
      icon: Database,
      color: 'text-blue-600',
      barColor: 'bg-blue-500',
      showBar: stats.total > 0
    },
    {
      label: 'CRITICAL CATEGORY',
      value: stats.criticalCategory > 0 ? stats.criticalCategory : '--',
      icon: Target,
      color: 'text-red-600',
      barColor: 'bg-red-500',
      showBar: stats.criticalCategory > 0
    },
    {
      label: 'CRITICAL RISK',
      value: stats.criticalRisk > 0 ? stats.criticalRisk : '--',
      icon: AlertTriangle,
      color: 'text-red-600',
      barColor: 'bg-red-500',
      showBar: stats.criticalRisk > 0
    },
    {
      label: 'HIGH RISK',
      value: stats.highRisk > 0 ? stats.highRisk : '--',
      icon: TrendingUp,
      color: 'text-orange-600',
      barColor: 'bg-orange-500',
      showBar: stats.highRisk > 0
    },
    {
      label: 'WITH PII/PHI',
      value: stats.sensitiveData > 0 ? stats.sensitiveData : '--',
      icon: Shield,
      color: 'text-purple-600',
      barColor: 'bg-orange-500',
      showBar: stats.sensitiveData > 0
    },
    {
      label: 'AVG INHERENT RISK',
      value: stats.avgInherentRisk > 0 ? `${stats.avgInherentRisk}` : '--',
      icon: TrendingUp,
      color: 'text-gray-600',
      barColor: 'bg-gray-500',
      showBar: stats.avgInherentRisk > 0
    }
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Quick Stats Overview</h2>
        <span className="text-gray-500 dark:text-gray-400 cursor-help" title="Quick statistics overview">
          ℹ️
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="mb-2 flex items-center gap-2">
                  <IconComponent className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {stat.label}
                  </p>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {stat.value}
                </div>
                {stat.showBar && (
                  <div className={`h-1 ${stat.barColor} rounded-full`} style={{ width: '100%' }}></div>
                )}
                {!stat.showBar && (
                  <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default StatsOverview;
