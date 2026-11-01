import Link from 'next/link';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { HomeContent } from '@/lib/content/homeContent';

const HREFS = ['#gallery', '/comunidad', '#about'];

/** Los tres espacios de la web en tarjetas sobrias. */
export function IntroSection({ t }: { t: HomeContent }) {
  return (
    <section id="intro" className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 md:pb-24">
      <SectionHeading eyebrow={t.intro.eyebrow} title={t.intro.title} />
      <div className="mt-8 grid md:grid-cols-3 gap-4 md:gap-5">
        {t.intro.cards.map((card, i) => {
          const href = HREFS[i];
          const className = 'panel lift group flex flex-col gap-3 rounded-2xl bg-[var(--color-surface)] p-6';
          const inner = (
            <>
              <span className="label-caps text-[var(--color-accent-text)]">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="font-display text-2xl font-bold tracking-[-0.03em] text-[var(--color-text)]">{card.title}</h3>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{card.desc}</p>
              <span className="mt-auto pt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-accent-text)]">
                {card.cta}
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
