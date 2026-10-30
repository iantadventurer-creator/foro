'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Avatar } from '@/components/ui/Avatar';
import { ALLOWED_IMAGE_TYPES } from '@/lib/validation';

/** Cabecera de un perfil: foto (editable por su dueño), nombre, enlace a
 * Instagram si lo dejó en alguna publicación, y los contadores. */
export function ProfileHeader({
    handle,
    fullName,
    avatarUrl,
    instagramUrl,
    isOwnProfile,
    uploading,
    editAvatarLabel,
    postsLabel,
    likesLabel,
    onPickAvatar,
}: {
    handle: string;
    fullName?: string | null;
    avatarUrl: string | null;
    instagramUrl: string | null;
    isOwnProfile: boolean;
    uploading: boolean;
    editAvatarLabel: string;
    postsLabel: string;
    likesLabel: string;
    onPickAvatar: (file: File) => void;
}) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center gap-3 mb-10"
        >
            <div className="relative">
                <Avatar handle={handle} imageUrl={avatarUrl} size={80} />
                {isOwnProfile && (
                    <>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            aria-label={editAvatarLabel}
                            title={editAvatarLabel}
                            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[var(--color-accent-3)] border-2 border-[var(--color-ink)] flex items-center justify-center text-xs text-white shadow-md hover:brightness-110 transition-[filter] disabled:opacity-60"
                        >
                            {uploading ? '…' : '✎'}
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept={ALLOWED_IMAGE_TYPES.join(',')}
                            aria-label={editAvatarLabel}
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                e.target.value = '';
                                if (file) onPickAvatar(file);
                            }}
                            className="hidden"
                        />
                    </>
                )}
            </div>
            {instagramUrl ? (
                <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-display text-xl font-semibold text-[var(--color-text)] hover:underline flex items-center gap-1"
                >
                    {handle} ↗
                </a>
            ) : (
                <h1 className="font-display text-xl font-semibold text-[var(--color-text)]">{handle}</h1>
            )}
            {fullName && <p className="text-sm text-[var(--color-text-muted)] -mt-1">{fullName}</p>}
            <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)] font-semibold uppercase tracking-wide">
                <span>{postsLabel}</span>
                <span className="w-1 h-1 rounded-full bg-[var(--color-border)]" aria-hidden="true" />
                <span>{likesLabel}</span>
            </div>
        </motion.div>
    );
}
