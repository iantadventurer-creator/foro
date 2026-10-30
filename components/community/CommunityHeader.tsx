'use client';

import Link from 'next/link';
import { CommunityHeaderNav } from '@/components/community/CommunityHeaderNav';
import { CommunityLogoutButton } from '@/components/community/CommunityLogoutButton';
import { LangToggle } from '@/components/ui/LangToggle';
import { communityNav } from '@/lib/content/nav';
import type { Lang } from '@/lib/lang';

/** Cabecera común de las páginas de la comunidad (feed, perfil, actividad):
 * en móvil, "volver" a la izquierda e idioma a la derecha; desde tablet, el
 * trío de navegación centrado. Las etiquetas salen del idioma, así que las
 * páginas solo indican a dónde se vuelve. */
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
        <header className="sticky top-0 z-40 bg-[var(--color-ink)]/85 backdrop-blur-md border-b border-[var(--color-border)] px-6 py-4">
            <div className="max-w-6xl mx-auto flex md:grid md:grid-cols-3 items-center justify-between">
                <Link
                    href={back === 'home' ? '/' : '/comunidad'}
                    className="justify-self-start inline-block py-2 text-xs font-semibold uppercase text-[var(--color-accent-text)] tracking-wider hover:underline"
                >
                    {back === 'home' ? nav.backToHome : nav.backToCommunity}
                </Link>
                <div className="justify-self-center">
                    <CommunityHeaderNav nav={nav} onPublish={onPublish} />
                </div>
                <div className="justify-self-end flex items-center gap-3">
                    <CommunityLogoutButton label={nav.logout} onLogout={onLogout} />
                    <LangToggle lang={lang} onChange={onLangChange} />
                </div>
            </div>
        </header>
    );
}
