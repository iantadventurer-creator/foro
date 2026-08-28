'use client';

import { motion } from 'framer-motion';

type BrickColor = 'accent' | 'accent-2' | 'accent-3' | 'accent-4';

const FILL: Record<BrickColor, string> = {
    accent: 'var(--color-accent)',
    'accent-2': 'var(--color-accent-2)',
    'accent-3': 'var(--color-accent-3)',
    'accent-4': 'var(--color-accent-4)',
};

// Proporciones tomadas directamente del logo del header (referencia aprobada):
// radio de tachuela = 5.5, separación centro a centro = 14, margen borde-a-centro = 11,
// sobre un cuerpo de 36×36 con 2×2 tachuelas. Aquí el radio es una constante (como en
// una pieza real: las tachuelas siempre miden lo mismo, sea la pieza 1×2 o 2×4).
const UNIT = 5.5;
const PITCH = UNIT * (14 / 5.5);
const EDGE_MARGIN = UNIT * 2;

/**
 * Ladrillo LEGO de fondo, dibujado en SVG con la misma geometría de tachuelas que
 * el logo del header. `scale` controla el tamaño final en pantalla sin alterar esas
 * proporciones internas.
 */
export function BackgroundBrick({
    color = 'accent',
    rows = 2,
    cols = 4,
    top,
    left,
    right,
    bottom,
    rotate = 0,
    delay = 0,
    scale = 2.2,
}: {
    color?: BrickColor;
    rows?: 1 | 2;
    cols?: 2 | 3 | 4;
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
    rotate?: number;
    delay?: number;
    scale?: number;
}) {
    const fill = FILL[color];
    const naturalWidth = EDGE_MARGIN * 2 + PITCH * (cols - 1);
    const naturalHeight = EDGE_MARGIN * 2 + PITCH * (rows - 1);
    const width = naturalWidth * scale;
    const height = naturalHeight * scale;

    const studs: { cx: number; cy: number }[] = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            studs.push({ cx: EDGE_MARGIN + c * PITCH, cy: EDGE_MARGIN + r * PITCH });
        }
    }

    return (
        <motion.div
            aria-hidden="true"
            initial={{ y: 0, rotate }}
            animate={{ y: [0, -20, 0], rotate: [rotate, rotate + 5, rotate] }}
            transition={{ duration: 8, repeat: Infinity, delay, ease: 'easeInOut' }}
            className="absolute pointer-events-none block -z-10 opacity-25"
            style={{ top, left, right, bottom, width, height }}
        >
            <svg viewBox={`0 0 ${naturalWidth} ${naturalHeight}`} className="w-full h-full block">
                <rect x={0} y={0} width={naturalWidth} height={naturalHeight} rx={UNIT * 0.5} fill={fill} />
                {studs.map((s, i) => (
                    <g key={i}>
                        <circle cx={s.cx + UNIT * 0.18} cy={s.cy + UNIT * 0.3} r={UNIT} fill="rgba(0,0,0,0.35)" />
                        <circle cx={s.cx} cy={s.cy} r={UNIT} fill={fill} />
                        <circle cx={s.cx - UNIT * 0.35} cy={s.cy - UNIT * 0.35} r={UNIT * 0.3} fill="white" opacity="0.55" />
                    </g>
                ))}
            </svg>
        </motion.div>
    );
}
