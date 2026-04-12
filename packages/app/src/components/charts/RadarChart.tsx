import React from 'react';
import { RadarChart as RechartsRadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts';
import { chartStrokes } from '../../theme/inlineUiTokens';
import { cn } from '../../utils/cn';

interface RadarChartProps {
  data: Array<{
    dimension: string;
    risk: number;
    required: number;
    fullMark: number;
  }>;
  height?: number;
  width?: string;
  className?: string;
}

const RadarChart: React.FC<RadarChartProps> = ({ 
  data, 
  height = 300, 
  width = "100%", 
  className = "" 
}) => {
  return (
    <div
      className={cn(className, (!width || width === '100%') && 'w-full')}
      style={{
        height: `${height}px`,
        ...(width && width !== '100%' ? { width } : {}),
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 10 }} />
          <PolarRadiusAxis
            angle={0}
            domain={[0, 100]}
            tick={{ fontSize: 8 }}
          />
          <Radar
            name="Current Risk"
            dataKey="risk"
            stroke={chartStrokes.red}
            fill={chartStrokes.red}
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Radar
            name="Required Controls"
            dataKey="required"
            stroke={chartStrokes.green}
            fill={chartStrokes.green}
            fillOpacity={0.1}
            strokeWidth={2}
          />
          <Legend />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RadarChart;

