'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { formatCategoryLabel, getCategoryTheme } from '@/lib/categoryThemes';
import type { HomeContent } from '@/lib/content/homeContent';

export type Universe = { name: string; count: number; cover?: string };

/** Carril horizontal de universos (Star Wars, Ninjago...): una tarjeta alta
 * por universo con su foto más reciente. Al tocar una, la galería se filtra
 * por ese universo. Se desliza con el dedo, la rueda o los botones. */
export function UniverseRail({
  t,
  universes,
  onSelect,
}: {
  t: HomeContent;
  universes: Universe[];
  onSelect: (name: string) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  if (universes.length === 0) return null;

  const scrollBy = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (el) el.scrollBy({ left: direction * Math.max(280, el.clientWidth * 0.7), behavior: 'smooth' });
  };

  return (
    <section aria-labelledby="universes-title" className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
      <div className="flex items-end justify-between gap-6 mb-6">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--color-accent-text)] mb-2">{'// '}{t.universes.eyebrow}</p>
          <h2 id="universes-title" className="font-display text-3xl md:text-5xl font-bold uppercase tracking-[-0.02em] text-[var(--color-text)]">
            {t.universes.title}
          </h2>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">{t.universes.subtitle}</p>
        </div>
        <div className="hidden sm:flex gap-2 shrink-0">
          {([-1, 1] as const).map((dir) => (
            <button
              key={dir}
              type="button"
              onClick={() => scrollBy(dir)}
              aria-label={dir === -1 ? '←' : '→'}
              className="w-11 h-11 rounded-full border-2 border-[var(--color-text)] text-[var(--color-text)] font-bold hover:bg-[var(--color-text)] hover:text-[var(--color-ink)] transition-colors"
            >
              {dir === -1 ? '←' : '→'}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="-mx-4 px-4 sm:mx-0 sm:px-0 flex gap-4 overflow-x-auto snap-x snap-mandatory pb-3 [scrollbar-width:thin]"
      >
        {universes.map((universe, i) => {
          const theme = getCategoryTheme(universe.name);
          return (
            <motion.button
              key={universe.name}
              type="button"
              onClick={() => onSelect(universe.name)}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: Math.min(i, 6) * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="group relative shrink-0 snap-start w-[68vw] sm:w-64 lg:w-72 aspect-[3/4] overflow-hidden rounded-[1.5rem] bg-[#0a1428] text-left text-white card-depth focus-visible:outline-offset-4"
            >
              {universe.cover && (
                <Image
                  src={universe.cover}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 68vw, 288px"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
              )}
              <span className="absolute inset-0 bg-gradient-to-t from-[#0a1428] via-[#0a1428]/25 to-transparent" aria-hidden="true" />
              <span className="pointer-events-none absolute inset-2.5 rounded-[1.15rem] border border-white/20" aria-hidden="true" />

              <span className="absolute top-5 left-5 font-mono text-xs tracking-[0.2em] text-white/80">{String(i + 1).padStart(2, '0')}</span>
              <span className="absolute top-5 right-5 w-3 h-3 rounded-full ring-2 ring-white/40" style={{ background: theme?.accent ?? 'var(--color-lego-yellow)' }} aria-hidden="true" />

              <span className="absolute left-5 right-5 bottom-5">
                <span className="block font-display text-2xl lg:text-3xl font-bold uppercase leading-none tracking-tight">
                  {formatCategoryLabel(universe.name)}
                </span>
                <span className="mt-2 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-white/80">
                  {t.universes.photos(universe.count)}
                  <span className="text-[var(--color-lego-yellow)] transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">→</span>
                </span>
              </span>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
