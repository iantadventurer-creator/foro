'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { formatCategoryLabel, getCategoryTheme } from '@/lib/categoryThemes';
import type { HomeContent } from '@/lib/content/homeContent';

export type Universe = { name: string; count: number; cover?: string };

/** Universos (Star Wars, Ninjago...) como tarjetas sobrias: la foto de
 * portada manda y debajo van el nombre, con el punto de color de la
 * franquicia, y el número de fotos. Al tocar una, la galería se filtra por
 * ese universo. */
export function UniverseTiles({
  t,
  universes,
  onSelect,
}: {
  t: HomeContent;
  universes: Universe[];
  onSelect: (name: string) => void;
}) {
  if (universes.length === 0) return null;

  return (
    <section aria-labelledby="universes-title" className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 md:pb-24">
      <SectionHeading eyebrow={t.universes.eyebrow} title={<span id="universes-title">{t.universes.title}</span>} subtitle={t.universes.subtitle} />

      <ul className="mt-8 grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
        {universes.map((universe, i) => {
          const theme = getCategoryTheme(universe.name);
          return (
            <motion.li
              key={universe.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: Math.min(i, 5) * 0.05 }}
            >
              <button
                type="button"
                onClick={() => onSelect(universe.name)}
                aria-label={`${formatCategoryLabel(universe.name)} — ${t.universes.photos(universe.count)}`}
                className="panel lift group w-full overflow-hidden rounded-2xl bg-[var(--color-surface)] text-left"
              >
                <span className="relative block aspect-[4/3] overflow-hidden bg-[var(--color-surface-2)]">
                  {universe.cover && (
                    <Image
                      src={universe.cover}
                      alt=""
                      fill
                      sizes="(max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                  )}
                </span>
                <span className="flex items-center justify-between gap-3 px-3 py-3 sm:px-4">
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 shrink-0 rounded-full" style={{ background: theme?.accent ?? 'var(--color-accent)' }} aria-hidden="true" />
                    <span className="truncate font-display text-base sm:text-lg font-bold tracking-[-0.02em] text-[var(--color-text)]">
                      {formatCategoryLabel(universe.name)}
                    </span>
                  </span>
                  <span className="label-caps shrink-0 text-[var(--color-text-faint)]">{universe.count}</span>
                </span>
              </button>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}
