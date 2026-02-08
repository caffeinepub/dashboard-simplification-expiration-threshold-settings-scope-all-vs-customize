export interface Language {
  code: string;
  name: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'fr-FR', name: 'Français', flag: '🇫🇷' },
  { code: 'en-US', name: 'English', flag: '🇺🇸' },
  { code: 'es-ES', name: 'Español', flag: '🇪🇸' },
  { code: 'pt-PT', name: 'Português', flag: '🇵🇹' },
  { code: 'it-IT', name: 'Italiano', flag: '🇮🇹' },
  { code: 'de-DE', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ru-RU', name: 'Русский', flag: '🇷🇺' },
  { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
  { code: 'ja-JP', name: '日本語', flag: '🇯🇵' },
  { code: 'tr-TR', name: 'Türkçe', flag: '🇹🇷' },
];

export function isSupportedLanguage(code: string): boolean {
  return SUPPORTED_LANGUAGES.some((lang) => lang.code === code);
}

export function getLanguageName(code: string): string {
  const language = SUPPORTED_LANGUAGES.find((lang) => lang.code === code);
  return language?.name || code;
}

export function getLanguageFlag(code: string): string {
  const language = SUPPORTED_LANGUAGES.find((lang) => lang.code === code);
  return language?.flag || '🌐';
}
