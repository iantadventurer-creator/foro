'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

/** Links de "Actividad" / "Mi perfil" para el header — se repiten en el
 * feed, el perfil y la actividad, así que viven en un solo lugar. */
export function CommunityHeaderNav({ activityLabel = 'Actividad', profileLabel = 'Mi perfil' }: { activityLabel?: string; profileLabel?: string }) {
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
        <nav className="flex items-center gap-5 text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
            <Link href="/comunidad/actividad" className="hover:text-[var(--color-text)] transition-colors">
                {activityLabel}
            </Link>
            {userId && (
                <Link href={`/comunidad/u/${userId}`} className="hover:text-[var(--color-text)] transition-colors">
                    {profileLabel}
                </Link>
            )}
        </nav>
    );
}
