// Supported languages with display names and flag emojis
export interface Language {
  code: string;
  name: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'fr-FR', name: 'Français', flag: '🇫🇷' },
  { code: 'en-US', name: 'English', flag: '🇬🇧' },
  { code: 'es-ES', name: 'Español', flag: '🇪🇸' },
  { code: 'pt-PT', name: 'Português', flag: '🇵🇹' },
  { code: 'it-IT', name: 'Italiano', flag: '🇮🇹' },
  { code: 'de-DE', name: 'Deutsch', flag: '🇩🇪' },
];

export function getLanguageByCode(code: string): Language | undefined {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
}

export function isSupportedLanguage(code: string): boolean {
  return SUPPORTED_LANGUAGES.some(lang => lang.code === code);
}
