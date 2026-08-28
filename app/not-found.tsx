import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-[var(--color-ink)] text-[var(--color-text)]">
      <div className="flex items-center gap-1.5 mb-8" aria-hidden="true">
        <span className="w-4 h-4 rounded-full bg-[var(--color-accent)]" />
        <span className="w-4 h-4 rounded-full bg-[var(--color-accent-2)]" />
        <span className="w-4 h-4 rounded-full bg-[var(--color-accent-3)]" />
        <span className="w-4 h-4 rounded-full bg-[var(--color-accent-4)]" />
      </div>
      <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-accent)] mb-4">Error 404</p>
      <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight mb-4">
        Esta pieza no encaja aquí
      </h1>
      <p className="text-[var(--color-text-muted)] max-w-md mb-10">
        La página que buscas no existe o se movió de lugar. Volvamos al set principal.
      </p>
      <Link
        href="/"
        className="font-button inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[var(--color-accent-ink)] bg-[var(--color-accent)] px-7 py-3.5 rounded-full shadow-[0_5px_0_0_var(--shadow-accent)] hover:brightness-110 transition-[filter]"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
