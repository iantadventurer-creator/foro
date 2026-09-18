'use client';

import Image from 'next/image';
import type { Post } from '@/lib/community';
import { getCategoryTheme, formatCategoryLabel } from '@/lib/categoryThemes';

/** Miniatura cuadrada de la cuadrícula, tipo grid de Instagram/Bricktiv —
 * sin bordes ni esquinas redondeadas, la foto es todo el contenido. */
export function PostCard({ post, onClick }: { post: Post; onClick: () => void }) {
  const likesCount = post.post_likes?.length || 0;
  const cardTheme = getCategoryTheme(post.category);

  return (
    <button
      onClick={onClick}
      aria-label={post.title}
      className="relative aspect-square overflow-hidden bg-black group focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] focus-visible:-outline-offset-2"
    >
      <Image
        src={post.image_url}
        alt={post.title}
        fill
        sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 240px"
        className="object-cover group-hover:scale-105 transition-transform duration-300"
      />
      {cardTheme && post.category && (
        <span
          className="absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide"
          style={{ background: cardTheme.accent, color: cardTheme.ink }}
        >
          {formatCategoryLabel(post.category)}
        </span>
      )}
      {likesCount > 0 && (
        <span className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
          ❤️ {likesCount}
        </span>
      )}
    </button>
  );
}
