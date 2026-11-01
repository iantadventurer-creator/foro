'use client';

import Image from 'next/image';
import type { Post } from '@/lib/community';
import { getCategoryTheme, formatCategoryLabel } from '@/lib/categoryThemes';
import { HeartIcon } from '@/components/ui/HeartIcon';

/** Miniatura cuadrada del feed como ficha de juguete (contorno y sombra
 * sólida). Encima, la categoría (con un punto de su color) y los me gusta;
 * al pasar el ratón o enfocar con el teclado aparecen el texto y el autor. */
export function PostCard({ post, onClick }: { post: Post; onClick: () => void }) {
  const likesCount = post.post_likes?.length || 0;
  const cardTheme = getCategoryTheme(post.category);

  return (
    <button
      onClick={onClick}
      aria-label={post.instagram_handle ? `${post.title} — ${post.instagram_handle}` : post.title}
      className="panel-sm lift relative aspect-square overflow-hidden rounded-xl sm:rounded-2xl bg-[var(--color-surface-2)] group focus-visible:z-10"
    >
      <Image
        src={post.image_url}
        alt=""
        fill
        sizes="(max-width: 1024px) 33vw, 320px"
        quality={85}
        className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
      />

      {cardTheme && post.category && (
        <span
          className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 flex items-center gap-1.5 rounded-full bg-black/55 text-white backdrop-blur-sm p-1 sm:pl-1.5 sm:pr-2 sm:py-0.5 label-caps text-[10px]"
        >
          <span className="w-2 h-2 rounded-full" style={{ background: cardTheme.accent }} aria-hidden="true" />
          <span className="hidden sm:inline">{formatCategoryLabel(post.category)}</span>
        </span>
      )}

      {likesCount > 0 && (
        <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 flex items-center gap-1 rounded-full bg-black/55 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold text-white">
          <HeartIcon filled className="w-3 h-3 text-[#ff6b8b]" />
          {likesCount}
        </span>
      )}

      <span className="absolute inset-x-0 bottom-0 hidden sm:flex flex-col items-start gap-0.5 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3 pt-12 text-left opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
        <span className="font-display text-base font-bold text-white line-clamp-2 leading-tight">{post.title}</span>
        {post.instagram_handle && <span className="text-[11px] font-bold text-[var(--color-highlight)]">{post.instagram_handle}</span>}
      </span>
    </button>
  );
}
