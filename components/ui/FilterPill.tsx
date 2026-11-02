'use client';

import type { ReactNode } from 'react';
import { type CategoryTheme } from '@/lib/categoryThemes';

/** Filtro con trazo a mano, como una etiqueta rodeada con bolígrafo. Activo
 * se rellena del azul bolígrafo de la web. La categoría se reconoce por un
 * punto de su color y `count` va al lado, más tenue. */
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
      className={`lift shrink-0 inline-flex items-center gap-2 border-[1.5px] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] px-3.5 py-1.5 text-sm font-semibold whitespace-nowrap ${active ? 'border-[var(--color-line)] bg-[var(--color-accent)] text-[var(--color-accent-ink)]' : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--color-line)]'}`}
    >
      {theme && <span className="w-2.5 h-2.5 rounded-full" style={{ background: theme.accent }} aria-hidden="true" />}
      {children}
      {count !== undefined && <span className={`text-xs ${active ? 'opacity-75' : 'text-[var(--color-text-faint)]'}`}>{count}</span>}
    </button>
  );
}
