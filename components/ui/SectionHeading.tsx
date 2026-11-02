import type { ReactNode } from 'react';

/** Encabezado de sección como un paso de un manual de instrucciones LEGO:
 * una placa con studs arriba, el número de paso en grande, la etiqueta
 * monoespaciada con el titular y, a la derecha, el subtítulo. Sobrio, para
 * no competir con las fotos. */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  step,
  className = '',
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
  /** Número de paso del "manual" (1, 2, 3...). */
  step?: number;
  className?: string;
  /** Contenido extra junto al subtítulo (p. ej. botones). */
  children?: ReactNode;
}) {
  return (
    <div className={className}>
      <div className="plate" aria-hidden="true" />
      <div className="pt-5 grid gap-4 md:grid-cols-[auto_1fr_minmax(0,22rem)] md:gap-8 md:items-end">
        <div className="flex items-end gap-4">
          {step !== undefined && (
            <span aria-hidden="true" className="font-display text-[clamp(3rem,6vw,4.5rem)] font-bold leading-[0.8] tracking-[-0.06em] text-[var(--color-accent-text)]">
              {step}
            </span>
          )}
          <div className="md:hidden">
            <p className="label-caps text-[var(--color-text-muted)]">{eyebrow}</p>
          </div>
        </div>
        <div>
          <p className="label-caps hidden md:block mb-2 text-[var(--color-text-muted)]">{eyebrow}</p>
          <h2 className="font-display text-[clamp(1.75rem,3.6vw,2.6rem)] font-semibold leading-[1.05] tracking-[-0.035em] text-[var(--color-text)]">
            {title}
          </h2>
        </div>
        {(subtitle || children) && (
          <div>
            {subtitle && <p className="text-sm leading-relaxed text-[var(--color-text-muted)]">{subtitle}</p>}
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
