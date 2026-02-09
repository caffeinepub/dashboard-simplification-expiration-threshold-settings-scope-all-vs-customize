import { useContext, useCallback, useMemo } from 'react';
import { I18nContext } from './I18nProvider';
import { translations, TranslationKey } from './translations';

export function useI18n() {
  const { languageTag, setLanguageTag, isLoading } = useContext(I18nContext);

  const t = useCallback((key: TranslationKey, lang?: string): string => {
    const targetLang = lang || languageTag;
    const languageTranslations = translations[targetLang];
    
    // If no translations for target language, try English fallback
    if (!languageTranslations) {
      const fallbackTranslations = translations['en-US'];
      if (fallbackTranslations && fallbackTranslations[key]) {
        return fallbackTranslations[key];
      }
      // If still no translation, humanize the key
      return humanizeKey(key);
    }
    
    // If key exists in target language, return it
    if (languageTranslations[key]) {
      return languageTranslations[key];
    }
    
    // Try English fallback
    const fallbackTranslations = translations['en-US'];
    if (fallbackTranslations && fallbackTranslations[key]) {
      return fallbackTranslations[key];
    }
    
    // Last resort: humanize the key
    return humanizeKey(key);
  }, [languageTag]);

  return useMemo(() => ({
    languageTag,
    setLanguageTag,
    isLoading,
    t,
  }), [languageTag, setLanguageTag, isLoading, t]);
}

// Helper to convert a translation key into a readable label
function humanizeKey(key: string): string {
  // Extract the last part after the last dot
  const parts = key.split('.');
  const lastPart = parts[parts.length - 1];
  
  // Convert camelCase to Title Case with spaces
  return lastPart
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}
