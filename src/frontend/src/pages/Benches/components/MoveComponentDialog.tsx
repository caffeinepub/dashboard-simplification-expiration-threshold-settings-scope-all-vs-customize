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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, ArrowLeftRight } from 'lucide-react';
import { useMoveComponentToBench, useGetAllTestBenches } from '../../../hooks/useQueries';
import type { Component } from '../../../backend';
import { toast } from 'sonner';
import { normalizeErrorMessage } from '../../../utils/errors';

interface MoveComponentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  component: Component | null;
  currentBenchId: string;
  onSuccess?: () => void;
}

export function MoveComponentDialog({
  open,
  onOpenChange,
  component,
  currentBenchId,
  onSuccess,
}: MoveComponentDialogProps) {
  const [selectedBenchId, setSelectedBenchId] = useState<string | null>(null);
  const { data: allBenches = [] } = useGetAllTestBenches();
  const moveComponent = useMoveComponentToBench();

  // Filter out the current bench
  const availableBenches = allBenches.filter((bench) => bench.id !== currentBenchId);

  const handleMove = async () => {
    if (!component || !selectedBenchId) {
      toast.error('Please select a destination bench');
      return;
    }

    const targetBench = availableBenches.find((b) => b.id === selectedBenchId);
    if (!targetBench) {
      toast.error('Invalid destination bench');
      return;
    }

    try {
      await moveComponent.mutateAsync({
        component,
        fromBenchId: currentBenchId,
        toBenchId: selectedBenchId,
      });
      
      toast.success(`Component moved to ${targetBench.name}`);
      
      setSelectedBenchId(null);
      onOpenChange(false);
      
      // Call success callback to trigger refetch on parent
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: unknown) {
      console.error('Failed to move component:', error);
      const errorMessage = normalizeErrorMessage(error);
      toast.error(`Failed to move component: ${errorMessage}`);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !moveComponent.isPending) {
      setSelectedBenchId(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Move Component to Another Bench</DialogTitle>
          <DialogDescription>
            Select a destination bench to move "{component?.componentName}" to. The component will be
            removed from the current bench and added to the selected bench.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          {availableBenches.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No other benches available. Create more benches to move components.
            </div>
          ) : (
            <div className="space-y-3">
              {availableBenches.map((bench) => (
                <div
                  key={bench.id}
                  className={`flex items-start space-x-3 p-3 rounded-md border cursor-pointer transition-colors ${
                    selectedBenchId === bench.id
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-accent/50'
                  }`}
                  onClick={() => setSelectedBenchId(bench.id)}
                >
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
                  {selectedBenchId === bench.id && (
                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs">
                      ✓
                    </div>
                  )}
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
            disabled={moveComponent.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleMove}
            disabled={moveComponent.isPending || !selectedBenchId}
          >
            {moveComponent.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <ArrowLeftRight className="mr-2 h-4 w-4" />
            Move Component
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
