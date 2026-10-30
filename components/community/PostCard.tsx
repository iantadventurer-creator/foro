'use client';

import Image from 'next/image';
import type { Post } from '@/lib/community';
import { getCategoryTheme, formatCategoryLabel } from '@/lib/categoryThemes';
import { HeartIcon } from '@/components/ui/HeartIcon';

/** Miniatura cuadrada del feed. La foto es el contenido; encima, la categoría
 * (con un "stud" de su color) y los me gusta; al pasar el ratón o enfocar con
 * el teclado aparecen el texto y el autor. */
export function PostCard({ post, onClick }: { post: Post; onClick: () => void }) {
  const likesCount = post.post_likes?.length || 0;
  const cardTheme = getCategoryTheme(post.category);

  return (
    <button
      onClick={onClick}
      aria-label={post.instagram_handle ? `${post.title} — ${post.instagram_handle}` : post.title}
      className="relative aspect-square overflow-hidden rounded-lg bg-black group border border-[var(--color-border)] hover:border-[var(--color-text-faint)] transition-colors focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] focus-visible:outline-offset-2"
    >
      <Image
        src={post.image_url}
        alt=""
        fill
        sizes="(max-width: 1152px) 33vw, 384px"
        quality={85}
        className="object-cover group-hover:scale-105 transition-transform duration-300"
      />

      {cardTheme && post.category && (
        <span className="absolute top-2 left-2 flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-sm pl-1.5 pr-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wide text-white">
          <span className="w-2 h-2 rounded-full shadow-[inset_0_-1px_0_rgba(0,0,0,0.3)]" style={{ background: cardTheme.accent }} aria-hidden="true" />
          {formatCategoryLabel(post.category)}
        </span>
      )}

      {likesCount > 0 && (
        <span className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold text-white">
          <HeartIcon filled className="w-3 h-3 text-[#ff4d6d]" />
          {likesCount}
        </span>
      )}

      <span className="absolute inset-x-0 bottom-0 hidden sm:flex flex-col items-start gap-0.5 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 pt-10 text-left opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
        <span className="text-sm font-semibold text-white line-clamp-2 leading-snug">{post.title}</span>
        {post.instagram_handle && <span className="text-[11px] font-semibold text-white/70">{post.instagram_handle}</span>}
      </span>
    </button>
  );
}
