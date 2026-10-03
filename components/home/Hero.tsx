'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { fadeUp } from '@/lib/motion';
import type { HomeContent } from '@/lib/homeContent';
import type { FeedItem } from '@/lib/gallery';

export function Hero({ t, previewShots }: { t: HomeContent; previewShots: FeedItem[] }) {
  return (
    <section id="top" className="relative z-0 overflow-hidden max-w-7xl mx-auto px-6 pt-20 pb-24 grid md:grid-cols-2 gap-16 items-center">
      <div className="absolute top-10 left-0 w-64 h-64 md:w-[28rem] md:h-[28rem] bg-[var(--color-accent-3)]/10 rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-0 w-56 h-56 md:w-[24rem] md:h-[24rem] bg-[var(--color-accent)]/10 rounded-full blur-[130px] pointer-events-none -z-10" />

      <div>
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="inline-flex items-center gap-2 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-accent-text)] text-xs font-bold px-4 py-2 rounded-full mb-6 uppercase tracking-widest">
          {t.hero.badge}
        </motion.div>

        <motion.h1 variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.05 }} className="font-display text-4xl md:text-6xl font-semibold tracking-tight mb-6 leading-[1.05] bg-gradient-to-b from-white to-[#a9b5d3] bg-clip-text text-transparent">
          {t.hero.title}
        </motion.h1>
        <motion.p variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }} className="text-[var(--color-text-muted)] text-base md:text-lg max-w-lg mb-10 leading-relaxed">
          {t.hero.description}
        </motion.p>
        <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.15 }} className="flex flex-wrap gap-4">
          <motion.a
            whileHover={{ y: -3 }}
            whileTap={{ y: 2 }}
            href="#gallery"
            className="font-button inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[var(--color-accent-ink)] bg-[var(--color-accent)] px-7 py-3.5 rounded-full shadow-[0_8px_24px_-8px_var(--shadow-accent)] hover:brightness-110 transition-[filter]"
          >
            {t.hero.btnExplore} ↓
          </motion.a>
          <motion.div whileHover={{ y: -3 }} whileTap={{ y: 2 }}>
            <Link href="/comunidad" className="font-button inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-white bg-[var(--color-accent-3)] px-7 py-3.5 rounded-full shadow-[0_8px_24px_-8px_var(--shadow-accent-3)] hover:brightness-110 transition-[filter]">
              {t.nav.community}
            </Link>
          </motion.div>
        </motion.div>
      </div>

      <div className="relative h-64 sm:h-72 md:h-96" aria-hidden="true">
        {previewShots.length > 0 ? (
          previewShots.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30, rotate: 0 }}
              animate={{ opacity: 1, y: 0, rotate: [-6, 4, -3][i] }}
              transition={{ delay: 0.1 * i, type: 'spring', stiffness: 200, damping: 20 }}
              whileHover={{ rotate: 0, scale: 1.03, zIndex: 10 }}
              className="absolute rounded-2xl border-4 border-[var(--color-surface)] shadow-2xl overflow-hidden bg-black"
              style={{
                width: '55%',
                aspectRatio: '4 / 5',
                top: `${[0, 30, 10][i]}%`,
                left: `${[5, 45, 25][i]}%`,
                zIndex: [1, 2, 3][i],
              }}
            >
              <Image src={item.src} alt="" fill sizes="(max-width: 1024px) 50vw, 400px" className="object-cover" />
            </motion.div>
          ))
        ) : (
          <>
            <div className="absolute rounded-2xl bg-gradient-to-br from-[var(--color-accent-3)]/30 to-transparent border border-[var(--color-border)]" style={{ width: '55%', aspectRatio: '4/5', top: '0%', left: '5%' }} />
            <div className="absolute rounded-2xl bg-gradient-to-br from-[var(--color-accent)]/30 to-transparent border border-[var(--color-border)]" style={{ width: '55%', aspectRatio: '4/5', top: '30%', left: '45%' }} />
          </>
        )}
      </div>
    </section>
  );
}
