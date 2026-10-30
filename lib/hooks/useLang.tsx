'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { DEFAULT_LANG, type Lang } from '@/lib/lang';

const STORAGE_KEY = 'iantbuild:lang';

type LangContextValue = { lang: Lang; setLang: (lang: Lang) => void };

const LangContext = createContext<LangContextValue | null>(null);

/** Idioma compartido por toda la web: se recuerda entre páginas y visitas
 * (localStorage) y mantiene el atributo `lang` del documento sincronizado,
 * para lectores de pantalla y buscadores. Va en el layout raíz. */
export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved === 'es' || saved === 'en') setLangState(saved);
    } catch {
      // Sin localStorage (incógnito estricto): el idioma no se recuerda, nada más.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Igual que arriba.
    }
  }, []);

  const value = useMemo(() => ({ lang, setLang }), [lang, setLang]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

/** Idioma actual y la función para cambiarlo, como un `useState`. */
export function useLang(): [Lang, (lang: Lang) => void] {
  const context = useContext(LangContext);
  if (!context) throw new Error('useLang necesita estar dentro de <LangProvider> (app/layout.tsx).');
  return [context.lang, context.setLang];
}
