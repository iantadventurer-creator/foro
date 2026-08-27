-- ============================================================================
-- Políticas de seguridad (Row Level Security) para el foro de IanTBuild.
--
-- CÓMO APLICARLO:
-- 1. Entra a tu proyecto en supabase.com → SQL Editor → New query.
-- 2. Pega todo este archivo y dale a "Run".
-- 3. Repite (una sola vez) cada vez que crees una tabla nueva relacionada con el foro.
--
-- Sin estas políticas, cualquier usuario autenticado podría editar o borrar
-- publicaciones y likes ajenos llamando directamente a la API de Supabase,
-- sin pasar por la interfaz web (la interfaz ya oculta esos botones, pero eso
-- no es seguridad real — la seguridad real vive aquí, en la base de datos).
-- ============================================================================

-- 1) Activar RLS en las tablas (si no estaba ya activo)
alter table public.community_posts enable row level security;
alter table public.post_likes enable row level security;

-- 2) community_posts: cualquiera puede leer, pero solo el dueño puede
--    insertar/editar/borrar SUS propias publicaciones.
drop policy if exists "community_posts_select_all" on public.community_posts;
create policy "community_posts_select_all"
  on public.community_posts for select
  using (true);

drop policy if exists "community_posts_insert_own" on public.community_posts;
create policy "community_posts_insert_own"
  on public.community_posts for insert
  with check (auth.uid() = user_id);

drop policy if exists "community_posts_update_own" on public.community_posts;
create policy "community_posts_update_own"
  on public.community_posts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "community_posts_delete_own" on public.community_posts;
create policy "community_posts_delete_own"
  on public.community_posts for delete
  using (auth.uid() = user_id);

-- 3) post_likes: cualquiera puede leer (para contar likes), pero solo puedes
--    crear/borrar TUS propios likes (no puedes dar like en nombre de otro
--    usuario, ni borrar el like de otra persona).
drop policy if exists "post_likes_select_all" on public.post_likes;
create policy "post_likes_select_all"
  on public.post_likes for select
  using (true);

drop policy if exists "post_likes_insert_own" on public.post_likes;
create policy "post_likes_insert_own"
  on public.post_likes for insert
  with check (auth.uid() = user_id);

drop policy if exists "post_likes_delete_own" on public.post_likes;
create policy "post_likes_delete_own"
  on public.post_likes for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- 4) Storage (bucket "foro-fotos"): cualquiera puede ver las fotos, pero solo
--    usuarios autenticados pueden subir, y solo pueden borrar lo que ellos
--    mismos subieron (Supabase guarda el owner del archivo automáticamente).
--    Esto se configura en Storage → Policies (o aquí, vía SQL, contra
--    storage.objects).
-- ============================================================================
drop policy if exists "foro_fotos_select_all" on storage.objects;
create policy "foro_fotos_select_all"
  on storage.objects for select
  using (bucket_id = 'foro-fotos');

drop policy if exists "foro_fotos_insert_auth" on storage.objects;
create policy "foro_fotos_insert_auth"
  on storage.objects for insert
  with check (bucket_id = 'foro-fotos' and auth.role() = 'authenticated');

drop policy if exists "foro_fotos_delete_own" on storage.objects;
create policy "foro_fotos_delete_own"
  on storage.objects for delete
  using (bucket_id = 'foro-fotos' and auth.uid() = owner);

-- ============================================================================
-- 5) (Opcional, recomendado) Activa Realtime para que el feed se actualice
--    en vivo para todos los visitantes sin recargar la página:
--    Database → Replication → activa "community_posts" y "post_likes".
--    La web ya está preparada para aprovechar esto en cuanto lo actives.
-- ============================================================================
