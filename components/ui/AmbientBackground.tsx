// Fondo ambiental fijo: dos halos de color (azul y rojo LEGO) sobre el azul
// noche, más una cuadrícula casi imperceptible que se desvanece hacia abajo.
// Es CSS puro, no se anima y queda detrás de todo el contenido.
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
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(154,166,196,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(154,166,196,0.06) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'linear-gradient(to bottom, black 0%, transparent 70%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 70%)',
        }}
      />
    </div>
  );
}
