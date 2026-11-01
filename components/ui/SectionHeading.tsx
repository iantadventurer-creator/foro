import type { ReactNode } from 'react';

/** Encabezado de sección del estilo cinemático: etiqueta en mono ("// GALERÍA"),
 * titular grande en mayúsculas y subtítulo opcional, centrados. */
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
      <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-[var(--color-accent-text)] mb-3">
        {'// '}
        {eyebrow}
      </p>
      <h2 className="font-display text-3xl md:text-5xl font-bold uppercase tracking-[-0.02em] text-[var(--color-text)]">{title}</h2>
      {subtitle && <p className="text-sm text-[var(--color-text-muted)] mt-2 max-w-md mx-auto">{subtitle}</p>}
    </div>
  );
}
