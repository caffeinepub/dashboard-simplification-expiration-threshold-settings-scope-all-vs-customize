import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { AlertTriangle } from 'lucide-react';
import { Status } from '@/backend';

interface CriticalityChartCardProps {
  allBenchComponents: Array<{ benchId: string; benchName: string; agileCode: string; components: any[] }>;
}

export function CriticalityChartCard({ allBenchComponents }: CriticalityChartCardProps) {
  const [filterBench, setFilterBench] = useState<string>('all');

  const chartData = useMemo(() => {
    const filtered =
      filterBench === 'all'
        ? allBenchComponents
        : allBenchComponents.filter((b) => b.benchId === filterBench);

    const statusCounts = {
      ok: 0,
      expiringSoon: 0,
      expired: 0,
    };

    filtered.forEach((benchData) => {
      benchData.components.forEach((comp) => {
        if (comp.status === Status.ok) statusCounts.ok++;
        else if (comp.status === Status.expiringSoon) statusCounts.expiringSoon++;
        else if (comp.status === Status.expired) statusCounts.expired++;
      });
    });

    return [
      { name: 'OK', count: statusCounts.ok, fill: 'hsl(var(--chart-2))' },
      { name: 'Expiring Soon', count: statusCounts.expiringSoon, fill: 'hsl(var(--chart-4))' },
      { name: 'Expired', count: statusCounts.expired, fill: 'hsl(var(--destructive))' },
    ];
  }, [allBenchComponents, filterBench]);

  return (
    <Card className="col-span-2">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Components by Criticality
            </CardTitle>
            <CardDescription>Distribution of component status</CardDescription>
          </div>
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
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            count: {
              label: 'Components',
              color: 'hsl(var(--chart-1))',
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
              <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
