import { LegoBrick } from '@/components/ui/LegoBrick';

const BRICKS = [
  { color: 'var(--color-accent)', studs: 2 },
  { color: 'var(--color-lego-yellow)', studs: 1 },
  { color: 'var(--color-accent-3)', studs: 2 },
  { color: 'var(--color-accent-4)', studs: 1 },
];

/**
 * Separador decorativo entre secciones: una línea que se desvanece en los
 * bordes con una hilera de piezas de los cuatro colores clásicos encima —
 * mismo lenguaje visual que el logo. Es solo adorno (aria-hidden).
 */
export function StudDivider() {
  return (
    <div aria-hidden="true" className="relative h-px my-6 bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent">
      <div className="absolute left-1/2 bottom-0 -translate-x-1/2 flex items-end gap-1 bg-[var(--color-ink)] px-3">
        {BRICKS.map((brick, i) => (
          <LegoBrick key={i} color={brick.color} studs={brick.studs} className="h-3.5 w-auto" />
        ))}
      </div>
    </div>
  );
}
