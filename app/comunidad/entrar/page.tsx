'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useToasts, ToastViewport } from '@/components/ui/Toast';
import { AuthShell, authButtonClass, authInputClass } from '@/components/community/AuthShell';

const content = {
    es: {
        back: '← Volver a la comunidad',
        tagline: 'Inicia sesión para publicar tus fotos LEGO y dar me gusta.',
        email: 'Correo electrónico',
        password: 'Contraseña',
        submit: 'Iniciar sesión',
        noAccount: '¿No tienes una cuenta?',
        signUp: 'Regístrate',
    },
    en: {
        back: '← Back to community',
        tagline: 'Log in to post your LEGO photos and give likes.',
        email: 'Email',
        password: 'Password',
        submit: 'Log in',
        noAccount: "Don't have an account?",
        signUp: 'Sign up',
    },
};

export default function EntrarPage() {
    const router = useRouter();
    const [lang, setLang] = useState<'es' | 'en'>('es');
    const { toasts, push, dismiss } = useToasts();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const t = content[lang];

    useEffect(() => {
        document.documentElement.lang = lang;
    }, [lang]);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) router.replace('/comunidad');
        });
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
            if (error) {
                push(error.message, 'error');
                return;
            }
            router.replace('/comunidad');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <AuthShell
                lang={lang}
                onLangChange={setLang}
                backLabel={t.back}
                tagline={t.tagline}
                switchText={t.noAccount}
                switchLabel={t.signUp}
                switchHref="/comunidad/registro"
            >
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
                        type="password"
                        required
                        autoComplete="current-password"
                        aria-label={t.password}
                        placeholder={t.password}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={authInputClass}
                    />
                    <button type="submit" disabled={submitting} className={`${authButtonClass} mt-2`}>
                        {t.submit}
                    </button>
                </form>
            </AuthShell>
            <ToastViewport toasts={toasts} onDismiss={dismiss} />
        </>
    );
}
