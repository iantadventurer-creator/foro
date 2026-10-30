import { useCallback, useEffect, useState } from 'react';
import { THEME_STORAGE_KEY, type Theme } from '@/lib/theme';

/** Tema actual (claro/oscuro) y la acción de alternarlo. El tema inicial lo
 * pone el script de <head> (lib/theme.ts); aquí solo se lee y se cambia. */
export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
  }, []);

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // Sin localStorage: el cambio dura hasta recargar, nada más.
      }
      return next;
    });
  }, []);

  return [theme, toggle];
}
