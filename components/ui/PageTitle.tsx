import type { ReactNode } from 'react';

/** Titular de página (comunidad, actividad) al estilo del cuaderno de
 * bocetos: tira de película con studs arriba con la etiqueta y el dato en los extremos, y
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
        <div className="film-divider text-[var(--color-text-faint)] opacity-40 mb-4" aria-hidden="true" />
        <p className="hand flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xl text-[var(--color-accent-text)]">
          <span>{meta}</span>
          {aside && <span>{aside}</span>}
        </p>
        <h1 className="mt-2 font-display font-extrabold leading-[0.98] text-[clamp(2.5rem,6.5vw,4.25rem)] text-[var(--color-text)] break-words">
          {title}
        </h1>
        {subtitle && <p className="mt-3 max-w-xl text-base leading-relaxed text-[var(--color-text-muted)]">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}
