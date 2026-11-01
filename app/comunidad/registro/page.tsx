'use client';

import { useState } from 'react';
import { AuthShell } from '@/components/auth/AuthShell';
import { Button } from '@/components/ui/Button';
import { inputClass } from '@/components/ui/inputStyles';
import { ToastViewport, useToasts } from '@/components/ui/Toast';
import { authContent } from '@/lib/content/authContent';
import { useLang } from '@/lib/hooks/useLang';
import { useRedirectIfLoggedIn } from '@/lib/hooks/useRedirectIfLoggedIn';
import { useUsernameAvailability, type UsernameStatus } from '@/lib/hooks/useUsernameAvailability';
import { supabase } from '@/lib/supabaseClient';
import { authErrorMessage, normalizeUsername } from '@/lib/validation';

export default function RegistroPage() {
    const [lang, setLang] = useLang();
    const { toasts, push, dismiss } = useToasts();
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);
    const t = authContent[lang];
    const s = t.signup;
    const usernameStatus = useUsernameAvailability(username);
    useRedirectIfLoggedIn();

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
                push(authErrorMessage(error.message, lang), 'error');
                return;
            }
            if (data?.user && data.user.identities && data.user.identities.length === 0) {
                push(s.emailTaken, 'error');
                return;
            }
            setDone(true);
        } finally {
            setSubmitting(false);
        }
    };

    const statusMessage: Record<UsernameStatus, { text: string; tone: string } | null> = {
        idle: null,
        invalid: { text: s.usernameInvalid, tone: 'text-[var(--color-accent-2)]' },
        checking: { text: s.usernameChecking, tone: 'text-[var(--color-text-faint)]' },
        available: { text: s.usernameAvailable, tone: 'text-[var(--color-accent-4-text)]' },
        taken: { text: s.usernameTaken, tone: 'text-[var(--color-danger-text)]' },
    };
    const status = statusMessage[usernameStatus];

    return (
        <>
            <AuthShell
                lang={lang}
                onLangChange={setLang}
                backLabel={t.back}
                tagline={s.tagline}
                switchText={s.hasAccount}
                switchLabel={s.signIn}
                switchHref="/comunidad/entrar"
            >
                {done ? (
                    <div className="text-center">
                        <div className="panel-sm w-14 h-14 mx-auto mb-5 rounded-full bg-[var(--color-accent-4)] text-white flex items-center justify-center text-2xl font-bold" aria-hidden="true">✓</div>
                        <h1 className="font-display text-3xl font-bold mb-2">{s.doneTitle}</h1>
                        <p className="text-sm text-[var(--color-text-muted)] mb-6">{s.doneDesc}</p>
                        <Button href="/comunidad/entrar" fullWidth>
                            {s.goLogin}
                        </Button>
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
                            className={inputClass}
                        />
                        <input
                            type="text"
                            required
                            maxLength={60}
                            autoComplete="name"
                            aria-label={s.fullName}
                            placeholder={s.fullName}
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className={inputClass}
                        />
                        <div>
                            <input
                                type="text"
                                required
                                maxLength={30}
                                autoComplete="username"
                                autoCapitalize="none"
                                spellCheck={false}
                                aria-label={s.username}
                                placeholder={s.username}
                                value={username}
                                onChange={(e) => setUsername(normalizeUsername(e.target.value))}
                                className={inputClass}
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
                                className={inputClass}
                            />
                            <p className="text-xs mt-1.5 text-[var(--color-text-faint)]">{s.passwordHint}</p>
                        </div>
                        <Button
                            type="submit"
                            fullWidth
                            disabled={submitting || usernameStatus === 'invalid' || usernameStatus === 'taken'}
                            className="mt-2"
                        >
                            {s.submit}
                        </Button>
                        <p className="text-xs text-[var(--color-text-faint)] text-center leading-relaxed mt-2">{s.terms}</p>
                    </form>
                )}
            </AuthShell>
            <ToastViewport toasts={toasts} onDismiss={dismiss} />
        </>
    );
}
