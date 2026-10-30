/** Pieza LEGO vista de lado (cuerpo + studs), como adorno: en etiquetas de
 * sección, separadores y distintivos. `studs` es el ancho de la pieza (1x1,
 * 2x1, 4x1...). Puramente decorativa. */
export function LegoBrick({
  color = 'var(--color-lego-yellow)',
  studs = 2,
  className = 'h-3.5 w-auto',
}: {
  color?: string;
  studs?: number;
  className?: string;
}) {
  const unit = 12;
  const width = studs * unit;

  return (
    <svg viewBox={`0 0 ${width} 13`} className={className} aria-hidden="true" focusable="false">
      {Array.from({ length: studs }, (_, i) => (
        <rect key={i} x={i * unit + 2.5} y={0.5} width={7} height={3.5} rx={1} fill={color} />
      ))}
      <rect x={0} y={3.5} width={width} height={9.5} rx={1.6} fill={color} />
      {/* brillo arriba y canto oscuro abajo, como plástico moldeado */}
      <rect x={0.8} y={4.2} width={width - 1.6} height={1.2} rx={0.6} fill="white" opacity={0.28} />
      <rect x={0} y={11} width={width} height={2} rx={1} fill="black" opacity={0.22} />
    </svg>
  );
}
