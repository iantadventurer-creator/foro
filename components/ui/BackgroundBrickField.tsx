'use client';

import { BackgroundBrick } from './BackgroundBrick';

/**
 * Capa de ladrillos LEGO fija a la ventana: no se desplaza con la página, así
 * que se ven en todo el sitio sin importar cuánto se haga scroll. Vive detrás
 * de todo el contenido (z-index negativo) — ver `relative z-0` en <main> de
 * cada página, necesario para que el contenido quede por encima.
 */
export function BackgroundBrickField() {
    return (
        <div className="fixed inset-0 -z-10 pointer-events-none" aria-hidden="true">
            <BackgroundBrick color="accent-2" scale={1.6} rows={2} cols={4} top="6%" left="3%" rotate={-10} delay={0} />
            <BackgroundBrick color="accent-3" scale={1.3} rows={1} cols={2} top="72%" left="7%" rotate={9} delay={1.2} />
            <BackgroundBrick color="accent" scale={1.6} rows={2} cols={3} top="8%" right="4%" rotate={7} delay={0.6} />
            <BackgroundBrick color="accent-4" scale={1.3} rows={1} cols={3} bottom="6%" right="5%" rotate={-6} delay={1.8} />
            <BackgroundBrick color="accent" scale={1.1} rows={1} cols={2} bottom="18%" left="44%" rotate={5} delay={2.4} />
        </div>
    );
}
