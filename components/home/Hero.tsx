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

      <div className="relative h-72 sm:h-80 md:h-[26rem]" aria-hidden="true">
        {/* Placa amarilla con studs: el "escenario" sobre el que se apoyan las fotos */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 160, damping: 22 }}
          className="lego-bevel absolute inset-0 rounded-[1.75rem] bg-[var(--color-lego-yellow)]"
          style={{
            // Textura de placa base: studs en relieve dentro de la placa.
            backgroundImage:
              'radial-gradient(circle at 42% 38%, rgba(255,255,255,0.55) 0 2.5px, transparent 3px), radial-gradient(circle, rgba(150,110,0,0.22) 0 7px, transparent 7.5px)',
            backgroundSize: '26px 26px',
            backgroundPosition: '6px 6px',
          }}
        />
        <div className="lego-bevel absolute -left-3 bottom-[8%] z-10 w-14 h-9 rounded-lg bg-[var(--color-accent)] hidden sm:block" />

        {previewShots.length > 0 ? (
          previewShots.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30, rotate: 0 }}
              animate={{ opacity: 1, y: 0, rotate: [-6, 4, -3][i] }}
              transition={{ delay: 0.1 * i, type: 'spring', stiffness: 200, damping: 20 }}
              whileHover={{ rotate: 0, scale: 1.03, zIndex: 10 }}
              className="absolute rounded-2xl border-4 border-white shadow-[0_20px_40px_-18px_rgba(32,33,36,0.55)] overflow-hidden bg-[var(--color-surface-2)]"
              style={{
                width: '42%',
                aspectRatio: '4 / 5',
                top: `${[9, 24, 13][i]}%`,
                left: `${[9, 49, 29][i]}%`,
                zIndex: [1, 2, 3][i],
              }}
            >
              <Image src={item.src} alt="" fill sizes="(max-width: 1024px) 50vw, 400px" className="object-cover" />
            </motion.div>
          ))
        ) : (
          <>
            <div className="absolute rounded-2xl border-4 border-white bg-[var(--color-surface-2)] animate-shimmer" style={{ width: '52%', aspectRatio: '4/5', top: '6%', left: '14%' }} />
            <div className="absolute rounded-2xl border-4 border-white bg-[var(--color-surface-2)] animate-shimmer" style={{ width: '52%', aspectRatio: '4/5', top: '24%', left: '44%' }} />
          </>
        )}
      </div>
    </section>
  );
}
