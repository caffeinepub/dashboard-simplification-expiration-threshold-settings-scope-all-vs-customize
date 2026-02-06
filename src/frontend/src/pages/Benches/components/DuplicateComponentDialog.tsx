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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Copy } from 'lucide-react';
import { useDuplicateComponentToBenches, useGetAllTestBenches } from '../../../hooks/useQueries';
import type { Component } from '../../../backend';
import { toast } from 'sonner';
import { normalizeErrorMessage } from '../../../utils/errors';

interface DuplicateComponentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  component: Component | null;
  currentBenchId: string;
  onSuccess?: () => void;
}

export function DuplicateComponentDialog({
  open,
  onOpenChange,
  component,
  currentBenchId,
  onSuccess,
}: DuplicateComponentDialogProps) {
  const [selectedBenchIds, setSelectedBenchIds] = useState<string[]>([]);
  const { data: allBenches = [] } = useGetAllTestBenches();
  const duplicateComponent = useDuplicateComponentToBenches();

  // Filter out the current bench
  const availableBenches = allBenches.filter((bench) => bench.id !== currentBenchId);

  const handleToggleBench = (benchId: string) => {
    setSelectedBenchIds((prev) =>
      prev.includes(benchId) ? prev.filter((id) => id !== benchId) : [...prev, benchId]
    );
  };

  const handleDuplicate = async () => {
    if (!component || selectedBenchIds.length === 0) {
      toast.error('Please select at least one bench');
      return;
    }

    try {
      await duplicateComponent.mutateAsync({
        component,
        targetBenchIds: selectedBenchIds,
      });
      
      toast.success(
        `Component duplicated to ${selectedBenchIds.length} bench${selectedBenchIds.length > 1 ? 'es' : ''}`
      );
      
      setSelectedBenchIds([]);
      onOpenChange(false);
      
      // Call success callback to trigger refetch on parent
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: unknown) {
      console.error('Failed to duplicate component:', error);
      const errorMessage = normalizeErrorMessage(error);
      toast.error(`Failed to duplicate component: ${errorMessage}`);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !duplicateComponent.isPending) {
      setSelectedBenchIds([]);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Duplicate Component to Other Benches</DialogTitle>
          <DialogDescription>
            Select one or more benches to copy "{component?.componentName}" to. The component will be
            added to each selected bench's Health Book immediately.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          {availableBenches.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No other benches available. Create more benches to duplicate components.
            </div>
          ) : (
            <div className="space-y-3">
              {availableBenches.map((bench) => (
                <div
                  key={bench.id}
                  className="flex items-start space-x-3 p-3 rounded-md border hover:bg-accent/50 transition-colors"
                >
                  <Checkbox
                    id={`bench-${bench.id}`}
                    checked={selectedBenchIds.includes(bench.id)}
                    onCheckedChange={() => handleToggleBench(bench.id)}
                    disabled={duplicateComponent.isPending}
                  />
                  <div className="flex-1 space-y-1">
                    <Label
                      htmlFor={`bench-${bench.id}`}
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      {bench.name}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {bench.agileCode && `AGILE: ${bench.agileCode} • `}
                      {bench.serialNumber && `S/N: ${bench.serialNumber}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={duplicateComponent.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDuplicate}
            disabled={duplicateComponent.isPending || selectedBenchIds.length === 0}
          >
            {duplicateComponent.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Copy className="mr-2 h-4 w-4" />
            Duplicate to {selectedBenchIds.length || 0} Bench{selectedBenchIds.length !== 1 ? 'es' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
