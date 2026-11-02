import type { ReactNode } from 'react';
import { DoodleArrow } from '@/components/ui/Doodles';

/** Encabezado de sección del cuaderno de bocetos: una tira de película con
 * perforaciones de studs LEGO arriba,
 * una nota manuscrita en azul bolígrafo (con su número de página, si lo hay),
 * el titular a mano y, a la derecha, el subtítulo. */
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
  /** Número de la sección (1, 2, 3...). */
  step?: number;
  className?: string;
  /** Contenido extra junto al subtítulo (p. ej. botones). */
  children?: ReactNode;
}) {
  return (
    <div className={className}>
      <div className="film-divider text-[var(--color-text-faint)] opacity-40" aria-hidden="true" />
      <div className="pt-6 grid gap-3 md:grid-cols-[1fr_minmax(0,22rem)] md:gap-8 md:items-end">
        <div>
          <p className="hand flex items-center gap-2 text-2xl text-[var(--color-accent-text)]">
            {step !== undefined && <span>{step}.</span>}
            {eyebrow}
            <DoodleArrow className="w-9 h-7 translate-y-1.5" />
          </p>
          <h2 className="mt-1 font-display text-[clamp(2rem,4vw,3rem)] font-extrabold leading-[1.02] text-[var(--color-text)]">
            {title}
          </h2>
        </div>
        {(subtitle || children) && (
          <div className="md:pb-2">
            {subtitle && <p className="text-[15px] leading-relaxed text-[var(--color-text-muted)]">{subtitle}</p>}
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
