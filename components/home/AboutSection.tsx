'use client';

import type { Ref } from 'react';
import { motion } from 'framer-motion';
import { fadeUp } from '@/lib/motion';
import type { HomeContent } from '@/lib/content/homeContent';

/** "Detrás del lente": último paso del "manual", con la frase del autor en
 * grande y su etiqueta a la izquierda. */
export function AboutSection({ t, sectionRef }: { t: HomeContent; sectionRef: Ref<HTMLElement> }) {
  return (
    <section id="about" ref={sectionRef} className="max-w-[1440px] mx-auto px-4 sm:px-6 pb-16 md:pb-24 scroll-mt-20">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="grid gap-6 md:grid-cols-[minmax(0,14rem)_1fr] md:gap-x-8 md:gap-y-5"
      >
        <div className="plate md:col-span-2" aria-hidden="true" />
        <div>
          <span aria-hidden="true" className="block mb-4 font-display text-[clamp(3rem,6vw,4.5rem)] font-bold leading-[0.8] tracking-[-0.06em] text-[var(--color-accent-text)]">4</span>
          <p className="label-caps text-[var(--color-text-muted)]">{t.aboutSection.eyebrow}</p>
          <h2 className="mt-2 text-sm font-semibold text-[var(--color-text)]">{t.aboutSection.title}</h2>
        </div>
        <div>
          <p className="font-display text-[clamp(1.6rem,3.4vw,2.75rem)] font-medium leading-[1.12] tracking-[-0.035em] text-[var(--color-text)] max-w-4xl">
            {t.aboutSection.desc}
          </p>
          <a
            href="https://instagram.com/iantadventurer"
            target="_blank"
            rel="noopener noreferrer"
            className="label-caps mt-8 inline-flex items-center gap-1.5 text-[var(--color-text)] link-underline"
          >
            {t.aboutSection.cta} ↗
          </a>
        </div>
      </motion.div>
    </section>
  );
}
