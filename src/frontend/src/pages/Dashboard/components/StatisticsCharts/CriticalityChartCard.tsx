import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AlertCircle } from 'lucide-react';
import { getEffectiveThreshold, computeExpirationStatus } from '../../../../utils/expirationSettings';
import type { UserProfile } from '../../../../backend';
import { useI18n } from '../../../../i18n/useI18n';

interface CriticalityChartCardProps {
  data: Array<{ benchId: string; benchName: string; agileCode: string; serialNumber: string; components: any[] }>;
  profile: UserProfile | null;
}

export function CriticalityChartCard({ data, profile }: CriticalityChartCardProps) {
  const { t } = useI18n();

  const chartData = data.map((benchData) => {
    const threshold = getEffectiveThreshold(profile, benchData.benchId);
    const statusCounts = { ok: 0, expiringSoon: 0, expired: 0 };

    benchData.components.forEach((comp) => {
      const status = computeExpirationStatus(comp.expirationDate, threshold);
      statusCounts[status]++;
    });

    return {
      name: benchData.benchName,
      [t('charts.ok')]: statusCounts.ok,
      [t('charts.expiringSoon')]: statusCounts.expiringSoon,
      [t('charts.expired')]: statusCounts.expired,
    };
  });

  const isEmpty = chartData.every((item) => item[t('charts.ok')] === 0 && item[t('charts.expiringSoon')] === 0 && item[t('charts.expired')] === 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {t('charts.criticalityChart')}
        </CardTitle>
        <CardDescription>{t('charts.criticalityChartDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">{t('charts.noData')}</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
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
              <Bar dataKey={t('charts.ok')} fill="oklch(0.65 0.15 150)" />
              <Bar dataKey={t('charts.expiringSoon')} fill="oklch(0.70 0.15 50)" />
              <Bar dataKey={t('charts.expired')} fill="oklch(0.60 0.15 25)" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
