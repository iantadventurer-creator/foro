import type { ComponentType, CSSProperties, SVGProps } from 'react';
import {
  DoodleArrow,
  DoodleBrick,
  DoodleCamera,
  DoodleHeart,
  DoodleMinifig,
  DoodleSparkle,
  DoodleSpiral,
  DoodleStar,
  DoodleStud,
} from '@/components/ui/Doodles';

type Item = {
  Doodle: ComponentType<SVGProps<SVGSVGElement>>;
  /** Posición en % de la ventana y ancho en píxeles. */
  top: string;
  left: string;
  width: number;
  rotate: number;
  /** Azul bolígrafo en vez de tinta. */
  blue?: boolean;
  /** Recorrido y duración del vaivén. */
  dy: number;
  duration: number;
  delay: number;
  /** Solo en pantallas medianas o grandes, para no llenar el móvil. */
  desktopOnly?: boolean;
};

// Repartidos por los márgenes, lejos del centro donde van las fotos.
const ITEMS: Item[] = [
  { Doodle: DoodleMinifig, top: '9%', left: '2%', width: 46, rotate: -10, dy: 8, duration: 9, delay: 0, desktopOnly: true },
  { Doodle: DoodleStar, top: '6%', left: '93%', width: 30, rotate: 12, blue: true, dy: 6, duration: 7, delay: -2 },
  { Doodle: DoodleBrick, top: '30%', left: '94%', width: 64, rotate: 8, dy: 10, duration: 11, delay: -5, desktopOnly: true },
  { Doodle: DoodleStud, top: '26%', left: '3%', width: 30, rotate: 0, dy: 7, duration: 8, delay: -3, desktopOnly: true },
  { Doodle: DoodleSpiral, top: '46%', left: '1.5%', width: 34, rotate: -6, blue: true, dy: 8, duration: 10, delay: -6, desktopOnly: true },
  { Doodle: DoodleHeart, top: '52%', left: '95%', width: 28, rotate: -12, blue: true, dy: 6, duration: 8, delay: -1 },
  { Doodle: DoodleCamera, top: '66%', left: '2.5%', width: 44, rotate: 6, dy: 9, duration: 12, delay: -4, desktopOnly: true },
  { Doodle: DoodleSparkle, top: '72%', left: '94%', width: 22, rotate: 0, dy: 5, duration: 6, delay: -2, desktopOnly: true },
  { Doodle: DoodleArrow, top: '84%', left: '91%', width: 54, rotate: 160, dy: 7, duration: 10, delay: -7, desktopOnly: true },
  { Doodle: DoodleStud, top: '88%', left: '4%', width: 26, rotate: 0, blue: true, dy: 6, duration: 9, delay: -3 },
];

// Fondo fijo: garabatos de LEGO a tinta, muy tenues, en los márgenes del
// "cuaderno". Flotan despacio (solo se anima transform); con "reducir
// movimiento" activado se quedan quietos (ver globals.css). Queda detrás de
// todo el contenido.
export function DoodleBackground() {
  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {ITEMS.map(({ Doodle, top, left, width, rotate, blue, dy, duration, delay, desktopOnly }, i) => (
        <div
          key={i}
          className={`doodle-float absolute opacity-[0.16] dark:opacity-[0.14] ${blue ? 'text-[var(--color-accent)]' : 'text-[var(--color-line)]'} ${desktopOnly ? 'hidden md:block' : ''}`}
          style={
            {
              top,
              left,
              width,
              '--r': `${rotate}deg`,
              '--dy': `${dy}px`,
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
            } as CSSProperties
          }
        >
          <Doodle className="w-full h-auto" />
        </div>
      ))}
    </div>
  );
}
