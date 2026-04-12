import React from 'react';
import { AreaChart as RechartsAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { lineBarAreaDefault } from '../../theme/inlineUiTokens';
import { cn } from '../../utils/cn';

interface AreaChartProps {
  data: Array<{
    [key: string]: string | number;
  }>;
  height?: number;
  width?: string;
  className?: string;
  dataKey?: string;
  xAxisKey?: string;
  areas?: Array<{
    dataKey: string;
    stroke: string;
    fill: string;
    name?: string;
  }>;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
}

const AreaChart: React.FC<AreaChartProps> = ({ 
  data, 
  height = 300, 
  width = "100%", 
  className = "",
  xAxisKey = "name",
  areas = [{ dataKey: "value", stroke: lineBarAreaDefault, fill: lineBarAreaDefault, name: "Value" }],
  showGrid = true,
  showTooltip = true,
  showLegend = true
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
        <RechartsAreaChart data={data}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis dataKey={xAxisKey} />
          <YAxis />
          {showTooltip && <Tooltip />}
          {showLegend && <Legend />}
          {areas.map((area, index) => (
            <Area
              key={index}
              type="monotone"
              dataKey={area.dataKey}
              stackId="1"
              stroke={area.stroke}
              fill={area.fill}
              name={area.name || area.dataKey}
              fillOpacity={0.6}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AreaChart;

