import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { useGetAllTestBenches, useRemoveTestBench } from '../../../hooks/useQueries';
import { Trash2, TestTube2 } from 'lucide-react';
import { toast } from 'sonner';
import { useI18n } from '../../../i18n/useI18n';

export function AdminBenchesPanel() {
  const { t } = useI18n();
  const { data: benches = [], isLoading } = useGetAllTestBenches();
  const removeBench = useRemoveTestBench();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [benchToDelete, setBenchToDelete] = useState<{ id: string; name: string } | null>(null);

  const handleDeleteClick = (benchId: string, benchName: string) => {
    setBenchToDelete({ id: benchId, name: benchName });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!benchToDelete) return;

    try {
      await removeBench.mutateAsync(benchToDelete.id);
      toast.success(t('admin.benchesDeleteSuccess').replace('{name}', benchToDelete.name));
    } catch (error: any) {
      console.error('Failed to delete bench:', error);
      toast.error(error.message || t('admin.benchesDeleteFailed'));
    } finally {
      setDeleteDialogOpen(false);
      setBenchToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{t('admin.benchesLoading')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.benchesTitle')}</CardTitle>
          <CardDescription>
            {t('admin.benchesDescription').replace('{count}', benches.length.toString())}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {benches.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">{t('admin.benchesEmpty')}</p>
          ) : (
            <div className="space-y-2">
              {benches.map((bench) => (
                <div
                  key={bench.id}
                  className="flex items-center justify-between p-3 bg-muted rounded"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <TestTube2 className="h-4 w-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{bench.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {bench.agileCode || t('admin.benchesNoAgile')}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(bench.id, bench.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.benchesDeleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.benchesDeleteDesc').replace('{name}', benchToDelete?.name || '')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBenchToDelete(null)}>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
