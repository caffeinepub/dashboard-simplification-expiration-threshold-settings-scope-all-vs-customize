import { create } from 'zustand';

interface AvatarCacheBusterState {
  cacheBuster: number;
  updateCacheBuster: () => void;
}

export const useAvatarCacheBuster = create<AvatarCacheBusterState>((set) => ({
  cacheBuster: Date.now(),
  updateCacheBuster: () => set({ cacheBuster: Date.now() }),
}));
