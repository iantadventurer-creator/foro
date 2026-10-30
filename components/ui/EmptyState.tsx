import type { ReactNode } from 'react';

/** Caja de "no hay nada que mostrar" (sin resultados, sin publicaciones,
 * error de carga...). Mismo aspecto en toda la web. */
export function EmptyState({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`text-center py-16 px-4 bg-[var(--color-surface)] border border-dashed border-[var(--color-border)] rounded-2xl text-[var(--color-text-muted)] font-medium text-sm ${className}`.trim()}
    >
      {children}
    </div>
  );
}
