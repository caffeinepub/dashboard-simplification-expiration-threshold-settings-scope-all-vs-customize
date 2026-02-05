import { useState, useEffect } from 'react';

export type ChartType = 'bar' | 'line';

const STORAGE_KEY = 'dashboard-chart-type';

export function useDashboardChartType() {
  const [chartType, setChartType] = useState<ChartType>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return (stored === 'bar' || stored === 'line') ? stored : 'bar';
    } catch {
      return 'bar';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, chartType);
    } catch (error) {
      console.error('Failed to save chart type preference:', error);
    }
  }, [chartType]);

  return { chartType, setChartType };
}
