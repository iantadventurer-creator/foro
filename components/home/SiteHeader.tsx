'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { BrandMark } from '@/components/ui/BrandMark';
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
    <header className="sticky top-0 z-40 bg-[var(--color-ink)]/90 backdrop-blur-md border-b-[3px] border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto flex justify-between items-center gap-4 px-4 sm:px-6 py-3">
        <a href="#top" className="group flex items-center gap-2.5">
          <BrandMark className="w-9 h-9 rounded-xl border-2 border-[var(--color-border)] group-hover:rotate-[-8deg] transition-transform" />
          <span className="font-display font-extrabold text-xl tracking-[-0.02em] text-[var(--color-text)]">IanTBuild</span>
        </a>

        <nav className="hidden md:flex items-center gap-6 text-sm font-extrabold text-[var(--color-text)]">
          <a href="#gallery" aria-current={activeSection === 'gallery' ? 'true' : undefined} className="link-underline py-1">
            {t.nav.gallery}
          </a>
          <Link href="/comunidad" className="link-underline py-1">
            {t.nav.community}
          </Link>
          <a href="#about" aria-current={activeSection === 'about' ? 'true' : undefined} className="link-underline py-1">
            {t.nav.about}
          </a>
          <button onClick={onOpenQr} aria-label={t.footer.qrLabel} className="link-underline py-1 font-extrabold">
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
            className="toy-sm toy-press font-button hidden sm:inline-flex items-center gap-1 rounded-full bg-[var(--color-accent)] text-[var(--color-accent-ink)] px-4 py-2 text-xs font-extrabold uppercase"
          >
            {t.nav.cta} ↗
          </a>
          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-expanded={mobileMenuOpen}
            aria-label={t.nav.menu}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-full border-2 border-[var(--color-border)] bg-[var(--color-highlight)] text-[var(--color-highlight-ink)]"
          >
            <div className="flex flex-col gap-1.5 items-center">
              <span className={`h-0.5 w-5 rounded-full bg-current transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-1' : ''}`} />
              <span className={`h-0.5 w-5 rounded-full bg-current transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-1' : ''}`} />
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
            className="md:hidden overflow-hidden border-t-2 border-[var(--color-border)]"
          >
            <div className="px-4 sm:px-6 py-3 flex flex-col">
              <a href="#gallery" onClick={(e) => { e.preventDefault(); scrollToSection('gallery'); }} className="block py-3 font-display text-3xl font-extrabold text-[var(--color-text)] hover:text-[var(--color-accent-text)]">{t.nav.gallery}</a>
              <Link href="/comunidad" onClick={() => setMobileMenuOpen(false)} className="block py-3 font-display text-3xl font-extrabold text-[var(--color-text)] hover:text-[var(--color-accent-text)]">{t.nav.community}</Link>
              <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }} className="block py-3 font-display text-3xl font-extrabold text-[var(--color-text)] hover:text-[var(--color-accent-text)]">{t.nav.about}</a>
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenQr(); }}
                aria-label={t.footer.qrLabel}
                className="block w-full text-left py-3 font-display text-3xl font-extrabold text-[var(--color-text)] hover:text-[var(--color-accent-text)]"
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
