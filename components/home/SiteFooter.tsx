import Link from 'next/link';
import type { HomeContent } from '@/lib/homeContent';

export function SiteFooter({ t, onOpenQr }: { t: HomeContent; onOpenQr: () => void }) {
  return (
    <footer className="border-t border-[var(--color-border)] py-14 px-6 relative z-10 mt-6">
      <div className="max-w-7xl mx-auto grid sm:grid-cols-3 gap-10 text-sm">
        <div>
          <span className="font-display font-semibold text-[var(--color-text)] block mb-2">@iantadventurer</span>
          <p className="text-[var(--color-text-muted)] max-w-xs leading-relaxed">{t.footer.tagline}</p>
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-faint)] block mb-3">{t.footer.linksTitle}</span>
          <div className="flex flex-col gap-1 text-[var(--color-text-muted)]">
            <a href="#gallery" className="hover:text-[var(--color-text)] w-fit block py-1">{t.nav.gallery}</a>
            <Link href="/comunidad" className="hover:text-[var(--color-text)] w-fit block py-1">{t.nav.community}</Link>
            <a href="#about" className="hover:text-[var(--color-text)] w-fit block py-1">{t.nav.about}</a>
          </div>
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-faint)] block mb-3">{t.footer.followTitle}</span>
          <div className="flex flex-col gap-1">
            <a href="https://instagram.com/iantadventurer" target="_blank" rel="noopener noreferrer" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] w-fit block py-1">Instagram ↗</a>
            <button onClick={onOpenQr} aria-label={t.footer.qrLabel} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] w-fit text-left py-1">
              {t.footer.qrLabel}
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-[var(--color-border)] text-xs text-[var(--color-text-faint)]">
        {t.disclaimer}
      </div>
    </footer>
  );
}
