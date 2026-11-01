import type { ReactNode } from 'react';

/** Encabezado de sección: etiqueta pequeña, titular y subtítulo al lado en
 * escritorio. Sobrio, para no competir con las fotos. */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  className = '',
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
  className?: string;
  /** Contenido extra junto al subtítulo (p. ej. botones). */
  children?: ReactNode;
}) {
  return (
    <div className={className}>
      <p className="label-caps text-[var(--color-text-faint)] mb-3">{eyebrow}</p>
      <div className="grid gap-4 md:grid-cols-[1fr_minmax(0,22rem)] md:items-end">
        <h2 className="font-display text-[clamp(2rem,4.5vw,3.25rem)] font-bold leading-[1] tracking-[-0.04em] text-[var(--color-text)]">
          {title}
        </h2>
        {(subtitle || children) && (
          <div className="md:pb-1">
            {subtitle && <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">{subtitle}</p>}
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
