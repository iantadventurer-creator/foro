import { Button } from '@/components/ui/Button';
import { LegoBrick } from '@/components/ui/LegoBrick';

export default function NotFound() {
  return (
    <main id="contenido" tabIndex={-1} className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-[var(--color-ink)] text-[var(--color-text)]">
      <div className="flex items-end gap-1 mb-8 hover-wiggle" aria-hidden="true">
        <LegoBrick color="var(--color-accent)" studs={2} className="h-8 w-auto" />
        <LegoBrick color="var(--color-highlight)" studs={1} className="h-8 w-auto rotate-12 translate-y-[-6px]" />
        <LegoBrick color="var(--color-accent-3)" studs={2} className="h-8 w-auto" />
      </div>
      <span className="sticker bg-[var(--color-highlight)] text-[var(--color-highlight-ink)] mb-5">Error 404</span>
      <h1 className="font-display text-[clamp(2.6rem,8vw,5.5rem)] font-black uppercase leading-[0.9] tracking-[-0.02em] mb-5">
        Esta pieza no encaja aquí
      </h1>
      <p className="text-[var(--color-text-muted)] max-w-md mb-10">
        La página que buscas no existe o se movió de lugar. Volvamos al set principal.
      </p>
      <Button href="/" size="lg">
        Volver al inicio
      </Button>
    </main>
  );
}
