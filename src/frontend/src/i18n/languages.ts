// Supported languages with display names and flag emojis
export interface Language {
  code: string;
  name: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en-US', name: 'English', flag: '🇬🇧' },
  { code: 'fr-FR', name: 'Français', flag: '🇫🇷' },
  { code: 'de-DE', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it-IT', name: 'Italiano', flag: '🇮🇹' },
  { code: 'es-ES', name: 'Español', flag: '🇪🇸' },
  { code: 'ru-RU', name: 'Русский', flag: '🇷🇺' },
  { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
  { code: 'ar-SA', name: 'العربية', flag: '🇸🇦' },
  { code: 'tr-TR', name: 'Türkçe', flag: '🇹🇷' },
];

export function getLanguageByCode(code: string): Language | undefined {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
}
