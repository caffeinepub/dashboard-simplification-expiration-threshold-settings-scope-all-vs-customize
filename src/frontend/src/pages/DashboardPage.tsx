import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useNavigate } from '@tanstack/react-router';
import { useGetAllTestBenches, useGetCallerUserProfile, useGetAllBenchComponents, useGetAllDocuments, useUpdateDashboardSectionsOrder } from '../hooks/useQueries';
import { getEffectiveThreshold, computeExpirationStatus } from '../utils/expirationSettings';
import { TestTube2, FileText, Activity, TrendingUp, Plus, AlertTriangle, Download, ArrowUp, ArrowDown, Edit } from 'lucide-react';
import { downloadDocument } from '../utils/download';
import { toast } from 'sonner';
import { ExpiredByBenchChartCard } from './Dashboard/components/StatisticsCharts/ExpiredByBenchChartCard';
import { ExpirationTrendChartCard } from './Dashboard/components/StatisticsCharts/ExpirationTrendChartCard';
import { HealthGaugeCard } from './Dashboard/components/StatisticsCharts/HealthGaugeCard';
import { DocumentsByCategoryPieCard } from './Dashboard/components/StatisticsCharts/DocumentsByCategoryPieCard';
import { ComponentsByStatusPieCard } from './Dashboard/components/StatisticsCharts/ComponentsByStatusPieCard';
import { useDashboardChartType, type ChartType } from '../hooks/useDashboardChartType';
import { useI18n } from '../i18n/useI18n';

