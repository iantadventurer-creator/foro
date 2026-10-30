// Fondo ambiental fijo: dos halos de color (azul y rojo LEGO) sobre el azul
// noche, más una "placa base" de studs casi imperceptible que se desvanece
// hacia abajo. Es CSS puro, no se anima y queda detrás de todo el contenido.
export function AmbientBackground() {
  return (
    <div aria-hidden="true" className="fixed inset-0 -z-20 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(60rem 40rem at 12% -10%, rgba(59,130,246,0.16), transparent 60%), radial-gradient(50rem 36rem at 95% 105%, rgba(224,68,54,0.12), transparent 60%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          // Cada celda: un stud (círculo) con un pequeño brillo arriba a la izquierda.
          backgroundImage:
            'radial-gradient(circle at 45% 42%, rgba(255,255,255,0.05) 0 2px, transparent 2.5px), radial-gradient(circle, rgba(154,166,196,0.075) 0 6px, transparent 6.5px)',
          backgroundSize: '28px 28px',
          maskImage: 'linear-gradient(to bottom, black 0%, transparent 65%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 65%)',
        }}
      />
    </div>
  );
}
