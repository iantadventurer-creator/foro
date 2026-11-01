'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { formatCategoryLabel } from '@/lib/categoryThemes';
import type { HomeContent } from '@/lib/content/homeContent';
import type { FeedItem } from '@/lib/gallery';

const EASE = [0.22, 1, 0.36, 1] as const;

/** Hueco de cada foto del mosaico: la primera, grande (2×2); el resto,
 * cuadradas. En móvil la grande ocupa todo el ancho y las demás van de dos
 * en dos. */
const TILES = [
  { className: 'col-span-2 md:row-span-2 aspect-[4/3] md:aspect-auto', sizes: '(max-width: 768px) 100vw, 50vw' },
  { className: 'aspect-square md:aspect-auto', sizes: '(max-width: 768px) 50vw, 25vw' },
  { className: 'aspect-square md:aspect-auto', sizes: '(max-width: 768px) 50vw, 25vw' },
  { className: 'aspect-square md:aspect-auto', sizes: '(max-width: 768px) 50vw, 25vw' },
  { className: 'aspect-square md:aspect-auto', sizes: '(max-width: 768px) 50vw, 25vw' },
];

/** Portada: lo protagonista son las fotos. Un texto breve arriba y, debajo,
 * un mosaico con las cinco más recientes; al tocar una se abre en grande. */
export function Hero({
  t,
  photos,
  photoCount,
  universeCount,
  loading,
  onOpenItem,
}: {
  t: HomeContent;
  /** Las fotos más recientes de la galería (se usan las cinco primeras). */
  photos: FeedItem[];
  photoCount: number;
  universeCount: number;
  loading: boolean;
  onOpenItem: (item: FeedItem) => void;
}) {
  return (
    <section id="top" className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 md:pt-12 pb-16 md:pb-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end mb-8 md:mb-10"
      >
        <div>
          <p className="label-caps text-[var(--color-text-muted)]">{t.hero.badge} · @iantadventurer</p>
          <h1 className="mt-3 font-display font-bold leading-[0.95] tracking-[-0.045em] text-[clamp(2.6rem,6vw,4.75rem)] text-[var(--color-text)]">
            {t.hero.display[0]} <span className="text-[var(--color-accent-text)]">{t.hero.display[1]}.</span>
          </h1>
          <p className="mt-4 max-w-xl text-[var(--color-text-muted)] leading-relaxed">{t.hero.description}</p>
        </div>
        <div className="flex flex-col gap-4 md:items-end">
          <div className="flex flex-wrap gap-3">
            <Button href="#gallery">{t.hero.btnExplore} ↓</Button>
            <Button href="/comunidad" variant="secondary">
              {t.nav.community} →
            </Button>
          </div>
          <p className="label-caps text-[var(--color-text-faint)]" aria-busy={loading}>
            {loading ? '—' : photoCount} {t.hero.stat1} · {loading ? '—' : universeCount} {t.hero.stat2}
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 md:grid-rows-2 gap-2 sm:gap-3 md:h-[min(72vh,660px)]">
        {TILES.map((tile, i) => {
          const item = photos[i];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07, duration: 0.7, ease: EASE }}
              className={`relative overflow-hidden rounded-2xl bg-[var(--color-surface-2)] ${tile.className}`}
            >
              {item ? (
                <button
                  type="button"
                  onClick={() => onOpenItem(item)}
                  aria-label={item.title}
                  className="group absolute inset-0 cursor-zoom-in"
                >
                  <Image
                    src={item.src}
                    alt=""
                    fill
                    priority={i < 2}
                    sizes={tile.sizes}
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                  {item.category && (
                    <span className="label-caps absolute left-3 bottom-3 rounded-full bg-black/55 px-2.5 py-1 text-white backdrop-blur-sm md:opacity-0 md:group-hover:opacity-100 md:group-focus-visible:opacity-100 transition-opacity">
                      {formatCategoryLabel(item.category)}
                    </span>
                  )}
                </button>
              ) : (
                <span className="absolute inset-0 animate-shimmer" aria-hidden="true" />
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
