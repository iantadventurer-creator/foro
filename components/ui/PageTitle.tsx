import type { ReactNode } from 'react';

/** Titular de página (comunidad, actividad) al estilo del cuaderno de
 * bocetos: línea ondulada arriba con la etiqueta y el dato en los extremos, y
 * debajo el título y el subtítulo. */
export function PageTitle({
  meta,
  title,
  subtitle,
  aside,
  children,
}: {
  /** Etiqueta superior, p. ej. "IanTBuild". */
  meta: ReactNode;
  title: ReactNode;
  subtitle?: string;
  /** Dato a la derecha de la etiqueta (contadores...). */
  aside?: ReactNode;
  /** Contenido extra bajo el subtítulo (p. ej. botones). */
  children?: ReactNode;
}) {
  return (
    <div className="pt-6 md:pt-10 pb-8 md:pb-10">
      <div>
        <div className="squiggle mb-4 text-[var(--color-border)]" aria-hidden="true" />
        <p className="hand flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xl text-[var(--color-accent-text)]">
          <span>{meta}</span>
          {aside && <span>{aside}</span>}
        </p>
        <h1 className="mt-2 font-display font-bold leading-[0.9] text-[clamp(3.25rem,9vw,6rem)] text-[var(--color-text)] break-words">
          {title}
        </h1>
        {subtitle && <p className="mt-3 max-w-xl text-base leading-relaxed text-[var(--color-text-muted)]">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}
