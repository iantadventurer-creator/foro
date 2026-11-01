'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Avatar } from '@/components/ui/Avatar';
import { ALLOWED_IMAGE_TYPES } from '@/lib/validation';

/** Cabecera de un perfil como bloque cobalto: pegatinas con los
 * contadores y la foto (editable por su dueño) junto al nombre en
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
    const nameClass = 'font-display font-black leading-[0.95] tracking-[-0.02em] text-[clamp(2.2rem,7vw,5.5rem)] break-all';

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="toy relative overflow-hidden rounded-[2rem] mt-6 md:mt-8 mb-10 bg-[var(--color-accent)] text-white px-6 py-8 md:px-10 md:py-10 [--color-border:#13204a] [--toy-shadow:#13204a]"
        >
            <div className="flex flex-wrap items-center gap-2">
                <span className="sticker bg-[var(--color-highlight)] text-[#13204a]">{metaLabel}</span>
                <span className="sticker bg-white text-[#13204a] rotate-[2deg]">{postsLabel}</span>
                <span className="sticker bg-[var(--color-accent-3)] text-[#13204a] rotate-[-1deg]">♥ {likesLabel}</span>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-7">
                <div className="relative shrink-0 w-fit">
                    <span className="block rounded-full border-4 border-[#13204a] shadow-[4px_4px_0_#13204a]">
                        <Avatar handle={handle} imageUrl={avatarUrl} size={112} />
                    </span>
                    {isOwnProfile && (
                        <>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                aria-label={editAvatarLabel}
                                title={editAvatarLabel}
                                className="toy-sm toy-press absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-[var(--color-highlight)] text-[#13204a] flex items-center justify-center text-base font-black disabled:opacity-60"
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
                        <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className={`${nameClass} block hover:text-[var(--color-highlight)] transition-colors`}>
                            <h1>
                                {handle}
                                <span className="text-[0.45em] align-top ml-2" aria-hidden="true">↗</span>
                            </h1>
                        </a>
                    ) : (
                        <h1 className={nameClass}>{handle}</h1>
                    )}
                    {fullName && <p className="font-display text-xl font-bold text-white/90 mt-2">{fullName}</p>}
                </div>
            </div>
        </motion.div>
    );
}
