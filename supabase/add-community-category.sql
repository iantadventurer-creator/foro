-- ============================================================================
-- Agrega la categoría/franquicia a las publicaciones del foro, para que la
-- comunidad use el mismo sistema de categorías que la galería principal
-- (Star Wars, Ninjago, Marvel, DC, Minecraft, Chill).
--
-- CÓMO APLICARLO: Supabase → SQL Editor → New query → pega esto → Run.
-- No hace falta tocar las políticas de RLS: son por fila, no por columna,
-- así que las que ya existen en rls-policies.sql siguen valiendo igual.
-- ============================================================================

alter table public.community_posts add column if not exists category text;
