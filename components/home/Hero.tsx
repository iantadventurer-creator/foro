'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { LegoBrick } from '@/components/ui/LegoBrick';
import { fadeUp } from '@/lib/motion';
import type { HomeContent } from '@/lib/content/homeContent';
import type { FeedItem } from '@/lib/gallery';

/** Hero cinemático (inspirado en "Lego Classic Space", Awwwards): la foto más
 * reciente a sangre dentro de un marco de cristal, un bloque tipo ticket en
 * tipografía mono y el titular gigante con la segunda palabra en amarillo.
 * Dentro del marco los colores son fijos (texto claro sobre la foto
 * oscurecida), así que se lee igual en modo claro y oscuro. */
export function Hero({
  t,
  featured,
  photoCount,
  universeCount,
  loading,
}: {
  t: HomeContent;
  /** Foto destacada (la más reciente de la galería). */
  featured?: FeedItem;
  photoCount: number;
  universeCount: number;
  loading: boolean;
}) {
  const ticketNumber = loading ? '———' : String(photoCount).padStart(3, '0');

  return (
    <section id="top" className="max-w-7xl mx-auto px-3 sm:px-6 pt-3 sm:pt-6 pb-12 md:pb-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative isolate overflow-hidden rounded-[1.75rem] sm:rounded-[2.25rem] bg-[#0a1428] text-white h-[74svh] min-h-[480px] max-h-[820px]"
      >
        {featured ? (
          <motion.div
            className="absolute inset-0 -z-10"
            initial={{ scale: 1.14 }}
            animate={{ scale: 1.04 }}
            transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image src={featured.src} alt="" fill priority sizes="(max-width: 1280px) 100vw, 1280px" className="object-cover" />
          </motion.div>
        ) : (
          <div className="absolute inset-0 -z-10 animate-shimmer opacity-20" aria-hidden="true" />
        )}

        {/* Oscurecido para que el texto se lea siempre sobre la foto */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#0a1428] via-[#0a1428]/35 to-[#0a1428]/45" aria-hidden="true" />
        {/* Marco interior de cristal */}
        <div className="pointer-events-none absolute inset-3 sm:inset-5 rounded-[1.35rem] sm:rounded-[1.75rem] border border-white/25" aria-hidden="true" />

        {/* Fila superior: firma y pieza */}
        <div className="absolute top-6 left-6 right-6 sm:top-9 sm:left-10 sm:right-10 flex items-center justify-between">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15 px-3 py-1.5 font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.2em]">
            <LegoBrick color="var(--color-accent)" studs={2} className="h-3 w-auto" />
            {t.hero.badge}
          </span>
          <LegoBrick color="var(--color-lego-yellow)" studs={2} className="h-6 w-auto drop-shadow" />
        </div>

        {/* Ticket */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.25 }}
          className="absolute left-6 sm:left-10 top-[22%] font-mono uppercase"
        >
          <p className="text-[10px] sm:text-[11px] tracking-[0.25em] text-white/75">{t.hero.ticket}</p>
          <p className="text-sm sm:text-base tracking-[0.2em] mt-1">
            Nº <span className="tabular-nums">{ticketNumber}</span> · {universeCount || '—'} {t.hero.stat2}
          </p>
          <div className="mt-3 flex items-center gap-3">
            <span
              className="block h-7 w-28 sm:w-36 text-[var(--color-lego-yellow)]"
              style={{
                background:
                  'repeating-linear-gradient(90deg, currentColor 0 2px, transparent 2px 4px, currentColor 4px 5px, transparent 5px 8px, currentColor 8px 11px, transparent 11px 13px)',
              }}
              aria-hidden="true"
            />
            <a
              href="#gallery"
              className="rounded-md border border-[var(--color-lego-yellow)] px-2.5 py-1 text-[10px] sm:text-xs font-bold tracking-[0.2em] text-[var(--color-lego-yellow)] hover:bg-[var(--color-lego-yellow)] hover:text-[var(--color-lego-yellow-ink)] transition-colors"
            >
              {t.hero.start}
            </a>
          </div>
        </motion.div>

        {/* Nota lateral en mono (escritorio) */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.35 }}
          className="hidden md:block absolute right-10 top-[24%] max-w-[17rem] text-right font-mono text-xs uppercase leading-relaxed tracking-[0.15em] text-white/85"
        >
          {t.hero.tagline}
          {featured?.category && <span className="mt-3 block text-[var(--color-lego-yellow)]">▸ {featured.title}</span>}
        </motion.p>

        {/* Titular gigante */}
        <div className="absolute left-6 right-6 bottom-7 sm:left-10 sm:right-10 sm:bottom-10">
          <h1 className="font-display font-bold uppercase leading-[0.86] tracking-[-0.03em] text-[clamp(3.1rem,11.5vw,10rem)]">
            <motion.span
              className="block"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              {t.hero.display[0]}
            </motion.span>
            <motion.span
              className="block text-[var(--color-lego-yellow)]"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              {t.hero.display[1]}
            </motion.span>
          </h1>
        </div>
      </motion.div>

      {/* Bajo el marco: descripción, acciones y cifras */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.3 }}
        className="mt-6 md:mt-8 grid gap-6 md:grid-cols-[1fr_auto] md:items-end"
      >
        <div>
          <p className="font-display text-xl md:text-2xl font-semibold tracking-tight text-[var(--color-text)]">{t.hero.title}</p>
          <p className="mt-2 max-w-xl text-[var(--color-text-muted)] leading-relaxed">{t.hero.description}</p>
        </div>
        <div className="flex flex-col gap-5 md:items-end">
          <div className="flex flex-wrap gap-3">
            <motion.a
              whileHover={{ y: -2 }}
              whileTap={{ y: 1 }}
              href="#gallery"
              className="font-button inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[var(--color-lego-yellow-ink)] bg-[var(--color-lego-yellow)] px-6 py-3.5 rounded-full lego-bevel [--bevel-glow:rgba(255,202,32,0.45)] hover:brightness-105 transition-[filter]"
            >
              {t.hero.btnExplore} ↓
            </motion.a>
            <motion.div whileHover={{ y: -2 }} whileTap={{ y: 1 }}>
              <Link
                href="/comunidad"
                className="font-button inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[var(--color-text)] border-2 border-[var(--color-text)] px-6 py-3 rounded-full hover:bg-[var(--color-text)] hover:text-[var(--color-ink)] transition-colors"
              >
                {t.nav.community}
              </Link>
            </motion.div>
          </div>
          <ul className="flex gap-6 font-mono text-xs uppercase tracking-[0.15em] text-[var(--color-text-muted)]" aria-busy={loading}>
            <li>
              <span className="font-display text-2xl font-bold text-[var(--color-text)] tabular-nums mr-2">{loading ? '–' : photoCount}</span>
              {t.hero.stat1}
            </li>
            <li>
              <span className="font-display text-2xl font-bold text-[var(--color-text)] tabular-nums mr-2">{loading ? '–' : universeCount}</span>
              {t.hero.stat2}
            </li>
          </ul>
        </div>
      </motion.div>
    </section>
  );
}
