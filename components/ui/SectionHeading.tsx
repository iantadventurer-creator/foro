import type { ReactNode } from 'react';

/** Encabezado de sección: etiqueta pequeña, título y subtítulo opcional,
 * centrados. Se usa igual en todas las secciones de la portada. */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  className = '',
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={`text-center ${className}`.trim()}>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-accent-text)] mb-3">{eyebrow}</p>
      <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-[var(--color-text)]">{title}</h2>
      {subtitle && <p className="text-sm text-[var(--color-text-muted)] mt-2 max-w-md mx-auto">{subtitle}</p>}
    </div>
  );
}
