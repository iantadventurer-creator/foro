'use client';

import type { ReactNode } from 'react';
import { type CategoryTheme } from '@/lib/categoryThemes';

/** Filtro con forma de ficha de juguete: contorno grueso y, al activarse, se
 * rellena con el color de su categoría (o en tinta si no tiene). `count` se
 * muestra en una burbuja. */
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
      style={active && theme ? { background: theme.accent, color: theme.ink } : undefined}
      className={`toy-sm toy-press shrink-0 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-extrabold uppercase tracking-[0.03em] whitespace-nowrap ${active
        ? theme
          ? ''
          : 'bg-[var(--color-text)] text-[var(--color-ink)]'
        : 'bg-[var(--color-surface)] text-[var(--color-text)]'
        }`}
    >
      {!active && theme && <span className="w-2.5 h-2.5 rounded-full border border-[var(--color-border)]" style={{ background: theme.accent }} aria-hidden="true" />}
      {children}
      {count !== undefined && (
        <span className={`min-w-5 h-5 px-1 rounded-full text-[10px] leading-5 text-center ${active ? 'bg-black/15' : 'bg-[var(--color-surface-2)]'}`}>{count}</span>
      )}
    </button>
  );
}
