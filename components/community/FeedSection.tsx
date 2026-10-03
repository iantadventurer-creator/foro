'use client';

import { FilterPill } from '@/components/ui/FilterPill';
import { PostCard } from '@/components/community/PostCard';
import { CATEGORY_KEYS, formatCategoryLabel, getCategoryTheme } from '@/lib/categoryThemes';
import type { Post } from '@/lib/community';
import type { CommunityContent } from '@/lib/communityContent';

export type FeedSort = 'recent' | 'popular';

/** Filtros, orden y cuadrícula de publicaciones de la comunidad. */
export function FeedSection({
  t,
  posts,
  hasAnyPosts,
  loading,
  filterCategory,
  sortBy,
  canFilterMine,
  filterMyPosts,
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
  onFilterCategory: (category: string | null) => void;
  onSortBy: (sort: FeedSort) => void;
  onToggleMine: () => void;
  onOpenPost: (postId: string) => void;
}) {
  return (
    <div className="max-w-6xl mx-auto px-4 pb-16">
        <div className="mb-10 flex flex-col items-center text-center gap-6">
            <div className="w-full flex items-center gap-3 overflow-x-auto px-4 sm:px-0 sm:flex-wrap sm:justify-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <FilterPill onClick={() => onFilterCategory(null)} active={filterCategory === null}>
                    {t.filterAll}
                </FilterPill>
                {CATEGORY_KEYS.map((key) => (
                    <FilterPill
                        key={key}
                        onClick={() => onFilterCategory(key)}
                        active={filterCategory === key}
                        theme={getCategoryTheme(key)}
                    >
                        {formatCategoryLabel(key)}
                    </FilterPill>
                ))}
            </div>

            <div className="flex flex-wrap justify-center gap-2">
                <div className="flex gap-1 bg-[var(--color-surface)] p-1 rounded-full border border-[var(--color-border)]">
                    <button
                        onClick={() => onSortBy('recent')}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase transition-all ${sortBy === 'recent' ? 'bg-[var(--color-accent-3)] text-white' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}
                    >
                        {t.sortRecent}
                    </button>
                    <button
                        onClick={() => onSortBy('popular')}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase transition-all ${sortBy === 'popular' ? 'bg-[var(--color-accent-3)] text-white' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}
                    >
                        {t.sortPopular}
                    </button>
                </div>
                {canFilterMine && (
                    <button
                        onClick={() => onToggleMine()}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase transition-all border ${filterMyPosts ? 'bg-[var(--color-accent)] text-[var(--color-accent-ink)] border-[var(--color-accent)]' : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:text-[var(--color-text)]'}`}
                    >
                        {t.filterMine}
                    </button>
                )}
            </div>
        </div>

        {loading ? (
            <div className="grid grid-cols-3 gap-0.5 sm:gap-1 -mx-4 sm:mx-0" aria-hidden="true">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="aspect-square animate-shimmer" />
                ))}
            </div>
        ) : posts.length === 0 ? (
            <div className="mx-4 sm:mx-0 text-center py-16 bg-[var(--color-surface)] border border-dashed border-[var(--color-border)] rounded-2xl text-[var(--color-text-muted)] font-medium text-sm">
                {hasAnyPosts ? t.noResultsFilter : t.noPosts}
            </div>
        ) : (
            <div className="grid grid-cols-3 gap-0.5 sm:gap-1 -mx-4 sm:mx-0">
                {posts.map((post) => (
                    <PostCard key={post.id} post={post} onClick={() => onOpenPost(post.id)} />
                ))}
            </div>
        )}
    </div>
  );
}
