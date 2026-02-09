import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, GripVertical, Download } from 'lucide-react';
import { useI18n } from '../i18n/useI18n';
import { useGetCallerUserProfile, useUpdateDashboardSectionsOrder, useDashboardExportData } from '../hooks/useQueries';
import { StatisticsSection } from './Dashboard/components/StatisticsSection';
import { MovementFlowSection } from './Dashboard/components/MovementFlowSection';
import { ExpiringComponentsByBenchTableSection } from './Dashboard/components/ExpiringComponentsByBenchTableSection';
import { downloadDocument } from '../utils/download';
import { toast } from 'sonner';
import type { Component, Document } from '../backend';

export function DashboardPage() {
  const { t } = useI18n();
  const { data: profile } = useGetCallerUserProfile();
  const updateOrder = useUpdateDashboardSectionsOrder();
  const { data: exportData, isLoading, isFetched } = useDashboardExportData();

  const [isReordering, setIsReordering] = useState(false);
  const [draggedSection, setDraggedSection] = useState<string | null>(null);
  const [localOrder, setLocalOrder] = useState<string[]>([]);

  const defaultSections = [
    'statistics',
    'expiringComponentsTable',
    'movementFlow',
    'documents',
    'benches',
    'quickActions',
  ];

  useEffect(() => {
    if (profile?.dashboardSectionsOrdered) {
      setLocalOrder(profile.dashboardSectionsOrdered);
    } else {
      setLocalOrder(defaultSections);
    }
  }, [profile]);

  const handleSaveLayout = async () => {
    try {
      await updateOrder.mutateAsync(localOrder);
      toast.success(t('dashboard.layoutSaved'));
      setIsReordering(false);
    } catch (error) {
      console.error('Failed to save layout:', error);
      toast.error(t('dashboard.layoutSaveFailed'));
    }
  };

  const handleDragStart = (sectionId: string) => {
    setDraggedSection(sectionId);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedSection || draggedSection === targetId) return;

    const newOrder = [...localOrder];
    const draggedIndex = newOrder.indexOf(draggedSection);
    const targetIndex = newOrder.indexOf(targetId);

    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedSection);

    setLocalOrder(newOrder);
  };

  const handleDragEnd = () => {
    setDraggedSection(null);
  };

  const handleDownloadDocument = async (doc: Document) => {
    try {
      await downloadDocument(doc);
      toast.success(t('dashboard.downloaded'));
    } catch (error) {
      console.error('Download failed:', error);
      toast.error(t('dashboard.downloadFailed'));
    }
  };

  const getBenchNames = (benchIds: string[]): string => {
    if (!exportData || benchIds.length === 0) return '-';
    const names = benchIds
      .map((id) => exportData.benches.find((b) => b.id === id)?.name)
      .filter(Boolean);
    return names.length > 0 ? names.join(', ') : '-';
  };

  // Show loading spinner only on initial load
  if (isLoading && !isFetched) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Extract data from exportData
  const benches = exportData?.benches || [];
  const allDocuments = exportData?.allDocuments || [];
  const allHistory = exportData?.perBenchHistoryEntries || [];
  
  const allComponents: Component[] = [];
  if (exportData?.perBenchComponents) {
    exportData.perBenchComponents.forEach(([_, comps]) => {
      allComponents.push(...comps);
    });
  }

  const sections: Record<string, React.ReactNode> = {
    statistics: (
      <StatisticsSection
        key="statistics"
        benches={benches}
        allComponents={allComponents}
        allDocuments={allDocuments}
        profile={profile || null}
      />
    ),
    expiringComponentsTable: (
      <ExpiringComponentsByBenchTableSection
        key="expiringComponentsTable"
        benches={benches}
        allComponents={allComponents}
        profile={profile || null}
      />
    ),
    movementFlow: (
      <MovementFlowSection
        key="movementFlow"
        benches={benches}
        history={allHistory}
      />
    ),
    documents: (
      <Card key="documents">
        <CardHeader>
          <CardTitle>{t('dashboard.documentsTitle')}</CardTitle>
          <CardDescription>{t('dashboard.documentsDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {allDocuments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {t('dashboard.noDocuments')}
            </p>
          ) : (
            <div className="space-y-3">
              {allDocuments.slice(0, 10).map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{doc.productDisplayName}</p>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span>{t('dashboard.category')}: {doc.category}</span>
                      <span>•</span>
                      <span>{t('dashboard.documentVersion')}: {doc.documentVersion || '-'}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('dashboard.assignedBenches')}: {getBenchNames(doc.associatedBenches)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownloadDocument(doc)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    ),
    benches: (
      <Card key="benches">
        <CardHeader>
          <CardTitle>{t('dashboard.totalBenches')}</CardTitle>
          <CardDescription>{t('dashboard.activeBenches')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{benches.length}</div>
        </CardContent>
      </Card>
    ),
    quickActions: (
      <Card key="quickActions">
        <CardHeader>
          <CardTitle>{t('dashboard.quickActions')}</CardTitle>
          <CardDescription>{t('dashboard.quickActionsDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button className="w-full" onClick={() => (window.location.href = '/benches/new')}>
            {t('dashboard.newBench')}
          </Button>
          <Button variant="outline" className="w-full" onClick={() => (window.location.href = '/benches')}>
            {t('dashboard.viewAllBenches')}
          </Button>
        </CardContent>
      </Card>
    ),
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('dashboard.title')}</h1>
          <p className="text-muted-foreground">{t('dashboard.subtitle')}</p>
        </div>
        <Button
          variant={isReordering ? 'default' : 'outline'}
          onClick={() => {
            if (isReordering) {
              handleSaveLayout();
            } else {
              setIsReordering(true);
            }
          }}
          disabled={updateOrder.isPending}
        >
          {updateOrder.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('common.loading')}
            </>
          ) : isReordering ? (
            t('dashboard.saveLayout')
          ) : (
            t('dashboard.reorderLayout')
          )}
        </Button>
      </div>

      {isReordering && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{t('dashboard.description')}</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {localOrder.map((sectionId) => {
          const section = sections[sectionId];
          if (!section) return null;

          if (isReordering) {
            return (
              <div
                key={sectionId}
                draggable
                onDragStart={() => handleDragStart(sectionId)}
                onDragOver={(e) => handleDragOver(e, sectionId)}
                onDragEnd={handleDragEnd}
                className="relative cursor-move"
              >
                <div className="absolute left-2 top-2 z-10">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <GripVertical className="h-3 w-3" />
                    {t(`dashboard.${sectionId}` as any) || sectionId}
                  </Badge>
                </div>
                <div className="pointer-events-none opacity-75">{section}</div>
              </div>
            );
          }

          return section;
        })}
      </div>

      {isReordering && (
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsReordering(false)}>
            {t('dashboard.cancel')}
          </Button>
          <Button onClick={handleSaveLayout} disabled={updateOrder.isPending}>
            {updateOrder.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('common.loading')}
              </>
            ) : (
              t('dashboard.saveLayout')
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
