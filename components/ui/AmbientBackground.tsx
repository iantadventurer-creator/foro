import type { CSSProperties } from 'react';

type Brick = {
  /** Posición (en % de la ventana) y tamaño en píxeles de un stud. */
  top: string;
  left: string;
  cols: number;
  rows: number;
  unit: number;
  color: string;
  /** Recorrido de la animación: desplazamiento y giro inicial/final. */
  dx: number;
  dy: number;
  r0: number;
  r1: number;
  duration: number;
  delay: number;
  /** Solo en pantallas medianas o grandes, para no saturar el móvil. */
  desktopOnly?: boolean;
};

const RED = '#e3000b';
const YELLOW = '#ffd500';
const BLUE = '#0055bf';
const GREEN = '#00852b';

const BRICKS: Brick[] = [
  { top: '8%', left: '-1.5%', cols: 4, rows: 2, unit: 22, color: RED, dx: 18, dy: 26, r0: -14, r1: -4, duration: 22, delay: 0 },
  { top: '14%', left: '95%', cols: 2, rows: 2, unit: 22, color: YELLOW, dx: -20, dy: 22, r0: 12, r1: 24, duration: 19, delay: -4 },
  { top: '38%', left: '92%', cols: 2, rows: 1, unit: 20, color: BLUE, dx: -14, dy: -24, r0: -8, r1: 6, duration: 24, delay: -9, desktopOnly: true },
  { top: '46%', left: '-1.5%', cols: 2, rows: 2, unit: 20, color: GREEN, dx: 16, dy: -20, r0: 18, r1: 4, duration: 26, delay: -3, desktopOnly: true },
  { top: '64%', left: '94%', cols: 4, rows: 2, unit: 20, color: YELLOW, dx: -22, dy: -18, r0: 6, r1: -10, duration: 28, delay: -12 },
  { top: '76%', left: '-1%', cols: 2, rows: 1, unit: 22, color: RED, dx: 20, dy: -16, r0: -20, r1: -6, duration: 21, delay: -7, desktopOnly: true },
  { top: '90%', left: '90%', cols: 1, rows: 1, unit: 22, color: RED, dx: -12, dy: -14, r0: -6, r1: 10, duration: 17, delay: -2 },
];

/** Pieza LEGO vista desde arriba: cuerpo con canto y una cuadrícula de studs. */
function BrickTop({ cols, rows, unit, color }: Pick<Brick, 'cols' | 'rows' | 'unit' | 'color'>) {
  const w = cols * unit;
  const h = rows * unit;
  const studR = unit * 0.3;
  return (
    <svg width={w} height={h + 3} viewBox={`0 0 ${w} ${h + 3}`} aria-hidden="true" focusable="false">
      <rect x={0} y={3} width={w} height={h} rx={unit * 0.18} fill="rgba(32,33,36,0.28)" />
      <rect x={0} y={0} width={w} height={h} rx={unit * 0.18} fill={color} stroke="rgba(32,33,36,0.12)" strokeWidth={1} />
      {Array.from({ length: cols * rows }, (_, i) => {
        const cx = (i % cols) * unit + unit / 2;
        const cy = Math.floor(i / cols) * unit + unit / 2;
        return (
          <g key={i}>
            <circle cx={cx} cy={cy + 1} r={studR} fill="rgba(0,0,0,0.18)" />
            <circle cx={cx} cy={cy} r={studR} fill={color} stroke="rgba(32,33,36,0.1)" strokeWidth={0.8} />
            <circle cx={cx - studR * 0.3} cy={cy - studR * 0.35} r={studR * 0.35} fill="white" opacity={0.45} />
          </g>
        );
      })}
    </svg>
  );
}

// Fondo fijo: halos muy suaves de amarillo y rojo y piezas LEGO que flotan
// despacio. Solo se animan transformaciones (fluido y barato para el
// navegador); con "reducir movimiento" activado se quedan quietas
// (ver globals.css). Queda detrás de todo el contenido.
export function AmbientBackground() {
  return (
    <div aria-hidden="true" className="fixed inset-0 -z-20 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(56rem 36rem at 8% -12%, rgba(255,213,0,0.2), transparent 62%), radial-gradient(48rem 34rem at 100% 110%, rgba(227,0,11,0.07), transparent 60%)',
        }}
      />
      {BRICKS.map((brick, i) => (
        <div
          key={i}
          className={`brick-drift absolute opacity-[0.2] md:opacity-[0.3] dark:opacity-[0.14] md:dark:opacity-[0.2] ${brick.desktopOnly ? 'hidden md:block' : ''}`}
          style={
            {
              top: brick.top,
              left: brick.left,
              '--dx': `${brick.dx}px`,
              '--dy': `${brick.dy}px`,
              '--r0': `${brick.r0}deg`,
              '--r1': `${brick.r1}deg`,
              animationDuration: `${brick.duration}s`,
              animationDelay: `${brick.delay}s`,
            } as CSSProperties
          }
        >
          <BrickTop cols={brick.cols} rows={brick.rows} unit={brick.unit} color={brick.color} />
        </div>
      ))}
    </div>
  );
}
