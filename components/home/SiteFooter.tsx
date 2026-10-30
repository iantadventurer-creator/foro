import Link from 'next/link';
import { BrandMark } from '@/components/ui/BrandMark';
import type { HomeContent } from '@/lib/content/homeContent';

const linkClass = 'text-[var(--color-on-dark-muted)] hover:text-[var(--color-on-dark)] w-fit block py-1 transition-colors';
const titleClass = 'text-xs font-bold uppercase tracking-widest text-[var(--color-lego-yellow)] block mb-3';

/** Pie de página: banda oscura de la marca con una franja de piezas arriba. */
export function SiteFooter({ t, onOpenQr }: { t: HomeContent; onOpenQr: () => void }) {
  return (
    <footer className="relative z-10 mt-10 bg-[var(--color-dark)] text-[var(--color-on-dark)]">
      {/* Franja de colores LEGO a modo de borde superior */}
      <div className="flex h-1.5" aria-hidden="true">
        <span className="flex-[3] bg-[var(--color-accent)]" />
        <span className="flex-[2] bg-[var(--color-lego-yellow)]" />
        <span className="flex-1 bg-[var(--color-accent-3)]" />
        <span className="flex-1 bg-[var(--color-accent-4)]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-14 grid sm:grid-cols-3 gap-10 text-sm">
        <div>
          <span className="flex items-center gap-3 mb-3">
            <BrandMark className="w-8 h-8 rounded-md lego-bevel" />
            <span className="font-display font-semibold text-base">@iantadventurer</span>
          </span>
          <p className="text-[var(--color-on-dark-muted)] max-w-xs leading-relaxed">{t.footer.tagline}</p>
        </div>
        <nav aria-label={t.footer.linksTitle}>
          <span className={titleClass}>{t.footer.linksTitle}</span>
          <a href="#gallery" className={linkClass}>{t.nav.gallery}</a>
          <Link href="/comunidad" className={linkClass}>{t.nav.community}</Link>
          <a href="#about" className={linkClass}>{t.nav.about}</a>
        </nav>
        <div>
          <span className={titleClass}>{t.footer.followTitle}</span>
          <a href="https://instagram.com/iantadventurer" target="_blank" rel="noopener noreferrer" className={linkClass}>
            Instagram ↗
          </a>
          <button onClick={onOpenQr} aria-label={t.footer.qrLabel} className={`${linkClass} text-left`}>
            {t.footer.qrLabel}
          </button>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 py-6 border-t border-white/10 text-xs text-[var(--color-on-dark-muted)]">
        {t.disclaimer}
      </div>
    </footer>
  );
}
