'use client';

import type { Ref } from 'react';
import { motion } from 'framer-motion';
import { DoodleMinifig, DoodleSparkle } from '@/components/ui/Doodles';
import { fadeUp } from '@/lib/motion';
import type { HomeContent } from '@/lib/content/homeContent';

/** "Detrás del lente": la frase del autor escrita a mano en grande, con una
 * minifigura garabateada al lado, como la última página del cuaderno. */
export function AboutSection({ t, sectionRef }: { t: HomeContent; sectionRef: Ref<HTMLElement> }) {
  return (
    <section id="about" ref={sectionRef} className="max-w-[1320px] mx-auto px-4 sm:px-6 pb-16 md:pb-24 scroll-mt-20">
      <div className="squiggle text-[var(--color-border)]" aria-hidden="true" />
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="pt-8 grid gap-8 md:grid-cols-[minmax(0,16rem)_1fr] md:gap-12 md:items-center"
      >
        <div className="flex items-end gap-4 md:flex-col md:items-start">
          <DoodleMinifig className="w-20 md:w-28 -rotate-6 text-[var(--color-line)]" />
          <div>
            <p className="hand text-2xl text-[var(--color-accent-text)]">4. {t.aboutSection.eyebrow}</p>
            <h2 className="mt-1 text-sm font-semibold text-[var(--color-text)]">{t.aboutSection.title}</h2>
          </div>
        </div>
        <div className="relative">
          <DoodleSparkle className="absolute -top-6 right-4 w-7 text-[var(--color-accent)] opacity-70" />
          <p className="hand text-[clamp(2.25rem,4.6vw,3.75rem)] leading-[1] text-[var(--color-text)] max-w-4xl">
            {t.aboutSection.desc}
          </p>
          <a
            href="https://instagram.com/iantadventurer"
            target="_blank"
            rel="noopener noreferrer"
            className="hand mt-8 inline-flex items-center gap-1.5 text-2xl text-[var(--color-accent-text)] link-underline"
          >
            {t.aboutSection.cta} ↗
          </a>
        </div>
      </motion.div>
    </section>
  );
}
