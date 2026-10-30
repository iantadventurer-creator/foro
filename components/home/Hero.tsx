'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { LegoBrick } from '@/components/ui/LegoBrick';
import { fadeUp } from '@/lib/motion';
import type { HomeContent } from '@/lib/content/homeContent';
import type { FeedItem } from '@/lib/gallery';

export function Hero({
  t,
  previewShots,
  photoCount,
  universeCount,
  loading,
}: {
  t: HomeContent;
  previewShots: FeedItem[];
  /** Cifras reales de la galería (se muestran cuando ya ha cargado). */
  photoCount: number;
  universeCount: number;
  loading: boolean;
}) {
  return (
    <section id="top" className="relative z-0 max-w-7xl mx-auto px-6 pt-14 md:pt-20 pb-20 md:pb-24 grid md:grid-cols-2 gap-12 md:gap-16 items-center">
      <div>
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="inline-flex items-center gap-2.5 rounded-full bg-[var(--color-lego-yellow)] text-[var(--color-lego-yellow-ink)] text-xs font-bold pl-2.5 pr-4 py-2 mb-6 uppercase tracking-widest shadow-[inset_0_-2px_0_rgba(0,0,0,0.12)]"
        >
          <LegoBrick color="var(--color-accent)" studs={2} className="h-3.5 w-auto" />
          {t.hero.badge}
        </motion.div>

        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.05 }}
          className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-[1.04] text-[var(--color-text)]"
        >
          {t.hero.title}
        </motion.h1>
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
          className="text-[var(--color-text-muted)] text-base md:text-lg max-w-lg mb-9 leading-relaxed"
        >
          {t.hero.description}
        </motion.p>
        <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.15 }} className="flex flex-wrap gap-3 sm:gap-4">
          <motion.a
            whileHover={{ y: -3 }}
            whileTap={{ y: 1 }}
            href="#gallery"
            className="font-button inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[var(--color-accent-ink)] bg-[var(--color-accent)] px-7 py-3.5 rounded-full lego-bevel [--bevel-glow:var(--shadow-accent)] hover:brightness-110 transition-[filter]"
          >
            {t.hero.btnExplore} ↓
          </motion.a>
          <motion.div whileHover={{ y: -3 }} whileTap={{ y: 1 }}>
            <Link
              href="/comunidad"
              className="font-button inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[var(--color-lego-yellow-ink)] bg-[var(--color-lego-yellow)] px-7 py-3.5 rounded-full lego-bevel [--bevel-glow:rgba(255,213,0,0.45)] hover:brightness-105 transition-[filter]"
            >
              {t.nav.community}
            </Link>
          </motion.div>
        </motion.div>

        <motion.ul
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
          className="mt-10 flex gap-8 border-t border-[var(--color-border)] pt-6"
          aria-busy={loading}
        >
          {[
            { value: photoCount, label: t.hero.stat1, color: 'var(--color-accent)' },
            { value: universeCount, label: t.hero.stat2, color: 'var(--color-accent-3)' },
          ].map((stat) => (
            <li key={stat.label} className="flex items-center gap-3">
              <LegoBrick color={stat.color} studs={1} className="h-6 w-auto" />
              <p className="flex flex-col">
                <span className="font-display text-2xl font-bold leading-none tabular-nums">{loading ? '–' : stat.value}</span>
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)] mt-1">{stat.label}</span>
              </p>
            </li>
          ))}
        </motion.ul>
      </div>

      <div className="relative" aria-hidden="true">
        {/* Acento: una sola pieza LEGO asomando por detrás del mosaico */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, type: 'spring', stiffness: 180, damping: 20 }}
          className="absolute -top-5 -right-3 z-10 hidden sm:block rotate-6"
        >
          <LegoBrick color="var(--color-lego-yellow)" studs={4} className="h-9 w-auto drop-shadow-md" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, type: 'spring', stiffness: 180, damping: 20 }}
          className="absolute -bottom-4 -left-4 z-10 hidden sm:block -rotate-6"
        >
          <LegoBrick color="var(--color-accent)" studs={2} className="h-8 w-auto drop-shadow-md" />
        </motion.div>

        <div className="grid grid-cols-3 grid-rows-2 gap-3 sm:gap-4 h-72 sm:h-80 md:h-[26rem]">
          {[0, 1, 2].map((i) => {
            const item = previewShots[i];
            const placement = i === 0 ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1';
            return (
              <motion.div
                key={item?.id ?? `placeholder-${i}`}
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.08 * i, type: 'spring', stiffness: 200, damping: 22 }}
                className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[var(--color-surface-2)] border border-[var(--color-border)] card-depth ${placement}`}
              >
                {item ? (
                  <>
                    <Image
                      src={item.src}
                      alt=""
                      fill
                      sizes={i === 0 ? '(max-width: 768px) 66vw, 420px' : '(max-width: 768px) 33vw, 210px'}
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                    {item.category && (
                      <span className="absolute left-2.5 bottom-2.5 sm:left-3 sm:bottom-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--color-surface)]/90 backdrop-blur-sm px-2.5 py-1 text-[10px] sm:text-xs font-bold text-[var(--color-text)] shadow-sm">
                        <span className="w-2 h-2 rounded-full" style={{ background: ['var(--color-accent)', 'var(--color-lego-yellow)', 'var(--color-accent-3)'][i] }} />
                        {item.title}
                      </span>
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 animate-shimmer" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
