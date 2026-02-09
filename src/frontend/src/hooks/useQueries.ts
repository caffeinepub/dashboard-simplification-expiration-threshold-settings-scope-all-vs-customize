import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { TestBench, UserProfile, UserRole, Tag, ExternalBlob, ExpirationThresholdMode, Component, Document, HistoryEntry, ProfilePicture, PublicUserInfo } from '../backend';
import { Principal } from '@dfinity/principal';
import { useAvatarCacheBuster } from './useAvatarCacheBuster';
import { normalizeErrorMessage } from '../utils/errors';

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
    },
  });
}

export function useGetBenchComponents(benchId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Component[]>({
    queryKey: ['benchComponents', benchId],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getComponents(benchId);
      } catch (error) {
        console.error('Failed to fetch components:', error);
        return [];
      }
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
    },
  });
}

export function useDuplicateComponentToBenches() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { component: Component; targetBenchIds: string[] }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.duplicateComponentToBenches(params.component, params.targetBenchIds);
      } catch (error) {
        throw new Error(normalizeErrorMessage(error));
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['benchComponents', variables.component.associatedBenchId] });
      variables.targetBenchIds.forEach((benchId) => {
        queryClient.invalidateQueries({ queryKey: ['benchComponents', benchId] });
        queryClient.invalidateQueries({ queryKey: ['benchHistory', benchId] });
      });
    },
  });
}

export function useMoveComponentToBench() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { component: Component; fromBenchId: string; toBenchId: string }) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.moveComponentToBench(params.component, params.fromBenchId, params.toBenchId);
      } catch (error) {
        throw new Error(normalizeErrorMessage(error));
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['benchComponents', variables.fromBenchId] });
      queryClient.invalidateQueries({ queryKey: ['benchComponents', variables.toBenchId] });
      queryClient.invalidateQueries({ queryKey: ['testBench', variables.fromBenchId] });
      queryClient.invalidateQueries({ queryKey: ['testBench', variables.toBenchId] });
      queryClient.invalidateQueries({ queryKey: ['benchHistory', variables.fromBenchId] });
      queryClient.invalidateQueries({ queryKey: ['benchHistory', variables.toBenchId] });
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
      queryClient.invalidateQueries({ queryKey: ['benchHistory', variables.benchId] });
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
      queryClient.invalidateQueries({ queryKey: ['testBench', variables.benchId] });
      variables.targetBenchIds.forEach((benchId) => {
        queryClient.invalidateQueries({ queryKey: ['testBench', benchId] });
      });
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
      queryClient.invalidateQueries({ queryKey: ['benchHistory', variables.benchId] });
    },
  });
}

export function useGetBenchHistory(benchId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<HistoryEntry[]>({
    queryKey: ['benchHistory', benchId],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getBenchHistory(benchId);
      } catch (error) {
        console.error('Failed to fetch bench history:', error);
        return [];
      }
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
      try {
        return await actor.getUniqueEntities();
      } catch (error) {
        console.error('Failed to fetch unique entities:', error);
        return [];
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
      if (!actor) return 'safrangroup.com';
      try {
        return await actor.getAllowedEmailDomain();
      } catch (error) {
        console.error('Failed to fetch allowed email domain:', error);
        return 'safrangroup.com';
      }
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

export function useGetPublicUserInfo(userId: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<PublicUserInfo | null>({
    queryKey: ['publicUserInfo', userId?.toString() || ''],
    queryFn: async () => {
      if (!actor || !userId) return null;
      try {
        return await actor.getPublicUserInfo(userId);
      } catch (error) {
        console.error('Failed to fetch public user info:', error);
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}
