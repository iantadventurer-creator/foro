import Link from 'next/link';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { HomeContent } from '@/lib/content/homeContent';

// Cada espacio lleva el color de su papel en la paleta (cobalto = la obra,
// turquesa = la comunidad, lavanda = el autor), con su texto en la pareja legible.
const BLOCKS = [
  { href: '#gallery', bg: 'var(--color-accent)', ink: '#ffffff', rotate: 'md:-rotate-1' },
  { href: '/comunidad', bg: 'var(--color-accent-3)', ink: '#13204a', rotate: 'md:rotate-1' },
  { href: '#about', bg: 'var(--color-highlight)', ink: '#13204a', rotate: 'md:-rotate-1' },
];

/** Los tres espacios de la web como bloques de color. */
export function IntroSection({ t }: { t: HomeContent }) {
  return (
    <section id="intro" className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 md:pb-28">
      <SectionHeading index="03" eyebrow={t.intro.eyebrow} title={t.intro.title} />
      <div className="mt-10 grid md:grid-cols-3 gap-5 md:gap-6">
        {t.intro.cards.map((card, i) => {
          const block = BLOCKS[i];
          const className = `toy toy-press group flex flex-col gap-4 rounded-3xl p-6 md:p-7 ${block.rotate} hover:rotate-0 [--color-border:#13204a] [--toy-shadow:#13204a]`;
          const style = { background: block.bg, color: block.ink };
          const inner = (
            <>
              <span className="w-12 h-12 rounded-full border-2 border-[#13204a] bg-white text-[#13204a] flex items-center justify-center font-display text-xl font-extrabold">
                {i + 1}
              </span>
              <h3 className="font-display text-3xl md:text-4xl font-extrabold leading-[0.95]">{card.title}</h3>
              <p className="text-sm md:text-base font-medium leading-relaxed opacity-90">{card.desc}</p>
              <span className="mt-auto pt-2 inline-flex items-center gap-2 font-display text-sm font-extrabold uppercase">
                {card.cta}
                <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
              </span>
            </>
          );
          return block.href.startsWith('/') ? (
            <Link key={card.title} href={block.href} className={className} style={style}>{inner}</Link>
          ) : (
            <a key={card.title} href={block.href} className={className} style={style}>{inner}</a>
          );
        })}
      </div>
    </section>
  );
}
