import Link from 'next/link';
import { BrandMark } from '@/components/ui/BrandMark';
import type { HomeContent } from '@/lib/content/homeContent';

const linkClass = 'link-underline text-[var(--color-on-dark)] font-semibold w-fit block py-1';
const titleClass = 'sticker bg-[var(--color-highlight)] text-[#13204a] mb-4';

/** Pie de página: un gran bloque marino con la marca a todo el ancho. */
export function SiteFooter({ t, onOpenQr }: { t: HomeContent; onOpenQr: () => void }) {
  return (
    <footer className="mt-auto px-3 sm:px-4 pb-3 sm:pb-4">
      <div className="toy overflow-hidden rounded-[2.5rem] bg-[var(--color-dark)] text-[var(--color-on-dark)] [--color-border:#13204a] [--toy-shadow:#13204a]">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 pt-12 grid grid-cols-2 md:grid-cols-4 gap-10 text-sm">
          <div className="col-span-2">
            <span className="flex items-center gap-3 mb-4">
              <BrandMark className="w-10 h-10 rounded-xl border-2 border-[#13204a]" />
              <span className="font-display text-lg font-extrabold">@iantadventurer</span>
            </span>
            <p className="max-w-xs font-display text-xl font-bold leading-snug">{t.footer.tagline}</p>
          </div>
          <nav aria-label={t.footer.linksTitle}>
            <span className={titleClass}>{t.footer.linksTitle}</span>
            <a href="#gallery" className={linkClass}>{t.nav.gallery}</a>
            <Link href="/comunidad" className={linkClass}>{t.nav.community}</Link>
            <a href="#about" className={linkClass}>{t.nav.about}</a>
          </nav>
          <div>
            <span className={`${titleClass} rotate-[3deg]`}>{t.footer.followTitle}</span>
            <a href="https://instagram.com/iantadventurer" target="_blank" rel="noopener noreferrer" className={linkClass}>
              Instagram ↗
            </a>
            <button onClick={onOpenQr} aria-label={t.footer.qrLabel} className={`${linkClass} text-left`}>
              {t.footer.qrLabel}
            </button>
          </div>
        </div>

        <p
          className="max-w-7xl mx-auto px-6 sm:px-10 mt-10 font-display font-extrabold leading-[0.8] tracking-[-0.04em] text-[clamp(3.2rem,15vw,12.5rem)] whitespace-nowrap select-none text-[var(--color-accent-3)] [text-shadow:5px_5px_0_rgba(0,0,0,0.35)]"
          aria-hidden="true"
        >
          IanTBuild
        </p>

        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-5 mt-6 border-t-2 border-white/25 text-xs text-[var(--color-on-dark-muted)]">
          {t.disclaimer}
        </div>
      </div>
    </footer>
  );
}
