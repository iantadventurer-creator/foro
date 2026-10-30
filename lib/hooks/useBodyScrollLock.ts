import { useEffect } from 'react';

/**
 * Bloquea el scroll de la página de fondo mientras un modal está abierto.
 * Sin esto, en móvil se puede seguir desplazando la página detrás del
 * modal con el dedo, y en escritorio con la rueda del mouse.
 */
export function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isLocked]);
}
