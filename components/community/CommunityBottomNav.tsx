'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { HeartIcon } from '@/components/ui/HeartIcon';
import { communityNav } from '@/lib/content/nav';
import { useLang } from '@/lib/hooks/useLang';
import { useSessionUserId } from '@/lib/hooks/useSessionUserId';

const icons = {
  feed: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" aria-hidden="true">
      <path d="M4 10.5 12 4l8 6.5V20h-5v-6H9v6H4z" />
    </svg>
  ),
  profile: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20c1.2-3.5 4.2-5 7.5-5s6.3 1.5 7.5 5" />
    </svg>
  ),
  activity: <HeartIcon className="w-5 h-5" />,
};

/** Barra inferior fija, visible en todas las páginas de /comunidad — la
 * navegación de app (Feed / Perfil / Actividad) con el botón de publicar en
 * medio, como una pieza amarilla. Solo en móvil (md:hidden); en escritorio
 * la navegación está en la cabecera. Sigue el idioma elegido en la web. */
export function CommunityBottomNav() {
  const pathname = usePathname();
  const userId = useSessionUserId();
  const [lang] = useLang();
  const nav = communityNav[lang];

  const item = (href: string, label: string, icon: ReactNode, active: boolean) => (
    <Link
      key={label}
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`relative flex flex-col items-center gap-1 py-2.5 px-4 text-[10px] font-bold uppercase tracking-wide transition-colors ${active ? 'text-[var(--color-lego-yellow)]' : 'text-[var(--color-text-muted)]'
        }`}
    >
      {icon}
      {label}
      {active && <span className="absolute top-0 w-6 h-1 rounded-b bg-[var(--color-lego-yellow)]" aria-hidden="true" />}
    </Link>
  );

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-[var(--color-ink)]/95 backdrop-blur-md border-t border-[var(--color-border)] pb-[env(safe-area-inset-bottom)]"
      aria-label={nav.navLabel}
    >
      <div className="flex items-center justify-around">
        {item('/comunidad', nav.feed, icons.feed, pathname === '/comunidad')}
        {item(userId ? `/comunidad/u/${userId}` : '/comunidad/entrar', nav.profileShort, icons.profile, pathname.startsWith('/comunidad/u/'))}
        <Link
          href={userId ? '/comunidad?publish=1' : '/comunidad/entrar'}
          aria-label={nav.publish}
          className="lego-studs lego-bevel [--stud-color:var(--color-lego-yellow)] [--bevel-glow:rgba(246,201,14,0.45)] flex items-center justify-center w-12 h-11 -mt-5 rounded-lg bg-[var(--color-lego-yellow)] text-[var(--color-lego-yellow-ink)] text-2xl font-bold leading-none"
        >
          +
        </Link>
        {item('/comunidad/actividad', nav.activity, icons.activity, pathname.startsWith('/comunidad/actividad'))}
      </div>
    </nav>
  );
}
