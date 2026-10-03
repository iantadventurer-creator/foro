'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { CATEGORY_KEYS, formatCategoryLabel, getCategoryTheme } from '@/lib/categoryThemes';
import { useModal } from '@/lib/useModal';
import { ALLOWED_IMAGE_TYPES, extensionForMime, safeExternalUrl } from '@/lib/validation';
import type { AppUser } from '@/lib/community';
import type { CommunityContent } from '@/lib/communityContent';
import type { ToastVariant } from '@/components/ui/Toast';

const TITLE_MAX_LENGTH = 280;
const URL_MAX_LENGTH = 200;
const MAX_FILE_SIZE_MB = 8;

export const communityInputClass =
  'bg-[var(--color-ink)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm text-[var(--color-text)] font-medium focus:outline-none focus:border-[var(--color-accent)] transition-colors placeholder:text-[var(--color-text-faint)]';

function buildUploadFileName(ext: string): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;
}

/** Formulario para publicar una foto: valida, sube a Storage y crea la publicación. */
export function UploadModal({
  open,
  user,
  t,
  notify,
  onClose,
  onPublished,
}: {
  open: boolean;
  user: AppUser | null;
  t: CommunityContent;
  notify: (message: string, variant?: ToastVariant) => void;
  onClose: () => void;
  /** Se llama tras publicar, para que el feed se recargue. */
  onPublished: () => Promise<void> | void;
}) {
  const [title, setTitle] = useState('');
  const [instagramUrlInput, setInstagramUrlInput] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { closeButtonRef, dialogRef, handleBackdropClick } = useModal(open, onClose);
  const inputClass = communityInputClass;

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      notify(t.mustLogin, 'info');
      return;
    }
    if (!title.trim() || !file) {
      notify(t.fillForm, 'info');
      return;
    }

    const ext = ALLOWED_IMAGE_TYPES.includes(file.type) ? extensionForMime(file.type) : null;
    if (!ext) {
      notify(t.badFormat, 'error');
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      notify(t.tooLarge(MAX_FILE_SIZE_MB), 'error');
      return;
    }
    const instagramUrl = instagramUrlInput.trim() ? safeExternalUrl(instagramUrlInput) : null;
    if (instagramUrlInput.trim() && !instagramUrl) {
      notify(t.badUrl, 'error');
      return;
    }

    setLoading(true);
    try {
      const fileName = buildUploadFileName(ext);

      const { error: storageError } = await supabase.storage.from('foro-fotos').upload(fileName, file);
      if (storageError) throw storageError;

      const { data: { publicUrl } } = supabase.storage.from('foro-fotos').getPublicUrl(fileName);

      const authorHandle = user.user_metadata?.instagram_handle || user.email?.split('@')[0] || 'anon';

      const { error: dbError } = await supabase.from('community_posts').insert([
        {
          title: title.trim(),
          image_url: publicUrl,
          instagram_handle: authorHandle.startsWith('@') ? authorHandle : '@' + authorHandle,
          instagram_url: instagramUrl,
          category,
          user_id: user.id,
        },
      ]);

      if (dbError) {
        // La foto ya se subió a Storage pero la publicación falló:
        // se borra para no dejar archivos huérfanos en el bucket.
        await supabase.storage.from('foro-fotos').remove([fileName]);
        throw dbError;
      }

      setTitle('');
      setInstagramUrlInput('');
      setCategory(null);
      setFile(null);
      onClose();
      await onPublished();
    } catch (error) {
      console.error('Error al subir:', error);
      notify(error instanceof Error ? error.message : 'Error desconocido', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
        {open && user && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleBackdropClick}
                ref={dialogRef as React.Ref<HTMLDivElement>}
                role="dialog"
                aria-modal="true"
                aria-label={t.newPostTitle}
                className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            >
                <motion.div
                    initial={{ scale: 0.95, y: 16, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.95, y: 16, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6"
                >
                    <div className="flex justify-between items-center mb-5">
                        <h2 className="font-display text-lg font-semibold tracking-tight text-[var(--color-text)]">{t.newPostTitle}</h2>
                        <button
                            ref={closeButtonRef}
                            onClick={onClose}
                            aria-label={t.close}
                            className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text)] bg-[var(--color-surface-2)] border border-[var(--color-border)]"
                        >
                            ✕
                        </button>
                    </div>
                    <form onSubmit={handleUpload} className="flex flex-col gap-4">
                        <textarea
                            required
                            rows={3}
                            maxLength={TITLE_MAX_LENGTH}
                            aria-label={t.placeholder}
                            placeholder={t.placeholder}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className={`${inputClass} resize-none`}
                        />
                        <div className="text-right text-[10px] text-[var(--color-text-faint)] -mt-2">
                            {title.length}/{TITLE_MAX_LENGTH}
                        </div>
                        <input
                            type="url"
                            maxLength={URL_MAX_LENGTH}
                            aria-label={t.instagramUrlPlaceholder}
                            placeholder={t.instagramUrlPlaceholder}
                            value={instagramUrlInput}
                            onChange={(e) => setInstagramUrlInput(e.target.value)}
                            className={inputClass}
                        />

                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-faint)] block mb-2">{t.categoryLabel}</span>
                            <div className="flex flex-wrap gap-2">
                                {CATEGORY_KEYS.map((key) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setCategory((prev) => (prev === key ? null : key))}
                                        style={
                                            category === key
                                                ? { background: getCategoryTheme(key)!.accent, color: getCategoryTheme(key)!.ink, borderColor: getCategoryTheme(key)!.accent }
                                                : undefined
                                        }
                                        className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide border transition-colors ${category === key
                                            ? ''
                                            : 'bg-transparent text-[var(--color-text-muted)] border-[var(--color-border)] hover:text-[var(--color-text)]'
                                            }`}
                                    >
                                        {formatCategoryLabel(key)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            aria-label={t.fileLabel}
                            required
                            onChange={(e) => e.target.files && setFile(e.target.files[0])}
                            className="w-full text-[var(--color-text-muted)] border border-[var(--color-border)] rounded-xl px-4 py-2 text-xs font-medium file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[var(--color-accent)] file:text-[var(--color-accent-ink)] hover:file:cursor-pointer hover:file:brightness-110"
                        />
                        <motion.button
                            whileHover={{ y: -2 }}
                            whileTap={{ y: 1 }}
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[var(--color-accent-3)] text-white font-bold px-6 py-3 rounded-full text-xs uppercase tracking-wider hover:brightness-110 transition disabled:opacity-50"
                        >
                            {loading ? t.publishingBtn : t.publishBtn}
                        </motion.button>
                    </form>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
  );
}
