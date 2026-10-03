'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useToasts, ToastViewport } from '@/components/ui/Toast';
import { AuthShell, authButtonClass, authInputClass } from '@/components/community/AuthShell';

const USERNAME_PATTERN = /^[a-z0-9._]{3,30}$/;

type UsernameStatus = 'idle' | 'invalid' | 'checking' | 'available' | 'taken';

const content = {
    es: {
        back: '← Volver a la comunidad',
        tagline: 'Regístrate para publicar tus fotos LEGO y ver las de otros fans.',
        email: 'Correo electrónico',
        fullName: 'Nombre completo',
        username: 'Nombre de usuario',
        password: 'Contraseña',
        usernameInvalid: 'Usa de 3 a 30 letras minúsculas, números, puntos o guiones bajos.',
        usernameChecking: 'Comprobando…',
        usernameAvailable: 'Nombre de usuario disponible.',
        usernameTaken: 'Ese nombre de usuario ya está en uso.',
        passwordHint: 'Mínimo 6 caracteres.',
        submit: 'Registrarte',
        terms: 'Al registrarte aceptas compartir tus fotos en la comunidad de IanTBuild.',
        hasAccount: '¿Tienes una cuenta?',
        signIn: 'Inicia sesión',
        emailTaken: 'Este correo ya está registrado.',
        doneTitle: '¡Cuenta creada!',
        doneDesc: 'Te enviamos un correo para confirmar tu cuenta. Revísalo y luego inicia sesión.',
        goLogin: 'Ir a iniciar sesión',
    },
    en: {
        back: '← Back to community',
        tagline: 'Sign up to post your LEGO photos and see other fans’ work.',
        email: 'Email',
        fullName: 'Full name',
        username: 'Username',
        password: 'Password',
        usernameInvalid: 'Use 3 to 30 lowercase letters, numbers, dots or underscores.',
        usernameChecking: 'Checking…',
        usernameAvailable: 'Username available.',
        usernameTaken: 'That username is already taken.',
        passwordHint: 'At least 6 characters.',
        submit: 'Sign up',
        terms: 'By signing up you agree to share your photos in the IanTBuild community.',
        hasAccount: 'Have an account?',
        signIn: 'Log in',
        emailTaken: 'This email is already registered.',
        doneTitle: 'Account created!',
        doneDesc: 'We sent you an email to confirm your account. Check it, then log in.',
        goLogin: 'Go to log in',
    },
};

export default function RegistroPage() {
    const router = useRouter();
    const [lang, setLang] = useState<'es' | 'en'>('es');
    const { toasts, push, dismiss } = useToasts();
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle');
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);
    const t = content[lang];

    useEffect(() => {
        document.documentElement.lang = lang;
    }, [lang]);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) router.replace('/comunidad');
        });
    }, [router]);

    // Comprueba en vivo si el nombre de usuario está libre. Si la función de
    // la base de datos aún no existe, no se muestra ningún aviso de "ocupado".
    useEffect(() => {
        if (!username) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setUsernameStatus('idle');
            return;
        }
        if (!USERNAME_PATTERN.test(username)) {
            setUsernameStatus('invalid');
            return;
        }
        setUsernameStatus('checking');
        let cancelled = false;
        const timer = window.setTimeout(async () => {
            const { data, error } = await supabase.rpc('username_available', { uname: username });
            if (cancelled) return;
            if (error) setUsernameStatus('idle');
            else setUsernameStatus(data ? 'available' : 'taken');
        }, 400);
        return () => {
            cancelled = true;
            window.clearTimeout(timer);
        };
    }, [username]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (usernameStatus === 'invalid' || usernameStatus === 'taken') return;
        setSubmitting(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                email: email.trim(),
                password,
                options: {
                    data: {
                        username,
                        full_name: fullName.trim(),
                        instagram_handle: username,
                    },
                },
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

    const statusMessage: Record<UsernameStatus, { text: string; tone: string } | null> = {
        idle: null,
        invalid: { text: t.usernameInvalid, tone: 'text-[var(--color-accent-2)]' },
        checking: { text: t.usernameChecking, tone: 'text-[var(--color-text-faint)]' },
        available: { text: t.usernameAvailable, tone: 'text-[var(--color-accent-4)]' },
        taken: { text: t.usernameTaken, tone: 'text-[var(--color-accent)]' },
    };
    const status = statusMessage[usernameStatus];

    return (
        <>
            <AuthShell
                lang={lang}
                onLangChange={setLang}
                backLabel={t.back}
                tagline={t.tagline}
                switchText={t.hasAccount}
                switchLabel={t.signIn}
                switchHref="/comunidad/entrar"
            >
                {done ? (
                    <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-5 rounded-full bg-[var(--color-accent-4)]/20 text-[var(--color-accent-4)] flex items-center justify-center text-xl" aria-hidden="true">✓</div>
                        <h1 className="font-display text-xl font-semibold tracking-tight mb-2">{t.doneTitle}</h1>
                        <p className="text-sm text-[var(--color-text-muted)] mb-6">{t.doneDesc}</p>
                        <Link href="/comunidad/entrar" className={`${authButtonClass} inline-block`}>
                            {t.goLogin}
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                        <input
                            type="email"
                            required
                            autoComplete="email"
                            aria-label={t.email}
                            placeholder={t.email}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={authInputClass}
                        />
                        <input
                            type="text"
                            required
                            maxLength={60}
                            autoComplete="name"
                            aria-label={t.fullName}
                            placeholder={t.fullName}
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className={authInputClass}
                        />
                        <div>
                            <input
                                type="text"
                                required
                                maxLength={30}
                                autoComplete="username"
                                autoCapitalize="none"
                                spellCheck={false}
                                aria-label={t.username}
                                placeholder={t.username}
                                value={username}
                                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                                className={authInputClass}
                            />
                            {status && <p className={`text-xs mt-1.5 ${status.tone}`} aria-live="polite">{status.text}</p>}
                        </div>
                        <div>
                            <input
                                type="password"
                                required
                                minLength={6}
                                autoComplete="new-password"
                                aria-label={t.password}
                                placeholder={t.password}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={authInputClass}
                            />
                            <p className="text-xs mt-1.5 text-[var(--color-text-faint)]">{t.passwordHint}</p>
                        </div>
                        <button
                            type="submit"
                            disabled={submitting || usernameStatus === 'invalid' || usernameStatus === 'taken'}
                            className={`${authButtonClass} mt-2`}
                        >
                            {t.submit}
                        </button>
                        <p className="text-xs text-[var(--color-text-faint)] text-center leading-relaxed mt-2">{t.terms}</p>
                    </form>
                )}
            </AuthShell>
            <ToastViewport toasts={toasts} onDismiss={dismiss} />
        </>
    );
}
