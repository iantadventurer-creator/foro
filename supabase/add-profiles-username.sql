-- ============================================================================
-- Nombre de usuario único y nombre completo, como en Instagram.
--
-- - Añade `username` (único, sin distinguir mayúsculas) y `full_name` a profiles.
-- - Un trigger crea la fila de profiles automáticamente cuando alguien se
--   registra, copiando los datos que la web envía al crear la cuenta.
-- - `username_available(uname)` deja comprobar si un usuario está libre
--   mientras se escribe (devuelve solo true/false, no expone datos de nadie).
--
-- CÓMO APLICARLO: Supabase → SQL Editor → New query → pega esto → Run.
-- Es seguro ejecutarlo más de una vez. La web sigue funcionando sin este
-- script (solo que sin la comprobación de usuario libre ni la tabla).
-- ============================================================================

alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists full_name text;

create unique index if not exists profiles_username_lower_key
  on public.profiles (lower(username))
  where username is not null;

create or replace function public.username_available(uname text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select not exists (
    select 1 from public.profiles where lower(username) = lower(uname)
  );
$$;

grant execute on function public.username_available(text) to anon, authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_username text := nullif(lower(trim(new.raw_user_meta_data ->> 'username')), '');
  meta_full_name text := nullif(trim(new.raw_user_meta_data ->> 'full_name'), '');
begin
  begin
    insert into public.profiles (user_id, username, full_name)
    values (new.id, meta_username, meta_full_name)
    on conflict (user_id) do nothing;
  exception when unique_violation then
    -- Alguien tomó ese usuario justo antes: el perfil se crea sin usuario.
    insert into public.profiles (user_id, full_name)
    values (new.id, meta_full_name)
    on conflict (user_id) do nothing;
  end;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
