import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Lang, Translations } from './types';
import { ko } from './ko';
import { en } from './en';

const LANG_KEY = 'todays-color-lang';

const translations: Record<Lang, Translations> = { ko, en };

interface I18nContextType {
  lang: Lang;
  t: Translations;
  setLang: (lang: Lang) => void;
}

const I18nContext = createContext<I18nContextType>(null!);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === 'en' || saved === 'ko') return saved;
    return navigator.language.startsWith('ko') ? 'ko' : 'en';
  });

  const setLang = useCallback((l: Lang) => {
    localStorage.setItem(LANG_KEY, l);
    setLangState(l);
  }, []);

  return (
    <I18nContext.Provider value={{ lang, t: translations[lang], setLang }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

export type { Lang, Translations };
