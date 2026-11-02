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

const num = (n: number | undefined) => (n === undefined ? '—' : `#${n}`);

/** Giro de cada polaroid de la rejilla, para que parezcan pegadas a mano. */
const TILT = ['-rotate-1', 'rotate-[0.6deg]', 'rotate-1', '-rotate-[0.6deg]', 'rotate-[0.4deg]', '-rotate-1', 'rotate-[0.8deg]'];

type View = 'grid' | 'list';

/** Galería del cuaderno: polaroids numeradas y un poco ladeadas, algunas
 * pegadas con cinta, con el título escrito a mano; o, si se prefiere, una
 * lista con miniatura, número, título y universo. El punto de color de cada
 * foto es el de su universo. */
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
    <section id="gallery" ref={sectionRef} className="max-w-[1320px] mx-auto px-4 sm:px-6 pb-20 md:pb-28 scroll-mt-20">
      <SectionHeading step={2} eyebrow={t.gallery.eyebrow} title={t.gallery.title} subtitle={t.gallery.subtitle} />

      <div className="mt-8 mb-10 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        {categories.length > 0 && (
          <div className="-mx-4 px-4 sm:mx-0 sm:px-0 flex items-center gap-2 overflow-x-auto sm:flex-wrap py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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

        <div role="group" aria-label={t.gallery.view} className="hand flex shrink-0 items-center gap-3 text-xl text-[var(--color-text-muted)] sm:pt-1.5">
          <span className="text-[var(--color-text-faint)]">{t.gallery.view.toLowerCase()}:</span>
          {(['grid', 'list'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              aria-pressed={view === v}
              className={`link-underline ${view === v ? 'text-[var(--color-accent-text)]' : ''}`}
            >
              {v === 'grid' ? t.gallery.viewGrid.toLowerCase() : t.gallery.viewList.toLowerCase()}
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 sm:gap-x-7 gap-y-8 sm:gap-y-12">
              {items.map((item, i) => {
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
                    className={`polaroid group cursor-zoom-in transition-transform duration-300 hover:rotate-0 hover:-translate-y-1 ${TILT[i % TILT.length]} ${i % 3 === 0 ? 'tape' : ''}`}
                  >
                    <div className="viewfinder relative aspect-[4/5] overflow-hidden bg-[var(--color-surface-2)]">
                      <Image
                        src={item.src}
                        alt={item.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover"
                      />
                      {item.mediaType === 'VIDEO' && (
                        <span className="hand absolute top-2 left-2 rounded-md bg-black/60 px-2 text-lg text-white">reel</span>
                      )}
                      {heart(
                        item,
                        `absolute top-1.5 right-1.5 rounded-full bg-white/90 text-[#2a2723] transition-opacity ${isFavorite ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-90'}`
                      )}
                    </div>
                    <figcaption className="hand flex items-center gap-2 px-1 pt-2 pb-1 text-xl sm:text-2xl">
                      <span className="text-[var(--color-accent-text)]">{num(frameNumbers.get(item.id))}</span>
                      <span className="min-w-0 flex-1 truncate text-[var(--color-text)]">{item.title}</span>
                      {theme && (
                        <span
                          className="w-2.5 h-2.5 shrink-0 rounded-full"
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
            <ul className="border-t-[1.5px] border-[var(--color-border)]">
              {items.map((item) => (
                <li key={item.id} className="border-b-[1.5px] border-[var(--color-border)]">
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label={item.title}
                    onClick={() => onOpenItem(item)}
                    onKeyDown={openOnKey(item)}
                    className="group grid cursor-zoom-in grid-cols-[3.5rem_1fr_auto] sm:grid-cols-[3rem_4rem_1fr_10rem_5rem_auto] items-center gap-3 sm:gap-5 py-2.5 transition-colors hover:bg-[var(--color-surface-2)] sm:px-2"
                  >
                    <span className="hand hidden sm:block text-xl text-[var(--color-accent-text)]">{num(frameNumbers.get(item.id))}</span>
                    <span className="polaroid relative block p-1 -rotate-2"><span className="relative block aspect-[4/5] overflow-hidden bg-[var(--color-surface-2)]">
                      <Image src={item.src} alt="" fill sizes="64px" className="object-cover" />
                    </span></span>
                    <span className="min-w-0">
                      <span className="label-caps block sm:hidden text-[var(--color-text-faint)]">
                        {num(frameNumbers.get(item.id))}
                        {distinctCategoryLabel(item.category, item.title) && <> — {distinctCategoryLabel(item.category, item.title)}</>}
                      </span>
                      <span className="hand block truncate text-xl sm:text-2xl text-[var(--color-text)]">{item.title}</span>
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
                    className={`lift sketch hand w-11 h-11 text-xl ${safePage === pageNum
                      ? 'bg-[var(--color-accent)] text-[var(--color-accent-ink)]'
                      : 'bg-[var(--color-surface)] text-[var(--color-text)]'
                      }`}
                  >
                    {pageNum}
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
