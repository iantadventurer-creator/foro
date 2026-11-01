'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { BrandMark } from '@/components/ui/BrandMark';
import { LangToggle } from '@/components/ui/LangToggle';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import type { Lang } from '@/lib/lang';

/** Marco común de las pantallas de acceso (entrar / registrarse), con el
 * mismo esquema que Instagram —una tarjeta central con la marca arriba y,
 * debajo, otra para pasar a la otra pantalla— hecho con piezas de juguete:
 * la cabecera de la tarjeta es un bloque cobalto. */
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
    lang: Lang;
    onLangChange: (lang: Lang) => void;
    backLabel: string;
    tagline: string;
    switchText: string;
    switchLabel: string;
    switchHref: string;
    children: ReactNode;
}) {
    return (
        <main id="contenido" tabIndex={-1} className="min-h-screen text-[var(--color-text)] font-sans relative z-0">
            <header className="px-4 sm:px-6 py-3">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link href="/comunidad" className="link-underline py-2 text-sm font-extrabold text-[var(--color-text)]">
                        {backLabel}
                    </Link>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <LangToggle lang={lang} onChange={onLangChange} />
                    </div>
                </div>
            </header>

            <div className="max-w-md mx-auto px-4 pt-6 md:pt-10 pb-16 flex flex-col gap-5">
                <motion.div
                    initial={{ opacity: 0, y: 20, rotate: -1 }}
                    animate={{ opacity: 1, y: 0, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 240, damping: 20 }}
                    className="toy overflow-hidden rounded-[2rem] bg-[var(--color-surface)]"
                >
                    <div className="relative bg-[var(--color-accent)] text-white px-7 py-7 border-b-[3px] border-[var(--color-border)]">
                        <BrandMark className="w-12 h-12 rounded-2xl border-2 border-[#13204a] mb-4 hover-wiggle" />
                        <p className="font-display text-4xl font-black tracking-[-0.02em]">IanTBuild</p>
                        <p className="text-sm font-medium text-white/90 mt-2 leading-relaxed">{tagline}</p>
                    </div>
                    <div className="px-7 py-7">{children}</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08, type: 'spring', stiffness: 240, damping: 20 }}
                    className="toy-sm rounded-3xl bg-[var(--color-highlight)] text-[#13204a] px-7 py-4 text-center text-sm font-semibold"
                >
                    {switchText}{' '}
                    <Link href={switchHref} className="font-black underline underline-offset-4 decoration-2">
                        {switchLabel}
                    </Link>
                </motion.div>
            </div>
        </main>
    );
}
