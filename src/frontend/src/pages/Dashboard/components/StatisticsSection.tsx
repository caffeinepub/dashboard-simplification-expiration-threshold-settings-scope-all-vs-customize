import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDraggableOrder } from '../../../components/dnd/useDraggableOrder';
import { DraggableList } from '../../../components/dnd/DraggableList';
import { CriticalityChartCard } from './StatisticsCharts/CriticalityChartCard';
import { DeadlineChartCard } from './StatisticsCharts/DeadlineChartCard';
import { ExpiredByBenchChartCard } from './StatisticsCharts/ExpiredByBenchChartCard';
import { ExpirationTrendChartCard } from './StatisticsCharts/ExpirationTrendChartCard';
import { HealthGaugeCard } from './StatisticsCharts/HealthGaugeCard';
import { DocumentsByCategoryPieCard } from './StatisticsCharts/DocumentsByCategoryPieCard';
import { ComponentsByStatusPieCard } from './StatisticsCharts/ComponentsByStatusPieCard';
import { useI18n } from '../../../i18n/useI18n';
import { useDashboardChartType } from '../../../hooks/useDashboardChartType';
import type { UserProfile, TestBench, Component, Document } from '../../../backend';

interface StatisticsSectionProps {
  benches: TestBench[];
  allComponents: Component[];
  allDocuments: Document[];
  profile: UserProfile | null;
}

export function StatisticsSection({ benches, allComponents, allDocuments, profile }: StatisticsSectionProps) {
  const { t } = useI18n();
  const { chartType } = useDashboardChartType();

  const defaultOrder = [
    { id: 'healthGauge' },
    { id: 'componentsByStatus' },
    { id: 'documentsByCategory' },
    { id: 'criticalityChart' },
    { id: 'deadlineChart' },
    { id: 'expiredByBench' },
    { id: 'expirationTrend' },
  ];

  const { items, draggedIndex, handleDragStart, handleDragOver, handleDragEnd, resetOrder } = useDraggableOrder(defaultOrder);

  // Prepare data for charts
  const benchData = benches.map((bench) => ({
    benchId: bench.id,
    benchName: bench.name,
    agileCode: bench.agileCode,
    serialNumber: bench.serialNumber,
    components: allComponents.filter((c) => c.associatedBenchId === bench.id),
  }));

  const chartComponents: Record<string, React.ReactNode> = {
    healthGauge: <HealthGaugeCard data={benchData} profile={profile} />,
    componentsByStatus: <ComponentsByStatusPieCard data={benchData} profile={profile} />,
    documentsByCategory: <DocumentsByCategoryPieCard data={allDocuments} />,
    criticalityChart: <CriticalityChartCard data={benchData} profile={profile} />,
    deadlineChart: <DeadlineChartCard data={benchData} />,
    expiredByBench: <ExpiredByBenchChartCard data={benchData} profile={profile} chartType={chartType} />,
    expirationTrend: <ExpirationTrendChartCard data={benchData} chartType={chartType} />,
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('statistics.title')}</CardTitle>
        <CardDescription>{t('statistics.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <DraggableList
          items={items}
          renderItem={(item) => chartComponents[item.id || ''] || null}
          onReorder={resetOrder}
          draggedIndex={draggedIndex}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        />
      </CardContent>
    </Card>
  );
}
