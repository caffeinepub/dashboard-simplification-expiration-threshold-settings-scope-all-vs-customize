import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TestTube2, FileText, AlertTriangle, TrendingUp } from 'lucide-react';
import { DraggableList } from '@/components/dnd/DraggableList';
import { useDraggableOrder } from '@/components/dnd/useDraggableOrder';
import { CriticalityChartCard } from './StatisticsCharts/CriticalityChartCard';
import { DeadlineChartCard } from './StatisticsCharts/DeadlineChartCard';
import type { UserProfile } from '../../../backend';

interface StatisticsSectionProps {
  totalBenches: number;
  criticalCount: number;
  expiringSoonCount: number;
  documentsCount: number;
  allBenchComponents: Array<{ benchId: string; benchName: string; agileCode: string; serialNumber: string; components: any[] }>;
  profile: UserProfile | null;
}

interface StatCard {
  id: string;
  type: 'stat' | 'chart';
  component: React.ReactNode;
}

const STORAGE_KEY = 'statistics-section-order';

export function StatisticsSection({
  totalBenches,
  criticalCount,
  expiringSoonCount,
  documentsCount,
  allBenchComponents,
  profile,
}: StatisticsSectionProps) {
  const defaultCards: StatCard[] = [
    {
      id: 'total-benches',
      type: 'stat',
      component: (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Test Benches</CardTitle>
            <TestTube2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBenches}</div>
            <p className="text-xs text-muted-foreground">Active test benches</p>
          </CardContent>
        </Card>
      ),
    },
    {
      id: 'critical-components',
      type: 'stat',
      component: (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Components</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{criticalCount}</div>
            <p className="text-xs text-muted-foreground">Expired components</p>
          </CardContent>
        </Card>
      ),
    },
    {
      id: 'expiring-soon',
      type: 'stat',
      component: (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{expiringSoonCount}</div>
            <p className="text-xs text-muted-foreground">Based on your threshold settings</p>
          </CardContent>
        </Card>
      ),
    },
    {
      id: 'documents',
      type: 'stat',
      component: (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documentsCount}</div>
            <p className="text-xs text-muted-foreground">Total documents</p>
          </CardContent>
        </Card>
      ),
    },
    {
      id: 'criticality-chart',
      type: 'chart',
      component: <CriticalityChartCard data={allBenchComponents} profile={profile} />,
    },
    {
      id: 'deadline-chart',
      type: 'chart',
      component: <DeadlineChartCard data={allBenchComponents} />,
    },
  ];

  const [orderedCards, setOrderedCards] = useState<StatCard[]>(defaultCards);

  useEffect(() => {
    const savedOrder = localStorage.getItem(STORAGE_KEY);
    if (savedOrder) {
      try {
        const orderIds: string[] = JSON.parse(savedOrder);
        const reordered = orderIds
          .map((id) => defaultCards.find((card) => card.id === id))
          .filter((card): card is StatCard => card !== undefined);
        
        // Add any new cards that weren't in saved order
        const existingIds = new Set(reordered.map((c) => c.id));
        const newCards = defaultCards.filter((card) => !existingIds.has(card.id));
        
        setOrderedCards([...reordered, ...newCards]);
      } catch (error) {
        console.error('Failed to parse saved order:', error);
      }
    }
  }, []);

  const { items, draggedIndex, handleDragStart, handleDragOver, handleDragEnd, resetOrder } =
    useDraggableOrder(orderedCards);

  useEffect(() => {
    resetOrder(orderedCards);
  }, [orderedCards]);

  const handleReorder = (newItems: StatCard[]) => {
    setOrderedCards(newItems);
    const orderIds = newItems.map((card) => card.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orderIds));
  };

  useEffect(() => {
    if (draggedIndex === null) {
      handleReorder(items);
    }
  }, [draggedIndex, items]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Statistics</h2>
        <p className="text-sm text-muted-foreground">Drag to reorder</p>
      </div>
      <DraggableList
        items={items}
        renderItem={(card) => card.component}
        onReorder={handleReorder}
        draggedIndex={draggedIndex}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      />
    </div>
  );
}
