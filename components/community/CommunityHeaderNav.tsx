'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSessionUserId } from '@/lib/useSessionUserId';

const publishClass =
    'font-button uppercase tracking-wider bg-[var(--color-accent-3)] text-white text-xs px-5 py-2 rounded-full shadow-[0_8px_24px_-8px_var(--shadow-accent-3)] hover:brightness-110 transition-[filter] inline-block';

/** Links de "Actividad" / "Publicar" / "Mi perfil" para el header — mismo
 * trío y mismo espaciado en las tres páginas de la comunidad. "Publicar"
 * abre el modal directamente si la página se lo pide (`onPublish`) o, si no,
 * navega al feed con ?publish=1, que abre el modal por sí solo. */
export function CommunityHeaderNav({
    activityLabel = 'Actividad',
    publishLabel = 'Publicar',
    profileLabel = 'Mi perfil',
    onPublish,
}: {
    activityLabel?: string;
    publishLabel?: string;
    profileLabel?: string;
    onPublish?: () => void;
}) {
    const userId = useSessionUserId();

    return (
        <nav aria-label="Comunidad" className="hidden md:flex items-center gap-5 text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
            <Link href="/comunidad/actividad" className="inline-block py-2 hover:text-[var(--color-text)] transition-colors">
                {activityLabel}
            </Link>
            {userId && (
                <motion.div whileHover={{ y: -2 }} whileTap={{ y: 2 }}>
                    {onPublish ? (
                        <button type="button" onClick={onPublish} className={publishClass}>
                            {publishLabel}
                        </button>
                    ) : (
                        <Link href="/comunidad?publish=1" className={publishClass}>
                            {publishLabel}
                        </Link>
                    )}
                </motion.div>
            )}
            {userId && (
                <Link href={`/comunidad/u/${userId}`} className="inline-block py-2 hover:text-[var(--color-text)] transition-colors">
                    {profileLabel}
                </Link>
            )}
        </nav>
    );
}
