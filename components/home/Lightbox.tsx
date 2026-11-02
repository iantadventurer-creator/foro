'use client';

import { useEffect, useRef, useState, type MouseEvent } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { DoodleAperture } from '@/components/ui/Doodles';
import { formatCategoryLabel, getCategoryTheme } from '@/lib/categoryThemes';
import { useModal } from '@/lib/hooks/useModal';
import type { HomeContent } from '@/lib/content/homeContent';
import type { FeedItem } from '@/lib/gallery';

/** Píxeles que hay que arrastrar la foto para pasar a la siguiente. */
const SWIPE_DISTANCE = 80;

const stop = (e: MouseEvent) => e.stopPropagation();

/** Visor de fotos como un cuarto oscuro: la foto en grande dentro de una
 * polaroid sobre fondo negro, con su número y título escritos a mano, las
 * acciones (favorito, Instagram, copiar enlace) y una tira de película con el
 * resto de fotos para saltar a cualquiera. Se pasa de foto con las flechas
 * (pantalla o teclado) o deslizando la foto en el móvil. */
export function Lightbox({
  t,
  item,
  items,
  frameNumbers,
  favorites,
  onToggleFavorite,
  onSelect,
  onClose,
}: {
  t: HomeContent;
  /** Foto abierta, o null si el visor está cerrado. */
  item: FeedItem | null;
  /** Lista (ya filtrada y ordenada) por la que se navega. */
  items: FeedItem[];
  /** Número fijo de cada foto en el archivo (la más antigua es la 1). */
  frameNumbers: Map<string, number>;
  favorites: Set<string>;
  onToggleFavorite: (id: string) => void;
  onSelect: (item: FeedItem) => void;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  // Dirección del último cambio de foto, para que la nueva entre por el lado correcto.
  const [direction, setDirection] = useState(0);
  const stripRef = useRef<HTMLOListElement | null>(null);

  // Escape, trampa de foco, devolución del foco y protección contra el
  // "click fantasma" en móvil: todo en el hook compartido con la comunidad.
  const { closeButtonRef, dialogRef, handleBackdropClick } = useModal(!!item, onClose);

  // Navegación dentro de la lista ya filtrada (no solo las fotos visibles en
  // la galería), así "siguiente" no se corta al llegar al final de una tanda.
  const selectedIndex = item ? items.findIndex((i) => i.id === item.id) : -1;
  const hasPrev = selectedIndex > 0;
  const hasNext = selectedIndex !== -1 && selectedIndex < items.length - 1;
  const goTo = (index: number) => {
    if (index < 0 || index >= items.length || index === selectedIndex) return;
    setDirection(index > selectedIndex ? 1 : -1);
    onSelect(items[index]);
  };

  // Flechas del teclado para pasar de foto sin cerrar el visor.
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

  // Mantiene la miniatura de la foto abierta a la vista en la tira de película.
  useEffect(() => {
    if (!item || !stripRef.current) return;
    const active = stripRef.current.querySelector<HTMLElement>('[aria-current="true"]');
    active?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [item]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE_DISTANCE) goTo(selectedIndex + 1);
    else if (info.offset.x > SWIPE_DISTANCE) goTo(selectedIndex - 1);
  };

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // Sin permiso de portapapeles (o contexto no seguro): no se muestra "copiado".
    }
  };

  const theme = getCategoryTheme(item?.category ?? null);
  const isFavorite = item ? favorites.has(item.id) : false;
  const arrowClass =
    'absolute top-1/2 -translate-y-1/2 z-20 hidden sm:flex w-12 h-12 items-center justify-center rounded-full border-2 border-white/40 text-white text-2xl leading-none bg-black/30 hover:bg-black/60 hover:border-white/70 transition-colors disabled:opacity-0 disabled:pointer-events-none';
  const actionClass =
    'lift sketch inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold border-white/60 text-white bg-white/5 hover:bg-white/15';

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
          className="fixed inset-0 z-50 flex flex-col bg-[#12110f]/95 backdrop-blur-sm text-white"
        >
          {/* Barra superior: número, universo, favorito y cerrar */}
          <div onClick={stop} className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3">
            <p className="hand flex min-w-0 items-center gap-2 text-2xl">
              <DoodleAperture className="w-5 h-5 shrink-0 text-[#a8bde8]" />
              <span className="truncate">
                #{frameNumbers.get(item.id) ?? selectedIndex + 1}
                {item.category && <span className="text-white/60"> · {formatCategoryLabel(item.category)}</span>}
              </span>
              {items.length > 1 && (
                <span className="ml-1 shrink-0 text-base text-white/45 tabular-nums">
                  ({selectedIndex + 1}/{items.length})
                </span>
              )}
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <motion.button
                whileTap={{ scale: 1.3 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                onClick={() => onToggleFavorite(item.id)}
                aria-label={isFavorite ? t.modal.removeFavorite : t.modal.addFavorite}
                aria-pressed={isFavorite}
                className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-white/40 text-lg hover:border-white/70"
              >
                <span style={{ color: isFavorite ? '#e8829c' : 'white' }}>{isFavorite ? '♥' : '♡'}</span>
              </motion.button>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                aria-label={t.modal.close}
                className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-white/40 hover:border-white/70"
              >
                ✕
              </button>
            </div>
          </div>

          {/* La foto, como una polaroid; se puede deslizar para cambiar */}
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-20">
            <button onClick={(e) => { stop(e); goTo(selectedIndex - 1); }} disabled={!hasPrev} aria-label={t.modal.prev} className={`${arrowClass} left-4`}>
              ‹
            </button>
            <button onClick={(e) => { stop(e); goTo(selectedIndex + 1); }} disabled={!hasNext} aria-label={t.modal.next} className={`${arrowClass} right-4`}>
              ›
            </button>

            <AnimatePresence mode="wait" initial={false}>
              <motion.figure
                key={item.id}
                initial={{ opacity: 0, x: direction * 60, rotate: 0 }}
                animate={{ opacity: 1, x: 0, rotate: -1 }}
                exit={{ opacity: 0, x: direction * -60 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                drag={items.length > 1 ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.35}
                onDragEnd={handleDragEnd}
                onClick={stop}
                className="tape relative max-w-full rounded-[2px] bg-[#fffdf8] p-2 sm:p-3 pb-1 shadow-2xl cursor-grab active:cursor-grabbing"
              >
                {item.videoUrl ? (
                  <video
                    src={item.videoUrl}
                    controls
                    autoPlay
                    loop
                    className="block max-h-[calc(100svh-19rem)] max-w-[min(88vw,960px)] w-auto h-auto"
                  />
                ) : (
                  <Image
                    src={item.src}
                    alt={item.title}
                    width={0}
                    height={0}
                    sizes="90vw"
                    draggable={false}
                    className="block max-h-[calc(100svh-19rem)] max-w-[min(88vw,960px)] w-auto h-auto select-none"
                  />
                )}
                <figcaption className="hand flex items-center justify-between gap-3 px-1 pt-2 pb-1 text-2xl text-[#2a2723]">
                  <span className="min-w-0 truncate pr-1">{item.title}</span>
                  {theme && <span className="w-3 h-3 shrink-0 rounded-full" style={{ background: theme.accent }} aria-hidden="true" />}
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>

          {/* Acciones y tira de película con el resto de fotos */}
          <div onClick={stop} className="flex flex-col items-center gap-3 px-4 pt-4 pb-4 sm:pb-6">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a href={item.permalink} target="_blank" rel="noopener noreferrer" className={actionClass}>
                {t.modal.viewOnIg} ↗
              </a>
              <button onClick={() => handleCopyLink(item.permalink)} className={actionClass}>
                {copied ? `${t.modal.copied} ✓` : t.modal.copyLink}
              </button>
            </div>
            {items.length > 1 && (
              <>
                <p className="hand text-lg text-white/45 sm:hidden">{t.modal.swipeHint}</p>
                <ol
                  ref={stripRef}
                  aria-label={t.modal.filmstrip}
                  className="flex max-w-full gap-2 overflow-x-auto px-1 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  {items.map((other, i) => {
                    const isActive = other.id === item.id;
                    return (
                      <li key={other.id} className="shrink-0">
                        <button
                          onClick={() => goTo(i)}
                          aria-label={other.title}
                          aria-current={isActive ? 'true' : undefined}
                          className={`relative block w-12 h-12 sm:w-14 sm:h-14 overflow-hidden rounded-[3px] transition ${isActive ? 'ring-2 ring-white ring-offset-2 ring-offset-[#12110f]' : 'opacity-45 hover:opacity-90'}`}
                        >
                          <Image src={other.src} alt="" fill sizes="56px" className="object-cover" />
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
