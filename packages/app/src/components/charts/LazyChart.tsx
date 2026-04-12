import React, { Suspense } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';
import { lazyWithRetry } from '../../utils/lazyWithRetry';

// Lazy load chart components with retry logic
const RadarChart = lazyWithRetry(() => import('./RadarChart'));
const PieChart = lazyWithRetry(() => import('./PieChart'));
const LineChart = lazyWithRetry(() => import('./LineChart'));
const BarChart = lazyWithRetry(() => import('./BarChart'));
const AreaChart = lazyWithRetry(() => import('./AreaChart'));

interface ChartData {
  [key: string]: string | number;
}

interface LazyChartProps {
  type: 'radar' | 'pie' | 'line' | 'bar' | 'area';
  data: ChartData[];
  title?: string;
  height?: number;
  width?: string;
  className?: string;
  [key: string]: string | number | boolean | undefined;
}

const ChartSkeleton: React.FC<{ height?: number }> = ({ height = 300 }) => (
  <div className="w-full" style={{ height: `${height}px` }}>
    <Skeleton className="w-full h-full rounded-lg" />
  </div>
);

const LazyChart: React.FC<LazyChartProps> = ({ 
  type, 
  data, 
  title, 
  height = 300, 
  width = "100%", 
  className = "",
  ...props 
}) => {
  const renderChart = () => {
    switch (type) {
      case 'radar':
        return <RadarChart data={data} height={height} width={width} {...props} />;
      case 'pie':
        return <PieChart data={data} height={height} width={width} {...props} />;
      case 'line':
        return <LineChart data={data} height={height} width={width} {...props} />;
      case 'bar':
        return <BarChart data={data} height={height} width={width} {...props} />;
      case 'area':
        return <AreaChart data={data} height={height} width={width} {...props} />;
      default:
        return <div>Unsupported chart type: {type}</div>;
    }
  };

  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <Suspense fallback={<ChartSkeleton height={height} />}>
          {renderChart()}
        </Suspense>
      </CardContent>
    </Card>
  );
};

export default LazyChart;

