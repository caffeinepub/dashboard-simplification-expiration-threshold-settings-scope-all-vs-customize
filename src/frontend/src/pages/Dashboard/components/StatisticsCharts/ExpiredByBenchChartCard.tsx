import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AlertTriangle } from 'lucide-react';
import { getEffectiveThreshold, computeExpirationStatus } from '../../../../utils/expirationSettings';
import type { UserProfile } from '../../../../backend';
import { useI18n } from '../../../../i18n/useI18n';

interface ExpiredByBenchChartCardProps {
  data: Array<{ benchId: string; benchName: string; agileCode: string; serialNumber: string; components: any[] }>;
  profile: UserProfile | null;
  chartType: 'Bar' | 'Line';
}

export function ExpiredByBenchChartCard({ data, profile, chartType }: ExpiredByBenchChartCardProps) {
  const { t } = useI18n();

  const chartData = data
    .map((benchData) => {
      const threshold = getEffectiveThreshold(profile, benchData.benchId);
      const expiredCount = benchData.components.filter((comp) => {
        const status = computeExpirationStatus(comp.expirationDate, threshold);
        return status === 'expired';
      }).length;

      return {
        name: benchData.benchName,
        expired: expiredCount,
      };
    })
    .filter((item) => item.expired > 0);

  const isEmpty = chartData.length === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          {t('charts.expiredByBench')}
        </CardTitle>
        <CardDescription>{t('charts.expiredByBenchDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">{t('charts.noData')}</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            {chartType === 'Bar' ? (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                  }}
                />
                <Legend />
                <Bar dataKey="expired" fill="oklch(0.60 0.15 25)" name={t('charts.expired')} />
              </BarChart>
            ) : (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="expired" stroke="oklch(0.60 0.15 25)" name={t('charts.expired')} />
              </LineChart>
            )}
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
