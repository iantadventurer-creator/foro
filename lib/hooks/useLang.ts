import { useEffect, useState } from 'react';
import { DEFAULT_LANG, type Lang } from '@/lib/lang';

/** Idioma de la interfaz (ES/EN). Mantiene el atributo `lang` del documento
 * sincronizado, para lectores de pantalla y buscadores. Cada página lo usa en
 * vez de repetir el estado y el efecto. */
export function useLang(): [Lang, (lang: Lang) => void] {
  const [lang, setLang] = useState<Lang>(DEFAULT_LANG);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return [lang, setLang];
}
