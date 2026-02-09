import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';
import { Document } from '../../../backend';
import { useI18n } from '../../../i18n/useI18n';
import { useGetAllTestBenches, useDuplicateBenchDocument } from '../../../hooks/useQueries';
import { toast } from 'sonner';

interface DuplicateDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: Document;
  currentBenchId: string;
}

export function DuplicateDocumentDialog({
  open,
  onOpenChange,
  document,
  currentBenchId,
}: DuplicateDocumentDialogProps) {
  const { t } = useI18n();
  const { data: allBenches = [], isLoading: benchesLoading } = useGetAllTestBenches();
  const duplicateDoc = useDuplicateBenchDocument();
  
  const [selectedBenches, setSelectedBenches] = useState<string[]>([]);

  // Filter out current bench and benches that already have this document
  const availableBenches = allBenches.filter(
    (bench) => bench.id !== currentBenchId && !document.associatedBenches.includes(bench.id)
  );

  const handleBenchToggle = (benchId: string) => {
    setSelectedBenches((prev) =>
      prev.includes(benchId) ? prev.filter((id) => id !== benchId) : [...prev, benchId]
    );
  };

  const handleDuplicate = async () => {
    if (selectedBenches.length === 0) {
      toast.error(t('documents.duplicateDialog.selectOne'));
      return;
    }

    try {
      await duplicateDoc.mutateAsync({
        benchId: currentBenchId,
        documentId: document.id,
        targetBenchIds: selectedBenches,
      });

      toast.success(t('documents.duplicateSuccess'));
      onOpenChange(false);
      setSelectedBenches([]);
    } catch (error: any) {
      console.error('Failed to duplicate document:', error);
      toast.error(error.message || t('documents.duplicateDialog.failed'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('documents.duplicateDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('documents.duplicateDialog.description').replace('{name}', document.productDisplayName)}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Label className="text-base font-semibold mb-3 block">
            {t('documents.selectTargetBenches')}
          </Label>
          {benchesLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('common.loading')}
            </div>
          ) : availableBenches.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">
              {t('documents.noTargetBenches')}
            </p>
          ) : (
            <ScrollArea className="h-64 border rounded-md p-3">
              <div className="space-y-2">
                {availableBenches.map((bench) => (
                  <div key={bench.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`duplicate-bench-${bench.id}`}
                      checked={selectedBenches.includes(bench.id)}
                      onCheckedChange={() => handleBenchToggle(bench.id)}
                      disabled={duplicateDoc.isPending}
                    />
                    <Label
                      htmlFor={`duplicate-bench-${bench.id}`}
                      className="font-normal cursor-pointer flex-1"
                    >
                      {bench.name} {bench.agileCode && `(${bench.agileCode})`}
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setSelectedBenches([]);
            }}
            disabled={duplicateDoc.isPending}
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleDuplicate}
            disabled={duplicateDoc.isPending || selectedBenches.length === 0}
          >
            {duplicateDoc.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('common.duplicate')}...
              </>
            ) : (
              t('common.duplicate')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
