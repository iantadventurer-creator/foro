import Link from 'next/link';
import type { HomeContent } from '@/lib/homeContent';

export function IntroSection({ t }: { t: HomeContent }) {
  return (
    <section id="intro" className="max-w-7xl mx-auto px-6 pb-20 relative z-10">
      <div className="text-center mb-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-accent-text)] mb-3">{t.intro.eyebrow}</p>
        <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">{t.intro.title}</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        {t.intro.cards.map((card, i) => {
          const tone = ['var(--color-accent)', 'var(--color-accent-3)', 'var(--color-accent-4)'][i];
          const href = ['#gallery', '/comunidad', '#about'][i];
          const icon = [
            <path key="g" d="M4 7a2 2 0 0 1 2-2h1.5l1-1.5h7l1 1.5H18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Zm8 9.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />,
            <path key="c" d="M16 11a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm-8 0a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm0 2c-2.3 0-7 1.2-7 3.5V19h8v-2.5c0-1 .4-1.9 1.1-2.7C9.4 13.3 8.6 13 8 13Zm8 0c-2.3 0-7 1.2-7 3.5V19h14v-2.5c0-2.3-4.7-3.5-7-3.5Z" />,
            <path key="a" d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Zm0 2c-3 0-8 1.5-8 4.5V21h16v-2.5c0-3-5-4.5-8-4.5Z" />,
          ][i];
          const cardClass = 'group relative flex flex-col h-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/70 backdrop-blur-sm p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--card-tone)]/60';
          const inner = (
            <>
              <span
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                style={{ background: `color-mix(in srgb, ${tone} 16%, transparent)`, color: tone }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">{icon}</svg>
              </span>
              <h3 className="font-display text-lg font-semibold mb-2">{card.title}</h3>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-6">{card.desc}</p>
              <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: tone }}>
                {card.cta}
                <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </span>
            </>
          );
          const style = { '--card-tone': tone } as React.CSSProperties;
          return href.startsWith('/') ? (
            <Link key={card.title} href={href} className={cardClass} style={style}>{inner}</Link>
          ) : (
            <a key={card.title} href={href} className={cardClass} style={style}>{inner}</a>
          );
        })}
      </div>
    </section>
  );
}
