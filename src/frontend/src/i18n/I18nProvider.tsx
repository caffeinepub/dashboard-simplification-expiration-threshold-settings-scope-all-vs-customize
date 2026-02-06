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
  languageTag: 'fr-FR',
  setLanguageTag: async () => {},
  isLoading: false,
});

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [languageTag, setLanguageTagState] = useState<string>('fr-FR'); // Default to French
  const [isLoading, setIsLoading] = useState(true);
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  // Initialize language on mount and when actor becomes available
  useEffect(() => {
    const initializeLanguage = async () => {
      setIsLoading(true);

      // If user is authenticated and actor is ready, fetch from backend
      if (identity && actor && !actorFetching) {
        try {
          const backendLanguage = await actor.getLanguageTag();
          if (backendLanguage && isSupportedLanguage(backendLanguage)) {
            setLanguageTagState(backendLanguage);
            localStorage.setItem('languageTag', backendLanguage);
          } else {
            // Backend returned unsupported language, use French default
            setLanguageTagState('fr-FR');
            localStorage.setItem('languageTag', 'fr-FR');
          }
        } catch (error) {
          console.error('Failed to fetch language from backend:', error);
          // Fall back to localStorage or French default
          const storedLanguage = localStorage.getItem('languageTag');
          if (storedLanguage && isSupportedLanguage(storedLanguage)) {
            setLanguageTagState(storedLanguage);
          } else {
            setLanguageTagState('fr-FR');
            localStorage.setItem('languageTag', 'fr-FR');
          }
        }
      } else if (!identity) {
        // User is not authenticated, use localStorage or French default
        const storedLanguage = localStorage.getItem('languageTag');
        if (storedLanguage && isSupportedLanguage(storedLanguage)) {
          setLanguageTagState(storedLanguage);
        } else {
          setLanguageTagState('fr-FR');
          localStorage.setItem('languageTag', 'fr-FR');
        }
      }

      setIsLoading(false);
    };

    initializeLanguage();
  }, [identity, actor, actorFetching]);

  // Reset to French when user logs out
  useEffect(() => {
    if (!identity) {
      const storedLanguage = localStorage.getItem('languageTag');
      if (storedLanguage && isSupportedLanguage(storedLanguage)) {
        setLanguageTagState(storedLanguage);
      } else {
        setLanguageTagState('fr-FR');
        localStorage.setItem('languageTag', 'fr-FR');
      }
    }
  }, [identity]);

  const setLanguageTag = async (newTag: string) => {
    if (!isSupportedLanguage(newTag)) {
      console.warn(`Unsupported language tag: ${newTag}, falling back to fr-FR`);
      newTag = 'fr-FR';
    }

    // Update UI immediately
    setLanguageTagState(newTag);
    localStorage.setItem('languageTag', newTag);

    // Persist to backend if authenticated
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
