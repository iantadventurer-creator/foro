import { supabase } from '@/lib/supabaseClient';

export type ProfileInfo = { avatar_url: string | null; username: string | null; full_name: string | null };

/** Perfil público de un usuario. Si la base de datos todavía no tiene las
 * columnas `username`/`full_name` (script supabase/add-profiles-username.sql
 * sin aplicar), cae a pedir solo el avatar para no perderlo. */
export async function fetchProfileInfo(userId: string): Promise<ProfileInfo | null> {
  const full = await supabase.from('profiles').select('avatar_url, username, full_name').eq('user_id', userId).maybeSingle();
  if (!full.error) return full.data;
  const basic = await supabase.from('profiles').select('avatar_url').eq('user_id', userId).maybeSingle();
  return basic.data ? { avatar_url: basic.data.avatar_url, username: null, full_name: null } : null;
}
