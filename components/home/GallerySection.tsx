'use client';

import type { MouseEvent, Ref } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FilterPill } from '@/components/ui/FilterPill';
import { GallerySkeleton } from '@/components/ui/GallerySkeleton';
import { formatCategoryLabel, getCategoryTheme } from '@/lib/categoryThemes';
import { fadeUp } from '@/lib/motion';
import type { HomeContent } from '@/lib/homeContent';
import type { FeedItem } from '@/lib/gallery';

export function GallerySection({
  t,
  sectionRef,
  items,
  totalItems,
  loading,
  feedError,
  categories,
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
  loading: boolean;
  feedError: boolean;
  categories: string[];
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
  const activeGalleryTheme = getCategoryTheme(filterCategory);

  return (
    <section id="gallery" ref={sectionRef} className="max-w-7xl mx-auto px-6 py-16 relative z-10 overflow-hidden">
      <motion.div
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] rounded-full blur-[160px] pointer-events-none -z-10"
        animate={{ backgroundColor: activeGalleryTheme ? `${activeGalleryTheme.accent}26` : 'rgba(0,0,0,0)' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
      <div className="mb-12 flex flex-col items-center text-center gap-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-accent-text)] mb-3">{t.gallery.eyebrow}</p>
          <motion.h2 initial={{ opacity: 0, y: -10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-[var(--color-text)]">
            {t.gallery.title}
          </motion.h2>
          <p className="text-sm text-[var(--color-text-muted)] mt-2 max-w-md mx-auto">{t.gallery.subtitle}</p>
        </div>
        {categories.length > 0 && (
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <FilterPill onClick={() => onSelectCategory(null)} active={filterCategory === null}>
              {t.gallery.filterAll}
            </FilterPill>
            {categories.map((cat) => (
              <FilterPill
                key={cat}
                onClick={() => onSelectCategory(cat)}
                active={filterCategory === cat}
                theme={getCategoryTheme(cat)}
              >
                {formatCategoryLabel(cat)}
              </FilterPill>
            ))}
            <FilterPill
              onClick={onToggleOnlyFavorites}
              active={showOnlyFavorites}
              theme={{ accent: '#e0245e', shadow: '#8a1638', ink: '#ffffff' }}
            >
              ♥ {t.gallery.favorites}
            </FilterPill>
          </div>
        )}
      </div>

      {loading ? (
        <GallerySkeleton />
      ) : feedError ? (
        <div className="flex flex-col items-center text-center py-24 gap-4 border border-dashed border-[var(--color-border)] rounded-2xl">
          <p className="text-[var(--color-text)] font-semibold">{t.gallery.errorTitle}</p>
          <p className="text-sm text-[var(--color-text-muted)] max-w-xs">{t.gallery.errorDesc}</p>
          <button onClick={onRetry} className="mt-2 text-xs font-bold uppercase tracking-wide bg-[var(--color-accent)] text-[var(--color-accent-ink)] px-5 py-2.5 rounded-full hover:brightness-110 transition">
            {t.gallery.retry}
          </button>
        </div>
      ) : totalItems === 0 ? (
        <div className="text-center py-20 text-[var(--color-text-muted)] font-medium text-sm border border-dashed border-[var(--color-border)] rounded-2xl">
          {showOnlyFavorites ? t.gallery.noResults : t.gallery.empty}
        </div>
      ) : (
        <>
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
            {items.map((item) => {
              const isVideo = item.mediaType === 'VIDEO';
              const cardTheme = getCategoryTheme(item.category);
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onOpenItem(item);
                    }
                  }}
                  style={{ '--card-accent': cardTheme?.accent ?? 'var(--color-accent)' } as React.CSSProperties}
                  className="mb-6 break-inside-avoid group cursor-pointer rounded-2xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--card-accent)]/60 transition-colors relative focus-visible:border-[var(--card-accent)]"
                >
                  <div className="relative overflow-hidden bg-black">
                    <Image
                      src={item.src}
                      alt={item.title}
                      width={0}
                      height={0}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="w-full h-auto object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                    />
                    {isVideo && (
                      <div className="absolute top-3 right-3 bg-[var(--color-accent-2)] text-[#2a1600] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Reel
                      </div>
                    )}
                    <motion.button
                      whileTap={{ scale: 1.3 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                      onClick={(e) => onToggleFavorite(item.id, e)}
                      aria-label={favorites.has(item.id) ? t.modal.removeFavorite : t.modal.addFavorite}
                      aria-pressed={favorites.has(item.id)}
                      className={`absolute top-3 left-3 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-base transition-all ${favorites.has(item.id) ? 'opacity-100' : 'opacity-70 hover:opacity-100'
                        }`}
                    >
                      <motion.span
                        key={favorites.has(item.id) ? 'fav' : 'unfav'}
                        initial={{ scale: 0.6 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                        style={{ color: favorites.has(item.id) ? '#e0245e' : '#ffffff' }}
                      >
                        {favorites.has(item.id) ? '♥' : '♡'}
                      </motion.span>
                    </motion.button>
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 pt-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <figcaption
                        className="text-sm font-bold line-clamp-1"
                        style={{ color: cardTheme?.accent ?? '#ffffff' }}
                      >
                        {item.title}
                      </figcaption>
                    </div>
                  </div>
                </motion.figure>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
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
                    className={`w-9 h-9 rounded-full font-bold text-xs transition-all border flex items-center justify-center ${safePage === pageNum
                        ? 'bg-[var(--color-accent)] text-[var(--color-accent-ink)] border-[var(--color-accent)]'
                        : 'bg-transparent text-[var(--color-text-muted)] border-[var(--color-border)] hover:text-[var(--color-text)]'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}
    </section>
  );
}
