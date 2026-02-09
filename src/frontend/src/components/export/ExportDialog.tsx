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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useI18n } from '../../i18n/useI18n';
import { useExportDialogData } from '../../hooks/useExportDialogData';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useActor } from '../../hooks/useActor';
import { generateExport } from '../../utils/export/exportGenerators';
import { filterExportData } from '../../utils/export/exportFilters';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ExportScope = 'all' | 'benches' | 'components' | 'dashboard';
type ExportFormat = 'csv' | 'txt' | 'benchExpertZip' | 'sqlite';

export default function ExportDialog({ open, onOpenChange }: ExportDialogProps) {
  const { t } = useI18n();
  const { actor } = useActor();
  const { benches, components, isLoading } = useExportDialogData();

  const [scope, setScope] = useState<ExportScope>('all');
  const [selectedBenches, setSelectedBenches] = useState<string[]>([]);
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);
  const [includeBenches, setIncludeBenches] = useState(true);
  const [includeComponents, setIncludeComponents] = useState(true);
  const [includeHistory, setIncludeHistory] = useState(true);
  const [includeDocuments, setIncludeDocuments] = useState(true);
  const [includeMovementFlow, setIncludeMovementFlow] = useState(true);
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [isExporting, setIsExporting] = useState(false);

  const handleBenchToggle = (benchId: string) => {
    setSelectedBenches((prev) =>
      prev.includes(benchId) ? prev.filter((id) => id !== benchId) : [...prev, benchId]
    );
  };

  const handleComponentToggle = (componentName: string) => {
    setSelectedComponents((prev) =>
      prev.includes(componentName) ? prev.filter((name) => name !== componentName) : [...prev, componentName]
    );
  };

  const handleExport = async () => {
    if (!actor) {
      toast.error(t('export.error.actorNotAvailable'));
      return;
    }

    // Validation for bench expert ZIP format
    if (format === 'benchExpertZip') {
      if (selectedBenches.length === 0) {
        toast.error(t('export.benchExpert.error.noBenchesSelected'));
        return;
      }
      
      setIsExporting(true);
      try {
        const { generateBenchExpertZip } = await import('../../utils/export/benchExpertZip');
        await generateBenchExpertZip(actor, selectedBenches, t);
        toast.success(t('export.success'));
        onOpenChange(false);
      } catch (error: any) {
        console.error('Bench expert export error:', error);
        toast.error(t('export.benchExpert.error.failed') + ': ' + (error.message || String(error)));
      } finally {
        setIsExporting(false);
      }
      return;
    }

    // Dashboard export mode
    if (scope === 'dashboard') {
      setIsExporting(true);
      try {
        const payload = await actor.exportData();
        
        // For dashboard export, include all data
        const filteredData = filterExportData(payload, {
          scope: 'all',
          selectedBenches: [],
          selectedComponents: [],
          includeBenches: true,
          includeComponents: true,
          includeHistory: includeMovementFlow, // History is needed for movement flow
        });

        await generateExport(filteredData, format, t);
        toast.success(t('export.success'));
        onOpenChange(false);
      } catch (error: any) {
        console.error('Export error:', error);
        toast.error(t('export.error.failed') + ': ' + (error.message || String(error)));
      } finally {
        setIsExporting(false);
      }
      return;
    }

    // Validation for standard exports
    if (scope === 'benches' && selectedBenches.length === 0) {
      toast.error(t('export.error.noBenchesSelected'));
      return;
    }

    if (scope === 'components' && selectedComponents.length === 0) {
      toast.error(t('export.error.noComponentsSelected'));
      return;
    }

    if (!includeBenches && !includeComponents && !includeHistory) {
      toast.error(t('export.error.noSectionsSelected'));
      return;
    }

    setIsExporting(true);

    try {
      // Fetch export payload from backend
      const payload = await actor.exportData();

      // Filter data based on scope and selections
      const filteredData = filterExportData(payload, {
        scope,
        selectedBenches,
        selectedComponents,
        includeBenches,
        includeComponents,
        includeHistory,
      });

      // Generate and download the export file
      await generateExport(filteredData, format, t);

      toast.success(t('export.success'));
      onOpenChange(false);
    } catch (error: any) {
      console.error('Export error:', error);
      if (format === 'sqlite') {
        toast.error(t('export.error.failed') + ' (SQLite): ' + (error.message || String(error)));
      } else {
        toast.error(t('export.error.failed') + ': ' + (error.message || String(error)));
      }
    } finally {
      setIsExporting(false);
    }
  };

  // Determine if bench selection is required
  const requiresBenchSelection = format === 'benchExpertZip' || scope === 'benches';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t('export.title')}</DialogTitle>
          <DialogDescription>{t('export.description')}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 py-4">
            {/* Format Selection - moved to top */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">{t('export.format.title')}</Label>
              <Select value={format} onValueChange={(value) => setFormat(value as ExportFormat)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">{t('export.format.csv')}</SelectItem>
                  <SelectItem value="txt">{t('export.format.txt')}</SelectItem>
                  <SelectItem value="sqlite">{t('export.format.sqlite')}</SelectItem>
                  <SelectItem value="benchExpertZip">{t('export.format.benchExpertZip')}</SelectItem>
                </SelectContent>
              </Select>
              {format === 'benchExpertZip' && (
                <p className="text-sm text-muted-foreground">{t('export.benchExpert.description')}</p>
              )}
            </div>

            {/* Scope Selection - only show for non-benchExpertZip formats */}
            {format !== 'benchExpertZip' && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">{t('export.scope.title')}</Label>
                <RadioGroup value={scope} onValueChange={(value) => setScope(value as ExportScope)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="scope-all" />
                    <Label htmlFor="scope-all" className="font-normal cursor-pointer">
                      {t('export.scope.all')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dashboard" id="scope-dashboard" />
                    <Label htmlFor="scope-dashboard" className="font-normal cursor-pointer">
                      {t('export.allDashboardData')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="benches" id="scope-benches" />
                    <Label htmlFor="scope-benches" className="font-normal cursor-pointer">
                      {t('export.scope.benches')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="components" id="scope-components" />
                    <Label htmlFor="scope-components" className="font-normal cursor-pointer">
                      {t('export.scope.components')}
                    </Label>
                  </div>
                </RadioGroup>
                {scope === 'dashboard' && (
                  <p className="text-sm text-muted-foreground">{t('export.allDashboardDataDesc')}</p>
                )}
              </div>
            )}

            {/* Bench Selection */}
            {requiresBenchSelection && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">{t('export.selectBenches')}</Label>
                {isLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('common.loading')}
                  </div>
                ) : (
                  <ScrollArea className="h-48 border rounded-md p-3">
                    <div className="space-y-2">
                      {benches.map((bench) => (
                        <div key={bench.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`bench-${bench.id}`}
                            checked={selectedBenches.includes(bench.id)}
                            onCheckedChange={() => handleBenchToggle(bench.id)}
                          />
                          <Label htmlFor={`bench-${bench.id}`} className="font-normal cursor-pointer flex-1">
                            {bench.name} {bench.agileCode && `(${bench.agileCode})`}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            )}

            {/* Component Selection */}
            {scope === 'components' && format !== 'benchExpertZip' && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">{t('export.selectComponents')}</Label>
                {isLoading ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t('common.loading')}
                  </div>
                ) : (
                  <ScrollArea className="h-48 border rounded-md p-3">
                    <div className="space-y-2">
                      {components.map((compName) => (
                        <div key={compName} className="flex items-center space-x-2">
                          <Checkbox
                            id={`comp-${compName}`}
                            checked={selectedComponents.includes(compName)}
                            onCheckedChange={() => handleComponentToggle(compName)}
                          />
                          <Label
                            htmlFor={`comp-${compName}`}
                            className="font-normal cursor-pointer flex-1"
                          >
                            {compName}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            )}

            {/* Section Toggles - only for non-benchExpertZip and non-dashboard */}
            {format !== 'benchExpertZip' && scope !== 'dashboard' && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">{t('export.sections.title')}</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-benches"
                      checked={includeBenches}
                      onCheckedChange={(checked) => setIncludeBenches(!!checked)}
                    />
                    <Label htmlFor="include-benches" className="font-normal cursor-pointer">
                      {t('export.sections.benches')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-components"
                      checked={includeComponents}
                      onCheckedChange={(checked) => setIncludeComponents(!!checked)}
                    />
                    <Label htmlFor="include-components" className="font-normal cursor-pointer">
                      {t('export.sections.components')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-history"
                      checked={includeHistory}
                      onCheckedChange={(checked) => setIncludeHistory(!!checked)}
                    />
                    <Label htmlFor="include-history" className="font-normal cursor-pointer">
                      {t('export.sections.history')}
                    </Label>
                  </div>
                </div>
              </div>
            )}

            {/* Dashboard-specific sections */}
            {scope === 'dashboard' && (
              <div className="space-y-3">
                <Label className="text-base font-semibold">{t('export.sections.title')}</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-documents"
                      checked={includeDocuments}
                      onCheckedChange={(checked) => setIncludeDocuments(!!checked)}
                    />
                    <Label htmlFor="include-documents" className="font-normal cursor-pointer">
                      {t('export.sections.documents')}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-movement-flow"
                      checked={includeMovementFlow}
                      onCheckedChange={(checked) => setIncludeMovementFlow(!!checked)}
                    />
                    <Label htmlFor="include-movement-flow" className="font-normal cursor-pointer">
                      {t('export.sections.movementFlow')}
                    </Label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('export.exporting')}
              </>
            ) : (
              t('export.export')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
