import { useMemo } from 'react';
import { lineBarAreaDefault, useChartDataLines, useChartDataPalette } from '../theme/inlineUiTokens';

interface ChartData {
  [key: string]: string | number | boolean | undefined;
}

interface UseChartDataOptions {
  data: ChartData[];
  type: 'radar' | 'pie' | 'line' | 'bar' | 'area';
  dataKey?: string;
  xAxisKey?: string;
}

export const useChartData = ({ data, type, dataKey = 'value', xAxisKey = 'name' }: UseChartDataOptions) => {
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    switch (type) {
      case 'radar':
        return data.map(item => ({
          dimension: item[xAxisKey] || item.dimension,
          risk: item.risk || item[dataKey] || 0,
          required: item.required || 0,
          fullMark: item.fullMark || 100
        }));

      case 'pie':
        return data.map(item => ({
          name: item[xAxisKey] || item.name,
          value: item[dataKey] || item.value || 0,
          color: item.color
        }));

      case 'line':
      case 'bar':
      case 'area':
        return data.map(item => ({
          [xAxisKey]: item[xAxisKey] || item.name,
          ...Object.keys(item).reduce((acc, key) => {
            if (key !== xAxisKey && key !== 'name') {
              acc[key] = item[key];
            }
            return acc;
          }, {} as Record<string, string | number | boolean | undefined>)
        }));

      default:
        return data;
    }
  }, [data, type, dataKey, xAxisKey]);

  const chartConfig = useMemo(() => {
    switch (type) {
      case 'radar':
        return {
          lines: [
            { dataKey: 'risk', stroke: useChartDataLines.risk, name: 'Current Risk' },
            { dataKey: 'required', stroke: useChartDataLines.required, name: 'Required Controls' },
          ],
        };

      case 'pie':
        return {
          colors: [...useChartDataPalette],
        };

      case 'line':
        return {
          lines: [{ dataKey: dataKey, stroke: lineBarAreaDefault, name: 'Value' }],
        };

      case 'bar':
        return {
          bars: [{ dataKey: dataKey, fill: lineBarAreaDefault, name: 'Value' }],
        };

      case 'area':
        return {
          areas: [{ dataKey: dataKey, stroke: lineBarAreaDefault, fill: lineBarAreaDefault, name: 'Value' }],
        };

      default:
        return {};
    }
  }, [type, dataKey]);

  return {
    processedData,
    chartConfig
  };
};

