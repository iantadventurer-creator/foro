/** El ladrillo rojo de la marca (logotipo). Se usa en la cabecera de la
 * portada y en las pantallas de acceso. `className` fija tamaño y sombra. */
export function BrandMark({ className = 'w-9 h-9' }: { className?: string }) {
  return (
    <div className={`overflow-hidden ${className}`.trim()}>
      <svg viewBox="0 0 36 36" className="w-full h-full" aria-hidden="true">
        <rect width="36" height="36" fill="var(--color-accent)" />
        {[[11, 11], [25, 11], [11, 25], [25, 25]].map(([cx, cy]) => (
          <g key={`${cx}-${cy}`}>
            <circle cx={cx + 1} cy={cy + 1.5} r="5.5" fill="rgba(0,0,0,0.3)" />
            <circle cx={cx} cy={cy} r="5.5" fill="var(--color-accent)" />
            <circle cx={cx - 2} cy={cy - 2} r="1.7" fill="white" opacity="0.5" />
          </g>
        ))}
      </svg>
    </div>
  );
}
