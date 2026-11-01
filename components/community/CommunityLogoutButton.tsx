'use client';

import { supabase } from '@/lib/supabaseClient';
import { useSessionUserId } from '@/lib/hooks/useSessionUserId';

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
    const userId = useSessionUserId();

    if (!userId) return null;

    const handleClick = async () => {
        await supabase.auth.signOut();
        onLogout?.();
    };

    return (
        <button
            onClick={handleClick}
            className="link-underline hidden md:inline py-2 text-xs font-extrabold text-[var(--color-text-muted)] hover:text-[var(--color-danger-text)]"
        >
            {label}
        </button>
    );
}
