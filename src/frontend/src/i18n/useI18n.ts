import { useContext } from 'react';
import { I18nContext } from './I18nProvider';
import { translations, TranslationKey } from './translations';

export function useI18n() {
  const { languageTag, setLanguageTag, isLoading } = useContext(I18nContext);

  const t = (key: TranslationKey): string => {
    const languageTranslations = translations[languageTag];
    if (!languageTranslations) {
      console.warn(`No translations found for language: ${languageTag}`);
      return key;
    }
    return languageTranslations[key] || key;
  };

  return {
    languageTag,
    setLanguageTag,
    isLoading,
    t,
  };
}
