'use client';

import { useState, type KeyboardEvent, type MouseEvent, type Ref } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { FilterPill } from '@/components/ui/FilterPill';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { GallerySkeleton } from '@/components/ui/GallerySkeleton';
import { distinctCategoryLabel, formatCategoryLabel, getCategoryTheme } from '@/lib/categoryThemes';
import { fadeUp } from '@/lib/motion';
import type { HomeContent } from '@/lib/content/homeContent';
import type { FeedItem } from '@/lib/gallery';

const FAVORITE_THEME = { accent: '#c9506f', shadow: '#8a1638', ink: '#ffffff' };

const pad = (n: number | undefined) => (n === undefined ? '—' : String(n).padStart(3, '0'));

type View = 'grid' | 'list';

/** Galería: rejilla estricta de fotos numeradas como los pasos de un manual
 * LEGO o, si se prefiere, lista tipo índice con miniatura, número, título y
 * universo. El cuadradito de color de cada foto es el de su universo. */
export function GallerySection({
  t,
  sectionRef,
  items,
  totalItems,
  frameNumbers,
  loading,
  feedError,
  categories,
  categoryCounts,
  allCount,
  filterCategory,
  showOnlyFavorites,
  favorites,
  totalPages,
  safePage,
  onSelectCategory,
  onToggleOnlyFavorites,
  onRetry,
  onOpenItem,
  onToggleFavorite,
  onPageChange,
}: {
  t: HomeContent;
  sectionRef: Ref<HTMLElement>;
  /** Fotos de la página actual. */
  items: FeedItem[];
  /** Total de fotos tras aplicar los filtros (todas las páginas). */
  totalItems: number;
  /** Número fijo de cada foto en el archivo (la más antigua es la 001). */
  frameNumbers: Map<string, number>;
  loading: boolean;
  feedError: boolean;
  categories: string[];
  /** Fotos por universo y en total, para los contadores de los filtros. */
  categoryCounts: Record<string, number>;
  allCount: number;
  filterCategory: string | null;
  showOnlyFavorites: boolean;
  favorites: Set<string>;
  totalPages: number;
  safePage: number;
  onSelectCategory: (category: string | null) => void;
  onToggleOnlyFavorites: () => void;
  onRetry: () => void;
  onOpenItem: (item: FeedItem) => void;
  onToggleFavorite: (id: string, e?: MouseEvent) => void;
  onPageChange: (page: number) => void;
}) {
  const [view, setView] = useState<View>('grid');

  const openOnKey = (item: FeedItem) => (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpenItem(item);
    }
  };

  const heart = (item: FeedItem, className: string) => {
    const isFavorite = favorites.has(item.id);
    return (
      <motion.button
        whileTap={{ scale: 1.3 }}
        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
        onClick={(e) => onToggleFavorite(item.id, e)}
        onKeyDown={(e) => e.stopPropagation()}
        aria-label={isFavorite ? t.modal.removeFavorite : t.modal.addFavorite}
        aria-pressed={isFavorite}
        className={`w-8 h-8 flex items-center justify-center text-base ${className}`}
      >
        <span style={{ color: isFavorite ? '#c9506f' : 'currentColor' }}>{isFavorite ? '♥' : '♡'}</span>
      </motion.button>
    );
  };

  return (
    <section id="gallery" ref={sectionRef} className="max-w-[1440px] mx-auto px-4 sm:px-6 pb-20 md:pb-28 scroll-mt-20">
      <SectionHeading step={2} eyebrow={t.gallery.eyebrow} title={t.gallery.title} subtitle={t.gallery.subtitle} />

      <div className="mt-8 mb-8 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        {categories.length > 0 && (
          <div className="-mx-4 px-4 sm:mx-0 sm:px-0 flex items-center gap-1.5 overflow-x-auto sm:flex-wrap pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <FilterPill onClick={() => onSelectCategory(null)} active={filterCategory === null} count={allCount}>
              {t.gallery.filterAll}
            </FilterPill>
            {categories.map((cat) => (
              <FilterPill
                key={cat}
                onClick={() => onSelectCategory(cat)}
                active={filterCategory === cat}
                theme={getCategoryTheme(cat)}
                count={categoryCounts[cat]}
              >
                {formatCategoryLabel(cat)}
              </FilterPill>
            ))}
            <FilterPill onClick={onToggleOnlyFavorites} active={showOnlyFavorites} theme={FAVORITE_THEME} count={favorites.size}>
              ♥ {t.gallery.favorites}
            </FilterPill>
          </div>
        )}

        <div role="group" aria-label={t.gallery.view} className="label-caps flex shrink-0 items-center gap-3 text-[var(--color-text-muted)] sm:pt-2.5">
          <span className="text-[var(--color-text-faint)]">{t.gallery.view}</span>
          {(['grid', 'list'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              aria-pressed={view === v}
              className={`link-underline font-mono uppercase ${view === v ? 'text-[var(--color-text)]' : ''}`}
            >
              {v === 'grid' ? `▦ ${t.gallery.viewGrid}` : `☰ ${t.gallery.viewList}`}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <GallerySkeleton />
      ) : feedError ? (
        <EmptyState className="flex flex-col items-center py-24 gap-4">
          <p className="text-[var(--color-text)] font-bold">{t.gallery.errorTitle}</p>
          <p className="text-sm max-w-xs">{t.gallery.errorDesc}</p>
          <Button onClick={onRetry} size="sm" className="mt-2">
            {t.gallery.retry}
          </Button>
        </EmptyState>
      ) : totalItems === 0 ? (
        <EmptyState className="py-20">{showOnlyFavorites ? t.gallery.noResults : t.gallery.empty}</EmptyState>
      ) : (
        <>
          {view === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-3 sm:gap-x-5 gap-y-6 sm:gap-y-9">
              {items.map((item) => {
                const isFavorite = favorites.has(item.id);
                const theme = getCategoryTheme(item.category);
                return (
                  <motion.figure
                    key={item.id}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '80px' }}
                    onClick={() => onOpenItem(item)}
                    role="button"
                    tabIndex={0}
                    aria-label={item.title}
                    onKeyDown={openOnKey(item)}
                    className="group cursor-zoom-in"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-[var(--color-surface-2)]">
                      <Image
                        src={item.src}
                        alt={item.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-opacity duration-300 group-hover:opacity-90"
                      />
                      {item.mediaType === 'VIDEO' && (
                        <span className="label-caps absolute top-2 left-2 bg-black/60 px-1.5 py-0.5 text-white">Reel</span>
                      )}
                      {heart(
                        item,
                        `absolute top-1.5 right-1.5 rounded-md bg-white/90 text-[#1c2833] transition-opacity ${isFavorite ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-90'}`
                      )}
                    </div>
                    <figcaption className="mt-2.5 flex items-baseline gap-2.5">
                      <span className="font-display text-lg font-bold leading-none tracking-[-0.04em] text-[var(--color-accent-text)]">
                        {frameNumbers.get(item.id) ?? '—'}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm text-[var(--color-text)]">{item.title}</span>
                      {theme && (
                        <span
                          className="w-2 h-2 shrink-0 rounded-[1px]"
                          style={{ background: theme.accent }}
                          title={item.category ? formatCategoryLabel(item.category) : undefined}
                          aria-hidden="true"
                        />
                      )}
                    </figcaption>
                  </motion.figure>
                );
              })}
            </div>
          ) : (
            <ul className="border-t border-[var(--color-border)]">
              {items.map((item) => (
                <li key={item.id} className="border-b border-[var(--color-border)]">
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label={item.title}
                    onClick={() => onOpenItem(item)}
                    onKeyDown={openOnKey(item)}
                    className="group grid cursor-zoom-in grid-cols-[3.5rem_1fr_auto] sm:grid-cols-[3rem_4rem_1fr_10rem_5rem_auto] items-center gap-3 sm:gap-5 py-2.5 transition-colors hover:bg-[var(--color-surface-2)] sm:px-2"
                  >
                    <span className="label-caps hidden sm:block text-[var(--color-text-faint)]">{pad(frameNumbers.get(item.id))}</span>
                    <span className="relative block aspect-[4/5] overflow-hidden rounded-md bg-[var(--color-surface-2)]">
                      <Image src={item.src} alt="" fill sizes="64px" className="object-cover" />
                    </span>
                    <span className="min-w-0">
                      <span className="label-caps block sm:hidden text-[var(--color-text-faint)]">
                        {pad(frameNumbers.get(item.id))}
                        {distinctCategoryLabel(item.category, item.title) && <> — {distinctCategoryLabel(item.category, item.title)}</>}
                      </span>
                      <span className="block truncate text-sm sm:text-base text-[var(--color-text)]">{item.title}</span>
                    </span>
                    <span className="label-caps hidden sm:block truncate text-[var(--color-text-muted)]">
                      {item.category ? formatCategoryLabel(item.category) : '—'}
                    </span>
                    <span className="label-caps hidden sm:block text-[var(--color-text-faint)]">
                      {item.mediaType === 'VIDEO' ? 'Reel' : t.gallery.photo}
                    </span>
                    {heart(item, 'text-[var(--color-text)]')}
                  </div>
                </li>
              ))}
            </ul>
          )}

          {totalPages > 1 && (
            <nav aria-label={t.gallery.title} className="flex justify-center items-center gap-1.5 mt-12">
              {Array.from({ length: totalPages }, (_, index) => {
                const pageNum = index + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => {
                      onPageChange(pageNum);
                      document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    aria-current={safePage === pageNum ? 'page' : undefined}
                    className={`brick lift w-10 h-10 rounded-md border font-mono text-xs ${safePage === pageNum
                      ? '[--brick-color:var(--color-accent)] border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-accent-ink)]'
                      : '[--brick-color:var(--color-border)] border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]'
                      }`}
                  >
                    {String(pageNum).padStart(2, '0')}
                  </button>
                );
              })}
            </nav>
          )}
        </>
      )}
    </section>
  );
}
