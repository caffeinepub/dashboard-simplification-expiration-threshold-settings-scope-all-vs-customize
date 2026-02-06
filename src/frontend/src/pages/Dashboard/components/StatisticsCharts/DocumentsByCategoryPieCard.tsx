import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { FileText } from 'lucide-react';
import { useI18n } from '../../../../i18n/useI18n';

interface DocumentsByCategoryPieCardProps {
  data: Array<{ document: any; benchName: string }>;
}

const COLORS = {
  Hardware: 'oklch(0.65 0.15 250)',
  Software: 'oklch(0.65 0.15 150)',
  'Other(s)': 'oklch(0.65 0.15 50)',
  Unknown: 'oklch(0.55 0.05 250)',
};

export function DocumentsByCategoryPieCard({ data }: DocumentsByCategoryPieCardProps) {
  const { t } = useI18n();

  const categoryCounts = data.reduce((acc, item) => {
    const category = item.document.category || 'Unknown';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(categoryCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const isEmpty = chartData.length === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {t('charts.documentsByCategory')}
        </CardTitle>
        <CardDescription>{t('charts.documentsByCategoryDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-sm text-muted-foreground">{t('charts.noDocuments')}</p>
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
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.Unknown} />
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
