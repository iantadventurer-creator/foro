'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { formatCategoryLabel, getCategoryTheme } from '@/lib/categoryThemes';
import type { HomeContent } from '@/lib/content/homeContent';

export type Universe = { name: string; count: number; cover?: string };

const FALLBACK = { accent: '#c9b8ff', ink: '#13204a' };

/** Universos (Star Wars, Ninjago...) como fichas de juguete, cada una del
 * color de su universo, con su foto más reciente y una pegatina con el
 * número de fotos. Al tocar una, la galería se filtra por ese universo. */
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
    <section aria-labelledby="universes-title" className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 md:pb-28">
      <SectionHeading index="01" tone="primary" eyebrow={t.universes.eyebrow} title={<span id="universes-title">{t.universes.title}</span>} subtitle={t.universes.subtitle} />

      <ul className="mt-10 grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {universes.map((universe, i) => {
          const theme = getCategoryTheme(universe.name) ?? FALLBACK;
          return (
            <motion.li
              key={universe.name}
              initial={{ opacity: 0, y: 30, rotate: i % 2 ? 3 : -3 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ type: 'spring', stiffness: 220, damping: 18, delay: Math.min(i, 5) * 0.05 }}
            >
              <button
                type="button"
                onClick={() => onSelect(universe.name)}
                aria-label={`${formatCategoryLabel(universe.name)} — ${t.universes.photos(universe.count)}`}
                style={{ background: theme.accent, color: theme.ink }}
                className="toy toy-press group relative w-full h-full flex flex-col gap-3 sm:gap-4 rounded-3xl p-2.5 sm:p-3.5 text-left [--color-border:#13204a] [--toy-shadow:#13204a]"
              >
                <span className="relative block aspect-[4/3] overflow-hidden rounded-2xl border-2 border-[#13204a] bg-black/20">
                  {universe.cover && (
                    <Image
                      src={universe.cover}
                      alt=""
                      fill
                      sizes="(max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  )}
                  <span className="sticker absolute top-2 right-2 bg-white text-[#13204a] text-[10px] sm:text-xs rotate-[4deg]">
                    {t.universes.photos(universe.count)}
                  </span>
                </span>
                <span className="flex items-end justify-between gap-2 px-1.5 pb-1">
                  <span className="font-display text-xl sm:text-3xl font-black uppercase leading-[0.95] tracking-[-0.01em]">
                    {formatCategoryLabel(universe.name)}
                  </span>
                  <span
                    className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-[#13204a] bg-white text-[#13204a] flex items-center justify-center font-black transition-transform group-hover:rotate-[-45deg]"
                    aria-hidden="true"
                  >
                    →
                  </span>
                </span>
              </button>
            </motion.li>
          );
        })}
      </ul>
    </section>
  );
}
