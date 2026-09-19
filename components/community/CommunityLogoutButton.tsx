'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

/** Botón "Cerrar sesión" del header — mismo componente en las tres páginas
 * de la comunidad para que se vea igual en todas. Separado de
 * CommunityHeaderNav para poder ubicarlo aparte (a la derecha) mientras
 * Actividad/Publicar quedan centrados. `onLogout` es opcional, para páginas
 * que necesitan limpiar algo más (p. ej. un filtro) además de cerrar
 * sesión. */
export function CommunityLogoutButton({
    label = 'Cerrar sesión',
    onLogout,
}: {
    label?: string;
    onLogout?: () => void;
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

    if (!userId) return null;

    const handleClick = async () => {
        await supabase.auth.signOut();
        onLogout?.();
    };

    return (
        <button
            onClick={handleClick}
            className="hidden md:inline text-[10px] font-bold uppercase tracking-wider text-[var(--color-accent-2)] bg-[var(--color-accent-2)]/10 hover:bg-[var(--color-accent-2)]/20 border border-[var(--color-accent-2)]/30 rounded-full px-3 py-1.5 transition-colors"
        >
            {label}
        </button>
    );
}
