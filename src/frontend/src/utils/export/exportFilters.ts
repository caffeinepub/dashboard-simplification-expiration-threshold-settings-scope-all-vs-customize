import type { ExportPayload, TestBench, Component, HistoryEntry } from '../../backend';
import { Principal } from '@dfinity/principal';

export interface ExportFilterOptions {
  scope: 'all' | 'benches' | 'components';
  selectedBenches: string[];
  selectedComponents: string[];
  includeBenches: boolean;
  includeComponents: boolean;
  includeHistory: boolean;
}

export interface FilteredExportData {
  benches: TestBench[];
  components: Array<{ benchId: string; benchName: string; components: Component[] }>;
  history: Array<{ benchId: string; benchName: string; entries: HistoryEntry[] }>;
  userMap: Map<string, { username: string; entity: string }>;
}

export function filterExportData(
  payload: ExportPayload,
  options: ExportFilterOptions
): FilteredExportData {
  const { scope, selectedBenches, selectedComponents, includeBenches, includeComponents, includeHistory } = options;

  // Build user map for easy lookup
  const userMap = new Map<string, { username: string; entity: string }>();
  payload.userMapping.forEach(([principal, profile]) => {
    userMap.set(principal.toString(), {
      username: profile.username || principal.toString(),
      entity: profile.entity || '',
    });
  });

  // Filter benches based on scope
  let filteredBenches: TestBench[] = [];
  if (includeBenches) {
    if (scope === 'all') {
      filteredBenches = payload.benches;
    } else if (scope === 'benches') {
      filteredBenches = payload.benches.filter((bench) => selectedBenches.includes(bench.id));
    } else if (scope === 'components') {
      // Include benches that have the selected components
      const benchIdsWithSelectedComponents = new Set<string>();
      payload.perBenchComponents.forEach(([benchId, components]) => {
        if (components.some((comp) => selectedComponents.includes(comp.componentName))) {
          benchIdsWithSelectedComponents.add(benchId);
        }
      });
      filteredBenches = payload.benches.filter((bench) => benchIdsWithSelectedComponents.has(bench.id));
    }
  }

  // Filter components
  let filteredComponents: Array<{ benchId: string; benchName: string; components: Component[] }> = [];
  if (includeComponents) {
    const benchMap = new Map(payload.benches.map((b) => [b.id, b.name]));

    payload.perBenchComponents.forEach(([benchId, components]) => {
      let compsToInclude: Component[] = [];

      if (scope === 'all') {
        compsToInclude = components;
      } else if (scope === 'benches') {
        if (selectedBenches.includes(benchId)) {
          compsToInclude = components;
        }
      } else if (scope === 'components') {
        compsToInclude = components.filter((comp) => selectedComponents.includes(comp.componentName));
      }

      if (compsToInclude.length > 0) {
        filteredComponents.push({
          benchId,
          benchName: benchMap.get(benchId) || benchId,
          components: compsToInclude,
        });
      }
    });
  }

  // Filter history
  let filteredHistory: Array<{ benchId: string; benchName: string; entries: HistoryEntry[] }> = [];
  if (includeHistory) {
    const benchMap = new Map(payload.benches.map((b) => [b.id, b.name]));

    payload.perBenchHistoryEntries.forEach(([benchId, entries]) => {
      let shouldInclude = false;

      if (scope === 'all') {
        shouldInclude = true;
      } else if (scope === 'benches') {
        shouldInclude = selectedBenches.includes(benchId);
      } else if (scope === 'components') {
        // Include history for benches that have selected components
        const benchComponents = payload.perBenchComponents.find(([id]) => id === benchId)?.[1] || [];
        shouldInclude = benchComponents.some((comp) => selectedComponents.includes(comp.componentName));
      }

      if (shouldInclude && entries.length > 0) {
        filteredHistory.push({
          benchId,
          benchName: benchMap.get(benchId) || benchId,
          entries,
        });
      }
    });
  }

  return {
    benches: filteredBenches,
    components: filteredComponents,
    history: filteredHistory,
    userMap,
  };
}
