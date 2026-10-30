import type { ReactNode } from 'react';
import { LegoBrick } from '@/components/ui/LegoBrick';

/** Encabezado de sección: etiqueta con una pieza amarilla, título y subtítulo
 * opcional, centrados. Se usa igual en todas las secciones de la portada. */
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
      <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-lego-yellow)] mb-3">
        <LegoBrick studs={2} className="h-3 w-auto" />
        {eyebrow}
      </p>
      <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-[var(--color-text)]">{title}</h2>
      {subtitle && <p className="text-sm text-[var(--color-text-muted)] mt-2 max-w-md mx-auto">{subtitle}</p>}
    </div>
  );
}
