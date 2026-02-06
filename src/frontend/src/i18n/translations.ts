// Translation dictionary for key UI strings
export type TranslationKey = 
  | 'nav.dashboard'
  | 'nav.testBenches'
  | 'nav.profile'
  | 'nav.signOut'
  | 'auth.signIn'
  | 'auth.signingIn'
  | 'auth.welcome'
  | 'profile.title'
  | 'profile.language'
  | 'profile.languageDescription';

export const translations: Record<string, Record<TranslationKey, string>> = {
  'en-US': {
    'nav.dashboard': 'Dashboard',
    'nav.testBenches': 'Test Benches',
    'nav.profile': 'Profile',
    'nav.signOut': 'Sign Out',
    'auth.signIn': 'Sign In',
    'auth.signingIn': 'Signing in...',
    'auth.welcome': 'Welcome to HistoryBench',
    'profile.title': 'User Profile',
    'profile.language': 'Language',
    'profile.languageDescription': 'Select your preferred language',
  },
  'fr-FR': {
    'nav.dashboard': 'Tableau de bord',
    'nav.testBenches': 'Bancs d\'essai',
    'nav.profile': 'Profil',
    'nav.signOut': 'Déconnexion',
    'auth.signIn': 'Se connecter',
    'auth.signingIn': 'Connexion...',
    'auth.welcome': 'Bienvenue sur HistoryBench',
    'profile.title': 'Profil utilisateur',
    'profile.language': 'Langue',
    'profile.languageDescription': 'Sélectionnez votre langue préférée',
  },
  'de-DE': {
    'nav.dashboard': 'Dashboard',
    'nav.testBenches': 'Prüfstände',
    'nav.profile': 'Profil',
    'nav.signOut': 'Abmelden',
    'auth.signIn': 'Anmelden',
    'auth.signingIn': 'Anmeldung...',
    'auth.welcome': 'Willkommen bei HistoryBench',
    'profile.title': 'Benutzerprofil',
    'profile.language': 'Sprache',
    'profile.languageDescription': 'Wählen Sie Ihre bevorzugte Sprache',
  },
  'it-IT': {
    'nav.dashboard': 'Dashboard',
    'nav.testBenches': 'Banchi di prova',
    'nav.profile': 'Profilo',
    'nav.signOut': 'Disconnetti',
    'auth.signIn': 'Accedi',
    'auth.signingIn': 'Accesso...',
    'auth.welcome': 'Benvenuto su HistoryBench',
    'profile.title': 'Profilo utente',
    'profile.language': 'Lingua',
    'profile.languageDescription': 'Seleziona la tua lingua preferita',
  },
  'es-ES': {
    'nav.dashboard': 'Panel',
    'nav.testBenches': 'Bancos de prueba',
    'nav.profile': 'Perfil',
    'nav.signOut': 'Cerrar sesión',
    'auth.signIn': 'Iniciar sesión',
    'auth.signingIn': 'Iniciando sesión...',
    'auth.welcome': 'Bienvenido a HistoryBench',
    'profile.title': 'Perfil de usuario',
    'profile.language': 'Idioma',
    'profile.languageDescription': 'Selecciona tu idioma preferido',
  },
  'ru-RU': {
    'nav.dashboard': 'Панель',
    'nav.testBenches': 'Испытательные стенды',
    'nav.profile': 'Профиль',
    'nav.signOut': 'Выйти',
    'auth.signIn': 'Войти',
    'auth.signingIn': 'Вход...',
    'auth.welcome': 'Добро пожаловать в HistoryBench',
    'profile.title': 'Профиль пользователя',
    'profile.language': 'Язык',
    'profile.languageDescription': 'Выберите предпочитаемый язык',
  },
  'zh-CN': {
    'nav.dashboard': '仪表板',
    'nav.testBenches': '测试台',
    'nav.profile': '个人资料',
    'nav.signOut': '退出',
    'auth.signIn': '登录',
    'auth.signingIn': '登录中...',
    'auth.welcome': '欢迎使用 HistoryBench',
    'profile.title': '用户资料',
    'profile.language': '语言',
    'profile.languageDescription': '选择您的首选语言',
  },
  'ar-SA': {
    'nav.dashboard': 'لوحة القيادة',
    'nav.testBenches': 'مقاعد الاختبار',
    'nav.profile': 'الملف الشخصي',
    'nav.signOut': 'تسجيل الخروج',
    'auth.signIn': 'تسجيل الدخول',
    'auth.signingIn': 'جاري تسجيل الدخول...',
    'auth.welcome': 'مرحبا بك في HistoryBench',
    'profile.title': 'ملف المستخدم',
    'profile.language': 'اللغة',
    'profile.languageDescription': 'اختر لغتك المفضلة',
  },
  'tr-TR': {
    'nav.dashboard': 'Gösterge Paneli',
    'nav.testBenches': 'Test Tezgahları',
    'nav.profile': 'Profil',
    'nav.signOut': 'Çıkış Yap',
    'auth.signIn': 'Giriş Yap',
    'auth.signingIn': 'Giriş yapılıyor...',
    'auth.welcome': 'HistoryBench\'e Hoş Geldiniz',
    'profile.title': 'Kullanıcı Profili',
    'profile.language': 'Dil',
    'profile.languageDescription': 'Tercih ettiğiniz dili seçin',
  },
};

export function getTranslation(languageCode: string, key: TranslationKey): string {
  return translations[languageCode]?.[key] || translations['en-US'][key] || key;
}
