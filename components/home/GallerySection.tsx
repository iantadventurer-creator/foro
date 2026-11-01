'use client';

import type { MouseEvent, Ref } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { FilterPill } from '@/components/ui/FilterPill';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { GallerySkeleton } from '@/components/ui/GallerySkeleton';
import { formatCategoryLabel, getCategoryTheme } from '@/lib/categoryThemes';
import { fadeUp } from '@/lib/motion';
import type { HomeContent } from '@/lib/content/homeContent';
import type { FeedItem } from '@/lib/gallery';

const FAVORITE_THEME = { accent: '#ff4d8d', shadow: '#8a1638', ink: '#13204a' };

export function GallerySection({
  t,
  sectionRef,
  items,
  totalItems,
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
  return (
    <section id="gallery" ref={sectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 md:pb-28 scroll-mt-20">
      <SectionHeading index="02" tone="secondary" eyebrow={t.gallery.eyebrow} title={t.gallery.title} subtitle={t.gallery.subtitle} />

      {categories.length > 0 && (
        <div className="mt-8 mb-10 -mx-4 px-4 sm:mx-0 sm:px-0 flex items-center gap-2.5 overflow-x-auto sm:flex-wrap pt-1 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
          <div className="columns-2 lg:columns-3 gap-3 sm:gap-6">
            {items.map((item) => {
              const isVideo = item.mediaType === 'VIDEO';
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onOpenItem(item);
                    }
                  }}
                  className="toy-sm toy-press group mb-3 sm:mb-6 break-inside-avoid cursor-pointer overflow-hidden rounded-2xl sm:rounded-3xl bg-[var(--color-surface)]"
                >
                  <div className="relative overflow-hidden bg-[var(--color-surface-2)]">
                    <Image
                      src={item.src}
                      alt={item.title}
                      width={0}
                      height={0}
                      sizes="(max-width: 1024px) 50vw, 33vw"
                      className="w-full h-auto object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                    {isVideo && (
                      <span className="sticker absolute top-2.5 right-2.5 bg-[var(--color-highlight)] text-[#13204a] border-[#13204a] text-[10px] rotate-[4deg]">Reel</span>
                    )}
                    <motion.button
                      whileTap={{ scale: 1.3 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                      onClick={(e) => onToggleFavorite(item.id, e)}
                      aria-label={isFavorite ? t.modal.removeFavorite : t.modal.addFavorite}
                      aria-pressed={isFavorite}
                      className="absolute top-2.5 left-2.5 w-9 h-9 flex items-center justify-center rounded-full border-2 border-[#13204a] bg-white text-lg"
                    >
                      <span style={{ color: isFavorite ? '#e0245e' : '#13204a' }}>{isFavorite ? '♥' : '♡'}</span>
                    </motion.button>
                  </div>
                  <figcaption className="flex items-center justify-between gap-2 border-t-2 border-[var(--color-border)] px-3 py-2.5">
                    <span className="min-w-0 text-sm font-bold leading-snug text-[var(--color-text)] line-clamp-1">{item.title}</span>
                    {item.category && (
                      <span
                        className="hidden sm:block w-3 h-3 shrink-0 rounded-full border-2 border-[var(--color-border)]"
                        style={{ background: theme?.accent ?? 'var(--color-accent)' }}
                        title={formatCategoryLabel(item.category)}
                        aria-hidden="true"
                      />
                    )}
                  </figcaption>
                </motion.figure>
              );
            })}
          </div>

          {totalPages > 1 && (
            <nav aria-label={t.gallery.title} className="flex justify-center items-center gap-2.5 mt-10">
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
                    className={`toy-sm toy-press w-11 h-11 rounded-full font-black text-sm ${safePage === pageNum
                      ? 'bg-[var(--color-highlight)] text-[var(--color-highlight-ink)]'
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
