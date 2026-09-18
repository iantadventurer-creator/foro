-- ============================================================================
-- Tabla de perfiles: por ahora solo guarda la foto de avatar de cada usuario
-- (el handle y demás datos ya se "prestan" de sus publicaciones, como hasta
-- ahora). Lectura pública para poder mostrar el avatar en cualquier perfil;
-- solo el propio usuario puede crear/editar el suyo.
--
-- CÓMO APLICARLO: Supabase → SQL Editor → New query → pega esto → Run.
-- No hace falta tocar el bucket "foro-fotos": sus políticas ya permiten subir
-- a cualquier ruta dentro del bucket a usuarios autenticados, así que las
-- fotos de avatar se guardan ahí mismo, bajo el prefijo "avatars/".
-- ============================================================================

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  avatar_url text,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all"
  on public.profiles for select
  using (true);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = user_id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
