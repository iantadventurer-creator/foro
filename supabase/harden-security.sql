-- ============================================================================
-- Endurecimiento de seguridad e integridad de datos.
--
-- Qué hace (todo es seguro de ejecutar más de una vez y NO borra datos):
--   1. Límites de longitud/formato en la base de datos. Hasta ahora solo los
--      aplicaba la interfaz web; alguien que llamara directamente a la API de
--      Supabase podía saltárselos (títulos gigantes, enlaces `javascript:`...).
--      Las restricciones se crean con NOT VALID: se aplican a todo lo NUEVO
--      sin fallar por filas antiguas.
--   2. Un like por persona y publicación (evita likes duplicados por doble clic).
--      Solo se crea si NO hay duplicados existentes; si los hay, avisa.
--   3. Índices para las consultas del feed, el perfil y la actividad.
--   4. El bucket "foro-fotos" solo acepta imágenes JPG/PNG/WEBP/GIF de hasta 8 MB.
--   5. El nombre de autor de una publicación se fuerza desde el perfil del
--      usuario (si ya eligió nombre de usuario), para que nadie publique
--      "como" otra persona llamando a la API a mano.
--
-- CÓMO APLICARLO: Supabase → SQL Editor → New query → pega esto → Run.
-- Ejecuta ANTES supabase/add-profiles-username.sql (el punto 5 lo necesita).
-- ============================================================================

-- 1) Límites y formato ------------------------------------------------------
alter table public.community_posts drop constraint if exists community_posts_title_len;
alter table public.community_posts
  add constraint community_posts_title_len
  check (char_length(title) between 1 and 280) not valid;

alter table public.community_posts drop constraint if exists community_posts_handle_len;
alter table public.community_posts
  add constraint community_posts_handle_len
  check (instagram_handle is null or char_length(instagram_handle) <= 40) not valid;

alter table public.community_posts drop constraint if exists community_posts_url_http;
alter table public.community_posts
  add constraint community_posts_url_http
  check (instagram_url is null or (instagram_url ~* '^https?://' and char_length(instagram_url) <= 200)) not valid;

alter table public.community_posts drop constraint if exists community_posts_category_len;
alter table public.community_posts
  add constraint community_posts_category_len
  check (category is null or char_length(category) <= 40) not valid;

-- El avatar solo puede apuntar al Storage público de Supabase (no a sitios
-- externos, que servirían para rastrear a quien vea el perfil).
alter table public.profiles drop constraint if exists profiles_avatar_storage_only;
alter table public.profiles
  add constraint profiles_avatar_storage_only
  check (avatar_url is null or avatar_url ~* '^https://[a-z0-9-]+\.supabase\.co/storage/v1/object/public/') not valid;

-- 2) Un like por persona y publicación -------------------------------------
do $$
begin
  if exists (
    select 1 from public.post_likes group by post_id, user_id having count(*) > 1
  ) then
    raise notice 'Hay likes duplicados: no se creó el índice único. Elimina los duplicados y vuelve a ejecutar este script.';
  else
    create unique index if not exists post_likes_one_per_user on public.post_likes (post_id, user_id);
  end if;
end $$;

-- 3) Índices ------------------------------------------------------------------
create index if not exists community_posts_created_at_idx on public.community_posts (created_at desc);
create index if not exists community_posts_user_id_idx on public.community_posts (user_id, created_at desc);
create index if not exists post_likes_post_id_idx on public.post_likes (post_id);
create index if not exists post_likes_user_id_idx on public.post_likes (user_id);

-- 4) Bucket "foro-fotos": tamaño y tipos permitidos --------------------------
update storage.buckets
set file_size_limit = 8388608,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
where id = 'foro-fotos';

-- 5) Autor de la publicación forzado desde el perfil -------------------------
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'username'
  ) then
    create or replace function public.force_post_handle()
    returns trigger
    language plpgsql
    security definer
    set search_path = public
    as $fn$
    declare
      uname text;
    begin
      select username into uname from public.profiles where user_id = new.user_id;
      if uname is not null then
        new.instagram_handle := '@' || uname;
      end if;
      return new;
    end;
    $fn$;

    drop trigger if exists community_posts_force_handle on public.community_posts;
    create trigger community_posts_force_handle
      before insert on public.community_posts
      for each row execute function public.force_post_handle();
  else
    raise notice 'Aún no existe profiles.username: ejecuta primero add-profiles-username.sql y vuelve a lanzar este script.';
  end if;
end $$;
