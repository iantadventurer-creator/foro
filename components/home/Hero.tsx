'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { LegoBrick } from '@/components/ui/LegoBrick';
import { formatCategoryLabel } from '@/lib/categoryThemes';
import type { HomeContent } from '@/lib/content/homeContent';
import type { FeedItem } from '@/lib/gallery';

const POP = { type: 'spring', stiffness: 260, damping: 18 } as const;

/** Posición y giro de cada foto del montón (en % de su caja). */
const STACK = [
  { className: 'left-0 top-[8%] w-[70%] z-10', rotate: -5, sizes: '(max-width: 768px) 70vw, 30vw' },
  { className: 'right-0 -top-[4%] w-[46%] z-20', rotate: 6, sizes: '(max-width: 768px) 50vw, 22vw' },
  { className: 'right-[6%] -bottom-[8%] w-[42%] z-30', rotate: -3, sizes: '(max-width: 768px) 46vw, 20vw' },
];

/** Portada de marca de juguete (inspirada en webs de Awwwards como Ring Pop®):
 * un bloque cobalto a sangre con contorno grueso, el titular enorme con la
 * segunda palabra en lavanda, pegatinas con las cifras y las tres fotos más
 * recientes como tarjetas giradas que se enderezan al pasar el ratón.
 * Dentro del bloque los colores son fijos, así que se ve igual en claro y
 * oscuro. */
export function Hero({
  t,
  photos,
  photoCount,
  universeCount,
  loading,
}: {
  t: HomeContent;
  /** Las fotos más recientes de la galería (se usan las tres primeras). */
  photos: FeedItem[];
  photoCount: number;
  universeCount: number;
  loading: boolean;
}) {
  return (
    <section id="top" className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 md:pt-8 pb-20 md:pb-28">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={POP}
        className="toy relative overflow-hidden rounded-[2.5rem] [--color-border:#13204a] [--toy-shadow:#13204a] bg-[var(--color-accent)] text-white px-6 py-10 sm:px-10 md:px-14 md:py-16 grid grid-cols-1 gap-12 md:grid-cols-[1.05fr_0.95fr] md:items-center"
      >
        {/* Studs decorativos del bloque */}
        <div className="pointer-events-none absolute -right-10 -bottom-10 grid grid-cols-4 gap-4 opacity-20" aria-hidden="true">
          {Array.from({ length: 8 }, (_, i) => (
            <span key={i} className="w-12 h-12 rounded-full border-4 border-white" />
          ))}
        </div>

        <div className="relative min-w-0">
          <span className="sticker bg-[var(--color-highlight)] text-[#13204a]">
            ✦ {t.hero.badge}
          </span>

          <h1 className="mt-6 font-display font-black uppercase leading-[0.86] tracking-[-0.02em] text-[clamp(3.4rem,10vw,8rem)]">
            <motion.span className="block" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ ...POP, delay: 0.1 }}>
              {t.hero.display[0]}
            </motion.span>
            <motion.span
              className="block text-[var(--color-highlight)] [text-shadow:4px_4px_0_#13204a]"
              initial={{ opacity: 0, y: 30, rotate: -4 }}
              animate={{ opacity: 1, y: 0, rotate: -2 }}
              transition={{ ...POP, delay: 0.2 }}
            >
              {t.hero.display[1]}!
            </motion.span>
          </h1>

          <p className="mt-6 font-display text-xl md:text-2xl font-bold leading-snug">{t.hero.title}</p>
          <p className="mt-3 max-w-md text-white/90 leading-relaxed">{t.hero.description}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#gallery"
              className="toy-sm toy-press font-button inline-flex items-center gap-2 rounded-full bg-[var(--color-highlight)] text-[#13204a] px-6 py-3 text-sm font-extrabold uppercase"
            >
              {t.hero.btnExplore} ↓
            </a>
            <Link
              href="/comunidad"
              className="toy-sm toy-press font-button inline-flex items-center gap-2 rounded-full bg-white text-[#13204a] px-6 py-3 text-sm font-extrabold uppercase"
            >
              {t.nav.community} →
            </Link>
          </div>

          <ul className="mt-8 flex flex-wrap gap-3" aria-busy={loading}>
            {[
              { value: photoCount, label: t.hero.stat1 },
              { value: universeCount, label: t.hero.stat2 },
            ].map((stat, i) => (
              <li
                key={stat.label}
                className={`inline-flex items-center gap-2 rounded-2xl border-2 border-white/80 px-4 py-2 ${i === 0 ? 'rotate-[-2deg]' : 'rotate-[2deg]'}`}
              >
                <span className="font-display text-3xl font-black tabular-nums">{loading ? '–' : stat.value}</span>
                <span className="label-caps text-white/90 max-w-[6rem]">{stat.label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Montón de fotos */}
        <div className="relative aspect-square w-full max-w-[34rem] mx-auto mb-[8%]">
          {STACK.map((slot, i) => {
            const item = photos[i];
            return (
              <motion.a
                key={i}
                href="#gallery"
                aria-label={item?.title}
                className={`absolute block ${slot.className}`}
                initial={{ opacity: 0, y: 40, rotate: 0 }}
                animate={{ opacity: 1, y: 0, rotate: slot.rotate }}
                whileHover={{ rotate: 0, scale: 1.04, zIndex: 40 }}
                transition={{ ...POP, delay: 0.25 + i * 0.12 }}
              >
                <span className="toy block overflow-hidden rounded-3xl bg-[var(--color-surface)]">
                  <span className="relative block aspect-[4/5] bg-[var(--color-surface-2)]">
                    {item ? (
                      <Image src={item.src} alt="" fill priority={i === 0} sizes={slot.sizes} className="object-cover" />
                    ) : (
                      <span className="absolute inset-0 animate-shimmer" aria-hidden="true" />
                    )}
                  </span>
                  {item?.category && (
                    <span className="label-caps block truncate px-3 py-2 bg-white text-[#13204a] border-t-2 border-[var(--color-border)]">
                      {formatCategoryLabel(item.category)}
                    </span>
                  )}
                </span>
              </motion.a>
            );
          })}
          <motion.div
            className="absolute -left-2 bottom-[6%] z-40"
            animate={{ y: [0, -10, 0], rotate: [-12, -4, -12] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden="true"
          >
            <LegoBrick color="var(--color-highlight)" studs={2} className="h-10 w-auto drop-shadow-[3px_3px_0_#13204a]" />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