const DEFAULT_SECTIONS = ['statistics', 'charts', 'criticalComponents', 'expiringComponents', 'documents', 'quickActions'];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: benches = [], isLoading } = useGetAllTestBenches();
  const { data: profile } = useGetCallerUserProfile();
  const { data: allBenchComponents = [] } = useGetAllBenchComponents();
  const { data: allDocuments = [] } = useGetAllDocuments();
  const updateSectionsOrder = useUpdateDashboardSectionsOrder();
  const { chartType, setChartType } = useDashboardChartType();
  const { t } = useI18n();

  const [isReordering, setIsReordering] = useState(false);
  const [sectionOrder, setSectionOrder] = useState<string[]>(DEFAULT_SECTIONS);

  useEffect(() => {
    if (profile?.dashboardSectionsOrdered && profile.dashboardSectionsOrdered.length > 0) {
      // Merge saved order with default sections to ensure all sections are present
      const savedSections = profile.dashboardSectionsOrdered;
      const missingDefaults = DEFAULT_SECTIONS.filter(section => !savedSections.includes(section));
      setSectionOrder([...savedSections, ...missingDefaults]);
    } else {
      setSectionOrder(DEFAULT_SECTIONS);
    }
  }, [profile]);

  const totalBenches = benches.length;

  const componentsWithStatus = allBenchComponents.flatMap((benchData) =>
    benchData.components.map((comp) => {
      const threshold = getEffectiveThreshold(profile ?? null, benchData.benchId);
      const status = computeExpirationStatus(comp.expirationDate, threshold);
      return {
        componentName: comp.componentName,
        benchName: benchData.benchName,
        agileCode: benchData.agileCode,
        status,
      };
    })
  );

  const criticalComponents = componentsWithStatus.filter((c) => c.status === 'expired');
  const expiringSoonComponents = componentsWithStatus.filter((c) => c.status === 'expiringSoon');

  const handleDownload = async (doc: any) => {
    try {
      await downloadDocument(doc.document.fileReference, doc.document.productDisplayName);
      toast.success(t('dashboard.downloaded'));
    } catch (error: any) {
      console.error('Failed to download document:', error);
      toast.error(error.message || t('dashboard.downloadFailed'));
    }
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...sectionOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
    setSectionOrder(newOrder);
  };

  const handleSaveOrder = async () => {
    try {
      await updateSectionsOrder.mutateAsync(sectionOrder);
      toast.success(t('dashboard.layoutSaved'));
      setIsReordering(false);
    } catch (error: any) {
      console.error('Failed to save layout:', error);
      toast.error(error.message || t('dashboard.layoutSaveFailed'));
    }
  };

  const renderSection = (sectionId: string, index: number) => {
    const canMoveUp = index > 0;
    const canMoveDown = index < sectionOrder.length - 1;

    const reorderControls = isReordering && (
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => moveSection(index, 'up')}
          disabled={!canMoveUp}
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => moveSection(index, 'down')}
          disabled={!canMoveDown}
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
      </div>
    );

    switch (sectionId) {
      case 'statistics':
        return (
          <div key={sectionId} className="space-y-4">
            {isReordering && (
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{t('dashboard.statistics')}</h2>
                {reorderControls}
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('dashboard.totalBenches')}</CardTitle>
                  <TestTube2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalBenches}</div>
                  <p className="text-xs text-muted-foreground">{t('dashboard.activeBenches')}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('dashboard.criticalComponents')}</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">{criticalComponents.length}</div>
                  <p className="text-xs text-muted-foreground">{t('dashboard.expiredComponents')}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('dashboard.expiringSoon')}</CardTitle>
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-500">{expiringSoonComponents.length}</div>
                  <p className="text-xs text-muted-foreground">{t('dashboard.basedOnThreshold')}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('dashboard.documents')}</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{allDocuments.length}</div>
                  <p className="text-xs text-muted-foreground">{t('dashboard.totalDocuments')}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'charts':
        return (
          <div key={sectionId} className="space-y-4">
            <div className="flex items-center justify-between">
              {isReordering ? (
                <>
                  <h2 className="text-lg font-semibold">{t('dashboard.chartsAnalytics')}</h2>
                  {reorderControls}
                </>
              ) : (
                <>
                  <h2 className="text-lg font-semibold">{t('dashboard.chartsAnalytics')}</h2>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="chart-type" className="text-sm">{t('dashboard.chartType')}</Label>
                    <Select value={chartType} onValueChange={(value) => setChartType(value as ChartType)}>
                      <SelectTrigger id="chart-type" className="w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bar">{t('dashboard.bar')}</SelectItem>
                        <SelectItem value="Line">{t('dashboard.line')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <ExpiredByBenchChartCard data={allBenchComponents} profile={profile ?? null} chartType={chartType} />
              <ExpirationTrendChartCard data={allBenchComponents} chartType={chartType} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <DocumentsByCategoryPieCard data={allDocuments} />
              <ComponentsByStatusPieCard data={allBenchComponents} profile={profile ?? null} />
            </div>
            <HealthGaugeCard data={allBenchComponents} profile={profile ?? null} />
          </div>
        );

      case 'criticalComponents':
        return (
          <Card key={sectionId}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    {t('dashboard.criticalComponentsTitle')}
                  </CardTitle>
                  <CardDescription>{t('dashboard.criticalComponentsDesc')}</CardDescription>
                </div>
                {reorderControls}
              </div>
            </CardHeader>
            <CardContent>
              {criticalComponents.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('dashboard.noCritical')}</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('dashboard.equipmentName')}</TableHead>
                      <TableHead>{t('dashboard.bench')}</TableHead>
                      <TableHead>{t('dashboard.agileNumber')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {criticalComponents.map((comp, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{comp.componentName}</TableCell>
                        <TableCell>{comp.benchName}</TableCell>
                        <TableCell>{comp.agileCode}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        );

      case 'expiringComponents':
        return (
          <Card key={sectionId}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-orange-500" />
                    {t('dashboard.expiringSoonTitle')}
                  </CardTitle>
                  <CardDescription>{t('dashboard.expiringSoonDesc')}</CardDescription>
                </div>
                {reorderControls}
              </div>
            </CardHeader>
            <CardContent>
              {expiringSoonComponents.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('dashboard.noExpiring')}</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('dashboard.equipmentName')}</TableHead>
                      <TableHead>{t('dashboard.bench')}</TableHead>
                      <TableHead>{t('dashboard.agileNumber')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expiringSoonComponents.map((comp, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{comp.componentName}</TableCell>
                        <TableCell>{comp.benchName}</TableCell>
                        <TableCell>{comp.agileCode}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        );

      case 'documents':
        return (
          <Card key={sectionId}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {t('dashboard.documentsTitle')}
                  </CardTitle>
                  <CardDescription>{t('dashboard.documentsDesc')}</CardDescription>
                </div>
                {reorderControls}
              </div>
            </CardHeader>
            <CardContent>
              {allDocuments.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t('dashboard.noDocuments')}</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('dashboard.documentName')}</TableHead>
                      <TableHead>{t('dashboard.category')}</TableHead>
                      <TableHead>{t('dashboard.version')}</TableHead>
                      <TableHead>{t('dashboard.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allDocuments.slice(0, 10).map((doc, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{doc.document.productDisplayName}</TableCell>
                        <TableCell>{doc.document.category}</TableCell>
                        <TableCell>{doc.document.documentVersion || 'N/A'}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(doc)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        );

      case 'quickActions':
        return (
          <Card key={sectionId}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    {t('dashboard.quickActions')}
                  </CardTitle>
                  <CardDescription>{t('dashboard.quickActionsDesc')}</CardDescription>
                </div>
                {reorderControls}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => navigate({ to: '/benches/new' })}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('dashboard.newBench')}
                </Button>
                <Button variant="outline" onClick={() => navigate({ to: '/benches' })}>
                  {t('dashboard.viewAllBenches')}
                </Button>
                <Button variant="outline" onClick={() => navigate({ to: '/profile' })}>
                  {t('dashboard.managePreferences')}
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('dashboard.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t('dashboard.title')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('dashboard.description')}
          </p>
        </div>
        <div className="flex gap-2">
          {isReordering ? (
            <>
              <Button variant="outline" onClick={() => setIsReordering(false)}>
                {t('dashboard.cancel')}
              </Button>
              <Button onClick={handleSaveOrder}>
                {t('dashboard.saveLayout')}
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => setIsReordering(true)}>
              <Edit className="h-4 w-4 mr-2" />
              {t('dashboard.reorderLayout')}
            </Button>
          )}
        </div>
      </div>

      {sectionOrder.map((sectionId, index) => renderSection(sectionId, index))}
    </div>
  );
}
