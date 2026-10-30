import { useCallback, useEffect, useState } from 'react';

const FAVORITES_STORAGE_KEY = 'iantbuild:favorites';

/** Favoritos de la galería, guardados en este navegador (localStorage; no hay
 * cuenta de por medio). Puede fallar en modo incógnito estricto: no pasa
 * nada, simplemente no persisten. */
export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setFavorites(new Set(JSON.parse(raw)));
    } catch {
      // localStorage no disponible; los favoritos solo viven en memoria.
    }
  }, []);

  const toggleFavorite = useCallback((id: string, e?: { stopPropagation: () => void }) => {
    e?.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([...next]));
      } catch {
        // Igual que arriba: si no hay localStorage, el favorito no sobrevive un refresh.
      }
      return next;
    });
  }, []);

  return { favorites, toggleFavorite };
}
