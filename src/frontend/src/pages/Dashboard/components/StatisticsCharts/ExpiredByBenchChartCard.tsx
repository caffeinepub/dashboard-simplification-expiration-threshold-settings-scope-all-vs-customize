import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle } from 'lucide-react';
import type { ChartType } from '../../../../hooks/useDashboardChartType';

interface ExpiredByBenchChartCardProps {
  data: Array<{ benchId: string; benchName: string; components: any[] }>;
  chartType: ChartType;
}

export function ExpiredByBenchChartCard({ data, chartType }: ExpiredByBenchChartCardProps) {
  const chartData = data
    .map((bench) => ({
      name: bench.benchName,
      expired: bench.components.filter((c) => c.status === 'expired').length,
    }))
    .filter((item) => item.expired > 0)
    .sort((a, b) => b.expired - a.expired)
    .slice(0, 10);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Expired Components by Bench
          </CardTitle>
          <CardDescription>Top benches with expired components</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No expired components found
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Expired Components by Bench
        </CardTitle>
        <CardDescription>Top benches with expired components</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          {chartType === 'bar' ? (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="expired" fill="hsl(var(--destructive))" />
            </BarChart>
          ) : (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="expired" stroke="hsl(var(--destructive))" strokeWidth={2} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
