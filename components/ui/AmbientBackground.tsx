// Fondo ambiental fijo: dos halos muy suaves (amarillo y rojo LEGO) sobre el
// blanco roto, más una "placa base" de studs en relieve que se desvanece hacia
// abajo. Es CSS puro, no se anima y queda detrás de todo el contenido.
export function AmbientBackground() {
  return (
    <div aria-hidden="true" className="fixed inset-0 -z-20 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(56rem 36rem at 8% -12%, rgba(255,213,0,0.22), transparent 62%), radial-gradient(48rem 34rem at 100% 110%, rgba(227,0,11,0.08), transparent 60%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          // Cada celda: un stud (círculo gris) con un brillo blanco arriba a la izquierda.
          backgroundImage:
            'radial-gradient(circle at 44% 40%, rgba(255,255,255,0.95) 0 2px, transparent 2.6px), radial-gradient(circle, rgba(32,33,36,0.06) 0 6px, transparent 6.6px)',
          backgroundSize: '28px 28px',
          maskImage: 'linear-gradient(to bottom, black 0%, transparent 60%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 60%)',
        }}
      />
    </div>
  );
}
