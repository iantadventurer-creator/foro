'use client';

import type { Ref } from 'react';
import { motion } from 'framer-motion';
import { fadeUp } from '@/lib/motion';
import type { HomeContent } from '@/lib/content/homeContent';

/** "Detrás del lente": la frase del autor en grande, en una tarjeta sobria. */
export function AboutSection({ t, sectionRef }: { t: HomeContent; sectionRef: Ref<HTMLElement> }) {
  return (
    <section id="about" ref={sectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 md:pb-24 scroll-mt-20">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="panel rounded-3xl bg-[var(--color-surface)] px-6 py-10 sm:px-10 md:px-14 md:py-14 grid gap-8 md:grid-cols-[1fr_1.5fr]"
      >
        <div>
          <span className="sticker text-[var(--color-text-muted)]">{t.aboutSection.eyebrow}</span>
          <h2 className="mt-4 font-display text-3xl md:text-4xl font-bold tracking-[-0.04em] leading-[1.02] text-[var(--color-text)]">
            {t.aboutSection.title}
          </h2>
        </div>
        <div>
          <p className="font-display text-xl md:text-2xl font-medium leading-snug text-[var(--color-text)]">{t.aboutSection.desc}</p>
          <a
            href="https://instagram.com/iantadventurer"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-accent-text)] link-underline"
          >
            {t.aboutSection.cta} ↗
          </a>
        </div>
      </motion.div>
    </section>
  );
}
