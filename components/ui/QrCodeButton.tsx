'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { QR_SIZE, isQrModuleDark, isQrFinderArea } from '@/lib/qrMatrix';

const SITE_URL = 'https://iantbuild.vercel.app';

// Paleta de colores "de ladrillo" para el logo del centro — son los mismos
// tokens que ya se usan en el resto del sitio (acentos base + un par de
// temas de categoría), nada inventado para esta pieza.
export const QR_BRICK_COLORS = [
  { name: 'Rojo', accent: '#b3382c', shadow: '#6e2019' },
  { name: 'Naranja', accent: '#e0791f', shadow: '#8a4d0f' },
  { name: 'Azul', accent: '#006cb7', shadow: '#003f5c' },
  { name: 'Verde', accent: '#00852b', shadow: '#004d1a' },
  { name: 'Dorado', accent: '#E8B923', shadow: '#8a6e14' },
  { name: 'Morado', accent: '#8B7CF6', shadow: '#4f4499' },
] as const;

const MODULE = 10;
const QUIET = 4;
const TOTAL = QR_SIZE + QUIET * 2;
const PX = TOTAL * MODULE;
const CREAM = '#f5f7fb';
const INK = '#05070c';

export function pickRandomQrColor(excludeIndex: number | null) {
  let index = Math.floor(Math.random() * QR_BRICK_COLORS.length);
  if (QR_BRICK_COLORS.length > 1 && index === excludeIndex) {
    index = (index + 1) % QR_BRICK_COLORS.length;
  }
  return index;
}

// El modal es "controlado": su estado (abierto/color) vive en el
// componente que lo usa (Home), no aquí dentro. Esto es a propósito —
// antes el botón del menú móvil cerraba ese menú (setMobileMenuOpen(false))
// en el mismo clic que abría el QR, y como el QR vivía DENTRO del bloque
// del menú móvil, cerrar el menú desmontaba también el componente que
// sostenía el estado del modal: se abría y se destruía casi al instante.
// Con el estado afuera y el modal montado una sola vez fuera de ese
// bloque, cerrar el menú ya no puede llevarse el modal por delante.
export function QrCodeModal({
  isOpen,
  colorIndex,
  onClose,
}: {
  isOpen: boolean;
  colorIndex: number | null;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const openedAtRef = useRef(0);

  // Patrón estándar "hasMounted" para portales seguros con SSR (document.body
  // no existe en el server).
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

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

  // En móvil, el mismo toque que abre el modal a veces también dispara un
  // "click" fantasma sobre el fondo (que aparece al instante justo debajo
  // del dedo) — el navegador resuelve el destino del click después de que
  // el DOM cambió, y termina cerrando el modal apenas se abrió. Se ignoran
  // los clics en el fondo durante un instante después de abrir.
  const handleBackdropClick = () => {
    if (Date.now() - openedAtRef.current < 350) return;
    onClose();
  };

  const color = colorIndex !== null ? QR_BRICK_COLORS[colorIndex] : QR_BRICK_COLORS[0];

  const logoSize = PX * 0.2;
  const logoX = (PX - logoSize) / 2;
  const logoY = (PX - logoSize) / 2;
  const studR = logoSize * 0.14;
  const cx1 = logoX + logoSize * 0.32;
  const cx2 = logoX + logoSize * 0.68;
  const cy = logoY + logoSize * 0.5;

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="Código QR de IanTBuild"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-6"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xs bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[28px] p-7 shadow-2xl"
          >
            <span className="absolute top-3.5 left-3.5 w-3.5 h-3.5 rounded-full bg-[var(--color-accent)] shadow-[0_3px_0_0_rgba(0,0,0,0.35)]" aria-hidden="true" />
            <span className="absolute bottom-3.5 left-3.5 w-3.5 h-3.5 rounded-full bg-[var(--color-accent-3)] shadow-[0_3px_0_0_rgba(0,0,0,0.35)]" aria-hidden="true" />
            <span className="absolute bottom-3.5 right-3.5 w-3.5 h-3.5 rounded-full bg-[var(--color-accent-4)] shadow-[0_3px_0_0_rgba(0,0,0,0.35)]" aria-hidden="true" />

            <div className="flex justify-end mb-3">
              <button
                ref={closeButtonRef}
                onClick={onClose}
                aria-label="Cerrar"
                className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text)] bg-[var(--color-surface-2)] border border-[var(--color-border)]"
              >
                ✕
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden">
              <svg viewBox={`0 0 ${PX} ${PX}`} role="img" aria-label={`Código QR hacia ${SITE_URL}`} className="block w-full h-auto">
                <rect width={PX} height={PX} rx={MODULE * 2} fill={CREAM} />
                {Array.from({ length: QR_SIZE }).map((_, row) =>
                  Array.from({ length: QR_SIZE }).map((_, col) => {
                    if (!isQrModuleDark(row, col)) return null;
                    const x = (col + QUIET) * MODULE;
                    const y = (row + QUIET) * MODULE;
                    const rounded = !isQrFinderArea(row, col);
                    return (
                      <rect
                        key={`${row}-${col}`}
                        x={x}
                        y={y}
                        width={MODULE}
                        height={MODULE}
                        rx={rounded ? MODULE * 0.28 : 0}
                        ry={rounded ? MODULE * 0.28 : 0}
                        fill={INK}
                      />
                    );
                  })
                )}
                <rect x={logoX} y={logoY} width={logoSize} height={logoSize} rx={logoSize * 0.22} fill={color.shadow} />
                <rect x={logoX} y={logoY - logoSize * 0.06} width={logoSize} height={logoSize} rx={logoSize * 0.22} fill={color.accent} />
                <circle cx={cx1} cy={cy - logoSize * 0.06} r={studR} fill="#ffffff" opacity={0.55} />
                <circle cx={cx2} cy={cy - logoSize * 0.06} r={studR} fill="#ffffff" opacity={0.55} />
              </svg>
            </div>

            <div className="mt-5 text-center">
              <p className="font-display font-bold text-[var(--color-text)]">IanTBuild</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">iantbuild.vercel.app</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
