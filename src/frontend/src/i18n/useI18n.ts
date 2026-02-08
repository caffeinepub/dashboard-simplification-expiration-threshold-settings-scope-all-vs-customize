import { useContext } from 'react';
import { I18nContext } from './I18nProvider';
import { translations, TranslationKey } from './translations';

export function useI18n() {
  const { languageTag, setLanguageTag, isLoading } = useContext(I18nContext);

  const t = (key: TranslationKey, lang?: string): string => {
    const targetLang = lang || languageTag;
    const languageTranslations = translations[targetLang];
    if (!languageTranslations) {
      console.warn(`No translations found for language: ${targetLang}`);
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
