'use client';

import type { Ref } from 'react';
import { motion } from 'framer-motion';
import { fadeUp } from '@/lib/motion';
import type { HomeContent } from '@/lib/homeContent';

export function AboutSection({ t, sectionRef }: { t: HomeContent; sectionRef: Ref<HTMLElement> }) {
  return (
    <section id="about" ref={sectionRef} className="max-w-5xl mx-auto px-6 py-20 relative z-10">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="grid md:grid-cols-[1.2fr_0.8fr] gap-10 items-center bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-8 md:p-14"
      >
        <div>
          <span className="text-xs font-bold text-[var(--color-accent-text)] uppercase tracking-widest">{t.aboutSection.eyebrow}</span>
          <h3 className="font-display text-2xl md:text-3xl font-semibold text-[var(--color-text)] mt-3 mb-5 tracking-tight">{t.aboutSection.title}</h3>
          <p className="text-[var(--color-text-muted)] text-base leading-relaxed">{t.aboutSection.desc}</p>
        </div>
        <div className="flex md:flex-col gap-4 md:gap-6 md:border-l md:border-[var(--color-border)] md:pl-10">
          <a href="https://instagram.com/iantadventurer" target="_blank" rel="noopener noreferrer" className="font-button inline-flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-text)] border border-[var(--color-border)] px-6 py-3.5 rounded-full hover:border-[var(--color-accent)] hover:text-[var(--color-accent-text)] transition whitespace-nowrap">
            {t.aboutSection.cta}
          </a>
        </div>
      </motion.div>
    </section>
  );
}
