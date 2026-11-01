'use client';

import type { Ref } from 'react';
import { motion } from 'framer-motion';
import { LegoBrick } from '@/components/ui/LegoBrick';
import { fadeUp } from '@/lib/motion';
import type { HomeContent } from '@/lib/content/homeContent';

/** "Detrás del lente": un bloque lavanda (el color de los destacados) con
 * la frase del autor en grande. Dentro del bloque los colores son fijos
 * (texto marino sobre lavanda) en ambos temas. */
export function AboutSection({ t, sectionRef }: { t: HomeContent; sectionRef: Ref<HTMLElement> }) {
  return (
    <section id="about" ref={sectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 md:pb-28 scroll-mt-20">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="toy relative overflow-hidden rounded-[2.5rem] bg-[var(--color-highlight)] text-[#13204a] px-6 py-10 sm:px-10 md:px-14 md:py-14 [--color-border:#13204a] [--toy-shadow:#13204a]"
      >
        <div className="absolute right-6 top-6 hidden sm:flex items-end gap-1 hover-wiggle" aria-hidden="true">
          <LegoBrick color="var(--color-accent)" studs={2} className="h-8 w-auto" />
          <LegoBrick color="var(--color-accent-3)" studs={1} className="h-8 w-auto" />
        </div>
        <span className="sticker bg-[var(--color-accent)] text-white">#04 {t.aboutSection.eyebrow}</span>
        <h2 className="mt-5 max-w-2xl font-display text-3xl md:text-5xl font-extrabold leading-[0.95]">{t.aboutSection.title}</h2>
        <p className="mt-6 max-w-3xl font-display text-xl md:text-3xl font-bold leading-snug">{t.aboutSection.desc}</p>
        <a
          href="https://instagram.com/iantadventurer"
          target="_blank"
          rel="noopener noreferrer"
          className="toy-sm toy-press font-button mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-extrabold uppercase"
        >
          {t.aboutSection.cta} ↗
        </a>
      </motion.div>
    </section>
  );
}
