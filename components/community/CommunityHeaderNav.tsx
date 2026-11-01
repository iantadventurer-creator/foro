'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSessionUserId } from '@/lib/hooks/useSessionUserId';
import type { CommunityNav } from '@/lib/content/nav';

const linkClass = 'link-underline py-1';
const publishClass =
    'panel-sm lift border-transparent font-button inline-block rounded-full bg-[var(--color-accent-3)] text-[var(--color-accent-3-ink)] px-4 py-2 text-xs font-bold uppercase';

/** Links de "Actividad" / "Publicar" / "Mi perfil" para el header — mismo
 * trío y mismo espaciado en las tres páginas de la comunidad. "Publicar"
 * abre el modal directamente si la página se lo pide (`onPublish`) o, si no,
 * navega al feed con ?publish=1, que abre el modal por sí solo. */
export function CommunityHeaderNav({ nav, onPublish }: { nav: CommunityNav; onPublish?: () => void }) {
    const userId = useSessionUserId();
    const pathname = usePathname();

    return (
        <nav aria-label="Comunidad" className="hidden md:flex items-center gap-6 text-sm font-bold text-[var(--color-text)]">
            <Link href="/comunidad/actividad" aria-current={pathname.startsWith('/comunidad/actividad') ? 'page' : undefined} className={linkClass}>
                {nav.activity}
            </Link>
            {userId &&
                (onPublish ? (
                    <button type="button" onClick={onPublish} className={publishClass}>
                        + {nav.publish}
                    </button>
                ) : (
                    <Link href="/comunidad?publish=1" className={publishClass}>
                        + {nav.publish}
                    </Link>
                ))}
            {userId && (
                <Link href={`/comunidad/u/${userId}`} aria-current={pathname === `/comunidad/u/${userId}` ? 'page' : undefined} className={linkClass}>
                    {nav.profile}
                </Link>
            )}
        </nav>
    );
}
