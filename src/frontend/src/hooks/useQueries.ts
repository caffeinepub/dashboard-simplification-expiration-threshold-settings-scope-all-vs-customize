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
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isCallerAdmin();
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
      return actor.getAllowedEmailDomain();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetAllowedEmailDomain() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newDomain: string) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.setAllowedEmailDomain(newDomain);
      } catch (error) {
        throw new Error(normalizeErrorMessage(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allowedEmailDomain'] });
    },
  });
}

export function useUploadProfilePicture() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (picture: ExternalBlob) => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.uploadProfilePicture(picture);
      } catch (error) {
        throw new Error(normalizeErrorMessage(error));
      }
    },
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
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['publicUserInfo'] });
      updateCacheBuster();
    },
  });
}

export function useGetPublicUserInfo(userPrincipal: Principal | null) {
  const { actor, isFetching } = useActor();

  return useQuery<PublicUserInfo | null>({
    queryKey: ['publicUserInfo', userPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !userPrincipal) return null;
      try {
        return await actor.getPublicUserInfo(userPrincipal);
      } catch (error) {
        // If user info doesn't exist, return null instead of throwing
        console.warn('Failed to fetch public user info:', normalizeErrorMessage(error));
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!userPrincipal,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

export function useGetAllEntities() {
  const { actor, isFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['allEntities'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllEntities();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetUniqueEntities() {
  const { actor, isFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ['uniqueEntities'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getUniqueEntities();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetUsersByEntity(entity: string) {
  const { actor, isFetching } = useActor();

  return useQuery<UserProfile[]>({
    queryKey: ['usersByEntity', entity],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getUsersByEntity(entity);
    },
    enabled: !!actor && !isFetching && !!entity,
  });
}

export function useIsUserOnline(userId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isUserOnline', userId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isOnline(Principal.fromText(userId));
    },
    enabled: !!actor && !isFetching && !!userId,
    refetchInterval: 30000, // Refetch every 30 seconds
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
        console.warn('Failed to fetch language tag:', normalizeErrorMessage(error));
        return 'en-US';
      }
    },
    enabled: !!actor && !isFetching,
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
      queryClient.invalidateQueries({ queryKey: ['languageTag'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetBenchTagSuggestions() {
  const { actor, isFetching } = useActor();

  return useQuery<Tag[]>({
    queryKey: ['benchTagSuggestions'],
    queryFn: async () => {
      if (!actor) return [];
      const benches = await actor.getAllTestBenches();
      const tagMap = new Map<string, Tag>();
      benches.forEach((bench) => {
        bench.tags.forEach((tag) => {
          tagMap.set(tag.tagName, tag);
        });
      });
      return Array.from(tagMap.values()).sort((a, b) => a.tagName.localeCompare(b.tagName));
    },
    enabled: !!actor && !isFetching,
  });
}

interface CreateBenchInput {
  id: string;
  name: string;
  serialNumber: string;
  agileCode: string;
  plmAgileUrl: string;
  decawebUrl: string;
  description: string;
  photo: ExternalBlob;
  tags: Tag[];
  documents: Array<{
    id: string;
    productDisplayName: string;
    category: string;
    fileReference: ExternalBlob;
    semanticVersion: string;
    tags: Tag[];
    documentVersion?: string;
  }>;
  components: Component[];
}

export function useCreateTestBench() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateBenchInput) => {
      if (!actor) throw new Error('Actor not available');

      try {
        // Create the bench
        await actor.createTestBench(
          input.id,
          input.name,
          input.serialNumber,
          input.agileCode,
          input.plmAgileUrl,
          input.decawebUrl,
          input.description,
          input.photo,
          null, // photoUrl
          input.tags
        );

        // Create and associate documents
        for (const doc of input.documents) {
          await actor.createDocument(
            doc.id,
            doc.productDisplayName,
            BigInt(1),
            doc.category,
            doc.fileReference,
            doc.semanticVersion,
            doc.tags,
            doc.documentVersion || null
          );
          await actor.associateDocumentToBench(doc.id, input.id);
        }

        // Set initial components
        if (input.components.length > 0) {
          await actor.setComponents(input.id, input.components);
        }
      } catch (error) {
        throw new Error(normalizeErrorMessage(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testBenches'] });
      queryClient.invalidateQueries({ queryKey: ['benchTagSuggestions'] });
      queryClient.invalidateQueries({ queryKey: ['benchComponents'] });
      queryClient.invalidateQueries({ queryKey: ['allDocuments'] });
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
          null, // photoUrl
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
      queryClient.invalidateQueries({ queryKey: ['benchTagSuggestions'] });
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
      queryClient.invalidateQueries({ queryKey: ['benchTagSuggestions'] });
      queryClient.invalidateQueries({ queryKey: ['benchComponents'] });
      queryClient.invalidateQueries({ queryKey: ['allDocuments'] });
    },
  });
}

export function useGetBenchComponents(benchId: string) {
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

export function useSetBenchComponents() {
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
      queryClient.invalidateQueries({ queryKey: ['benchComponents'] });
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
        await actor.duplicateComponentToBenches(params.component, params.targetBenchIds);
        
        // Add a small delay to ensure backend has fully processed the duplication
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        throw new Error(normalizeErrorMessage(error));
      }
    },
    onSuccess: async (_, variables) => {
      // Invalidate and refetch all affected bench component queries
      for (const benchId of variables.targetBenchIds) {
        await queryClient.invalidateQueries({ queryKey: ['benchComponents', benchId] });
        await queryClient.invalidateQueries({ queryKey: ['benchHistory', benchId] });
      }
      
      // Invalidate global queries
      await queryClient.invalidateQueries({ queryKey: ['benchComponents'] });
      
      // Force immediate refetch of all destination benches to ensure data is ready
      // This ensures that navigating to a destination bench shows the duplicated component immediately
      const refetchPromises = variables.targetBenchIds.map(async (benchId) => {
        await queryClient.refetchQueries({ 
          queryKey: ['benchComponents', benchId],
          exact: true
        });
      });
      
      await Promise.all(refetchPromises);
    },
  });
}

export function useGetAllBenchComponents() {
  const { actor, isFetching } = useActor();
  const { data: benches = [] } = useGetAllTestBenches();

  return useQuery<Array<{ benchId: string; benchName: string; agileCode: string; serialNumber: string; components: Component[] }>>({
    queryKey: ['benchComponents', 'all', benches.map(b => b.id).join(',')],
    queryFn: async () => {
      if (!actor || benches.length === 0) return [];
      
      const results = await Promise.all(
        benches.map(async (bench) => {
          const components = await actor.getComponents(bench.id);
          return {
            benchId: bench.id,
            benchName: bench.name,
            agileCode: bench.agileCode || '—',
            serialNumber: bench.serialNumber || '—',
            components,
          };
        })
      );
      
      return results;
    },
    enabled: !!actor && !isFetching && benches.length > 0,
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
      queryClient.invalidateQueries({ queryKey: ['testBenches'] });
      queryClient.invalidateQueries({ queryKey: ['benchHistory', variables.benchId] });
      queryClient.invalidateQueries({ queryKey: ['allDocuments'] });
      queryClient.invalidateQueries({ queryKey: ['benchDocuments', variables.benchId] });
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
      queryClient.invalidateQueries({ queryKey: ['testBenches'] });
      queryClient.invalidateQueries({ queryKey: ['benchHistory', variables.benchId] });
      queryClient.invalidateQueries({ queryKey: ['allDocuments'] });
      queryClient.invalidateQueries({ queryKey: ['benchDocuments', variables.benchId] });
    },
  });
}

export function useGetAllDocuments() {
  const { actor, isFetching } = useActor();
  const { data: benches = [] } = useGetAllTestBenches();

  return useQuery<Array<{ document: Document; benchNames: string[] }>>({
    queryKey: ['allDocuments', benches.map(b => b.id).join(',')],
    queryFn: async () => {
      if (!actor || benches.length === 0) return [];

      const documentMap = new Map<string, { document: Document; benchNames: string[] }>();

      for (const bench of benches) {
        for (const [docId] of bench.documents) {
          if (!documentMap.has(docId)) {
            try {
              const doc = await actor.getTestBench(bench.id);
              if (doc) {
                const docRef = doc.documents.find(([id]) => id === docId);
                if (docRef) {
                  documentMap.set(docId, {
                    document: {
                      id: docId,
                      productDisplayName: docId,
                      version: docRef[1],
                      category: 'Unknown',
                      fileReference: null as any,
                      semanticVersion: '1.0.0',
                      uploader: Principal.anonymous(),
                      associatedBenches: [bench.id],
                      tags: [],
                      documentVersion: undefined,
                    },
                    benchNames: [bench.name],
                  });
                }
              }
            } catch (error) {
              console.warn(`Failed to fetch document ${docId}:`, normalizeErrorMessage(error));
            }
          } else {
            const existing = documentMap.get(docId)!;
            if (!existing.benchNames.includes(bench.name)) {
              existing.benchNames.push(bench.name);
            }
          }
        }
      }

      return Array.from(documentMap.values());
    },
    enabled: !!actor && !isFetching && benches.length > 0,
  });
}

export function useGetBenchDocuments(benchId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Document[]>({
    queryKey: ['benchDocuments', benchId],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const bench = await actor.getTestBench(benchId);
        if (!bench) return [];
        
        return [];
      } catch (error) {
        console.warn('Failed to fetch bench documents:', normalizeErrorMessage(error));
        return [];
      }
    },
    enabled: !!actor && !isFetching && !!benchId,
  });
}
