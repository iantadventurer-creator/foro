'use client';

import type { ReactNode } from 'react';
import { FilterPill } from '@/components/ui/FilterPill';
import { PostCard } from '@/components/community/PostCard';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { PostGridSkeleton } from '@/components/ui/Skeletons';
import { CATEGORY_KEYS, formatCategoryLabel, getCategoryTheme } from '@/lib/categoryThemes';
import type { Post } from '@/lib/community';
import type { CommunityContent } from '@/lib/content/communityContent';

export type FeedSort = 'recent' | 'popular';

const segmentClass = (active: boolean) =>
  `px-3 py-1.5 rounded-full text-xs font-extrabold uppercase transition-colors ${active ? 'bg-[var(--color-highlight)] text-[var(--color-highlight-ink)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`;

/** Filtros por categoría, barra de herramientas (cuántas hay, orden, "mis
 * publicaciones") y cuadrícula de publicaciones de la comunidad. */
export function FeedSection({
  t,
  posts,
  hasAnyPosts,
  loading,
  filterCategory,
  sortBy,
  canFilterMine,
  filterMyPosts,
  emptyAction,
  error,
  onRetry,
  onFilterCategory,
  onSortBy,
  onToggleMine,
  onOpenPost,
}: {
  t: CommunityContent;
  /** Publicaciones ya filtradas y ordenadas. */
  posts: Post[];
  /** Si existe alguna publicación (sin filtros), para elegir el mensaje de vacío. */
  hasAnyPosts: boolean;
  loading: boolean;
  filterCategory: string | null;
  sortBy: FeedSort;
  canFilterMine: boolean;
  filterMyPosts: boolean;
  /** Botón que se ofrece cuando el feed está vacío (publicar o registrarse). */
  emptyAction?: ReactNode;
  /** La carga falló: se muestra el error con un botón para reintentar. */
  error?: boolean;
  onRetry?: () => void;
  onFilterCategory: (category: string | null) => void;
  onSortBy: (sort: FeedSort) => void;
  onToggleMine: () => void;
  onOpenPost: (postId: string) => void;
}) {
  return (
    <section aria-label={t.pageTitle} className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
      <div className="-mx-4 px-4 sm:mx-0 sm:px-0 flex items-center gap-2.5 overflow-x-auto pt-1 pb-3 sm:flex-wrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <FilterPill onClick={() => onFilterCategory(null)} active={filterCategory === null}>
          {t.filterAll}
        </FilterPill>
        {CATEGORY_KEYS.map((key) => (
          <FilterPill key={key} onClick={() => onFilterCategory(key)} active={filterCategory === key} theme={getCategoryTheme(key)}>
            {formatCategoryLabel(key)}
          </FilterPill>
        ))}
      </div>

      <div className="mt-3 mb-8 flex flex-wrap items-center justify-between gap-3">
        <p className="label-caps text-[var(--color-text-muted)]" aria-live="polite">
          {loading ? '…' : t.postsCount(posts.length)}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1 p-1 rounded-full border-2 border-[var(--color-border)] bg-[var(--color-surface)]" role="group" aria-label={`${t.sortRecent} / ${t.sortPopular}`}>
            <button type="button" aria-pressed={sortBy === 'recent'} onClick={() => onSortBy('recent')} className={segmentClass(sortBy === 'recent')}>
              {t.sortRecent}
            </button>
            <button type="button" aria-pressed={sortBy === 'popular'} onClick={() => onSortBy('popular')} className={segmentClass(sortBy === 'popular')}>
              {t.sortPopular}
            </button>
          </div>
          {canFilterMine && (
            <button
              type="button"
              aria-pressed={filterMyPosts}
              onClick={onToggleMine}
              className={`toy-sm toy-press px-4 py-2 rounded-full text-xs font-extrabold uppercase ${filterMyPosts
                ? 'bg-[var(--color-accent)] text-[var(--color-accent-ink)]'
                : 'bg-[var(--color-surface)] text-[var(--color-text)]'
                }`}
            >
              {t.filterMine}
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <PostGridSkeleton count={9} />
      ) : error ? (
        <EmptyState>
          <p>{t.loadError}</p>
          {onRetry && (
            <Button onClick={onRetry} size="sm" className="mt-5">
              {t.retry}
            </Button>
          )}
        </EmptyState>
      ) : posts.length === 0 ? (
        <EmptyState>
          <p>{hasAnyPosts ? t.noResultsFilter : t.noPosts}</p>
          {!hasAnyPosts && emptyAction && <div className="mt-5">{emptyAction}</div>}
        </EmptyState>
      ) : (
        <div className="grid grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onClick={() => onOpenPost(post.id)} />
          ))}
        </div>
      )}
    </section>
  );
}
