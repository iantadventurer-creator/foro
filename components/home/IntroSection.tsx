import Link from 'next/link';
import { DoodleFilmRoll, DoodleMinifig, DoodleMinifigPhotographer } from '@/components/ui/Doodles';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { HomeContent } from '@/lib/content/homeContent';

const HREFS = ['#gallery', '/comunidad', '#about'];
const DOODLES = [DoodleFilmRoll, DoodleMinifig, DoodleMinifigPhotographer];
const TILT = ['-rotate-1', 'rotate-1', '-rotate-[0.5deg]'];

/** Los tres espacios de la web como hojas sueltas del cuaderno, cada una con
 * su garabato (carrete de fotos, minifigura y minifigura fotógrafa). */
export function IntroSection({ t }: { t: HomeContent }) {
  return (
    <section id="intro" className="max-w-[1320px] mx-auto px-4 sm:px-6 pb-16 md:pb-24">
      <SectionHeading step={3} eyebrow={t.intro.eyebrow} title={t.intro.title} />
      <div className="mt-10 grid md:grid-cols-3 gap-6 md:gap-8">
        {t.intro.cards.map((card, i) => {
          const href = HREFS[i];
          const Doodle = DOODLES[i];
          const className = `panel lift group flex flex-col gap-3 rounded-2xl bg-[var(--color-surface)] p-6 ${TILT[i]}`;
          const inner = (
            <>
              <Doodle className="h-12 w-auto self-start text-[var(--color-line)]" />
              <h3 className="font-display text-2xl font-extrabold leading-tight text-[var(--color-text)]">{card.title}</h3>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{card.desc}</p>
              <span className="hand mt-auto pt-2 inline-flex items-center gap-1.5 text-xl text-[var(--color-accent-text)]">
                <span className="link-underline">{card.cta}</span>
                <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </span>
            </>
          );
          return href.startsWith('/') ? (
            <Link key={card.title} href={href} className={className}>{inner}</Link>
          ) : (
            <a key={card.title} href={href} className={className}>{inner}</a>
          );
        })}
      </div>
    </section>
  );
}
