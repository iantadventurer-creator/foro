// Marca de IanTBuild para las imágenes generadas (icono de la pestaña e
// imagen al compartir): la cámara hecha de ladrillo del logo, con los mismos
// trazos que DoodleBrickCamera (components/ui/Doodles.tsx). Va aparte porque
// esas imágenes se dibujan con next/og, que necesita los atributos SVG en
// línea y no puede usar las variables CSS del tema.

export const BRAND_PAPER = '#f6f1e6';
export const BRAND_INK = '#2a2723';
export const BRAND_BLUE = '#2e4d8a';

export function BrickCameraMark({ width, color = BRAND_BLUE, strokeWidth = 2 }: { width: number; color?: string; strokeWidth?: number }) {
  const stroke = { fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <svg width={width} height={(width * 50) / 64} viewBox="0 0 64 50">
      <path d="M11 10.5V5h9v5.5M27.5 10.5V5h9v5.5M44 10.5V5h9v5.5" {...stroke} />
      <path d="M4.5 13q0-2.5 2.5-2.5h50q2.5 0 2.5 2.5v29q0 2.5-2.5 2.5H7q-2.5 0-2.5-2.5z" {...stroke} />
      <circle cx="34" cy="28" r="11" {...stroke} />
      <circle cx="34" cy="28" r="5" {...stroke} />
      <path d="M10 16.5h8v5h-8z" {...stroke} />
    </svg>
  );
}
