'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

/** Barra inferior fija, visible en todas las páginas de /comunidad — el
 * mismo tipo de navegación de app (Feed / Perfil / Actividad) que tienen
 * plataformas como Bricktiv. Solo en móvil (md:hidden); en escritorio hay
 * espacio de sobra para navegar desde el contenido mismo. */
export function CommunityBottomNav() {
  const pathname = usePathname();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const leftItems: { href: string; label: string; icon: string; match: (p: string) => boolean }[] = [
    { href: '/comunidad', label: 'Feed', icon: '⌂', match: (p) => p === '/comunidad' },
    { href: userId ? `/comunidad/u/${userId}` : '/comunidad', label: 'Perfil', icon: '◔', match: (p) => p.startsWith('/comunidad/u/') },
  ];
  const rightItems: { href: string; label: string; icon: string; match: (p: string) => boolean }[] = [
    { href: '/comunidad/actividad', label: 'Actividad', icon: '♥', match: (p) => p.startsWith('/comunidad/actividad') },
  ];

  function renderItem(item: (typeof leftItems)[number]) {
    const active = item.match(pathname);
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`flex flex-col items-center gap-0.5 py-2.5 px-4 text-[10px] font-bold uppercase tracking-wide transition-colors ${active ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'
          }`}
      >
        <span className="text-lg leading-none" aria-hidden="true">{item.icon}</span>
        {item.label}
      </Link>
    );
  }

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-[var(--color-ink)]/95 backdrop-blur-md border-t border-[var(--color-border)] pb-[env(safe-area-inset-bottom)]"
      aria-label="Navegación de la comunidad"
    >
      <div className="flex items-center justify-around">
        {leftItems.map(renderItem)}
        <Link
          href="/comunidad?publish=1"
          aria-label="Publicar"
          className="flex items-center justify-center w-12 h-12 -mt-4 rounded-full bg-[var(--color-accent-3)] text-white text-2xl leading-none shadow-[0_4px_0_0_var(--shadow-accent-3)] border-4 border-[var(--color-ink)]"
        >
          +
        </Link>
        {rightItems.map(renderItem)}
      </div>
    </nav>
  );
}
