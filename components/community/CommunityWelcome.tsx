'use client';

import { motion } from 'framer-motion';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import type { AppUser } from '@/lib/community';
import type { CommunityContent } from '@/lib/content/communityContent';

/** Tarjeta-pieza de la parte superior del feed. Con sesión: saludo, publicar
 * y perfil. Sin sesión: los tres pasos para participar y los botones de
 * registro / acceso. */
export function CommunityWelcome({
    t,
    user,
    avatarUrl,
    onPublish,
}: {
    t: CommunityContent;
    user: AppUser | null;
    avatarUrl?: string;
    onPublish: () => void;
}) {
    const cardClass = 'lego-studs card-depth bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 mb-10';

    if (user) {
        const rawHandle = user.user_metadata?.instagram_handle || user.email?.split('@')[0] || 'anon';
        const handle = rawHandle.startsWith('@') ? rawHandle : `@${rawHandle}`;
        return (
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${cardClass} [--stud-color:color-mix(in_srgb,var(--color-accent-3)_55%,var(--color-surface))] flex flex-col sm:flex-row sm:items-center gap-5`}
            >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <Avatar handle={handle} imageUrl={avatarUrl} size={52} />
                    <div className="min-w-0">
                        <h2 className="font-display text-lg font-semibold tracking-tight truncate">{t.welcomeGreeting(handle)}</h2>
                        <p className="text-sm text-[var(--color-text-muted)]">{t.welcomeDesc}</p>
                    </div>
                </div>
                <div className="flex gap-3 shrink-0">
                    <Button variant="blue" onClick={onPublish} className="flex-1 sm:flex-none">
                        + {t.publishBtn}
                    </Button>
                    <Button href={`/comunidad/u/${user.id}`} variant="secondary" className="flex-1 sm:flex-none">
                        {t.myProfile}
                    </Button>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className={cardClass}>
            <h2 className="font-display text-lg font-semibold tracking-tight text-[var(--color-text)] mb-2">{t.auth.joinTitle}</h2>
            <p className="text-sm text-[var(--color-text-muted)] mb-5">{t.auth.joinDesc}</p>
            <ol className="mb-6 grid gap-2 sm:grid-cols-3">
                {t.steps.map((step, i) => (
                    <li key={step} className="flex items-center gap-2.5 rounded-xl bg-[var(--color-surface-2)] border border-[var(--color-border)] px-3 py-2.5 text-xs font-semibold text-[var(--color-text)]">
                        <span
                            className="lego-bevel w-6 h-6 shrink-0 rounded-md flex items-center justify-center text-[11px] font-bold"
                            style={{
                                background: ['var(--color-accent)', 'var(--color-lego-yellow)', 'var(--color-accent-3)'][i],
                                color: i === 1 ? 'var(--color-lego-yellow-ink)' : '#ffffff',
                            }}
                        >
                            {i + 1}
                        </span>
                        {step}
                    </li>
                ))}
            </ol>
            <div className="flex flex-col sm:flex-row gap-3">
                <Button href="/comunidad/registro" className="flex-1">
                    {t.auth.signUpBtn}
                </Button>
                <Button href="/comunidad/entrar" variant="secondary" className="flex-1">
                    {t.auth.loginBtn}
                </Button>
            </div>
        </motion.div>
    );
}
