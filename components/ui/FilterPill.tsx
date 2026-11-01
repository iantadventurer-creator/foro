'use client';

import type { ReactNode } from 'react';
import { type CategoryTheme } from '@/lib/categoryThemes';

/** Filtro con forma de ficha de juguete. Activo se rellena de marino (la
 * tinta de la paleta), así todos los filtros comparten color; la categoría
 * se reconoce por su punto de color. `count` se muestra en una burbuja. */
export function FilterPill({
  children,
  onClick,
  active,
  theme,
  count,
}: {
  children: ReactNode;
  onClick: () => void;
  active: boolean;
  theme?: CategoryTheme | null;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`panel-sm lift shrink-0 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-bold uppercase tracking-[0.03em] whitespace-nowrap ${active ? 'bg-[var(--color-text)] text-[var(--color-ink)]' : 'bg-[var(--color-surface)] text-[var(--color-text)]'}`}
    >
      {theme && <span className="w-2.5 h-2.5 rounded-full ring-2 ring-[var(--color-surface)]" style={{ background: theme.accent }} aria-hidden="true" />}
      {children}
      {count !== undefined && (
        <span className={`min-w-5 h-5 px-1 rounded-full text-[10px] leading-5 text-center ${active ? 'bg-[var(--color-highlight)] text-[var(--color-highlight-ink)]' : 'bg-[var(--color-surface-2)]'}`}>{count}</span>
      )}
    </button>
  );
}
