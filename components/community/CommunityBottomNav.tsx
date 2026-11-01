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
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinejoin="round" aria-hidden="true">
      <path d="M4 10.5 12 4l8 6.5V20h-5v-6H9v6H4z" />
    </svg>
  ),
  profile: (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20c1.2-3.5 4.2-5 7.5-5s6.3 1.5 7.5 5" />
    </svg>
  ),
  activity: <HeartIcon className="w-5 h-5" />,
};

/** Barra inferior fija, visible en todas las páginas de /comunidad — la
 * navegación de app (Feed / Perfil / Actividad) con el botón de publicar en
 * medio, como una pieza cobalto. Solo en móvil (md:hidden); en escritorio
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
      className={`flex flex-col items-center gap-0.5 my-1.5 py-1.5 px-3 rounded-2xl label-caps text-[10px] transition-colors ${active ? 'bg-[var(--color-highlight)] text-[var(--color-highlight-ink)]' : 'text-[var(--color-text-muted)]'}`}
    >
      {icon}
      {label}
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
          className="panel-sm lift border-transparent flex items-center justify-center w-12 h-12 -mt-6 rounded-2xl bg-[var(--color-accent)] text-white text-3xl font-bold leading-none"
        >
          +
        </Link>
        {item('/comunidad/actividad', nav.activity, icons.activity, pathname.startsWith('/comunidad/actividad'))}
      </div>
    </nav>
  );
}
