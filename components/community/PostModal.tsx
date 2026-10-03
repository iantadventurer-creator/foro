'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { categoryTextColor, formatCategoryLabel, getCategoryTheme } from '@/lib/categoryThemes';
import { avatarColorFor, type AppUser, type Like, type Post } from '@/lib/community';
import { useModal } from '@/lib/useModal';
import { safeExternalUrl } from '@/lib/validation';
import type { CommunityContent } from '@/lib/communityContent';
import { communityInputClass } from '@/components/community/UploadModal';

const TITLE_MAX_LENGTH = 280;

/** Detalle de una publicación: foto, autor, me gusta, y editar/borrar para su dueño. */
export function PostModal({
  post,
  user,
  t,
  lang,
  avatarUrl,
  onClose,
  onToggleLike,
  onRequestDelete,
  onSaveTitle,
}: {
  /** Publicación abierta, o null si el modal está cerrado. */
  post: Post | null;
  user: AppUser | null;
  t: CommunityContent;
  lang: 'es' | 'en';
  avatarUrl?: string;
  onClose: () => void;
  onToggleLike: (postId: string, likes: Like[]) => void;
  onRequestDelete: (postId: string, imageUrl: string) => void;
  /** Devuelve true si se guardó, para poder salir del modo edición. */
  onSaveTitle: (postId: string, title: string) => Promise<boolean>;
}) {
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const { closeButtonRef, dialogRef, handleBackdropClick } = useModal(!!post, onClose);
  const inputClass = communityInputClass;
  const modalTheme = getCategoryTheme(post?.category ?? null);

  const handleEdit = async (postId: string) => {
    if (!editText.trim()) return;
    if (await onSaveTitle(postId, editText.trim())) {
      setEditingPostId(null);
      setEditText('');
    }
  };

  return (
    <AnimatePresence>
        {post && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleBackdropClick}
                ref={dialogRef as React.Ref<HTMLDivElement>}
                role="dialog"
                aria-modal="true"
                aria-label={post.title}
                className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
            >
                <motion.div
                    initial={{ scale: 0.95, y: 16, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.95, y: 16, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col md:flex-row shadow-2xl"
                >
                    <div className="w-full md:w-3/5 bg-black relative min-h-[320px] md:min-h-[480px] flex items-center justify-center overflow-hidden">
                        <div
                            className="absolute inset-0 bg-cover bg-center filter blur-2xl opacity-30 scale-110 pointer-events-none"
                            style={{ backgroundImage: `url(${post.image_url})` }}
                        />
                        <Image
                            src={post.image_url}
                            alt={post.title}
                            width={0}
                            height={0}
                            sizes="(max-width: 768px) 100vw, 60vw"
                            className="relative z-10 max-h-[70vh] w-full h-auto object-contain"
                        />
                    </div>
                    <div className="relative w-full md:w-2/5 p-6 flex flex-col justify-center overflow-y-auto">
                        <button
                            ref={closeButtonRef}
                            onClick={onClose}
                            aria-label={t.close}
                            className="absolute top-4 right-4 z-10 w-8 h-8 shrink-0 flex items-center justify-center rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text)] bg-[var(--color-surface-2)] border border-[var(--color-border)]"
                        >
                            ✕
                        </button>

                        <div className="flex flex-col items-center text-center gap-2 mb-5">
                            <Link
                                href={`/comunidad/u/${post.user_id}`}
                                className="relative w-20 h-20 shrink-0 rounded-full overflow-hidden flex items-center justify-center text-2xl font-black text-[#14100a] hover:brightness-110 transition"
                                style={{ background: avatarColorFor(post.instagram_handle || 'anon') }}
                                title={t.viewProfile}
                            >
                                <span className="relative z-0">
                                    {(post.instagram_handle || 'A').replace('@', '').charAt(0).toUpperCase()}
                                </span>
                                {avatarUrl && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={avatarUrl}
                                        alt=""
                                        className="absolute inset-0 z-10 w-full h-full object-cover"
                                    />
                                )}
                            </Link>
                            {safeExternalUrl(post.instagram_url) ? (
                                <a
                                    href={safeExternalUrl(post.instagram_url) ?? undefined}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-bold text-sm uppercase tracking-wide hover:underline flex items-center gap-1 max-w-full"
                                    style={{ color: categoryTextColor(modalTheme) }}
                                >
                                    <span className="truncate">{post.instagram_handle || t.anonymous}</span> ↗
                                </a>
                            ) : (
                                <Link
                                    href={`/comunidad/u/${post.user_id}`}
                                    className="font-bold text-sm uppercase tracking-wide hover:underline max-w-full truncate"
                                    style={{ color: categoryTextColor(modalTheme) }}
                                >
                                    {post.instagram_handle || t.anonymous}
                                </Link>
                            )}
                        </div>

                        <div className="flex flex-col gap-4">
                            {modalTheme && post.category && (
                                <span
                                    className="self-start text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide"
                                    style={{ background: `${modalTheme.accent}22`, color: categoryTextColor(modalTheme) }}
                                >
                                    {formatCategoryLabel(post.category)}
                                </span>
                            )}
                            <AnimatePresence mode="wait">
                                {editingPostId === post.id ? (
                                    <motion.div
                                        key="editing"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex flex-col gap-2"
                                    >
                                        <textarea
                                            rows={3}
                                            maxLength={TITLE_MAX_LENGTH}
                                            aria-label={t.edit}
                                            value={editText}
                                            onChange={(e) => setEditText(e.target.value)}
                                            className={`${inputClass} resize-none`}
                                        />
                                        <div className="flex gap-2 justify-end">
                                            <button
                                                onClick={() => handleEdit(post.id)}
                                                className="bg-[var(--color-accent-4)] hover:brightness-110 text-[#04170d] font-bold px-3 py-1.5 rounded-full text-[10px] uppercase transition-all"
                                            >
                                                {t.save}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingPostId(null);
                                                    setEditText('');
                                                }}
                                                className="bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] text-[var(--color-text)] font-bold px-3 py-1.5 rounded-full text-[10px] uppercase border border-[var(--color-border)] transition-colors"
                                            >
                                                {t.cancel}
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.p
                                        key="text"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="font-display text-lg md:text-xl font-semibold text-[var(--color-text)] leading-snug whitespace-pre-line"
                                    >
                                        {post.title}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>

                        <div
                            className="w-full mt-6 pt-4 flex flex-col gap-2.5"
                            style={{ borderTop: `1px solid ${modalTheme ? `${modalTheme.accent}40` : 'var(--color-border)'}` }}
                        >
                            <div className="flex items-center justify-between gap-2">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 1.3 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                                    onClick={() => onToggleLike(post.id, post.post_likes || [])}
                                    aria-pressed={user ? (post.post_likes || []).some((l) => l.user_id === user.id) : false}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${user && (post.post_likes || []).some((l) => l.user_id === user.id)
                                        ? 'bg-[var(--color-accent-2)]/10 text-[var(--color-accent-2)] border-[var(--color-accent-2)]/30'
                                        : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:text-[var(--color-text)]'
                                        }`}
                                >
                                    <motion.span
                                        key={user && (post.post_likes || []).some((l) => l.user_id === user.id) ? 'liked' : 'unliked'}
                                        initial={{ scale: 0.6 }}
                                        animate={{ scale: 1 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {user && (post.post_likes || []).some((l) => l.user_id === user.id) ? '❤️' : '🤍'}
                                    </motion.span>
                                    <span>{(post.post_likes || []).length}</span>
                                </motion.button>

                                {user?.id === post.user_id && editingPostId !== post.id && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                setEditingPostId(post.id);
                                                setEditText(post.title);
                                            }}
                                            className="text-[10px] bg-[var(--color-surface-2)] text-[var(--color-accent-text)] hover:brightness-110 px-2.5 py-1 rounded-full font-bold uppercase border border-[var(--color-border)] tracking-wider transition-colors"
                                        >
                                            {t.edit}
                                        </button>
                                        <button
                                            onClick={() => onRequestDelete(post.id, post.image_url)}
                                            className="text-[10px] bg-[var(--color-accent-2)]/10 text-[var(--color-accent-2)] hover:bg-[var(--color-accent-2)]/20 px-2.5 py-1 rounded-full font-bold uppercase border border-[var(--color-accent-2)]/30 tracking-wider transition-colors"
                                        >
                                            {t.delete}
                                        </button>
                                    </div>
                                )}
                            </div>
                            <span className="text-[10px] text-[var(--color-text-faint)] font-semibold">
                                {new Date(post.created_at).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
  );
}
