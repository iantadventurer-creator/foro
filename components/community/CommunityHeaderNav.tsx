'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';

/** Links de "Actividad" / "Publicar" para el header — se repiten en el feed,
 * el perfil y la actividad, así que viven en un solo lugar. "Publicar"
 * navega al feed con ?publish=1, que ya sabe abrir el modal de subida solo
 * con ese parámetro en la URL. Separado de "Cerrar sesión" (ver
 * CommunityLogoutButton) para poder centrar este par sin arrastrarlo. */
export function CommunityHeaderNav({
    activityLabel = 'Actividad',
    publishLabel = 'Publicar',
}: {
    activityLabel?: string;
    publishLabel?: string;
}) {
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

    return (
        <nav className="hidden md:flex items-center gap-5 text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
            <Link href="/comunidad/actividad" className="hover:text-[var(--color-text)] transition-colors">
                {activityLabel}
            </Link>
            {userId && (
                <motion.div whileHover={{ y: -2 }} whileTap={{ y: 2 }}>
                    <Link
                        href="/comunidad?publish=1"
                        className="font-button uppercase tracking-wider bg-[var(--color-accent-3)] text-white text-xs px-5 py-2 rounded-full shadow-[0_4px_0_0_var(--shadow-accent-3)] hover:brightness-110 transition-[filter] inline-block"
                    >
                        {publishLabel}
                    </Link>
                </motion.div>
            )}
        </nav>
    );
}
