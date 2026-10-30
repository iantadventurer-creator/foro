import { supabase } from '@/lib/supabaseClient';
import { formatCategoryLabel } from '@/lib/categoryThemes';
import { orThrow, withRetry } from '@/lib/retry';

export type FeedItem = {
  id: string;
  title: string;
  src: string;
  videoUrl: string | null;
  permalink: string;
  mediaType: 'VIDEO' | 'IMAGE';
  author: string;
  /** Nombre de la subcarpeta del bucket (p. ej. "STAR WARS"), o null si la foto está suelta en la raíz. */
  category: string | null;
  /** Fecha real (no formateada) para poder ordenar por más reciente entre categorías. */
  createdAtMs: number;
};

/** Nombre del bucket público de Supabase Storage donde se suben las fotos de la galería. */
const GALLERY_BUCKET = 'galeria';
const VIDEO_EXTENSIONS = ['mp4', 'mov', 'webm'];
// Supabase limita cada listado a 100 archivos por defecto; sin esto, una
// carpeta con más fotos las perdería en silencio.
const GALLERY_LIST_LIMIT = 1000;

type StorageFile = { id: string | null; name: string; created_at?: string | null; updated_at?: string | null };

function buildItem(file: StorageFile, category: string | null, storagePath: string): FeedItem {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const isVideoType = VIDEO_EXTENSIONS.includes(ext);
  const { data: { publicUrl } } = supabase.storage.from(GALLERY_BUCKET).getPublicUrl(storagePath);
  const createdAt = file.created_at || file.updated_at;

  return {
    id: storagePath,
    title: category ? formatCategoryLabel(category) : 'Toy Photography',
    src: publicUrl,
    videoUrl: isVideoType ? publicUrl : null,
    permalink: 'https://instagram.com/iantadventurer',
    mediaType: isVideoType ? 'VIDEO' : 'IMAGE',
    author: '@iantadventurer',
    category,
    createdAtMs: createdAt ? new Date(createdAt).getTime() : 0,
  };
}

/** Lee la galería desde Supabase Storage, de la más reciente a la más antigua.
 * Una "carpeta" se distingue de un archivo porque no trae metadata (id es
 * null): cada subcarpeta del bucket es una categoría de la galería (su
 * nombre es el que se muestra en el filtro). Lanza si Storage falla. */
export async function loadGalleryItems(): Promise<FeedItem[]> {
  const rootEntries = await withRetry(() =>
    orThrow(supabase.storage.from(GALLERY_BUCKET).list('', { limit: GALLERY_LIST_LIMIT, sortBy: { column: 'name', order: 'asc' } }))
  );

  // Cada subcarpeta se lista en paralelo y con reintentos. Si una carpeta
  // sigue fallando, se omite en vez de dejar toda la galería en error.
  const groups = await Promise.all(
    (rootEntries || [])
      .filter((entry) => entry.name && !entry.name.startsWith('.'))
      .map(async (entry): Promise<FeedItem[]> => {
        if (entry.id !== null) return [buildItem(entry, null, entry.name)];

        try {
          const subEntries = await withRetry(() =>
            orThrow(
              supabase.storage
                .from(GALLERY_BUCKET)
                .list(entry.name, { limit: GALLERY_LIST_LIMIT, sortBy: { column: 'created_at', order: 'desc' } })
            )
          );
          return (subEntries || [])
            .filter((file) => file.name && !file.name.startsWith('.') && file.id !== null)
            .map((file) => buildItem(file, entry.name, `${entry.name}/${file.name}`));
        } catch (error) {
          console.error(`No se pudo leer la carpeta ${entry.name} de la galería:`, error);
          return [];
        }
      })
  );

  return groups.flat().sort((a, b) => b.createdAtMs - a.createdAtMs);
}
