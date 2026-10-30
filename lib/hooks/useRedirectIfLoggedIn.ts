import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

/** En las pantallas de acceso (entrar / registrarse): quien ya tiene sesión
 * iniciada no necesita verlas y vuelve a la comunidad. */
export function useRedirectIfLoggedIn(to = '/comunidad') {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace(to);
    });
  }, [router, to]);
}
