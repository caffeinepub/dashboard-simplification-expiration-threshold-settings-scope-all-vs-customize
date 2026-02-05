import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Activity } from 'lucide-react';
import { getEffectiveThreshold, computeExpirationStatus } from '../../../../utils/expirationSettings';
import type { UserProfile } from '../../../../backend';

interface ComponentsByStatusPieCardProps {
  data: Array<{ benchId: string; benchName: string; agileCode: string; serialNumber: string; components: any[] }>;
  profile: UserProfile | null;
}

const COLORS = {
  ok: 'oklch(0.65 0.15 150)',
  expiringSoon: 'oklch(0.70 0.15 50)',
  expired: 'oklch(0.60 0.15 25)',
};

export function ComponentsByStatusPieCard({ data, profile }: ComponentsByStatusPieCardProps) {
  const statusCounts = { ok: 0, expiringSoon: 0, expired: 0 };

  data.forEach((benchData) => {
    const threshold = getEffectiveThreshold(profile, benchData.benchId);
    benchData.components.forEach((comp) => {
      const status = computeExpirationStatus(comp.expirationDate, threshold);
      statusCounts[status]++;
    });
  });

  const chartData = [
    { name: 'OK', value: statusCounts.ok },
    { name: 'Expiring Soon', value: statusCounts.expiringSoon },
    { name: 'Expired', value: statusCounts.expired },
  ].filter((item) => item.value > 0);

  const isEmpty = chartData.length === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Components by Status
        </CardTitle>
        <CardDescription>Health status distribution across all components</CardDescription>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">No components available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="oklch(0.65 0.15 250)"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.name === 'OK'
                        ? COLORS.ok
                        : entry.name === 'Expiring Soon'
                        ? COLORS.expiringSoon
                        : COLORS.expired
                    }
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
