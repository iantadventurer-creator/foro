// Textura de grano sutil sobre toda la web — encaja con la idea de
// "iluminación cinematográfica" del sitio, le da un toque más analógico
// al fondo oscuro. Es puro CSS (ruido generado con un filtro SVG en un
// data URI), no pesa nada y no bloquea ningún clic.
export function FilmGrainOverlay() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-30 pointer-events-none opacity-[0.035] mix-blend-overlay"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      }}
    />
  );
}
