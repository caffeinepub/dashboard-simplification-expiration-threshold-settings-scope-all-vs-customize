import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useActor } from '../hooks/useActor';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

interface I18nContextType {
  languageTag: string;
  setLanguageTag: (tag: string) => Promise<void>;
  isLoading: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();
  const [languageTag, setLanguageTagState] = useState<string>('en-US');
  const [isLoading, setIsLoading] = useState(true);

  // Load language preference from backend when authenticated
  useEffect(() => {
    const loadLanguage = async () => {
      // When not authenticated, reset to default
      if (!identity) {
        setLanguageTagState('en-US');
        setIsLoading(false);
        return;
      }

      // Wait for actor to be ready
      if (!actor || actorFetching) {
        return;
      }
      
      try {
        const tag = await actor.getLanguageTag();
        setLanguageTagState(tag);
      } catch (error) {
        console.error('Failed to load language preference:', error);
        setLanguageTagState('en-US');
      } finally {
        setIsLoading(false);
      }
    };

    loadLanguage();
  }, [actor, actorFetching, identity]);

  const setLanguageTag = async (tag: string) => {
    if (!actor) {
      console.warn('Actor not available, cannot save language preference');
      return;
    }

    try {
      // Update UI immediately for instant language switching
      setLanguageTagState(tag);
      
      // Persist to backend asynchronously
      await actor.setLanguageTag(tag);
    } catch (error) {
      console.error('Failed to save language preference:', error);
      // Revert on error
      if (actor) {
        try {
          const currentTag = await actor.getLanguageTag();
          setLanguageTagState(currentTag);
        } catch (e) {
          console.error('Failed to revert language:', e);
        }
      }
      throw error;
    }
  };

  return (
    <I18nContext.Provider value={{ languageTag, setLanguageTag, isLoading }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18nContext() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18nContext must be used within I18nProvider');
  }
  return context;
}
