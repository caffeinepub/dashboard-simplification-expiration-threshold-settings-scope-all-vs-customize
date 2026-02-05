import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import type { ChartType } from '../../../../hooks/useDashboardChartType';

interface ExpirationTrendChartCardProps {
  data: Array<{ benchId: string; benchName: string; components: any[] }>;
  chartType: ChartType;
}

export function ExpirationTrendChartCard({ data, chartType }: ExpirationTrendChartCardProps) {
  const allComponents = data.flatMap((bench) => bench.components);

  const monthBuckets: Record<string, number> = {};

  allComponents.forEach((comp) => {
    if (!comp.expirationDate) return;
    try {
      const date = new Date(comp.expirationDate);
      if (isNaN(date.getTime())) return;
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthBuckets[monthKey] = (monthBuckets[monthKey] || 0) + 1;
    } catch {
      // Skip invalid dates
    }
  });

  const chartData = Object.entries(monthBuckets)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Expiration Trend Over Time
          </CardTitle>
          <CardDescription>Component expirations by month</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No expiration data available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Expiration Trend Over Time
        </CardTitle>
        <CardDescription>Component expirations by month</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          {chartType === 'bar' ? (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--primary))" />
            </BarChart>
          ) : (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
