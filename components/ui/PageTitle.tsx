import type { ReactNode } from 'react';

const TONES = {
  primary: 'bg-[var(--color-accent)] text-white',
  secondary: 'bg-[var(--color-accent-3)] text-[#13204a]',
  highlight: 'bg-[var(--color-highlight)] text-[#13204a]',
};

/** Titular de página de juguete (comunidad, actividad): un bloque de color
 * a sangre con contorno grueso, una pegatina con el dato del momento y el
 * título enorme. Dentro del bloque los colores son fijos, así que se ve
 * igual en modo claro y oscuro. */
export function PageTitle({
  meta,
  title,
  subtitle,
  aside,
  tone = 'primary',
  children,
}: {
  /** Pegatina superior, p. ej. "Comunidad". */
  meta: ReactNode;
  title: ReactNode;
  subtitle?: string;
  /** Segunda pegatina (contadores...). */
  aside?: ReactNode;
  tone?: keyof typeof TONES;
  /** Contenido extra bajo el subtítulo (p. ej. botones). */
  children?: ReactNode;
}) {
  return (
    <div className={`toy relative overflow-hidden rounded-[2rem] [--color-border:#13204a] [--toy-shadow:#13204a] mt-6 md:mt-8 mb-10 px-6 py-8 md:px-10 md:py-12 ${TONES[tone]}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="sticker bg-[var(--color-highlight)] text-[#13204a]">{meta}</span>
        {aside && <span className="sticker bg-white text-[#13204a] rotate-[2deg]">{aside}</span>}
      </div>
      <h1 className="mt-5 font-display font-black uppercase leading-[0.88] tracking-[-0.02em] text-[clamp(2rem,10.5vw,7.5rem)] break-words">
        {title}
      </h1>
      {subtitle && <p className="mt-4 max-w-xl text-base md:text-lg font-medium leading-relaxed opacity-90">{subtitle}</p>}
      {children}
    </div>
  );
}
