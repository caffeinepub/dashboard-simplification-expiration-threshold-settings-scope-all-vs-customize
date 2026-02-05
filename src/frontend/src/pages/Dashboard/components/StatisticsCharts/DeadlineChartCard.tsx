import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Calendar } from 'lucide-react';

interface DeadlineChartCardProps {
  allBenchComponents: Array<{ benchId: string; benchName: string; agileCode: string; components: any[] }>;
}

export function DeadlineChartCard({ allBenchComponents }: DeadlineChartCardProps) {
  const [filterBench, setFilterBench] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('6months');

  const chartData = useMemo(() => {
    const filtered =
      filterBench === 'all'
        ? allBenchComponents
        : allBenchComponents.filter((b) => b.benchId === filterBench);

    const now = new Date();
    const buckets: Record<string, number> = {};

    // Define time buckets based on range
    const ranges =
      timeRange === '3months'
        ? ['Overdue', '0-1 month', '1-2 months', '2-3 months', '3+ months']
        : timeRange === '6months'
        ? ['Overdue', '0-2 months', '2-4 months', '4-6 months', '6+ months']
        : ['Overdue', '0-6 months', '6-12 months', '12+ months'];

    ranges.forEach((range) => {
      buckets[range] = 0;
    });

    filtered.forEach((benchData) => {
      benchData.components.forEach((comp) => {
        try {
          const expirationDate = new Date(comp.expirationDate);
          const diffMs = expirationDate.getTime() - now.getTime();
          const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

          if (timeRange === '3months') {
            if (diffDays < 0) buckets['Overdue']++;
            else if (diffDays <= 30) buckets['0-1 month']++;
            else if (diffDays <= 60) buckets['1-2 months']++;
            else if (diffDays <= 90) buckets['2-3 months']++;
            else buckets['3+ months']++;
          } else if (timeRange === '6months') {
            if (diffDays < 0) buckets['Overdue']++;
            else if (diffDays <= 60) buckets['0-2 months']++;
            else if (diffDays <= 120) buckets['2-4 months']++;
            else if (diffDays <= 180) buckets['4-6 months']++;
            else buckets['6+ months']++;
          } else {
            if (diffDays < 0) buckets['Overdue']++;
            else if (diffDays <= 180) buckets['0-6 months']++;
            else if (diffDays <= 365) buckets['6-12 months']++;
            else buckets['12+ months']++;
          }
        } catch (error) {
          // Skip invalid dates
        }
      });
    });

    return Object.entries(buckets).map(([name, count]) => ({
      name,
      count,
      fill: name === 'Overdue' ? 'hsl(var(--destructive))' : 'hsl(var(--chart-3))',
    }));
  }, [allBenchComponents, filterBench, timeRange]);

  return (
    <Card className="col-span-2">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Components by Deadline
            </CardTitle>
            <CardDescription>Distribution by expiration date</CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3months">3 Months</SelectItem>
                <SelectItem value="6months">6 Months</SelectItem>
                <SelectItem value="12months">12 Months</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterBench} onValueChange={setFilterBench}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by bench" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Benches</SelectItem>
                {allBenchComponents.map((bench) => (
                  <SelectItem key={bench.benchId} value={bench.benchId}>
                    {bench.benchName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            count: {
              label: 'Components',
              color: 'hsl(var(--chart-3))',
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="count" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
