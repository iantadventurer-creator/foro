import Link from 'next/link';
import type { HomeContent } from '@/lib/content/homeContent';

const linkClass = 'link-underline text-[var(--color-text)] w-fit block py-1';
const titleClass = 'label-caps text-[var(--color-text-faint)] block mb-3';

/** Pie de página: columnas de datos entre filetes, como la contraportada
 * de un manual LEGO, y una firma grande. */
export function SiteFooter({ t, onOpenQr }: { t: HomeContent; onOpenQr: () => void }) {
  return (
    <footer className="mt-auto max-w-[1440px] w-full mx-auto px-4 sm:px-6 pb-8">
      <div className="plate" aria-hidden="true" />
      <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div className="col-span-2">
          <span className={titleClass}>IanTBuild</span>
          <p className="max-w-xs text-[var(--color-text-muted)] leading-relaxed">{t.footer.tagline}</p>
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
      <p aria-hidden="true" className="mt-12 font-display font-semibold leading-[0.8] tracking-[-0.06em] text-[clamp(3.5rem,15vw,13rem)] text-[var(--color-text)] select-none">
        IanTBuild
      </p>
      <div className="mt-6 border-t border-[var(--color-border)] pt-4 label-caps text-[var(--color-text-faint)] normal-case tracking-normal">
        {t.disclaimer}
      </div>
    </footer>
  );
}
