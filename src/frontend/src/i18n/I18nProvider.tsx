import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useActor } from '../hooks/useActor';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { isSupportedLanguage } from './languages';

interface I18nContextType {
  languageTag: string;
  setLanguageTag: (tag: string) => Promise<void>;
  isLoading: boolean;
}

export const I18nContext = createContext<I18nContextType>({
  languageTag: 'en-US',
  setLanguageTag: async () => {},
  isLoading: false,
});

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [languageTag, setLanguageTagState] = useState<string>('en-US'); // Default to English (US)
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  // Initialize language on mount and when actor becomes available
  useEffect(() => {
    const initializeLanguage = async () => {
      // Skip re-initialization if already done and actor is ready
      if (hasInitialized && actor && !actorFetching) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      // If user is authenticated and actor is ready, fetch from backend
      if (identity && actor && !actorFetching) {
        try {
          const backendLanguage = await actor.getLanguageTag();
          if (backendLanguage && isSupportedLanguage(backendLanguage)) {
            setLanguageTagState(backendLanguage);
            localStorage.setItem('languageTag', backendLanguage);
          } else {
            // Backend returned unsupported language, use English default
            const storedLanguage = localStorage.getItem('languageTag');
            if (storedLanguage && isSupportedLanguage(storedLanguage)) {
              setLanguageTagState(storedLanguage);
            } else {
              setLanguageTagState('en-US');
              localStorage.setItem('languageTag', 'en-US');
            }
          }
          setHasInitialized(true);
        } catch (error) {
          console.error('Failed to fetch language from backend:', error);
          // Fall back to localStorage or English default
          const storedLanguage = localStorage.getItem('languageTag');
          if (storedLanguage && isSupportedLanguage(storedLanguage)) {
            setLanguageTagState(storedLanguage);
          } else {
            setLanguageTagState('en-US');
            localStorage.setItem('languageTag', 'en-US');
          }
          setHasInitialized(true);
        }
      } else if (!identity) {
        // User is not authenticated, use localStorage or English default
        const storedLanguage = localStorage.getItem('languageTag');
        if (storedLanguage && isSupportedLanguage(storedLanguage)) {
          setLanguageTagState(storedLanguage);
        } else {
          setLanguageTagState('en-US');
          localStorage.setItem('languageTag', 'en-US');
        }
        setHasInitialized(true);
      }

      setIsLoading(false);
    };

    initializeLanguage();
  }, [identity, actor, actorFetching, hasInitialized]);

  const setLanguageTag = async (newTag: string) => {
    if (!isSupportedLanguage(newTag)) {
      console.warn(`Unsupported language tag: ${newTag}, falling back to en-US`);
      newTag = 'en-US';
    }

    // Update UI immediately (synchronous state update)
    setLanguageTagState(newTag);
    localStorage.setItem('languageTag', newTag);

    // Persist to backend if authenticated (async, non-blocking)
    if (actor && identity) {
      try {
        await actor.setLanguageTag(newTag);
      } catch (error) {
        console.error('Failed to save language to backend:', error);
        // UI is already updated, so we don't revert
      }
    }
  };

  return (
    <I18nContext.Provider value={{ languageTag, setLanguageTag, isLoading }}>
      {children}
    </I18nContext.Provider>
  );
}
