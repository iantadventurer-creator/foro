'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { DoodleBrick } from '@/components/ui/Doodles';
import { LangToggle } from '@/components/ui/LangToggle';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import type { HomeContent } from '@/lib/content/homeContent';
import type { Lang } from '@/lib/lang';

export type ActiveSection = 'gallery' | 'about' | null;

export function SiteHeader({
  t,
  lang,
  onLangChange,
  activeSection,
  onOpenQr,
}: {
  t: HomeContent;
  lang: Lang;
  onLangChange: (lang: Lang) => void;
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
    <header className="sticky top-0 z-40 bg-[var(--color-ink)]/95 backdrop-blur-sm border-b border-[var(--color-border)]">
      <div className="max-w-[1320px] mx-auto flex justify-between items-center gap-4 px-4 sm:px-6 h-16">
        <a href="#top" className="group flex items-center gap-2.5">
          <DoodleBrick className="w-10 h-auto text-[var(--color-accent)] transition-transform group-hover:-rotate-6" />
          <span className="font-display text-2xl font-extrabold leading-none text-[var(--color-text)]">IanTBuild</span>
        </a>

        <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-[var(--color-text)]">
          <a href="#gallery" aria-current={activeSection === 'gallery' ? 'true' : undefined} className="link-underline py-1">
            {t.nav.gallery}
          </a>
          <Link href="/comunidad" className="link-underline py-1">
            {t.nav.community}
          </Link>
          <a href="#about" aria-current={activeSection === 'about' ? 'true' : undefined} className="link-underline py-1">
            {t.nav.about}
          </a>
          <button onClick={onOpenQr} aria-label={t.footer.qrLabel} className="link-underline py-1 font-semibold">
            {t.footer.qrLabel}
          </button>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:block">
            <LangToggle lang={lang} onChange={onLangChange} />
          </div>
          <ThemeToggle />
          <a
            href="https://instagram.com/iantadventurer"
            target="_blank"
            rel="noopener noreferrer"
            className="lift sketch hidden sm:inline-flex items-center gap-1 px-3.5 py-1 text-sm font-semibold bg-[var(--color-surface)] text-[var(--color-text)]"
          >
            {t.nav.cta} ↗
          </a>
          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-expanded={mobileMenuOpen}
            aria-label={t.nav.menu}
            className="md:hidden w-10 h-10 flex items-center justify-center sketch text-[var(--color-text)]"
          >
            <div className="flex flex-col gap-1.5 items-center">
              <span className={`h-px w-5 bg-current transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-[3.5px]' : ''}`} />
              <span className={`h-px w-5 bg-current transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-[3.5px]' : ''}`} />
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
            <div className="px-4 sm:px-6 py-3 flex flex-col">
              <a href="#gallery" onClick={(e) => { e.preventDefault(); scrollToSection('gallery'); }} className="block py-3 border-b-[1.5px] border-[var(--color-border)] font-display text-2xl font-extrabold text-[var(--color-text)] hover:opacity-60">{t.nav.gallery}</a>
              <Link href="/comunidad" onClick={() => setMobileMenuOpen(false)} className="block py-3 border-b-[1.5px] border-[var(--color-border)] font-display text-2xl font-extrabold text-[var(--color-text)] hover:opacity-60">{t.nav.community}</Link>
              <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }} className="block py-3 border-b-[1.5px] border-[var(--color-border)] font-display text-2xl font-extrabold text-[var(--color-text)] hover:opacity-60">{t.nav.about}</a>
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenQr(); }}
                aria-label={t.footer.qrLabel}
                className="block w-full text-left py-3 border-b-[1.5px] border-[var(--color-border)] font-display text-2xl font-extrabold text-[var(--color-text)] hover:opacity-60"
              >
                {t.footer.qrLabel}
              </button>
              <div className="mt-3 w-fit">
                <LangToggle lang={lang} onChange={onLangChange} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
