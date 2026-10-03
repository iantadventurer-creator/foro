'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { categoryTextColor, getCategoryTheme } from '@/lib/categoryThemes';
import { useModal } from '@/lib/useModal';
import type { HomeContent } from '@/lib/homeContent';
import type { FeedItem } from '@/lib/gallery';

export function Lightbox({
  t,
  item,
  items,
  favorites,
  onToggleFavorite,
  onSelect,
  onClose,
}: {
  t: HomeContent;
  /** Foto abierta, o null si el visor está cerrado. */
  item: FeedItem | null;
  /** Lista (ya filtrada) por la que se navega con las flechas. */
  items: FeedItem[];
  favorites: Set<string>;
  onToggleFavorite: (id: string) => void;
  onSelect: (item: FeedItem) => void;
  onClose: () => void;
}) {
  const [zoomed, setZoomed] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleClose = useCallback(() => {
    setZoomed(false);
    onClose();
  }, [onClose]);
  // Escape, trampa de foco, devolución del foco y protección contra el
  // "click fantasma" en móvil: todo en el hook compartido con la comunidad.
  const { closeButtonRef, dialogRef, handleBackdropClick } = useModal(!!item, handleClose);

  // Navegación dentro de la lista ya filtrada por categoría (no solo la
  // página actual), así "siguiente" no se corta al llegar al final de una página.
  const selectedIndex = item ? items.findIndex((i) => i.id === item.id) : -1;
  const hasPrev = selectedIndex > 0;
  const hasNext = selectedIndex !== -1 && selectedIndex < items.length - 1;
  const goTo = (index: number) => {
    if (index < 0 || index >= items.length) return;
    setZoomed(false);
    onSelect(items[index]);
  };

  // Flechas del teclado para pasar de foto sin cerrar el modal.
  useEffect(() => {
    if (!item) return;
    function handleArrowKeys(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') goTo(selectedIndex - 1);
      if (e.key === 'ArrowRight') goTo(selectedIndex + 1);
    }
    document.addEventListener('keydown', handleArrowKeys);
    return () => document.removeEventListener('keydown', handleArrowKeys);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, selectedIndex, items]);

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // Sin permiso de portapapeles (o contexto no seguro): no se muestra "copiado".
    }
  };

  const modalTheme = getCategoryTheme(item?.category ?? null);

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
          ref={dialogRef as React.Ref<HTMLDivElement>}
          role="dialog"
          aria-modal="true"
          aria-label={item.title}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
        >
          <motion.div
            initial={{ scale: 0.95, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 16, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col md:flex-row shadow-2xl"
          >
            <div className={`w-full md:w-3/5 bg-black relative min-h-[320px] md:min-h-[480px] flex items-center justify-center ${zoomed ? 'overflow-auto' : 'overflow-hidden'}`}>
              {items.length > 1 && !zoomed && (
                <span className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-full bg-black/50 text-white text-[11px] font-bold tracking-wide border border-white/20 backdrop-blur-sm tabular-nums">
                  {selectedIndex + 1} / {items.length}
                </span>
              )}
              <button
                onClick={() => goTo(selectedIndex - 1)}
                disabled={!hasPrev || zoomed}
                aria-label={t.modal.prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white text-2xl leading-none border border-white/20 backdrop-blur-sm hover:bg-black/70 transition-colors disabled:opacity-0 disabled:pointer-events-none"
              >
                ‹
              </button>
              <button
                onClick={() => goTo(selectedIndex + 1)}
                disabled={!hasNext || zoomed}
                aria-label={t.modal.next}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white text-2xl leading-none border border-white/20 backdrop-blur-sm hover:bg-black/70 transition-colors disabled:opacity-0 disabled:pointer-events-none"
              >
                ›
              </button>
              {!item.videoUrl && !zoomed && (
                <div
                  className="absolute inset-0 bg-cover bg-center filter blur-2xl opacity-30 scale-110 pointer-events-none"
                  style={{ backgroundImage: `url(${item.src})` }}
                />
              )}
              {item.videoUrl ? (
                <video src={item.videoUrl} controls autoPlay loop className="relative z-10 max-h-[60vh] w-full object-contain" />
              ) : zoomed ? (
                <Image
                  src={item.src}
                  alt={item.title}
                  width={0}
                  height={0}
                  sizes="90vw"
                  onClick={() => setZoomed(false)}
                  className="relative z-10 max-w-none w-auto h-auto cursor-zoom-out"
                />
              ) : (
                <Image
                  src={item.src}
                  alt={item.title}
                  width={0}
                  height={0}
                  sizes="(max-width: 768px) 100vw, 60vw"
                  onClick={() => setZoomed(true)}
                  className="relative z-10 max-h-[60vh] w-full h-auto object-contain cursor-zoom-in"
                />
              )}
            </div>
            <div className="w-full md:w-2/5 p-6 flex flex-col">
              <div className="flex justify-between items-center">
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: categoryTextColor(modalTheme) }}
                >
                  {item.author}
                </span>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileTap={{ scale: 1.3 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                    onClick={() => onToggleFavorite(item.id)}
                    aria-label={favorites.has(item.id) ? t.modal.removeFavorite : t.modal.addFavorite}
                    aria-pressed={favorites.has(item.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] text-base"
                  >
                    <motion.span
                      key={favorites.has(item.id) ? 'fav' : 'unfav'}
                      initial={{ scale: 0.6 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                      style={{ color: favorites.has(item.id) ? '#e0245e' : 'var(--color-text-muted)' }}
                    >
                      {favorites.has(item.id) ? '♥' : '♡'}
                    </motion.span>
                  </motion.button>
                  <button
                    ref={closeButtonRef}
                    onClick={handleClose}
                    aria-label={t.modal.close}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text)] bg-[var(--color-surface-2)] border border-[var(--color-border)]"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                <h3 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight text-[var(--color-text)] mb-3">{item.title}</h3>
                <div
                  className="w-full pt-4 mt-3 flex flex-col gap-2.5"
                  style={{ borderTop: `1px solid ${modalTheme ? `${modalTheme.accent}40` : 'var(--color-border)'}` }}
                >
                  <a
                    href={item.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-button block text-center text-xs font-bold uppercase tracking-wider py-3 rounded-full hover:brightness-110 transition"
                    style={{
                      color: modalTheme?.ink ?? 'var(--color-accent-ink)',
                      background: modalTheme?.accent ?? 'var(--color-accent)',
                      boxShadow: `0 8px 24px -8px ${modalTheme?.accent ?? 'var(--shadow-accent)'}`,
                    }}
                  >
                    {t.modal.viewOnIg} ↗
                  </a>
                  <button
                    onClick={() => handleCopyLink(item.permalink)}
                    className="block w-full text-center text-xs font-bold uppercase tracking-wider text-[var(--color-text)] bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] py-3 rounded-full border border-[var(--color-border)] transition-all"
                  >
                    {copied ? t.modal.copied + ' ✨' : t.modal.copyLink}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
