'use client';

import Link from 'next/link';
import { CommunityHeaderNav } from '@/components/community/CommunityHeaderNav';
import { CommunityLogoutButton } from '@/components/community/CommunityLogoutButton';
import { DoodleBrick } from '@/components/ui/Doodles';
import { LangToggle } from '@/components/ui/LangToggle';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { communityNav } from '@/lib/content/nav';
import type { Lang } from '@/lib/lang';

/** Cabecera común de las páginas de la comunidad (feed, perfil, actividad),
 * con el mismo aspecto de juguete que la portada: marca y "volver" a la
 * izquierda, navegación en el centro (desde tablet) y ajustes a la derecha.
 * Las etiquetas salen del idioma, así que las páginas solo indican a dónde
 * se vuelve. */
export function CommunityHeader({
    back,
    lang,
    onLangChange,
    onLogout,
    onPublish,
}: {
    /** Destino del enlace "volver": la portada o el feed de la comunidad. */
    back: 'home' | 'community';
    lang: Lang;
    onLangChange: (lang: Lang) => void;
    onLogout?: () => void;
    /** Si se indica, "Publicar" abre el formulario directamente en vez de navegar. */
    onPublish?: () => void;
}) {
    const nav = communityNav[lang];

    return (
        <header className="sticky top-0 z-40 bg-[var(--color-ink)]/95 backdrop-blur-sm border-b border-[var(--color-border)] px-4 sm:px-6 h-16 flex items-center">
            <div className="w-full max-w-7xl mx-auto flex md:grid md:grid-cols-3 items-center justify-between gap-3">
                <div className="justify-self-start flex items-center gap-3 min-w-0">
                    <Link href="/" aria-label="IanTBuild" className="group shrink-0">
                        <DoodleBrick className="w-10 h-auto text-[var(--color-accent)] transition-transform group-hover:-rotate-6" />
                    </Link>
                    <Link
                        href={back === 'home' ? '/' : '/comunidad'}
                        className="link-underline py-1 text-xs sm:text-sm font-semibold text-[var(--color-text)] truncate"
                    >
                        {back === 'home' ? nav.backToHome : nav.backToCommunity}
                    </Link>
                </div>
                <div className="justify-self-center">
                    <CommunityHeaderNav nav={nav} onPublish={onPublish} />
                </div>
                <div className="justify-self-end flex items-center gap-2 sm:gap-3">
                    <CommunityLogoutButton label={nav.logout} onLogout={onLogout} />
                    <ThemeToggle />
                    <LangToggle lang={lang} onChange={onLangChange} />
                </div>
            </div>
        </header>
    );
}
