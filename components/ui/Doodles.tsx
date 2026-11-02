import type { SVGProps } from 'react';

/** Garabatos a tinta del cuaderno de bocetos. Trazos con `currentColor`, así
 * toman el color del texto que los rodea (tinta en claro, tiza en oscuro). */
type DoodleProps = SVGProps<SVGSVGElement>;

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

/** Minifigura LEGO dibujada a mano. */
export function DoodleMinifig(props: DoodleProps) {
  return (
    <svg viewBox="0 0 60 82" aria-hidden="true" focusable="false" {...props}>
      <g {...stroke}>
        <path d="M24.5 3.5h11l.5 4.5h-12z" />
        <path d="M18 9.5Q30 6 42.5 9.5q3.5 9 -.5 18Q30 31 18 27.5q-4-9 0-18z" />
        <path d="M24 21q6 5 12 0" />
        <path d="M26 29.5v3.5M34 29.5v3.5" />
        <path d="M16.5 33.5h27l4 25h-35z" />
        <path d="M16.5 35.5Q8 44 9.5 54M43.5 35.5Q52 44 50.5 54" />
        <path d="M7 55.5a3 3 0 1 0 5.5 1M48 56.5a3 3 0 1 0 5.5-1" />
        <path d="M12.5 58.5h35v5h-35z" />
        <path d="M13 63.5v14h15l.5-11h3l.5 11h15v-14" />
      </g>
      <circle cx="25" cy="16" r="1.8" fill="currentColor" />
      <circle cx="35" cy="16" r="1.8" fill="currentColor" />
    </svg>
  );
}

/** Ladrillo 2×4 en perspectiva, dibujado a mano. */
export function DoodleBrick(props: DoodleProps) {
  return (
    <svg viewBox="0 0 92 54" aria-hidden="true" focusable="false" {...props}>
      <g {...stroke}>
        <path d="M5 24.5l57.5.5.5 23.5L5.5 48z" />
        <path d="M62.5 25L86 13.5l-.5 23L63 48.5" />
        <path d="M5 24.5L28.5 13l57.5.5" />
        {[
          [33, 14.5],
          [46, 14.5],
          [59, 14.5],
          [72, 14.5],
          [23, 19.5],
          [36, 19.5],
          [49, 19.5],
          [62, 19.5],
        ].map(([x, y]) => (
          <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
            <ellipse cx="0" cy="-2" rx="4.2" ry="1.9" />
            <path d="M-4.2-2v2.6q4.2 2.4 8.4 0V-2" />
          </g>
        ))}
      </g>
    </svg>
  );
}

/** Cámara de fotos garabateada. */
export function DoodleCamera(props: DoodleProps) {
  return (
    <svg viewBox="0 0 64 48" aria-hidden="true" focusable="false" {...props}>
      <g {...stroke}>
        <path d="M6 15.5q0-4 4-4h9l3.5-6h19l3.5 6h9q4 0 4 4v24q0 4-4 4H10q-4 0-4-4z" />
        <circle cx="32" cy="27.5" r="10" />
        <circle cx="32" cy="27.5" r="4.5" />
        <path d="M48 18h4" />
      </g>
    </svg>
  );
}

/** Flecha curva de anotación (apunta abajo a la derecha). */
export function DoodleArrow(props: DoodleProps) {
  return (
    <svg viewBox="0 0 80 60" aria-hidden="true" focusable="false" {...props}>
      <g {...stroke}>
        <path d="M6 9Q48 2 62 44" />
        <path d="M51 37.5l11.5 8 5-13" />
      </g>
    </svg>
  );
}

/** Destello / estrellita de tres trazos. */
export function DoodleSparkle(props: DoodleProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      <g {...stroke}>
        <path d="M12 2.5v19M2.5 12h19M5.5 5.5l13 13M18.5 5.5l-13 13" />
      </g>
    </svg>
  );
}

/** Pieza redonda 1×1 vista desde arriba (un stud con su sombra). */
export function DoodleStud(props: DoodleProps) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" focusable="false" {...props}>
      <g {...stroke}>
        <path d="M20 3.5q16 .5 16.5 16.5T20 36.5 3.5 20 20 3.5z" />
        <path d="M20 11q9 0 9 9t-9 9-9-9 9-9z" />
        <path d="M15.5 16q2-2.5 5-2.5" />
      </g>
    </svg>
  );
}

/** Corazón garabateado. */
export function DoodleHeart(props: DoodleProps) {
  return (
    <svg viewBox="0 0 32 30" aria-hidden="true" focusable="false" {...props}>
      <path d="M16 27.5Q3 19 3.5 10.5 4 3.5 10 3.5q4.5 0 6 4.5 1.5-4.5 6-4.5 6 0 6.5 7 .5 8.5-12.5 17z" {...stroke} />
    </svg>
  );
}

/** Estrella de cinco puntas trazada de un solo golpe. */
export function DoodleStar(props: DoodleProps) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" focusable="false" {...props}>
      <path d="M20 3.5l5 11.5 12.5 1-9.5 8.5 3 12.5L20 30.5 9 37l3-12.5L2.5 16l12.5-1z" {...stroke} />
    </svg>
  );
}

/** Espiral de bolígrafo, como cuando se prueba si pinta. */
export function DoodleSpiral(props: DoodleProps) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" focusable="false" {...props}>
      <path d="M21 20q0-2.5-2.5-2.5T16 20.5t4.5 4.5 7-5.5-7.5-9-11 8 8.5 13 15-6.5-4-16.5-17-1" {...stroke} />
    </svg>
  );
}

/** Subrayado ondulado a mano; se estira al ancho de su contenedor. */
export function DoodleUnderline(props: DoodleProps) {
  return (
    <svg viewBox="0 0 200 14" preserveAspectRatio="none" aria-hidden="true" focusable="false" {...props}>
      <path d="M3 9Q22 2 40 8t36 0 36 0 36 0 36 0 14-2" {...stroke} strokeWidth={3} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
