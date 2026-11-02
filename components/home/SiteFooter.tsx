import Link from 'next/link';
import { DoodleBrick, DoodleMinifig } from '@/components/ui/Doodles';
import type { HomeContent } from '@/lib/content/homeContent';

const linkClass = 'link-underline text-[var(--color-text)] w-fit block py-1';
const titleClass = 'hand text-xl text-[var(--color-accent-text)] block mb-2';

/** Pie de página: la contraportada del cuaderno, con los enlaces, la firma
 * escrita a mano en grande y un par de garabatos. */
export function SiteFooter({ t, onOpenQr }: { t: HomeContent; onOpenQr: () => void }) {
  return (
    <footer className="mt-auto max-w-[1320px] w-full mx-auto px-4 sm:px-6 pb-8">
      <div className="squiggle text-[var(--color-border)]" aria-hidden="true" />
      <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
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
      <div aria-hidden="true" className="mt-10 flex items-end gap-4 select-none">
        <p className="font-display font-extrabold leading-[0.9] text-[clamp(3rem,11vw,9rem)] text-[var(--color-text)]">IanTBuild</p>
        <DoodleMinifig className="hidden sm:block w-[clamp(3rem,6vw,5rem)] mb-3 rotate-6 text-[var(--color-line)]" />
        <DoodleBrick className="hidden md:block w-[clamp(4rem,8vw,7rem)] mb-4 -rotate-3 text-[var(--color-text-faint)]" />
      </div>
      <div className="mt-6 pt-4 border-t-[1.5px] border-[var(--color-border)] text-xs leading-relaxed text-[var(--color-text-faint)]">
        {t.disclaimer}
      </div>
    </footer>
  );
}
