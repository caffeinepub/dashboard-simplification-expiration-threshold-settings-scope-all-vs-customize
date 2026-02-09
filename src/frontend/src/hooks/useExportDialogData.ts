import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { TestBench, Component } from '../backend';

export function useExportDialogData() {
  const { actor, isFetching: actorFetching } = useActor();

  const benchesQuery = useQuery<TestBench[]>({
    queryKey: ['benches'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTestBenches();
    },
    enabled: !!actor && !actorFetching,
  });

  const componentsQuery = useQuery<string[]>({
    queryKey: ['allComponentNames'],
    queryFn: async () => {
      if (!actor) return [];
      const benches = await actor.getAllTestBenches();
      const componentNamesSet = new Set<string>();

      for (const bench of benches) {
        const components = await actor.getComponents(bench.id);
        components.forEach((comp) => componentNamesSet.add(comp.componentName));
      }

      return Array.from(componentNamesSet).sort();
    },
    enabled: !!actor && !actorFetching,
  });

  return {
    benches: benchesQuery.data || [],
    components: componentsQuery.data || [],
    isLoading: benchesQuery.isLoading || componentsQuery.isLoading,
  };
}
