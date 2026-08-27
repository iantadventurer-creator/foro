/** Fila decorativa de "tachuelas" de LEGO, usada como separador sutil entre secciones. */
export function StudDivider() {
    return (
        <div aria-hidden="true" className="flex justify-center items-center gap-3 py-1">
            {Array.from({ length: 5 }).map((_, i) => (
                <span
                    key={i}
                    className={`rounded-full ${i === 2 ? 'w-2.5 h-2.5 bg-[var(--color-accent)]/50' : 'w-1.5 h-1.5 bg-[var(--color-border)]'}`}
                />
            ))}
        </div>
    );
}
