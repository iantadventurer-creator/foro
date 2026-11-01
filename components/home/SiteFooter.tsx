import Link from 'next/link';
import { BrandMark } from '@/components/ui/BrandMark';
import type { HomeContent } from '@/lib/content/homeContent';

const linkClass = 'link-underline text-[var(--color-on-dark-muted)] hover:text-[var(--color-on-dark)] w-fit block py-1';
const titleClass = 'label-caps text-[var(--color-on-dark)] block mb-3';

/** Pie de página: una banda grafito discreta con los enlaces y la firma. */
export function SiteFooter({ t, onOpenQr }: { t: HomeContent; onOpenQr: () => void }) {
  return (
    <footer className="mt-auto bg-[var(--color-dark)] text-[var(--color-on-dark)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-10 text-sm">
        <div className="col-span-2">
          <span className="flex items-center gap-3 mb-3">
            <BrandMark className="w-8 h-8 rounded-lg" />
            <span className="font-display text-lg font-bold tracking-[-0.02em]">IanTBuild</span>
          </span>
          <p className="max-w-xs text-[var(--color-on-dark-muted)] leading-relaxed">{t.footer.tagline}</p>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 border-t border-white/10 text-xs text-[var(--color-on-dark-muted)]">
        {t.disclaimer}
      </div>
    </footer>
  );
}
