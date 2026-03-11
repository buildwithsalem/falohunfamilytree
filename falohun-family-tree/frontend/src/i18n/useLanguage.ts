// i18n/useLanguage.ts
import { create } from 'zustand';
import { Language, translations, TranslationKey } from './translations';

interface LanguageStore {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

export const useLanguage = create<LanguageStore>((set, get) => ({
  language: (localStorage.getItem('falohun-lang') as Language) || 'en',
  setLanguage: (lang) => {
    localStorage.setItem('falohun-lang', lang);
    set({ language: lang });
  },
  t: (key) => translations[get().language][key] as string,
}));
