'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthShell } from '@/components/auth/AuthShell';
import { Button } from '@/components/ui/Button';
import { inputClass } from '@/components/ui/inputStyles';
import { ToastViewport, useToasts } from '@/components/ui/Toast';
import { authContent } from '@/lib/content/authContent';
import { useLang } from '@/lib/hooks/useLang';
import { useRedirectIfLoggedIn } from '@/lib/hooks/useRedirectIfLoggedIn';
import { supabase } from '@/lib/supabaseClient';
import { authErrorMessage } from '@/lib/validation';

export default function EntrarPage() {
    const router = useRouter();
    const [lang, setLang] = useLang();
    const { toasts, push, dismiss } = useToasts();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const t = authContent[lang];
    useRedirectIfLoggedIn();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
            if (error) {
                push(authErrorMessage(error.message, lang), 'error');
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
                tagline={t.login.tagline}
                switchText={t.login.noAccount}
                switchLabel={t.login.signUp}
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
                        className={inputClass}
                    />
                    <input
                        type="password"
                        required
                        autoComplete="current-password"
                        aria-label={t.password}
                        placeholder={t.password}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={inputClass}
                    />
                    <Button type="submit" fullWidth disabled={submitting} className="mt-2">
                        {t.login.submit}
                    </Button>
                </form>
            </AuthShell>
            <ToastViewport toasts={toasts} onDismiss={dismiss} />
        </>
    );
}
