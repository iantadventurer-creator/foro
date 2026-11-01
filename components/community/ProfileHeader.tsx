'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Avatar } from '@/components/ui/Avatar';
import { ALLOWED_IMAGE_TYPES } from '@/lib/validation';

/** Cabecera de un perfil: los contadores en una línea discreta y la foto (editable por su dueño) junto al nombre en
 * grande, con enlace a Instagram si lo dejó en alguna publicación. */
export function ProfileHeader({
    metaLabel,
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
    /** Etiqueta de la fila superior ("Perfil"). */
    metaLabel: string;
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
    const nameClass = 'font-display font-bold leading-[0.95] tracking-[-0.04em] text-[clamp(2.2rem,7vw,5.5rem)] break-all';

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-8 md:pt-12 pb-8 md:pb-10"
        >
            <p className="label-caps flex flex-wrap items-center gap-x-3 gap-y-1 text-[var(--color-text-faint)]">
                <span>{metaLabel}</span>
                <span aria-hidden="true">·</span>
                <span>{postsLabel}</span>
                <span aria-hidden="true">·</span>
                <span>{likesLabel}</span>
            </p>

            <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-7">
                <div className="relative shrink-0 w-fit">
                    <span className="block rounded-full ring-1 ring-[var(--color-border)]">
                        <Avatar handle={handle} imageUrl={avatarUrl} size={112} />
                    </span>
                    {isOwnProfile && (
                        <>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                aria-label={editAvatarLabel}
                                title={editAvatarLabel}
                                className="panel-sm lift absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-[var(--color-accent)] text-[var(--color-accent-ink)] border-transparent flex items-center justify-center text-base font-bold disabled:opacity-60"
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
                <div className="min-w-0">
                    {instagramUrl ? (
                        <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className={`${nameClass} block hover:text-[var(--color-accent-text)] transition-colors`}>
                            <h1>
                                {handle}
                                <span className="text-[0.45em] align-top ml-2" aria-hidden="true">↗</span>
                            </h1>
                        </a>
                    ) : (
                        <h1 className={nameClass}>{handle}</h1>
                    )}
                    {fullName && <p className="text-lg text-[var(--color-text-muted)] mt-2">{fullName}</p>}
                </div>
            </div>
        </motion.div>
    );
}
