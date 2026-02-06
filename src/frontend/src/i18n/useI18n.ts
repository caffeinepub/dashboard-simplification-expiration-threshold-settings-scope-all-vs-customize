import { useI18nContext } from './I18nProvider';
import { getTranslation, TranslationKey } from './translations';

export function useI18n() {
  const { languageTag, setLanguageTag, isLoading } = useI18nContext();

  const t = (key: TranslationKey): string => {
    return getTranslation(languageTag, key);
  };

  return {
    languageTag,
    setLanguageTag,
    isLoading,
    t,
  };
}
