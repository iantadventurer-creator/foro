/**
 * Separador decorativo entre secciones: una línea que se desvanece en los
 * bordes con un pequeño ladrillo LEGO centrado (mismo lenguaje visual que el
 * logo del header) — lectura clara de simple adorno, no de control
 * interactivo (a diferencia de una fila de puntos, que se confunde con un
 * indicador de carrusel).
 */
export function StudDivider() {
    return (
        <div aria-hidden="true" className="relative h-px my-3 bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-3.5">
                <div className="absolute inset-x-0 -top-1 flex justify-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-[var(--color-accent)]" />
                    <span className="w-1 h-1 rounded-full bg-[var(--color-accent)]" />
                </div>
                <div className="w-full h-full rounded-[2px] bg-[var(--color-accent)] shadow-[0_2px_0_0_var(--shadow-accent)]" />
            </div>
        </div>
    );
}
