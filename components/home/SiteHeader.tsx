'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import type { HomeContent } from '@/lib/homeContent';

export type ActiveSection = 'gallery' | 'about' | null;

export function SiteHeader({
  t,
  lang,
  onLangChange,
  activeSection,
  onOpenQr,
}: {
  t: HomeContent;
  lang: 'es' | 'en';
  onLangChange: (lang: 'es' | 'en') => void;
  activeSection: ActiveSection;
  onOpenQr: () => void;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Cierra el menú móvil y, una vez terminada su animación de colapso (para
  // que la cabecera ya tenga su altura final), hace scroll a la sección.
  // Si se hiciera el salto de ancla nativo al mismo tiempo que se anima el
  // cierre del menú, el navegador calcula el destino con la cabecera todavía
  // expandida y el scroll termina descuadrado (parece que el enlace "no hace nada").
  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 350);
  };

  return (
    <header className="sticky top-0 z-40 bg-[var(--color-ink)]/85 backdrop-blur-md border-b border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        <a href="#top" className="flex items-center gap-3 group">
          <div className="w-9 h-9 shadow-[0_8px_24px_-8px_var(--shadow-accent)] group-hover:-translate-y-0.5 group-hover:shadow-[0_8px_24px_-8px_var(--shadow-accent)] transition-all rounded-md overflow-hidden">
            <svg viewBox="0 0 36 36" className="w-full h-full" aria-hidden="true">
              <rect x="0" y="0" width="36" height="36" fill="var(--color-accent)" />
              {[[11, 11], [25, 11], [11, 25], [25, 25]].map(([cx, cy]) => (
                <g key={`${cx}-${cy}`}>
                  <circle cx={cx + 1} cy={cy + 1.5} r="5.5" fill="rgba(0,0,0,0.3)" />
                  <circle cx={cx} cy={cy} r="5.5" fill="var(--color-accent)" />
                  <circle cx={cx - 2} cy={cy - 2} r="1.7" fill="white" opacity="0.5" />
                </g>
              ))}
            </svg>
          </div>
          <div className="leading-none">
            <span className="font-display font-semibold text-base tracking-tight text-[var(--color-text)] block">IanTBuild</span>
            <span className="text-[10px] text-[var(--color-accent-text)] font-semibold tracking-[0.2em] uppercase">Studio</span>
          </div>
        </a>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[var(--color-text-muted)]">
          <a href="#gallery" className="group relative py-1 hover:text-[var(--color-text)] transition-colors">
            {t.nav.gallery}
            <span className={`absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-[var(--color-accent)] transition-transform duration-300 origin-center ${activeSection === 'gallery' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
          </a>
          <Link href="/comunidad" className="group relative py-1 hover:text-[var(--color-text)] transition-colors">
            {t.nav.community}
            <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-[var(--color-accent-2)] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
          </Link>
          <a href="#about" className="group relative py-1 hover:text-[var(--color-text)] transition-colors">
            {t.nav.about}
            <span className={`absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-[var(--color-accent-3)] transition-transform duration-300 origin-center ${activeSection === 'about' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
          </a>
          <button
            onClick={onOpenQr}
            aria-label={t.footer.qrLabel}
            className="group relative py-1 hover:text-[var(--color-text)] transition-colors"
          >
            {t.footer.qrLabel}
            <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-[var(--color-accent-4)] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1 bg-[var(--color-surface)] p-1 rounded-full border border-[var(--color-border)]">
            <button onClick={() => onLangChange('es')} aria-pressed={lang === 'es'} className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${lang === 'es' ? 'bg-[var(--color-accent)] text-[var(--color-accent-ink)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}>ES</button>
            <button onClick={() => onLangChange('en')} aria-pressed={lang === 'en'} className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${lang === 'en' ? 'bg-[var(--color-accent)] text-[var(--color-accent-ink)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}>EN</button>
          </div>
          <motion.a
            whileHover={{ y: -2 }}
            whileTap={{ y: 1 }}
            href="https://instagram.com/iantadventurer"
            target="_blank"
            rel="noopener noreferrer"
            className="font-button hidden sm:inline-flex items-center text-xs font-bold uppercase tracking-wide text-[var(--color-accent-ink)] bg-[var(--color-accent)] px-5 py-2.5 rounded-full shadow-[0_8px_24px_-8px_var(--shadow-accent)] hover:brightness-110 transition-[filter]"
          >
            {t.nav.cta}
          </motion.a>
          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-expanded={mobileMenuOpen}
            aria-label={t.nav.menu}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-text)]"
          >
            <div className="flex flex-col gap-1.5 items-end">
              <span className={`h-0.5 bg-current transition-all ${mobileMenuOpen ? 'w-5 rotate-45 translate-y-2' : 'w-5'}`} />
              <span className={`h-0.5 bg-current transition-all ${mobileMenuOpen ? 'opacity-0' : 'w-4'}`} />
              <span className={`h-0.5 bg-current transition-all ${mobileMenuOpen ? 'w-5 -rotate-45 -translate-y-2' : 'w-3'}`} />
            </div>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-[var(--color-border)]"
          >
            <div className="px-6 py-3 flex flex-col text-sm font-semibold">
              <a href="#gallery" onClick={(e) => { e.preventDefault(); scrollToSection('gallery'); }} className="block py-3 text-[var(--color-text-muted)] hover:text-[var(--color-text)]">{t.nav.gallery}</a>
              <Link href="/comunidad" onClick={() => setMobileMenuOpen(false)} className="block py-3 text-[var(--color-text-muted)] hover:text-[var(--color-text)]">{t.nav.community}</Link>
              <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }} className="block py-3 text-[var(--color-text-muted)] hover:text-[var(--color-text)]">{t.nav.about}</a>
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenQr(); }}
                aria-label={t.footer.qrLabel}
                className="block w-full text-left py-3 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                {t.footer.qrLabel}
              </button>
              <div className="flex items-center gap-1 bg-[var(--color-surface)] p-1 rounded-full border border-[var(--color-border)] w-fit mt-2">
                <button onClick={() => onLangChange('es')} className={`px-3 py-1 rounded-full text-xs font-bold ${lang === 'es' ? 'bg-[var(--color-accent)] text-[var(--color-accent-ink)]' : 'text-[var(--color-text-muted)]'}`}>ES</button>
                <button onClick={() => onLangChange('en')} className={`px-3 py-1 rounded-full text-xs font-bold ${lang === 'en' ? 'bg-[var(--color-accent)] text-[var(--color-accent-ink)]' : 'text-[var(--color-text-muted)]'}`}>EN</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
