import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Pencil, Trash2, ExternalLink, AlertCircle } from 'lucide-react';
import { useGetTestBench, useRemoveTestBench, useGetBenchComponents, useSetBenchComponents, useGetCallerUserProfile, useGetBenchHistory } from '../../hooks/useQueries';
import { BenchComponentsTableEditor } from './components/BenchComponentsTableEditor';
import { BenchDocumentsEditor } from './components/BenchDocumentsEditor';
import { BenchHistoryList } from './components/BenchHistoryList';
import { EditBenchModal } from './components/EditBenchModal';
import { DuplicateComponentDialog } from './components/DuplicateComponentDialog';
import { BenchPhoto } from './components/BenchPhoto';
import { getEffectiveThreshold } from '../../utils/expirationSettings';
import { toast } from 'sonner';
import type { Component } from '../../backend';
import { useI18n } from '../../i18n/useI18n';

export function BenchDetailPage() {
  const { t } = useI18n();
  const { benchId } = useParams({ from: '/benches/$benchId' });
  const navigate = useNavigate();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [componentToDuplicate, setComponentToDuplicate] = useState<Component | null>(null);

  const { data: bench, isLoading, refetch: refetchBench } = useGetTestBench(benchId);
  const { data: components = [], refetch: refetchComponents } = useGetBenchComponents(benchId);
  const { data: history = [] } = useGetBenchHistory(benchId);
  const { data: profile } = useGetCallerUserProfile();
  const removeBench = useRemoveTestBench();
  const setComponents = useSetBenchComponents();
  const effectiveThreshold = getEffectiveThreshold(profile ?? null, benchId);

  const handleRemove = async () => {
    try {
      await removeBench.mutateAsync(benchId);
      toast.success(t('benches.removed'));
      navigate({ to: '/benches' });
    } catch (error: any) {
      console.error('Failed to remove bench:', error);
      toast.error(error.message || t('benches.removeFailed'));
    }
  };

  const handleComponentsChange = async (newComponents: Component[]) => {
    try {
      await setComponents.mutateAsync({ benchId, components: newComponents });
      toast.success(t('components.saved'));
    } catch (error: any) {
      console.error('Failed to save components:', error);
      toast.error(error.message || t('components.saveFailed'));
    }
  };

  const handleDuplicateComponent = (component: Component) => {
    setComponentToDuplicate(component);
    setDuplicateDialogOpen(true);
  };

  const handleDuplicateSuccess = () => {
    refetchBench();
    refetchComponents();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!bench) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('benches.notFound')}</AlertTitle>
          <AlertDescription>{t('benches.notFoundDesc')}</AlertDescription>
        </Alert>
        <Button onClick={() => navigate({ to: '/benches' })}>
          {t('benches.title')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{bench.name}</h1>
          <p className="text-muted-foreground">{bench.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditModalOpen(true)}>
            <Pencil className="h-4 w-4 mr-2" />
            {t('benches.edit')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRemoveDialogOpen(true)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {t('benches.remove')}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('benches.overview')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <BenchPhoto photo={bench.photo} alt={bench.name} className="w-full h-64 rounded-md" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('benches.name')}</p>
              <p className="text-base">{bench.name}</p>
            </div>
            {bench.serialNumber && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('benches.serialNumber')}</p>
                <p className="text-base">{bench.serialNumber}</p>
              </div>
            )}
            {bench.agileCode && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t('benches.agileCode')}</p>
                <p className="text-base">{bench.agileCode}</p>
              </div>
            )}
            {bench.tags.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">{t('benches.tags')}</p>
                <div className="flex flex-wrap gap-1">
                  {bench.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag.tagName}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {(bench.plmAgileUrl || bench.decawebUrl) && (
            <div className="flex gap-2">
              {bench.plmAgileUrl && (
                <a href={bench.plmAgileUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {t('benches.plmAgile')}
                  </Button>
                </a>
              )}
              {bench.decawebUrl && (
                <a href={bench.decawebUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {t('benches.decaweb')}
                  </Button>
                </a>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="health-book" className="space-y-4">
        <TabsList>
          <TabsTrigger value="health-book">{t('benches.healthBook')}</TabsTrigger>
          <TabsTrigger value="documents">{t('benches.documents')}</TabsTrigger>
          <TabsTrigger value="history">{t('benches.history')}</TabsTrigger>
        </TabsList>

        <TabsContent value="health-book" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('benches.healthBook')}</CardTitle>
              <CardDescription>{t('benchModal.componentsHelp')}</CardDescription>
            </CardHeader>
            <CardContent>
              <BenchComponentsTableEditor
                components={components}
                onChange={handleComponentsChange}
                effectiveThreshold={effectiveThreshold}
                benchId={benchId}
                onDuplicateComponent={handleDuplicateComponent}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <BenchDocumentsEditor benchId={benchId} />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('benches.history')}</CardTitle>
              <CardDescription>{t('benches.noHistory')}</CardDescription>
            </CardHeader>
            <CardContent>
              <BenchHistoryList history={history} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <EditBenchModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        bench={bench}
      />

      <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('benches.confirmRemove')}</AlertDialogTitle>
            <AlertDialogDescription>{t('benches.confirmRemoveDesc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('benches.remove')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DuplicateComponentDialog
        open={duplicateDialogOpen}
        onOpenChange={setDuplicateDialogOpen}
        component={componentToDuplicate}
        currentBenchId={benchId}
        onSuccess={handleDuplicateSuccess}
      />
    </div>
  );
}
