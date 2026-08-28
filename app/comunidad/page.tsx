'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useToasts, ToastViewport } from '@/components/ui/Toast';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

type Like = { user_id: string };
type Post = {
    id: string;
    title: string;
    image_url: string;
    instagram_handle: string | null;
    instagram_url: string | null;
    user_id: string;
    created_at: string;
    post_likes: Like[];
};
type AppUser = {
    id: string;
    email?: string;
    user_metadata?: { instagram_handle?: string };
};

function buildUploadFileName(originalName: string): string {
    const ext = originalName.split('.').pop() || 'jpg';
    return `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;
}

const AVATAR_COLORS = ['var(--color-accent)', 'var(--color-accent-2)', 'var(--color-accent-3)', 'var(--color-accent-4)'];

/** Color determinista para el avatar, derivado del handle (mismo usuario = mismo color siempre). */
function avatarColorFor(handle: string): string {
    let hash = 0;
    for (let i = 0; i < handle.length; i++) hash = (hash * 31 + handle.charCodeAt(i)) >>> 0;
    return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

const TITLE_MAX_LENGTH = 280;
const HANDLE_MAX_LENGTH = 30;
const URL_MAX_LENGTH = 200;

export default function ComunidadPage() {
    const [lang, setLang] = useState<'es' | 'en'>('es');
    const { toasts, push, dismiss } = useToasts();

    // Mantiene el atributo lang del documento sincronizado con el selector ES/EN.
    useEffect(() => {
        document.documentElement.lang = lang;
    }, [lang]);

    const [posts, setPosts] = useState<Post[]>([]);
    const [feedLoading, setFeedLoading] = useState(true);
    const [user, setUser] = useState<AppUser | null>(null);
    const [filterMyPosts, setFilterMyPosts] = useState(false);
    const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');

    // Estados para Registro / Login
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [instagramHandle, setInstagramHandle] = useState('');
    const [authSubmitting, setAuthSubmitting] = useState(false);

    // Estados del Formulario del Foro
    const [newPostTitle, setNewPostTitle] = useState('');
    const [newPostInstagramUrl, setNewPostInstagramUrl] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    // Estados para Edición
    const [editingPostId, setEditingPostId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');

    // Estado para el diálogo de confirmación de borrado
    const [pendingDelete, setPendingDelete] = useState<{ id: string; imageUrl: string } | null>(null);

    const content = {
        es: {
            volver: '← Volver al inicio',
            foro: 'Foro Comunidad',
            connectedAs: 'Conectado como',
            logout: 'Cerrar sesión',
            newPostTitle: 'Nueva publicación',
            placeholder: '¿Qué diorama o creación quieres compartir hoy?',
            instagramUrlPlaceholder: 'URL de tu perfil de Instagram (ej. https://instagram.com/tu_usuario)',
            publishBtn: 'Publicar',
            publishingBtn: 'Publicando…',
            feedTitle: 'Feed en directo',
            filterAll: 'Todas',
            filterMine: 'Mis publicaciones',
            sortRecent: 'Recientes',
            sortPopular: 'Más gustados',
            noPosts: 'Aún no hay publicaciones en el foro.',
            edit: 'Editar',
            delete: 'Borrar',
            save: 'Guardar',
            cancel: 'Cancelar',
            confirmDeleteTitle: '¿Eliminar esta publicación?',
            confirmDeleteDesc: 'Esta acción no se puede deshacer.',
            mustLoginLike: 'Debes iniciar sesión para dar "Me gusta".',
            mustLogin: 'Debes iniciar sesión.',
            fillForm: 'Completa el mensaje y selecciona una imagen.',
            badFormat: 'Formato no permitido. Usa JPG, PNG, WEBP o GIF.',
            tooLarge: (mb: number) => `La imagen supera los ${mb}MB permitidos.`,
            emailTaken: 'Este correo ya está registrado.',
            signUpOk: '¡Registro exitoso! Revisa tu correo.',
            auth: {
                signInTitle: 'Iniciar sesión en el foro',
                signUpTitle: 'Crear una cuenta',
                signInDesc: 'Inicia sesión con tu cuenta para poder publicar y dar like.',
                signUpDesc: 'Regístrate para unirte a la comunidad y compartir tus fotos.',
                handlePlaceholder: 'Tu usuario de Instagram (ej. @tu_cuenta)',
                emailPlaceholder: 'Correo electrónico',
                passwordPlaceholder: 'Contraseña',
                toSignUp: '¿No tienes cuenta? Regístrate',
                toSignIn: '¿Ya tienes cuenta? Inicia sesión',
                loginBtn: 'Entrar',
                registerBtn: 'Registrarse',
            }
        },
        en: {
            volver: '← Back to home',
            foro: 'Community Forum',
            connectedAs: 'Logged in as',
            logout: 'Log out',
            newPostTitle: 'New post',
            placeholder: 'What diorama or creation do you want to share today?',
            instagramUrlPlaceholder: 'Your Instagram profile URL (e.g. https://instagram.com/your_account)',
            publishBtn: 'Post',
            publishingBtn: 'Posting…',
            feedTitle: 'Live feed',
            filterAll: 'All',
            filterMine: 'My posts',
            sortRecent: 'Recent',
            sortPopular: 'Most liked',
            noPosts: 'No posts in the forum yet.',
            edit: 'Edit',
            delete: 'Delete',
            save: 'Save',
            cancel: 'Cancel',
            confirmDeleteTitle: 'Delete this post?',
            confirmDeleteDesc: 'This action cannot be undone.',
            mustLoginLike: 'You must log in to like posts.',
            mustLogin: 'You must log in.',
            fillForm: 'Complete the message and select an image.',
            badFormat: 'Unsupported format. Use JPG, PNG, WEBP or GIF.',
            tooLarge: (mb: number) => `The image exceeds the ${mb}MB limit.`,
            emailTaken: 'This email is already registered.',
            signUpOk: 'Registration successful! Check your email.',
            auth: {
                signInTitle: 'Sign in to the forum',
                signUpTitle: 'Create an account',
                signInDesc: 'Sign in with your account to post and like.',
                signUpDesc: 'Register to join the community and share your photos.',
                handlePlaceholder: 'Your Instagram handle (e.g. @your_account)',
                emailPlaceholder: 'Email address',
                passwordPlaceholder: 'Password',
                toSignUp: "Don't have an account? Register",
                toSignIn: 'Already have an account? Sign in',
                loginBtn: 'Sign in',
                registerBtn: 'Register',
            }
        }
    };

    const t = content[lang];

    const loadCommunityPosts = async () => {
        try {
            const { data, error } = await supabase
                .from('community_posts')
                .select(`
                    *,
                    post_likes (
                        user_id
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) setPosts(data as Post[]);
        } catch (err) {
            console.error('Error cargando comunidad:', err);
        } finally {
            setFeedLoading(false);
        }
    };

    useEffect(() => {
        async function checkUser() {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
        }
        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        // Carga inicial del feed al montar. La regla experimental
        // `react-hooks/set-state-in-effect` (nueva en Next 16, aún inestable)
        // marca este patrón estándar de "fetch on mount"; es intencional.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadCommunityPosts();
        return () => subscription.unsubscribe();
    }, []);

    // Feed en vivo: cuando alguien publica, edita, borra o da like, el feed se
    // refresca solo para todos los que tengan la página abierta. Requiere que
    // "community_posts" y "post_likes" tengan Realtime activado en Supabase
    // (Database → Replication) — ver supabase/rls-policies.sql.
    useEffect(() => {
        const channel = supabase
            .channel('community-feed')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'community_posts' }, () => {
                loadCommunityPosts();
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'post_likes' }, () => {
                loadCommunityPosts();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleToggleLike = async (postId: string, currentLikes: Like[]) => {
        if (!user) {
            push(t.mustLoginLike, 'info');
            return;
        }

        const hasLiked = currentLikes.some((like) => like.user_id === user.id);

        try {
            if (hasLiked) {
                const { error } = await supabase
                    .from('post_likes')
                    .delete()
                    .eq('post_id', postId)
                    .eq('user_id', user.id);

                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('post_likes')
                    .insert([{ post_id: postId, user_id: user.id }]);

                if (error) throw error;
            }

            await loadCommunityPosts();
        } catch (err) {
            console.error('Error al actualizar like:', err);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthSubmitting(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                email: email.trim(),
                password,
                options: { data: { instagram_handle: instagramHandle.trim() } }
            });

            if (error) {
                push(error.message, 'error');
                return;
            }

            if (data?.user && data.user.identities && data.user.identities.length === 0) {
                push(t.emailTaken, 'error');
            } else {
                push(t.signUpOk, 'success');
                setIsSignUp(false);
            }
        } finally {
            setAuthSubmitting(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthSubmitting(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
            if (error) {
                push(error.message, 'error');
            } else {
                setEmail('');
                setPassword('');
            }
        } finally {
            setAuthSubmitting(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setFilterMyPosts(false);
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            push(t.mustLogin, 'info');
            return;
        }
        if (!newPostTitle.trim() || !file) {
            push(t.fillForm, 'info');
            return;
        }

        const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        const MAX_FILE_SIZE_MB = 8;
        if (!ALLOWED_TYPES.includes(file.type)) {
            push(t.badFormat, 'error');
            return;
        }
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            push(t.tooLarge(MAX_FILE_SIZE_MB), 'error');
            return;
        }

        setLoading(true);
        try {
            const fileName = buildUploadFileName(file.name);

            const { error: storageError } = await supabase.storage
                .from('foro-fotos')
                .upload(fileName, file);

            if (storageError) throw storageError;

            const { data: { publicUrl } } = supabase.storage
                .from('foro-fotos')
                .getPublicUrl(fileName);

            const authorHandle = user.user_metadata?.instagram_handle || user.email?.split('@')[0] || 'anon';

            const { error: dbError } = await supabase
                .from('community_posts')
                .insert([
                    {
                        title: newPostTitle.trim(),
                        image_url: publicUrl,
                        instagram_handle: authorHandle.startsWith('@') ? authorHandle : '@' + authorHandle,
                        instagram_url: newPostInstagramUrl.trim() || null,
                        user_id: user.id,
                    },
                ]);

            if (dbError) throw dbError;

            setNewPostTitle('');
            setNewPostInstagramUrl('');
            setFile(null);
            await loadCommunityPosts();
        } catch (error) {
            console.error('Error al subir:', error);
            push(error instanceof Error ? error.message : 'Error desconocido', 'error');
        } finally {
            setLoading(false);
        }
    };

    const requestDelete = (postId: string, imageUrl: string) => setPendingDelete({ id: postId, imageUrl });

    const confirmDelete = async () => {
        if (!pendingDelete) return;
        const { id: postId, imageUrl } = pendingDelete;
        setPendingDelete(null);

        try {
            const { error: dbError } = await supabase
                .from('community_posts')
                .delete()
                .eq('id', postId);

            if (dbError) throw dbError;

            const fileName = imageUrl.split('/').pop()?.split('?')[0];
            if (fileName) {
                await supabase.storage.from('foro-fotos').remove([fileName]);
            }

            await loadCommunityPosts();
        } catch (err) {
            console.error('Error al eliminar:', err);
            push(err instanceof Error ? err.message : 'Error desconocido', 'error');
        }
    };

    const handleEdit = async (postId: string) => {
        if (!editText.trim()) return;

        try {
            const { error } = await supabase
                .from('community_posts')
                .update({ title: editText.trim() })
                .eq('id', postId);

            if (error) throw error;

            setEditingPostId(null);
            setEditText('');
            await loadCommunityPosts();
        } catch (err) {
            console.error('Error al editar:', err);
            push(err instanceof Error ? err.message : 'Error desconocido', 'error');
        }
    };

    const displayedPosts = posts
        .filter(post => {
            if (filterMyPosts && user) {
                return post.user_id === user.id;
            }
            return true;
        })
        .slice()
        .sort((a, b) => {
            if (sortBy === 'popular') {
                return (b.post_likes?.length || 0) - (a.post_likes?.length || 0);
            }
            return 0; // ya vienen ordenados por fecha desde la consulta
        });

    const inputClass = "bg-[var(--color-ink)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm text-[var(--color-text)] font-medium focus:outline-none focus:border-[var(--color-accent)] transition-colors placeholder:text-[var(--color-text-faint)]";

    return (
        <main className="min-h-screen text-[var(--color-text)] font-sans relative z-0">
            <header className="sticky top-0 z-40 bg-[var(--color-ink)]/85 backdrop-blur-md border-b border-[var(--color-border)] px-6 py-4">
                <div className="max-w-2xl mx-auto flex justify-between items-center">
                    <Link href="/" className="text-xs font-semibold uppercase text-[var(--color-accent)] tracking-wider hover:underline">
                        {t.volver}
                    </Link>

                    <div className="flex items-center gap-4">
                        <span className="font-semibold text-xs uppercase tracking-widest text-[var(--color-text-muted)] hidden sm:inline">{t.foro}</span>
                        <div className="flex items-center gap-1 bg-[var(--color-surface)] p-1 rounded-full border border-[var(--color-border)]">
                            <button onClick={() => setLang('es')} className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${lang === 'es' ? 'bg-[var(--color-accent)] text-[var(--color-accent-ink)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}>ES</button>
                            <button onClick={() => setLang('en')} className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${lang === 'en' ? 'bg-[var(--color-accent)] text-[var(--color-accent-ink)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}>EN</button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-2xl mx-auto px-4 py-10">

                {!user ? (
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 mb-8"
                    >
                        <h2 className="font-display text-lg font-semibold tracking-tight text-[var(--color-text)] mb-2">
                            {isSignUp ? t.auth.signUpTitle : t.auth.signInTitle}
                        </h2>
                        <p className="text-sm text-[var(--color-text-muted)] mb-6">
                            {isSignUp ? t.auth.signUpDesc : t.auth.signInDesc}
                        </p>

                        <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="flex flex-col gap-4">
                            {isSignUp && (
                                <input
                                    type="text"
                                    required
                                    maxLength={HANDLE_MAX_LENGTH}
                                    placeholder={t.auth.handlePlaceholder}
                                    value={instagramHandle}
                                    onChange={(e) => setInstagramHandle(e.target.value)}
                                    className={inputClass}
                                />
                            )}
                            <input
                                type="email"
                                required
                                autoComplete="email"
                                placeholder={t.auth.emailPlaceholder}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={inputClass}
                            />
                            <input
                                type="password"
                                required
                                minLength={6}
                                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                                placeholder={t.auth.passwordPlaceholder}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={inputClass}
                            />

                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsSignUp(!isSignUp)}
                                    className="text-xs text-[var(--color-accent)] font-semibold hover:underline"
                                >
                                    {isSignUp ? t.auth.toSignIn : t.auth.toSignUp}
                                </button>
                                <motion.button
                                    whileHover={{ y: -2 }}
                                    whileTap={{ y: 1 }}
                                    type="submit"
                                    disabled={authSubmitting}
                                    className="w-full sm:w-auto bg-[var(--color-accent)] text-[var(--color-accent-ink)] font-bold px-6 py-3 rounded-full text-xs uppercase tracking-wider hover:brightness-110 transition disabled:opacity-50"
                                >
                                    {isSignUp ? t.auth.registerBtn : t.auth.loginBtn}
                                </motion.button>
                            </div>
                        </form>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 mb-8"
                    >
                        <div className="flex justify-between items-center mb-5">
                            <span className="text-xs font-semibold text-[var(--color-accent)] uppercase tracking-wide">
                                {t.connectedAs} {user.user_metadata?.instagram_handle || user.email?.split('@')[0]}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="text-[10px] font-bold uppercase bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] px-3 py-1.5 rounded-full border border-[var(--color-border)]"
                            >
                                {t.logout}
                            </button>
                        </div>

                        <h2 className="font-display text-lg font-semibold tracking-tight text-[var(--color-text)] mb-4">{t.newPostTitle}</h2>
                        <form onSubmit={handleUpload} className="flex flex-col gap-4">
                            <textarea
                                required
                                rows={3}
                                maxLength={TITLE_MAX_LENGTH}
                                placeholder={t.placeholder}
                                value={newPostTitle}
                                onChange={(e) => setNewPostTitle(e.target.value)}
                                className={`${inputClass} resize-none`}
                            />
                            <div className="text-right text-[10px] text-[var(--color-text-faint)] -mt-2">
                                {newPostTitle.length}/{TITLE_MAX_LENGTH}
                            </div>
                            <input
                                type="url"
                                maxLength={URL_MAX_LENGTH}
                                placeholder={t.instagramUrlPlaceholder}
                                value={newPostInstagramUrl}
                                onChange={(e) => setNewPostInstagramUrl(e.target.value)}
                                className={inputClass}
                            />
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    required
                                    onChange={(e) => e.target.files && setFile(e.target.files[0])}
                                    className="w-full sm:w-auto text-[var(--color-text-muted)] border border-[var(--color-border)] rounded-xl px-4 py-2 text-xs font-medium file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[var(--color-accent)] file:text-[var(--color-accent-ink)] hover:file:cursor-pointer hover:file:brightness-110"
                                />
                                <motion.button
                                    whileHover={{ y: -2 }}
                                    whileTap={{ y: 1 }}
                                    type="submit"
                                    disabled={loading}
                                    className="w-full sm:w-auto bg-[var(--color-accent-3)] text-white font-bold px-6 py-3 rounded-full text-xs uppercase tracking-wider hover:brightness-110 transition disabled:opacity-50"
                                >
                                    {loading ? t.publishingBtn : t.publishBtn}
                                </motion.button>
                            </div>
                        </form>
                    </motion.div>
                )}

                <div className="space-y-4">
                    <div className="flex flex-wrap justify-between items-center gap-3 mb-2">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-faint)] flex items-center gap-2">
                            {t.feedTitle}
                            <span className="relative flex h-2 w-2" title="En vivo">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-accent-4)] opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-accent-4)]" />
                            </span>
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            <div className="flex gap-1 bg-[var(--color-surface)] p-1 rounded-full border border-[var(--color-border)]">
                                <button
                                    onClick={() => setSortBy('recent')}
                                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${sortBy === 'recent' ? 'bg-[var(--color-accent-3)] text-white' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}
                                >
                                    {t.sortRecent}
                                </button>
                                <button
                                    onClick={() => setSortBy('popular')}
                                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${sortBy === 'popular' ? 'bg-[var(--color-accent-3)] text-white' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}
                                >
                                    {t.sortPopular}
                                </button>
                            </div>
                            {user && (
                                <div className="flex gap-1 bg-[var(--color-surface)] p-1 rounded-full border border-[var(--color-border)]">
                                    <button
                                        onClick={() => setFilterMyPosts(false)}
                                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${!filterMyPosts ? 'bg-[var(--color-accent)] text-[var(--color-accent-ink)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}
                                    >
                                        {t.filterAll}
                                    </button>
                                    <button
                                        onClick={() => setFilterMyPosts(true)}
                                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${filterMyPosts ? 'bg-[var(--color-accent)] text-[var(--color-accent-ink)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}
                                    >
                                        {t.filterMine}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {feedLoading ? (
                        <div className="space-y-4" aria-hidden="true">
                            {[0, 1, 2].map((i) => (
                                <div key={i} className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 flex flex-col gap-3">
                                    <div className="h-4 w-32 rounded-full animate-shimmer" />
                                    <div className="h-4 w-full rounded-full animate-shimmer" />
                                    <div className="h-48 w-full rounded-xl animate-shimmer" />
                                </div>
                            ))}
                        </div>
                    ) : displayedPosts.length === 0 ? (
                        <div className="text-center py-16 bg-[var(--color-surface)] border border-dashed border-[var(--color-border)] rounded-2xl text-[var(--color-text-muted)] font-medium text-sm">
                            {t.noPosts}
                        </div>
                    ) : (
                        displayedPosts.map((post, index) => {
                            const likes = post.post_likes || [];
                            const hasLiked = user ? likes.some((l) => l.user_id === user.id) : false;

                            return (
                                <motion.div
                                    key={post.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: Math.min(index, 8) * 0.05 }}
                                    className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 flex flex-col gap-3"
                                >
                                    <div className="flex items-center justify-between flex-wrap gap-y-2">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div
                                                className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-[11px] font-black text-[#14100a]"
                                                style={{ background: avatarColorFor(post.instagram_handle || 'anon') }}
                                                aria-hidden="true"
                                            >
                                                {(post.instagram_handle || 'A').replace('@', '').charAt(0).toUpperCase()}
                                            </div>
                                            {post.instagram_url ? (
                                                <a
                                                    href={post.instagram_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-bold text-xs text-[var(--color-accent)] uppercase tracking-wide hover:underline flex items-center gap-1 truncate"
                                                >
                                                    <span className="truncate">{post.instagram_handle || 'Anónimo'}</span> ↗
                                                </a>
                                            ) : (
                                                <span className="font-bold text-xs text-[var(--color-accent)] uppercase tracking-wide truncate">
                                                    {post.instagram_handle || 'Anónimo'}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3 shrink-0">
                                            {user?.id === post.user_id && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditingPostId(post.id);
                                                            setEditText(post.title);
                                                        }}
                                                        className="text-[10px] bg-[var(--color-surface-2)] text-[var(--color-accent)] hover:brightness-110 px-2.5 py-1 rounded-full font-bold uppercase border border-[var(--color-border)] tracking-wider transition-colors"
                                                    >
                                                        {t.edit}
                                                    </button>
                                                    <button
                                                        onClick={() => requestDelete(post.id, post.image_url)}
                                                        className="text-[10px] bg-[var(--color-accent-2)]/10 text-[var(--color-accent-2)] hover:bg-[var(--color-accent-2)]/20 px-2.5 py-1 rounded-full font-bold uppercase border border-[var(--color-accent-2)]/30 tracking-wider transition-colors"
                                                    >
                                                        {t.delete}
                                                    </button>
                                                </div>
                                            )}
                                            <span className="text-[10px] text-[var(--color-text-faint)] font-semibold">
                                                {new Date(post.created_at).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {editingPostId === post.id ? (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="flex flex-col gap-2 mt-2"
                                            >
                                                <textarea
                                                    rows={2}
                                                    maxLength={TITLE_MAX_LENGTH}
                                                    value={editText}
                                                    onChange={(e) => setEditText(e.target.value)}
                                                    className={`${inputClass} resize-none`}
                                                />
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => handleEdit(post.id)}
                                                        className="bg-[var(--color-accent-4)] hover:brightness-110 text-white font-bold px-3 py-1.5 rounded-full text-[10px] uppercase transition-all"
                                                    >
                                                        {t.save}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditingPostId(null);
                                                            setEditText('');
                                                        }}
                                                        className="bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] text-[var(--color-text)] font-bold px-3 py-1.5 rounded-full text-[10px] uppercase border border-[var(--color-border)] transition-colors"
                                                    >
                                                        {t.cancel}
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <p className="text-sm font-medium text-[var(--color-text)] leading-relaxed">{post.title}</p>
                                        )}
                                    </AnimatePresence>

                                    {post.image_url && (
                                        <div className="rounded-xl overflow-hidden border border-[var(--color-border)] bg-black mt-2 flex justify-center items-center">
                                            <Image
                                                src={post.image_url}
                                                alt="Foto publicada por el usuario"
                                                width={0}
                                                height={0}
                                                sizes="(max-width: 640px) 100vw, 600px"
                                                className="w-full h-auto max-h-[600px] object-contain"
                                            />
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 pt-2 border-t border-[var(--color-border)] mt-1">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 1.3 }}
                                            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                                            onClick={() => handleToggleLike(post.id, likes)}
                                            aria-pressed={hasLiked}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${hasLiked
                                                ? 'bg-[var(--color-accent-2)]/10 text-[var(--color-accent-2)] border-[var(--color-accent-2)]/30'
                                                : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:text-[var(--color-text)]'
                                                }`}
                                        >
                                            <motion.span
                                                key={hasLiked ? 'liked' : 'unliked'}
                                                initial={{ scale: 0.6 }}
                                                animate={{ scale: 1 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                {hasLiked ? '❤️' : '🤍'}
                                            </motion.span>
                                            <span>{likes.length}</span>
                                        </motion.button>
                                    </div>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>

            <ConfirmDialog
                open={!!pendingDelete}
                title={t.confirmDeleteTitle}
                description={t.confirmDeleteDesc}
                confirmLabel={t.delete}
                cancelLabel={t.cancel}
                onConfirm={confirmDelete}
                onCancel={() => setPendingDelete(null)}
            />
            <ToastViewport toasts={toasts} onDismiss={dismiss} />
        </main>
    );
}
