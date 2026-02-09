import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { TestBench, UserProfile, UserRole, Tag, ExternalBlob, ExpirationThresholdMode, Component, Document, HistoryEntry, ProfilePicture, PublicUserInfo, ExportPayload } from '../backend';
import { Principal } from '@dfinity/principal';
import { useAvatarCacheBuster } from './useAvatarCacheBuster';
import { normalizeErrorMessage } from '../utils/errors';

// Centralized query key for dashboard export data
export const DASHBOARD_EXPORT_QUERY_KEY = ['dashboardExportData'] as const;

export function useGetAllTestBenches() {
  const { actor, isFetching } = useActor();

  return useQuery<TestBench[]>({
    queryKey: ['testBenches'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTestBenches();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTestBench(benchId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<TestBench | null>({
    queryKey: ['testBench', benchId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getTestBench(benchId);
    },
    enabled: !!actor && !isFetching && !!benchId,
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getCallerUserProfile();
      } catch (error) {
        // If profile doesn't exist, return null instead of throwing
        const errorMsg = normalizeErrorMessage(error);
        if (errorMsg.includes('profile') || errorMsg.includes('User does not exist')) {
          return null;
        }
        throw new Error(errorMsg);
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.saveCallerUserProfile(profile);
      } catch (error) {
        throw new Error(normalizeErrorMessage(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['testBenches'] });
      queryClient.invalidateQueries({ queryKey: ['uniqueEntities'] });
      queryClient.invalidateQueries({ queryKey: ['languageTag'] });
    },
  });
}

export function useUpdateExpirationPreferences() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      mode: ExpirationThresholdMode;
      thresholdAll: bigint;
      thresholdCustom: Array<[string, bigint]>;
    }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.updateExpirationPreferences(
          params.mode,
          params.thresholdAll,
          params.thresholdCustom
        );
      } catch (error) {
        throw new Error(normalizeErrorMessage(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['testBenches'] });
      queryClient.invalidateQueries({ queryKey: ['benchComponents'] });
    },
  });
}

export function useUpdateDashboardSectionsOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sections: string[]) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.updateDashboardSectionsOrder(sections);
      } catch (error) {
        throw new Error(normalizeErrorMessage(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetCallerRole() {
  const { actor, isFetching } = useActor();

  return useQuery<UserRole>({
    queryKey: ['callerRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getCallerUserRole();
      } catch (error) {
        throw new Error(normalizeErrorMessage(error));
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch (error) {
        console.error('Failed to check admin status:', error);
        return false;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateTestBench() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: string;
      name: string;
      serialNumber: string;
      agileCode: string;
      plmAgileUrl: string;
      decawebUrl: string;
      description: string;
      photo: ExternalBlob;
      photoUrl: string | null;
      tags: Tag[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.createTestBench(
          params.id,
          params.name,
          params.serialNumber,
          params.agileCode,
          params.plmAgileUrl,
          params.decawebUrl,
          params.description,
          params.photo,
          params.photoUrl,
          params.tags
        );
      } catch (error) {
        throw new Error(normalizeErrorMessage(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testBenches'] });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_EXPORT_QUERY_KEY });
    },
  });
}

export function useUpdateTestBench() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      benchId: string;
      name: string;
      serialNumber: string;
      agileCode: string;
      plmAgileUrl: string;
      decawebUrl: string;
      description: string;
      photo: ExternalBlob;
      photoUrl: string | null;
      tags: Tag[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.updateTestBench(
          params.benchId,
          params.name,
          params.serialNumber,
          params.agileCode,
          params.plmAgileUrl,
          params.decawebUrl,
          params.description,
          params.photo,
          params.photoUrl,
          params.tags
        );
      } catch (error) {
        throw new Error(normalizeErrorMessage(error));
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['testBenches'] });
      queryClient.invalidateQueries({ queryKey: ['testBench', variables.benchId] });
      queryClient.invalidateQueries({ queryKey: ['benchHistory', variables.benchId] });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_EXPORT_QUERY_KEY });
    },
  });
}

export function useRemoveTestBench() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (benchId: string) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.removeTestBench(benchId);
      } catch (error) {
        throw new Error(normalizeErrorMessage(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testBenches'] });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_EXPORT_QUERY_KEY });
    },
  });
}

export function useGetComponents(benchId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Component[]>({
    queryKey: ['benchComponents', benchId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getComponents(benchId);
    },
    enabled: !!actor && !isFetching && !!benchId,
  });
}

export function useSetComponents() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { benchId: string; components: Component[] }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.setComponents(params.benchId, params.components);
      } catch (error) {
        throw new Error(normalizeErrorMessage(error));
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['benchComponents', variables.benchId] });
      queryClient.invalidateQueries({ queryKey: ['benchHistory', variables.benchId] });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_EXPORT_QUERY_KEY });
    },
  });
}

export function useMoveComponentToBench() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      component: Component;
      fromBenchId: string;
      toBenchId: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.moveComponentToBench(
          params.component,
          params.fromBenchId,
          params.toBenchId
        );
      } catch (error) {
        throw new Error(normalizeErrorMessage(error));
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['benchComponents', variables.fromBenchId] });
      queryClient.invalidateQueries({ queryKey: ['benchComponents', variables.toBenchId] });
      queryClient.invalidateQueries({ queryKey: ['benchHistory', variables.fromBenchId] });
      queryClient.invalidateQueries({ queryKey: ['benchHistory', variables.toBenchId] });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_EXPORT_QUERY_KEY });
    },
  });
}

export function useDuplicateComponentToBench() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      benchId: string;
      component: Component;
      targetBenchId: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.duplicateComponentToBench(
          params.benchId,
          params.component,
          params.targetBenchId
        );
      } catch (error) {
        throw new Error(normalizeErrorMessage(error));
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['benchComponents', variables.targetBenchId] });
      queryClient.invalidateQueries({ queryKey: ['benchHistory', variables.targetBenchId] });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_EXPORT_QUERY_KEY });
    },
  });
}

