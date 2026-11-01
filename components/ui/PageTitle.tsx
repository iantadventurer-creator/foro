import type { ReactNode } from 'react';

/** Titular de página (comunidad, actividad): etiqueta pequeña, título y
 * subtítulo, sin bloques de color para que el contenido sea lo que destaque. */
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
    <div className="pt-8 md:pt-12 pb-8 md:pb-10">
      <p className="label-caps flex flex-wrap items-center gap-x-3 gap-y-1 text-[var(--color-text-faint)]">
        <span>{meta}</span>
        {aside && (
          <>
            <span aria-hidden="true">·</span>
            <span>{aside}</span>
          </>
        )}
      </p>
      <h1 className="mt-3 font-display font-bold leading-[0.95] tracking-[-0.045em] text-[clamp(2.4rem,7vw,4.75rem)] text-[var(--color-text)] break-words">
        {title}
      </h1>
      {subtitle && <p className="mt-3 max-w-xl text-base leading-relaxed text-[var(--color-text-muted)]">{subtitle}</p>}
      {children}
    </div>
  );
}
