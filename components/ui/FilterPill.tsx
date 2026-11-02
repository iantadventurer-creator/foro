'use client';

import type { ReactNode } from 'react';
import { type CategoryTheme } from '@/lib/categoryThemes';

/** Filtro con forma de ficha: texto monoespaciado en una caja de esquinas
 * suaves. Activo se rellena del Sand Blue de la web. La categoría se
 * reconoce por un cuadradito de su color y `count` va al lado, en gris. */
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
      className={`lift shrink-0 inline-flex items-center gap-2 rounded-md border px-3 py-2 font-mono text-[11px] font-medium uppercase tracking-[0.04em] whitespace-nowrap ${active ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-accent-ink)]' : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]'}`}
    >
      {theme && <span className="w-2 h-2 rounded-[1px] ring-1 ring-white/40" style={{ background: theme.accent }} aria-hidden="true" />}
      {children}
      {count !== undefined && <span className={active ? 'opacity-70' : 'text-[var(--color-text-faint)]'}>{String(count).padStart(2, '0')}</span>}
    </button>
  );
}
