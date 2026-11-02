'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { formatCategoryLabel, getCategoryTheme } from '@/lib/categoryThemes';
import type { HomeContent } from '@/lib/content/homeContent';

export type Universe = { name: string; count: number; cover?: string };

/** Giro de cada polaroid, para que parezcan pegadas a mano. */
const TILT = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2', 'rotate-1', '-rotate-2'];

/** Universos (Star Wars, Ninjago...) como polaroids pegadas con cinta en el
 * cuaderno: la foto de portada y, escritos a mano debajo, el nombre con el
 * punto de color de la franquicia y el número de fotos. Al tocar una, la
 * galería se filtra por ese universo. */
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
    <section aria-labelledby="universes-title" className="max-w-[1320px] mx-auto px-4 sm:px-6 pb-16 md:pb-24">
      <SectionHeading step={1} eyebrow={t.universes.eyebrow} title={<span id="universes-title">{t.universes.title}</span>} subtitle={t.universes.subtitle} />

      <ul className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-5 gap-y-10">
        {universes.map((universe, i) => {
          const theme = getCategoryTheme(universe.name);
          return (
            <motion.li
              key={universe.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: Math.min(i, 5) * 0.05 }}
            >
              <button
                type="button"
                onClick={() => onSelect(universe.name)}
                aria-label={`${formatCategoryLabel(universe.name)} — ${t.universes.photos(universe.count)}`}
                className={`polaroid lift group block w-full text-left ${i % 2 === 0 ? 'tape' : ''} ${TILT[i % TILT.length]}`}
              >
                <span className="relative block aspect-square overflow-hidden bg-[var(--color-surface-2)]">
                  {universe.cover && <Image src={universe.cover} alt="" fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw" className="object-cover" />}
                </span>
                <span className="flex items-baseline justify-between gap-2 px-1 pt-2 pb-1">
                  <span className="hand flex min-w-0 items-center gap-1.5 text-2xl text-[var(--color-text)]">
                    <span className="w-2.5 h-2.5 shrink-0 rounded-full" style={{ background: theme?.accent ?? 'var(--color-accent)' }} aria-hidden="true" />
                    <span className="truncate">{formatCategoryLabel(universe.name)}</span>
                  </span>
                  <span className="hand shrink-0 text-lg text-[var(--color-text-muted)]">{universe.count}</span>
                </span>
              </button>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}
