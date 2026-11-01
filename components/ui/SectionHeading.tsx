import type { ReactNode } from 'react';

const STICKER_TONES = {
  primary: 'bg-[var(--color-accent)] text-[var(--color-accent-ink)]',
  secondary: 'bg-[var(--color-accent-3)] text-[var(--color-accent-3-ink)]',
  highlight: 'bg-[var(--color-highlight)] text-[var(--color-highlight-ink)]',
};

/** Encabezado de sección de juguete: una pegatina girada con el número y la
 * etiqueta, y debajo el titular enorme y redondo. El subtítulo (o lo que se
 * pase como `children`) va al lado en escritorio. */
export function SectionHeading({
  index,
  eyebrow,
  title,
  subtitle,
  tone = 'highlight',
  className = '',
  children,
}: {
  /** Número de sección ("02"), opcional. */
  index?: string;
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
  /** Color de la pegatina. */
  tone?: keyof typeof STICKER_TONES;
  className?: string;
  /** Contenido extra junto al subtítulo (p. ej. botones). */
  children?: ReactNode;
}) {
  return (
    <div className={className}>
      <span className={`sticker mb-5 ${STICKER_TONES[tone]}`}>
        {index && <span>#{index}</span>}
        {eyebrow}
      </span>
      <div className="grid gap-5 md:grid-cols-[1fr_minmax(0,22rem)] md:items-end">
        <h2 className="font-display text-[clamp(2.4rem,6.5vw,5rem)] font-black uppercase leading-[0.92] tracking-[-0.02em] text-[var(--color-text)]">
          {title}
        </h2>
        {(subtitle || children) && (
          <div className="md:pb-2">
            {subtitle && <p className="text-base leading-relaxed text-[var(--color-text-muted)]">{subtitle}</p>}
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
