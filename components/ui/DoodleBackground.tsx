'use client';

import type { ComponentType, CSSProperties, SVGProps } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import {
  DoodleAperture,
  DoodleArrow,
  DoodleBrick,
  DoodleBrickCamera,
  DoodleCamera,
  DoodleCoffeeRing,
  DoodleFilmRoll,
  DoodleHeart,
  DoodleMinifig,
  DoodleMinifigPhotographer,
  DoodlePlate,
  DoodleScribble,
  DoodleSparkle,
  DoodleSpiral,
  DoodleStar,
  DoodleStud,
} from '@/components/ui/Doodles';

type Doodle = ComponentType<SVGProps<SVGSVGElement>>;
type Tone = 'ink' | 'blue' | 'green';

type Item = {
  Doodle: Doodle;
  /** Altura en % de la página, lado y separación del borde en %. */
  top: number;
  side: 'left' | 'right';
  inset: number;
  width: number;
  rotate: number;
  tone: Tone;
  /** Capa "lejana" (se mueve menos al hacer scroll) o "cercana". */
  far: boolean;
  /** Solo en pantallas medianas o grandes, para no llenar el móvil. */
  desktopOnly: boolean;
  dy: number;
  duration: number;
  delay: number;
};

// Mitad fotografía, mitad LEGO: cámaras, carretes y diafragmas junto a
// minifiguras, ladrillos y studs.
const DOODLES: Doodle[] = [
  DoodleMinifigPhotographer,
  DoodleStar,
  DoodleBrick,
  DoodleAperture,
  DoodleStud,
  DoodleFilmRoll,
  DoodleMinifig,
  DoodleSparkle,
  DoodleBrickCamera,
  DoodleHeart,
  DoodlePlate,
  DoodleCamera,
  DoodleScribble,
  DoodleSpiral,
  DoodleArrow,
];
const WIDTHS = [56, 30, 78, 38, 34, 74, 50, 24, 60, 28, 72, 50, 58, 36, 58];
const ROTATIONS = [-10, 10, -5, 12, 0, -8, 6, -15, 7, 14, 4, -6, -8, 9, 160];
const TONES: Tone[] = ['ink', 'blue', 'ink', 'blue', 'green', 'ink', 'ink', 'blue', 'blue', 'blue', 'green', 'ink', 'ink', 'ink', 'blue'];
const INSETS = [1.5, 4, 2.5, 5.5, 3];

const COUNT = 30;

// Repartidos a lo largo de toda la página, alternando márgenes, con valores
// fijos (nada aleatorio) para que el servidor y el navegador pinten lo mismo.
const ITEMS: Item[] = Array.from({ length: COUNT }, (_, i) => ({
  Doodle: DOODLES[i % DOODLES.length],
  top: 1.5 + (i * 97) / COUNT,
  side: i % 2 === 0 ? 'left' : 'right',
  inset: INSETS[i % INSETS.length],
  width: WIDTHS[i % WIDTHS.length],
  rotate: ROTATIONS[i % ROTATIONS.length],
  tone: TONES[i % TONES.length],
  far: i % 3 === 1,
  desktopOnly: i % 3 !== 0,
  dy: 5 + (i % 4) * 2,
  duration: 7 + (i % 5) * 1.5,
  delay: -((i * 1.3) % 9),
}));

/** Marcas de taza de café, grandes y muy tenues. */
const RINGS = [
  { top: 7, side: 'right' as const, inset: -3, width: 150, rotate: 20 },
  { top: 48, side: 'left' as const, inset: -4, width: 130, rotate: -30 },
  { top: 83, side: 'right' as const, inset: -2, width: 120, rotate: 75 },
];

const TONE_CLASS: Record<Tone, string> = {
  ink: 'text-[var(--color-line)]',
  blue: 'text-[var(--color-accent)]',
  green: 'text-[var(--color-accent-3)]',
};

function Doodles({ items }: { items: Item[] }) {
  return items.map(({ Doodle, top, side, inset, width, rotate, tone, desktopOnly, dy, duration, delay }, i) => (
    <div
      key={i}
      className={`doodle-float doodle-${side} absolute opacity-[0.24] dark:opacity-[0.18] ${TONE_CLASS[tone]} ${desktopOnly ? 'hidden md:block' : ''}`}
      style={
        {
          top: `${top}%`,
          width,
          '--w': `${width}px`,
          '--inset': `${inset}%`,
          '--r': `${rotate}deg`,
          '--dy': `${dy}px`,
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
        } as CSSProperties
      }
    >
      <Doodle className="w-full h-auto" />
    </div>
  ));
}

// Fondo del cuaderno: garabatos de fotografía y de LEGO a tinta, en azul bolígrafo y en verde
// lápiz repartidos por los márgenes de toda la página, más un par de marcas de
// taza de café. Van en dos capas que se desplazan a distinta velocidad al
// hacer scroll (paralaje) y cada garabato flota despacio. Con "reducir
// movimiento" activado no hay paralaje ni vaivén (ver globals.css). Queda
// detrás de todo el contenido y no recibe clics. En pantallas sin márgenes
// los garabatos asoman a medias por los bordes para no quedar detrás del
// texto (ver .doodle-left / .doodle-right en globals.css).
export function DoodleBackground() {
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const nearY = useTransform(scrollY, (v) => (reduceMotion ? 0 : v * -0.08));
  const farY = useTransform(scrollY, (v) => (reduceMotion ? 0 : v * 0.06));

  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <motion.div className="absolute inset-0" style={{ y: farY }}>
        {RINGS.map(({ top, side, inset, width, rotate }, i) => (
          <div
            key={i}
            className={`absolute text-[#a8875a] opacity-[0.16] dark:opacity-[0.1] ${i === 1 ? 'hidden md:block' : ''}`}
            style={{ top: `${top}%`, [side]: `${inset}%`, width, rotate: `${rotate}deg` }}
          >
            <DoodleCoffeeRing className="w-full h-auto" />
          </div>
        ))}
        <Doodles items={ITEMS.filter((item) => item.far)} />
      </motion.div>
      <motion.div className="absolute inset-0" style={{ y: nearY }}>
        <Doodles items={ITEMS.filter((item) => !item.far)} />
      </motion.div>
    </div>
  );
}
