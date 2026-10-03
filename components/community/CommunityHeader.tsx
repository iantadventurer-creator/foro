'use client';

import Link from 'next/link';
import { CommunityHeaderNav } from '@/components/community/CommunityHeaderNav';
import { CommunityLogoutButton } from '@/components/community/CommunityLogoutButton';
import { LangToggle } from '@/components/community/LangToggle';

/** Cabecera común de las páginas de la comunidad (feed, perfil, actividad):
 * en móvil, "volver" a la izquierda e idioma a la derecha; desde tablet, el
 * trío de navegación centrado. Un solo lugar en vez de tres copias. */
export function CommunityHeader({
    backHref,
    backLabel,
    lang,
    onLangChange,
    activityLabel,
    publishLabel,
    profileLabel,
    logoutLabel,
    onLogout,
    onPublish,
}: {
    backHref: string;
    backLabel: string;
    lang: 'es' | 'en';
    onLangChange: (lang: 'es' | 'en') => void;
    activityLabel: string;
    publishLabel: string;
    profileLabel: string;
    logoutLabel: string;
    onLogout?: () => void;
    onPublish?: () => void;
}) {
    return (
        <header className="sticky top-0 z-40 bg-[var(--color-ink)]/85 backdrop-blur-md border-b border-[var(--color-border)] px-6 py-4">
            <div className="max-w-6xl mx-auto flex md:grid md:grid-cols-3 items-center justify-between">
                <Link href={backHref} className="justify-self-start inline-block py-2 text-xs font-semibold uppercase text-[var(--color-accent-text)] tracking-wider hover:underline">
                    {backLabel}
                </Link>
                <div className="justify-self-center">
                    <CommunityHeaderNav activityLabel={activityLabel} publishLabel={publishLabel} profileLabel={profileLabel} onPublish={onPublish} />
                </div>
                <div className="justify-self-end flex items-center gap-3">
                    <CommunityLogoutButton label={logoutLabel} onLogout={onLogout} />
                    <LangToggle lang={lang} onChange={onLangChange} />
                </div>
            </div>
        </header>
    );
}
