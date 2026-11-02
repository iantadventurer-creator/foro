import Link from 'next/link';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { HomeContent } from '@/lib/content/homeContent';

const HREFS = ['#gallery', '/comunidad', '#about'];

/** Los tres espacios de la web en columnas separadas por filetes. */
export function IntroSection({ t }: { t: HomeContent }) {
  return (
    <section id="intro" className="max-w-[1440px] mx-auto px-4 sm:px-6 pb-16 md:pb-24">
      <SectionHeading step={3} eyebrow={t.intro.eyebrow} title={t.intro.title} />
      <div className="mt-8 grid md:grid-cols-3 border-t border-[var(--color-border)] md:border-t-0">
        {t.intro.cards.map((card, i) => {
          const href = HREFS[i];
          const className = `group flex flex-col gap-3 py-6 md:px-6 md:py-2 border-b md:border-b-0 border-[var(--color-border)] ${i > 0 ? 'md:border-l' : 'md:pl-0'} hover:bg-[var(--color-surface-2)] md:hover:bg-transparent`;
          const inner = (
            <>
              <span className="label-caps text-[var(--color-text-faint)]">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="font-display text-2xl font-semibold tracking-[-0.03em] text-[var(--color-text)]">{card.title}</h3>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{card.desc}</p>
              <span className="label-caps mt-auto pt-3 inline-flex items-center gap-1.5 text-[var(--color-text)]">
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
