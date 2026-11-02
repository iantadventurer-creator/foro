'use client';

import Image from 'next/image';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { formatCategoryLabel, getCategoryTheme } from '@/lib/categoryThemes';
import type { HomeContent } from '@/lib/content/homeContent';

export type Universe = { name: string; count: number; cover?: string };

/** Universos (Star Wars, Ninjago...) como la lista de piezas de un manual
 * LEGO: filas numeradas con una miniatura de portada, el nombre, el
 * cuadradito de color de la franquicia y la cantidad de fotos ("9x"). Al tocar una, la galería se filtra
 * por ese universo. */
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
    <section aria-labelledby="universes-title" className="max-w-[1440px] mx-auto px-4 sm:px-6 pb-16 md:pb-24">
      <SectionHeading step={1} eyebrow={t.universes.eyebrow} title={<span id="universes-title">{t.universes.title}</span>} subtitle={t.universes.subtitle} />

      <ul className="mt-8 grid lg:grid-cols-2 lg:gap-x-10 border-t border-[var(--color-border)] lg:border-t-0">
        {universes.map((universe, i) => {
          const theme = getCategoryTheme(universe.name);
          return (
            <li key={universe.name} className={`border-b border-[var(--color-border)] ${i < 2 ? 'lg:border-t' : ''}`}>
              <button
                type="button"
                onClick={() => onSelect(universe.name)}
                aria-label={`${formatCategoryLabel(universe.name)} — ${t.universes.photos(universe.count)}`}
                className="group grid w-full grid-cols-[2rem_3.5rem_1fr_auto] items-center gap-4 rounded-lg py-3 text-left transition-colors hover:bg-[var(--color-surface-2)] sm:px-2"
              >
                <span className="label-caps text-[var(--color-text-faint)]">{String(i + 1).padStart(2, '0')}</span>
                <span className="relative block aspect-[4/5] overflow-hidden rounded-md bg-[var(--color-surface-2)]">
                  {universe.cover && <Image src={universe.cover} alt="" fill sizes="56px" className="object-cover" />}
                </span>
                <span className="flex min-w-0 items-center gap-2.5">
                  <span className="w-2.5 h-2.5 shrink-0 rounded-[2px]" style={{ background: theme?.accent ?? 'var(--color-text)' }} aria-hidden="true" />
                  <span className="truncate font-display text-lg sm:text-xl font-semibold tracking-[-0.03em] text-[var(--color-text)]">
                    {formatCategoryLabel(universe.name)}
                  </span>
                </span>
                <span className="flex items-center gap-3 text-[var(--color-text-muted)]">
                  <span className="font-mono text-sm font-semibold text-[var(--color-text)]">{universe.count}x</span>
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
