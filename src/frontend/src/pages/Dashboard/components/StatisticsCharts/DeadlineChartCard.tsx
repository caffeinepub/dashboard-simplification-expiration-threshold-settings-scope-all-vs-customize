import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Calendar } from 'lucide-react';
import { useI18n } from '../../../../i18n/useI18n';

interface DeadlineChartCardProps {
  data: Array<{ benchId: string; benchName: string; agileCode: string; serialNumber: string; components: any[] }>;
}

export function DeadlineChartCard({ data }: DeadlineChartCardProps) {
  const { t } = useI18n();

  // Group components by expiration date ranges
  const ranges = {
    'Past': 0,
    '0-30 days': 0,
    '31-90 days': 0,
    '91-180 days': 0,
    '180+ days': 0,
  };

  const now = new Date();

  data.forEach((benchData) => {
    benchData.components.forEach((comp) => {
      if (comp.expirationDate) {
        const expDate = new Date(comp.expirationDate);
        const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
          ranges['Past']++;
        } else if (diffDays <= 30) {
          ranges['0-30 days']++;
        } else if (diffDays <= 90) {
          ranges['31-90 days']++;
        } else if (diffDays <= 180) {
          ranges['91-180 days']++;
        } else {
          ranges['180+ days']++;
        }
      }
    });
  });

  const chartData = Object.entries(ranges).map(([range, count]) => ({
    range,
    count,
  }));

  const isEmpty = chartData.every((item) => item.count === 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {t('charts.deadlineChart')}
        </CardTitle>
        <CardDescription>{t('charts.deadlineChartDesc')}</CardDescription>
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
              <XAxis dataKey="range" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
              />
              <Legend />
              <Bar dataKey="count" fill="oklch(0.65 0.15 250)" name={t('charts.count')} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
