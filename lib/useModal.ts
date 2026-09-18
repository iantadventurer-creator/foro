import { useEffect, useRef } from 'react';
import { useBodyScrollLock } from './useBodyScrollLock';

/**
 * Comportamiento común para un modal simple (abrir/cerrar): bloquea el
 * scroll de fondo, cierra con Escape, devuelve el foco a quien lo abrió,
 * y evita el "click fantasma" en móvil que cierra el modal apenas se abre
 * (el mismo toque que lo abre a veces también dispara un click sobre el
 * fondo, que aparece al instante justo debajo del dedo).
 */
export function useModal(isOpen: boolean, onClose: () => void) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const openedAtRef = useRef(0);

  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    lastFocusedRef.current = document.activeElement as HTMLElement;
    openedAtRef.current = Date.now();
    closeButtonRef.current?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      lastFocusedRef.current?.focus();
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = () => {
    if (Date.now() - openedAtRef.current < 350) return;
    onClose();
  };

  return { closeButtonRef, handleBackdropClick };
}
