'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { CATEGORY_KEYS, formatCategoryLabel, getCategoryTheme } from '@/lib/categoryThemes';
import { ImageDropzone } from '@/components/community/ImageDropzone';
import { Button } from '@/components/ui/Button';
import { FilterPill } from '@/components/ui/FilterPill';
import { inputClass } from '@/components/ui/inputStyles';
import { useModal } from '@/lib/hooks/useModal';
import { ALLOWED_IMAGE_TYPES, extensionForMime, safeExternalUrl } from '@/lib/validation';
import type { AppUser } from '@/lib/community';
import type { CommunityContent } from '@/lib/content/communityContent';
import type { ToastVariant } from '@/components/ui/Toast';

const TITLE_MAX_LENGTH = 280;
const URL_MAX_LENGTH = 200;
const MAX_FILE_SIZE_MB = 8;
const labelClass = 'text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]';

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
                    className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 [scrollbar-width:thin]"
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
                    <form onSubmit={handleUpload} className="flex flex-col gap-5">
                        <ImageDropzone
                            file={file}
                            onChange={setFile}
                            maxSizeMb={MAX_FILE_SIZE_MB}
                            labels={{ title: t.dropTitle, hint: t.dropHint(MAX_FILE_SIZE_MB), change: t.changePhoto, remove: t.removePhoto, input: t.fileLabel }}
                            onInvalid={(reason) => notify(reason === 'format' ? t.badFormat : t.tooLarge(MAX_FILE_SIZE_MB), 'error')}
                        />

                        <div>
                            <div className="flex items-baseline justify-between mb-2">
                                <label htmlFor="post-description" className={labelClass}>{t.descriptionLabel}</label>
                                <span className="text-[10px] text-[var(--color-text-faint)] tabular-nums" aria-hidden="true">
                                    {title.length}/{TITLE_MAX_LENGTH}
                                </span>
                            </div>
                            <textarea
                                id="post-description"
                                required
                                rows={3}
                                maxLength={TITLE_MAX_LENGTH}
                                placeholder={t.placeholder}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className={`${inputClass} resize-none`}
                            />
                        </div>

                        <div>
                            <label htmlFor="post-instagram" className={`${labelClass} block mb-2`}>{t.instagramLabel}</label>
                            <input
                                id="post-instagram"
                                type="url"
                                maxLength={URL_MAX_LENGTH}
                                placeholder="https://instagram.com/…"
                                value={instagramUrlInput}
                                onChange={(e) => setInstagramUrlInput(e.target.value)}
                                className={inputClass}
                            />
                        </div>

                        <fieldset>
                            <legend className={`${labelClass} mb-2`}>{t.categoryLabel}</legend>
                            <div className="flex flex-wrap gap-2">
                                {CATEGORY_KEYS.map((key) => (
                                    <FilterPill
                                        key={key}
                                        onClick={() => setCategory((prev) => (prev === key ? null : key))}
                                        active={category === key}
                                        theme={getCategoryTheme(key)}
                                    >
                                        {formatCategoryLabel(key)}
                                    </FilterPill>
                                ))}
                            </div>
                        </fieldset>

                        <Button type="submit" variant="blue" fullWidth disabled={loading || !file || !title.trim()}>
                            {loading ? t.publishingBtn : t.publishBtn}
                        </Button>
                    </form>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
  );
}
