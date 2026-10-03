import { useEffect, useRef } from 'react';
import { useBodyScrollLock } from './useBodyScrollLock';

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Comportamiento común para un modal: bloquea el scroll de fondo, cierra con
 * Escape, mantiene el foco del teclado DENTRO del modal (Tab y Shift+Tab dan
 * la vuelta), devuelve el foco a quien lo abrió, y evita el "click fantasma"
 * en móvil que cierra el modal apenas se abre (el mismo toque que lo abre a
 * veces también dispara un click sobre el fondo, que aparece al instante
 * justo debajo del dedo).
 *
 * Pon `dialogRef` en el contenedor del modal para activar la trampa de foco.
 */
export function useModal(isOpen: boolean, onClose: () => void) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLElement | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const openedAtRef = useRef(0);
  // Siempre la versión más reciente de onClose, sin reiniciar el efecto (que
  // devolvería el foco al disparador en cada render si onClose cambia).
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    lastFocusedRef.current = document.activeElement as HTMLElement;
    openedAtRef.current = Date.now();
    closeButtonRef.current?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !dialogRef.current.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !dialogRef.current.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      lastFocusedRef.current?.focus();
    };
  }, [isOpen]);

  const handleBackdropClick = () => {
    if (Date.now() - openedAtRef.current < 350) return;
    onCloseRef.current();
  };

  return { closeButtonRef, dialogRef, handleBackdropClick };
}