export function useDuplicateComponentToBenches() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      component: Component;
      targetBenchIds: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.duplicateComponentToBenches(
          params.component,
          params.targetBenchIds
        );
      } catch (error) {
        throw new Error(normalizeErrorMessage(error));
      }
    },
    onSuccess: (_, variables) => {
      variables.targetBenchIds.forEach((benchId) => {
        queryClient.invalidateQueries({ queryKey: ['benchComponents', benchId] });
        queryClient.invalidateQueries({ queryKey: ['benchHistory', benchId] });
      });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_EXPORT_QUERY_KEY });
    },
  });
}

export function useGetBenchHistory(benchId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<HistoryEntry[]>({
    queryKey: ['benchHistory', benchId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getBenchHistory(benchId);
    },
    enabled: !!actor && !isFetching && !!benchId,
  });
}

export function useGetUniqueEntities() {
  const { actor, isFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['uniqueEntities'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUniqueEntities();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetProfilePicture() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { updateCacheBuster } = useAvatarCacheBuster();

  return useMutation({
    mutationFn: async (profilePicture: ProfilePicture) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.setProfilePicture(profilePicture);
      } catch (error) {
        throw new Error(normalizeErrorMessage(error));
      }
    },
    onSuccess: () => {
      updateCacheBuster();
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useSetLanguageTag() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (languageTag: string) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.setLanguageTag(languageTag);
      } catch (error) {
        throw new Error(normalizeErrorMessage(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['languageTag'] });
    },
  });
}

export function useGetLanguageTag() {
  const { actor, isFetching } = useActor();

  return useQuery<string>({
    queryKey: ['languageTag'],
    queryFn: async () => {
      if (!actor) return 'en-US';
      try {
        return await actor.getLanguageTag();
      } catch (error) {
        console.error('Failed to get language tag:', error);
        return 'en-US';
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllowedEmailDomain() {
  const { actor, isFetching } = useActor();

  return useQuery<string>({
    queryKey: ['allowedEmailDomain'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getAllowedEmailDomain();
      } catch (error) {
        throw new Error(normalizeErrorMessage(error));
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPublicUserInfo(userId: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<PublicUserInfo | null>({
    queryKey: ['publicUserInfo', userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return null;
      try {
        return await actor.getPublicUserInfo(userId);
      } catch (error) {
        console.error('Failed to get public user info:', error);
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

// New hook for dashboard export data
export function useDashboardExportData() {
  const { actor, isFetching } = useActor();

  return useQuery<ExportPayload>({
    queryKey: DASHBOARD_EXPORT_QUERY_KEY,
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.exportData();
      } catch (error) {
        throw new Error(normalizeErrorMessage(error));
      }
    },
    enabled: !!actor && !isFetching,
  });
}

// Document mutations with centralized dashboard invalidation
export function useCreateDocument() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: string;
      productDisplayName: string;
      version: bigint;
      category: string;
      fileReference: ExternalBlob;
      semanticVersion: string;
      tags: Tag[];
      documentVersion: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.createDocument(
          params.id,
          params.productDisplayName,
          params.version,
          params.category,
          params.fileReference,
          params.semanticVersion,
          params.tags,
          params.documentVersion
        );
      } catch (error) {
        throw new Error(normalizeErrorMessage(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DASHBOARD_EXPORT_QUERY_KEY });
    },
  });
}

export function useAssociateDocumentToBench() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { documentId: string; benchId: string }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.associateDocumentToBench(params.documentId, params.benchId);
      } catch (error) {
        throw new Error(normalizeErrorMessage(error));
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['testBench', variables.benchId] });
      queryClient.invalidateQueries({ queryKey: ['benchHistory', variables.benchId] });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_EXPORT_QUERY_KEY });
    },
  });
}

export function useRemoveDocumentFromBench() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { documentId: string; benchId: string }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.removeDocumentFromBench(params.documentId, params.benchId);
      } catch (error) {
        throw new Error(normalizeErrorMessage(error));
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['testBench', variables.benchId] });
      queryClient.invalidateQueries({ queryKey: ['benchHistory', variables.benchId] });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_EXPORT_QUERY_KEY });
    },
  });
}

export function useDeleteBenchDocument() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { benchId: string; documentId: string }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.deleteBenchDocument(params.benchId, params.documentId);
      } catch (error) {
        throw new Error(normalizeErrorMessage(error));
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['testBench', variables.benchId] });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_EXPORT_QUERY_KEY });
    },
  });
}

export function useEditBenchDocument() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      benchId: string;
      documentId: string;
      updatedProductDisplayName: string;
      updatedSemanticVersion: string;
      updatedFile: ExternalBlob;
    }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.editBenchDocument(
          params.benchId,
          params.documentId,
          params.updatedProductDisplayName,
          params.updatedSemanticVersion,
          params.updatedFile
        );
      } catch (error) {
        throw new Error(normalizeErrorMessage(error));
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['testBench', variables.benchId] });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_EXPORT_QUERY_KEY });
    },
  });
}

export function useDuplicateBenchDocument() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      benchId: string;
      documentId: string;
      targetBenchIds: string[];
    }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.duplicateBenchDocument(
          params.benchId,
          params.documentId,
          params.targetBenchIds
        );
      } catch (error) {
        throw new Error(normalizeErrorMessage(error));
      }
    },
    onSuccess: (_, variables) => {
      variables.targetBenchIds.forEach((benchId) => {
        queryClient.invalidateQueries({ queryKey: ['testBench', benchId] });
      });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_EXPORT_QUERY_KEY });
    },
  });
}
