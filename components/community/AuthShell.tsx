'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { LangToggle } from '@/components/community/LangToggle';

/** Marco común de las pantallas de acceso (entrar / crear perfil), con el
 * mismo esquema que Instagram: una tarjeta central con la marca arriba y,
 * debajo, una segunda tarjeta para pasar a la otra pantalla. */
export function AuthShell({
    lang,
    onLangChange,
    backLabel,
    tagline,
    switchText,
    switchLabel,
    switchHref,
    children,
}: {
    lang: 'es' | 'en';
    onLangChange: (lang: 'es' | 'en') => void;
    backLabel: string;
    tagline: string;
    switchText: string;
    switchLabel: string;
    switchHref: string;
    children: ReactNode;
}) {
    return (
        <main id="contenido" tabIndex={-1} className="min-h-screen text-[var(--color-text)] font-sans relative z-0">
            <header className="px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <Link href="/comunidad" className="text-xs font-semibold uppercase text-[var(--color-accent-text)] tracking-wider hover:underline">
                        {backLabel}
                    </Link>
                    <LangToggle lang={lang} onChange={onLangChange} />
                </div>
            </header>

            <div className="max-w-sm mx-auto px-4 pt-6 pb-16 flex flex-col gap-3">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl px-8 py-10"
                >
                    <div className="flex flex-col items-center text-center mb-8">
                        <div className="w-14 h-14 rounded-xl overflow-hidden shadow-[0_8px_24px_-8px_var(--shadow-accent)] mb-4">
                            <svg viewBox="0 0 36 36" className="w-full h-full" aria-hidden="true">
                                <rect width="36" height="36" fill="var(--color-accent)" />
                                {[[11, 11], [25, 11], [11, 25], [25, 25]].map(([cx, cy]) => (
                                    <g key={`${cx}-${cy}`}>
                                        <circle cx={cx + 1} cy={cy + 1.5} r="5.5" fill="rgba(0,0,0,0.3)" />
                                        <circle cx={cx} cy={cy} r="5.5" fill="var(--color-accent)" />
                                        <circle cx={cx - 2} cy={cy - 2} r="1.7" fill="white" opacity="0.5" />
                                    </g>
                                ))}
                            </svg>
                        </div>
                        <p className="font-display text-3xl font-semibold tracking-tight">IanTBuild</p>
                        <p className="text-sm text-[var(--color-text-muted)] mt-3 leading-relaxed">{tagline}</p>
                    </div>
                    {children}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl px-8 py-5 text-center text-sm text-[var(--color-text-muted)]"
                >
                    {switchText}{' '}
                    <Link href={switchHref} className="text-[var(--color-accent-text)] font-semibold hover:underline">
                        {switchLabel}
                    </Link>
                </motion.div>
            </div>
        </main>
    );
}

export const authInputClass =
    'w-full bg-[var(--color-ink)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm text-[var(--color-text)] font-medium focus:outline-none focus:border-[var(--color-accent)] transition-colors placeholder:text-[var(--color-text-faint)]';

export const authButtonClass =
    'w-full bg-[var(--color-accent)] text-[var(--color-accent-ink)] font-bold px-6 py-3 rounded-full text-sm hover:brightness-110 transition disabled:opacity-50 shadow-[0_8px_24px_-8px_var(--shadow-accent)]';
