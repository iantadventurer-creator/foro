'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useToasts, ToastViewport } from '@/components/ui/Toast';
import { LangToggle } from '@/components/community/LangToggle';

const HANDLE_MAX_LENGTH = 30;

const content = {
    es: {
        back: '← Volver a la comunidad',
        title: 'Crea tu perfil',
        subtitle: 'Un perfil gratuito para publicar tus fotos LEGO y dar me gusta a las de otros fans.',
        handleLabel: 'Usuario de Instagram',
        handlePlaceholder: '@tu_cuenta',
        handleHint: 'Es el nombre que verán los demás en tus publicaciones.',
        emailLabel: 'Correo electrónico',
        passwordLabel: 'Contraseña',
        passwordHint: 'Mínimo 6 caracteres.',
        submit: 'Crear perfil',
        hasAccount: '¿Ya tienes cuenta?',
        signIn: 'Inicia sesión',
        emailTaken: 'Este correo ya está registrado.',
        doneTitle: '¡Perfil creado!',
        doneDesc: 'Te enviamos un correo para confirmar tu cuenta. Revísalo y luego inicia sesión.',
        goLogin: 'Ir a iniciar sesión',
    },
    en: {
        back: '← Back to community',
        title: 'Create your profile',
        subtitle: 'A free profile to post your LEGO photos and like other fans’ work.',
        handleLabel: 'Instagram username',
        handlePlaceholder: '@your_account',
        handleHint: 'This is the name others will see on your posts.',
        emailLabel: 'Email',
        passwordLabel: 'Password',
        passwordHint: 'At least 6 characters.',
        submit: 'Create profile',
        hasAccount: 'Already have an account?',
        signIn: 'Sign in',
        emailTaken: 'This email is already registered.',
        doneTitle: 'Profile created!',
        doneDesc: 'We sent you an email to confirm your account. Check it, then sign in.',
        goLogin: 'Go to sign in',
    },
};

export default function RegistroPage() {
    const router = useRouter();
    const [lang, setLang] = useState<'es' | 'en'>('es');
    const { toasts, push, dismiss } = useToasts();
    const [handle, setHandle] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);
    const t = content[lang];

    useEffect(() => {
        document.documentElement.lang = lang;
    }, [lang]);

    // Quien ya tiene sesión iniciada no necesita crear otro perfil.
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) router.replace('/comunidad');
        });
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                email: email.trim(),
                password,
                options: { data: { instagram_handle: handle.trim() } },
            });
            if (error) {
                push(error.message, 'error');
                return;
            }
            if (data?.user && data.user.identities && data.user.identities.length === 0) {
                push(t.emailTaken, 'error');
                return;
            }
            setDone(true);
        } finally {
            setSubmitting(false);
        }
    };

    const inputClass =
        'w-full bg-[var(--color-ink)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm text-[var(--color-text)] font-medium focus:outline-none focus:border-[var(--color-accent)] transition-colors placeholder:text-[var(--color-text-faint)]';
    const labelClass = 'block text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2';
    const hintClass = 'text-xs text-[var(--color-text-faint)] mt-1.5';

    return (
        <main className="min-h-screen text-[var(--color-text)] font-sans relative z-0">
            <header className="sticky top-0 z-40 bg-[var(--color-ink)]/85 backdrop-blur-md border-b border-[var(--color-border)] px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <Link href="/comunidad" className="text-xs font-semibold uppercase text-[var(--color-accent)] tracking-wider hover:underline">
                        {t.back}
                    </Link>
                    <LangToggle lang={lang} onChange={setLang} />
                </div>
            </header>

            <div className="max-w-md mx-auto px-4 pt-12 pb-16">
                {done ? (
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-8 text-center"
                    >
                        <div className="w-12 h-12 mx-auto mb-5 rounded-full bg-[var(--color-accent-4)]/20 text-[var(--color-accent-4)] flex items-center justify-center text-xl" aria-hidden="true">✓</div>
                        <h1 className="font-display text-2xl font-semibold tracking-tight mb-2">{t.doneTitle}</h1>
                        <p className="text-sm text-[var(--color-text-muted)] mb-6">{t.doneDesc}</p>
                        <Link
                            href="/comunidad"
                            className="inline-block bg-[var(--color-accent)] text-[var(--color-accent-ink)] font-bold px-6 py-3 rounded-full text-xs uppercase tracking-wider hover:brightness-110 transition shadow-[0_8px_24px_-8px_var(--shadow-accent)]"
                        >
                            {t.goLogin}
                        </Link>
                    </motion.div>
                ) : (
                    <>
                        <div className="text-center mb-8">
                            <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">{t.title}</h1>
                            <p className="text-sm text-[var(--color-text-muted)] mt-2">{t.subtitle}</p>
                        </div>
                        <motion.form
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            onSubmit={handleSubmit}
                            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 flex flex-col gap-5"
                        >
                            <div>
                                <label htmlFor="handle" className={labelClass}>{t.handleLabel}</label>
                                <input
                                    id="handle"
                                    type="text"
                                    required
                                    maxLength={HANDLE_MAX_LENGTH}
                                    placeholder={t.handlePlaceholder}
                                    value={handle}
                                    onChange={(e) => setHandle(e.target.value)}
                                    className={inputClass}
                                />
                                <p className={hintClass}>{t.handleHint}</p>
                            </div>
                            <div>
                                <label htmlFor="email" className={labelClass}>{t.emailLabel}</label>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className={labelClass}>{t.passwordLabel}</label>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    minLength={6}
                                    autoComplete="new-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={inputClass}
                                />
                                <p className={hintClass}>{t.passwordHint}</p>
                            </div>
                            <motion.button
                                whileHover={{ y: -2 }}
                                whileTap={{ y: 1 }}
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-[var(--color-accent)] text-[var(--color-accent-ink)] font-bold px-6 py-3.5 rounded-full text-xs uppercase tracking-wider hover:brightness-110 transition disabled:opacity-50 shadow-[0_8px_24px_-8px_var(--shadow-accent)]"
                            >
                                {t.submit}
                            </motion.button>
                        </motion.form>
                        <p className="text-center text-sm text-[var(--color-text-muted)] mt-6">
                            {t.hasAccount}{' '}
                            <Link href="/comunidad" className="text-[var(--color-accent)] font-semibold hover:underline">{t.signIn}</Link>
                        </p>
                    </>
                )}
            </div>

            <ToastViewport toasts={toasts} onDismiss={dismiss} />
        </main>
    );
}
