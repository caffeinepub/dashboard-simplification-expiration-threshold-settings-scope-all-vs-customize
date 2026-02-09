import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { useI18n } from '../../../i18n/useI18n';
import type { TestBench, HistoryEntry } from '../../../backend';

interface MovementFlowSectionProps {
  benches: TestBench[];
  history: Array<[string, HistoryEntry[]]>;
}

interface MovementPair {
  sourceBenchId: string;
  sourceBenchName: string;
  destinationBenchId: string;
  destinationBenchName: string;
  count: number;
}

export function MovementFlowSection({ benches, history }: MovementFlowSectionProps) {
  const { t } = useI18n();

  // Build a map of bench IDs to names
  const benchMap = new Map<string, string>();
  benches.forEach((bench) => {
    benchMap.set(bench.id, bench.name);
  });

  // Parse movement history to extract source -> destination pairs
  const movementPairs = new Map<string, MovementPair>();

  history.forEach(([benchId, entries]) => {
    entries.forEach((entry) => {
      if (entry.action === 'Component moved in' || entry.action === 'Component moved out') {
        // Parse details: "ComponentName SourceId->DestinationId ManufacturerRef"
        const match = entry.details.match(/^(.+?)\s+(\S+)->(\S+)\s+(.+)$/);
        if (match) {
          const [, , sourceId, destId] = match;
          const key = `${sourceId}->${destId}`;

          if (movementPairs.has(key)) {
            const existing = movementPairs.get(key)!;
            existing.count += 1;
          } else {
            movementPairs.set(key, {
              sourceBenchId: sourceId,
              sourceBenchName: benchMap.get(sourceId) || sourceId,
              destinationBenchId: destId,
              destinationBenchName: benchMap.get(destId) || destId,
              count: 1,
            });
          }
        }
      }
    });
  });

  const movements = Array.from(movementPairs.values()).sort((a, b) => b.count - a.count);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dashboard.movementFlow')}</CardTitle>
        <CardDescription>{t('dashboard.movementFlowDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        {movements.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {t('dashboard.noMovements')}
          </p>
        ) : (
          <div className="space-y-3">
            {movements.map((movement, index) => {
              const maxCount = movements[0].count;
              const widthPercent = (movement.count / maxCount) * 100;

              return (
                <div
                  key={`${movement.sourceBenchId}-${movement.destinationBenchId}-${index}`}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <span className="truncate">{movement.sourceBenchName}</span>
                      <ArrowRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      <span className="truncate">{movement.destinationBenchName}</span>
                    </div>
                    <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="text-2xl font-bold">{movement.count}</div>
                    <div className="text-xs text-muted-foreground">{t('dashboard.movementCount')}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
