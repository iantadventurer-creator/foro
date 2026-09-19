'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useToasts, ToastViewport } from '@/components/ui/Toast';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { FilterPill } from '@/components/ui/FilterPill';
import { CATEGORY_KEYS, formatCategoryLabel, getCategoryTheme } from '@/lib/categoryThemes';
import { useModal } from '@/lib/useModal';
import { type Like, type Post, avatarColorFor } from '@/lib/community';
import { PostCard } from '@/components/community/PostCard';

type AppUser = {
    id: string;
    email?: string;
    user_metadata?: { instagram_handle?: string };
};

function buildUploadFileName(originalName: string): string {
    const ext = originalName.split('.').pop() || 'jpg';
    return `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;
}

const TITLE_MAX_LENGTH = 280;
const HANDLE_MAX_LENGTH = 30;
const URL_MAX_LENGTH = 200;

export default function ComunidadPage() {
    const router = useRouter();
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
    const [filterCategory, setFilterCategory] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
    const [showUploadModal, setShowUploadModal] = useState(false);

    // Permite enlazar directo a una publicación (?post=<id>) o abrir el
    // formulario de publicar (?publish=1) — así el perfil, la actividad y
    // la barra de navegación inferior pueden abrir estos modales de esta
    // misma página en vez de duplicar toda su lógica. Se lee con la API del
    // navegador en vez de useSearchParams para no forzar esta página a
    // salir del prerenderizado estático (useSearchParams exige un límite
    // de Suspense).
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const postId = params.get('post');
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (postId) setSelectedPostId(postId);
        if (params.get('publish') === '1') setShowUploadModal(true);
    }, []);

    const openPost = (postId: string) => {
        setSelectedPostId(postId);
        router.replace(`/comunidad?post=${postId}`, { scroll: false });
    };

    // Estados para Registro / Login
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [instagramHandle, setInstagramHandle] = useState('');
    const [authSubmitting, setAuthSubmitting] = useState(false);

    // Estados del Formulario del Foro
    const [newPostTitle, setNewPostTitle] = useState('');
    const [newPostInstagramUrl, setNewPostInstagramUrl] = useState('');
    const [newPostCategory, setNewPostCategory] = useState<string | null>(null);
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
            pageTitle: 'Comunidad',
            pageSubtitle: 'Comparte tus propias creaciones LEGO y descubre las de otros fans.',
            connectedAs: 'Conectado como',
            logout: 'Cerrar sesión',
            newPostTitle: 'Nueva publicación',
            placeholder: '¿Qué diorama o creación quieres compartir hoy?',
            instagramUrlPlaceholder: 'URL de tu perfil de Instagram (ej. https://instagram.com/tu_usuario)',
            categoryLabel: 'Categoría (opcional)',
            publishBtn: 'Publicar',
            publishingBtn: 'Publicando…',
            filterAll: 'Todo',
            filterMine: 'Mis publicaciones',
            sortRecent: 'Recientes',
            sortPopular: 'Más gustados',
            noPosts: 'Aún no hay publicaciones en el foro.',
            noResultsFilter: 'No hay publicaciones que coincidan con este filtro.',
            edit: 'Editar',
            delete: 'Borrar',
            save: 'Guardar',
            cancel: 'Cancelar',
            close: 'Cerrar',
            confirmDeleteTitle: '¿Eliminar esta publicación?',
            confirmDeleteDesc: 'Esta acción no se puede deshacer.',
            mustLoginLike: 'Debes iniciar sesión para dar "Me gusta".',
            mustLogin: 'Debes iniciar sesión.',
            fillForm: 'Completa el mensaje y selecciona una imagen.',
            badFormat: 'Formato no permitido. Usa JPG, PNG, WEBP o GIF.',
            tooLarge: (mb: number) => `La imagen supera los ${mb}MB permitidos.`,
            emailTaken: 'Este correo ya está registrado.',
            signUpOk: '¡Registro exitoso! Revisa tu correo.',
            anonymous: 'Anónimo',
            viewProfile: 'Ver perfil',
            activity: 'Actividad',
            profile: 'Mi perfil',
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
            pageTitle: 'Community',
            pageSubtitle: 'Share your own LEGO creations and discover other fans’.',
            connectedAs: 'Logged in as',
            logout: 'Log out',
            newPostTitle: 'New post',
            placeholder: 'What diorama or creation do you want to share today?',
            instagramUrlPlaceholder: 'Your Instagram profile URL (e.g. https://instagram.com/your_account)',
            categoryLabel: 'Category (optional)',
            publishBtn: 'Post',
            publishingBtn: 'Posting…',
            filterAll: 'All',
            filterMine: 'My posts',
            sortRecent: 'Recent',
            sortPopular: 'Most liked',
            noPosts: 'No posts in the forum yet.',
            noResultsFilter: 'No posts match this filter.',
            edit: 'Edit',
            delete: 'Delete',
            save: 'Save',
            cancel: 'Cancel',
            close: 'Close',
            confirmDeleteTitle: 'Delete this post?',
            confirmDeleteDesc: 'This action cannot be undone.',
            mustLoginLike: 'You must log in to like posts.',
            mustLogin: 'You must log in.',
            fillForm: 'Complete the message and select an image.',
            badFormat: 'Unsupported format. Use JPG, PNG, WEBP or GIF.',
            tooLarge: (mb: number) => `The image exceeds the ${mb}MB limit.`,
            emailTaken: 'This email is already registered.',
            signUpOk: 'Registration successful! Check your email.',
            anonymous: 'Anonymous',
            viewProfile: 'View profile',
            activity: 'Activity',
            profile: 'My profile',
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
                        category: newPostCategory,
                        user_id: user.id,
                    },
                ]);

            if (dbError) {
                // La foto ya se subió a Storage pero la publicación falló:
                // se borra para no dejar archivos huérfanos en el bucket.
                await supabase.storage.from('foro-fotos').remove([fileName]);
                throw dbError;
            }

            setNewPostTitle('');
            setNewPostInstagramUrl('');
            setNewPostCategory(null);
            setFile(null);
            closeUploadModal();
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
        setSelectedPostId((current) => (current === postId ? null : current));

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
            if (filterMyPosts && user && post.user_id !== user.id) return false;
            if (filterCategory && post.category !== filterCategory) return false;
            return true;
        })
        .slice()
        .sort((a, b) => {
            if (sortBy === 'popular') {
                return (b.post_likes?.length || 0) - (a.post_likes?.length || 0);
            }
            return 0; // ya vienen ordenados por fecha desde la consulta
        });

    // El modal siempre muestra la versión más fresca del post (no la foto
    // congelada del momento en que se abrió), para que el contador de likes
    // se actualice en vivo si alguien más le da like mientras está abierto.
    const selectedPost = selectedPostId ? posts.find((p) => p.id === selectedPostId) ?? null : null;
    const closeModal = useCallback(() => {
        setSelectedPostId(null);
        router.replace('/comunidad', { scroll: false });
    }, [router]);
    const { closeButtonRef, handleBackdropClick } = useModal(!!selectedPost, closeModal);

    const closeUploadModal = useCallback(() => {
        setShowUploadModal(false);
        router.replace('/comunidad', { scroll: false });
    }, [router]);
    const { closeButtonRef: uploadCloseButtonRef, handleBackdropClick: handleUploadBackdropClick } = useModal(showUploadModal, closeUploadModal);
    const modalTheme = getCategoryTheme(selectedPost?.category ?? null);

    const inputClass = "bg-[var(--color-ink)] border border-[var(--color-border)] rounded-xl px-4 py-3 text-sm text-[var(--color-text)] font-medium focus:outline-none focus:border-[var(--color-accent)] transition-colors placeholder:text-[var(--color-text-faint)]";

    return (
        <main className="min-h-screen text-[var(--color-text)] font-sans relative z-0">
            <header className="sticky top-0 z-40 bg-[var(--color-ink)]/85 backdrop-blur-md border-b border-[var(--color-border)] px-6 py-4">
                <div className="max-w-6xl mx-auto grid grid-cols-3 items-center">
                    <Link href="/" className="justify-self-start text-xs font-semibold uppercase text-[var(--color-accent)] tracking-wider hover:underline">
                        {t.volver}
                    </Link>

                    <nav className="hidden md:flex justify-self-center items-center gap-5 text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                        <Link href="/comunidad/actividad" className="hover:text-[var(--color-text)] transition-colors">
                            {t.activity}
                        </Link>
                        {user && (
                            <motion.button
                                whileHover={{ y: -2 }}
                                whileTap={{ y: 2 }}
                                onClick={() => setShowUploadModal(true)}
                                className="font-button uppercase tracking-wider bg-[var(--color-accent-3)] text-white text-xs px-5 py-2 rounded-full shadow-[0_4px_0_0_var(--shadow-accent-3)] hover:brightness-110 transition-[filter]"
                            >
                                {t.publishBtn}
                            </motion.button>
                        )}
                        {user && (
                            <Link href={`/comunidad/u/${user.id}`} className="hover:text-[var(--color-text)] transition-colors">
                                {t.profile}
                            </Link>
                        )}
                    </nav>

                    <div className="justify-self-end flex items-center gap-4">
                        {user && (
                            <button
                                onClick={handleLogout}
                                className="hidden sm:inline text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-faint)] hover:text-[var(--color-text-muted)] transition-colors"
                            >
                                {t.logout}
                            </button>
                        )}
                        <div className="flex items-center gap-1 bg-[var(--color-surface)] p-1 rounded-full border border-[var(--color-border)]">
                            <button onClick={() => setLang('es')} className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${lang === 'es' ? 'bg-[var(--color-accent)] text-[var(--color-accent-ink)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}>ES</button>
                            <button onClick={() => setLang('en')} className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${lang === 'en' ? 'bg-[var(--color-accent)] text-[var(--color-accent-ink)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}>EN</button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-2xl mx-auto px-4 pt-12">
                <div className="mb-10 text-center">
                    <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-[var(--color-text)]">{t.pageTitle}</h1>
                    <p className="text-sm text-[var(--color-text-muted)] mt-1">{t.pageSubtitle}</p>
                </div>

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
                ) : null}
            </div>

            {/* MODAL DE PUBLICAR */}
            <AnimatePresence>
                {showUploadModal && user && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleUploadBackdropClick}
                        role="dialog"
                        aria-modal="true"
                        aria-label={t.newPostTitle}
                        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 16, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.95, y: 16, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6"
                        >
                            <div className="flex justify-between items-center mb-5">
                                <h2 className="font-display text-lg font-semibold tracking-tight text-[var(--color-text)]">{t.newPostTitle}</h2>
                                <button
                                    ref={uploadCloseButtonRef}
                                    onClick={closeUploadModal}
                                    aria-label={t.close}
                                    className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text)] bg-[var(--color-surface-2)] border border-[var(--color-border)]"
                                >
                                    ✕
                                </button>
                            </div>
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

                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-faint)] block mb-2">{t.categoryLabel}</span>
                                    <div className="flex flex-wrap gap-2">
                                        {CATEGORY_KEYS.map((key) => (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => setNewPostCategory((prev) => (prev === key ? null : key))}
                                                style={
                                                    newPostCategory === key
                                                        ? { background: getCategoryTheme(key)!.accent, color: getCategoryTheme(key)!.ink, borderColor: getCategoryTheme(key)!.accent }
                                                        : undefined
                                                }
                                                className={`px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide border transition-colors ${newPostCategory === key
                                                    ? ''
                                                    : 'bg-transparent text-[var(--color-text-muted)] border-[var(--color-border)] hover:text-[var(--color-text)]'
                                                    }`}
                                            >
                                                {formatCategoryLabel(key)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    required
                                    onChange={(e) => e.target.files && setFile(e.target.files[0])}
                                    className="w-full text-[var(--color-text-muted)] border border-[var(--color-border)] rounded-xl px-4 py-2 text-xs font-medium file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[var(--color-accent)] file:text-[var(--color-accent-ink)] hover:file:cursor-pointer hover:file:brightness-110"
                                />
                                <motion.button
                                    whileHover={{ y: -2 }}
                                    whileTap={{ y: 1 }}
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[var(--color-accent-3)] text-white font-bold px-6 py-3 rounded-full text-xs uppercase tracking-wider hover:brightness-110 transition disabled:opacity-50"
                                >
                                    {loading ? t.publishingBtn : t.publishBtn}
                                </motion.button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* FEED — cuadrícula ancha, como la galería principal */}
            <div className="max-w-6xl mx-auto px-4 pb-16">
                <div className="mb-10 flex flex-col items-center text-center gap-6">
                    <div className="w-full flex items-center gap-3 overflow-x-auto px-4 sm:px-0 sm:flex-wrap sm:justify-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        <FilterPill onClick={() => setFilterCategory(null)} active={filterCategory === null}>
                            {t.filterAll}
                        </FilterPill>
                        {CATEGORY_KEYS.map((key) => (
                            <FilterPill
                                key={key}
                                onClick={() => setFilterCategory(key)}
                                active={filterCategory === key}
                                theme={getCategoryTheme(key)}
                            >
                                {formatCategoryLabel(key)}
                            </FilterPill>
                        ))}
                    </div>

                    <div className="flex flex-wrap justify-center gap-2">
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
                            <button
                                onClick={() => setFilterMyPosts((v) => !v)}
                                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all border ${filterMyPosts ? 'bg-[var(--color-accent)] text-[var(--color-accent-ink)] border-[var(--color-accent)]' : 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:text-[var(--color-text)]'}`}
                            >
                                {t.filterMine}
                            </button>
                        )}
                    </div>
                </div>

                {feedLoading ? (
                    <div className="grid grid-cols-3 gap-0.5 sm:gap-1 -mx-4 sm:mx-0" aria-hidden="true">
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="aspect-square animate-shimmer" />
                        ))}
                    </div>
                ) : displayedPosts.length === 0 ? (
                    <div className="mx-4 sm:mx-0 text-center py-16 bg-[var(--color-surface)] border border-dashed border-[var(--color-border)] rounded-2xl text-[var(--color-text-muted)] font-medium text-sm">
                        {posts.length === 0 ? t.noPosts : t.noResultsFilter}
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-0.5 sm:gap-1 -mx-4 sm:mx-0">
                        {displayedPosts.map((post) => (
                            <PostCard key={post.id} post={post} onClick={() => openPost(post.id)} />
                        ))}
                    </div>
                )}
            </div>

            {/* MODAL DE PUBLICACIÓN */}
            <AnimatePresence>
                {selectedPost && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleBackdropClick}
                        role="dialog"
                        aria-modal="true"
                        aria-label={selectedPost.title}
                        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 16, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.95, y: 16, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col md:flex-row shadow-2xl"
                        >
                            <div className="w-full md:w-3/5 bg-black relative min-h-[320px] md:min-h-[480px] flex items-center justify-center overflow-hidden">
                                <div
                                    className="absolute inset-0 bg-cover bg-center filter blur-2xl opacity-30 scale-110 pointer-events-none"
                                    style={{ backgroundImage: `url(${selectedPost.image_url})` }}
                                />
                                <Image
                                    src={selectedPost.image_url}
                                    alt={selectedPost.title}
                                    width={0}
                                    height={0}
                                    sizes="(max-width: 768px) 100vw, 60vw"
                                    className="relative z-10 max-h-[70vh] w-full h-auto object-contain"
                                />
                            </div>
                            <div className="w-full md:w-2/5 p-6 flex flex-col">
                                <div className="flex justify-between items-center gap-3">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <Link
                                            href={`/comunidad/u/${selectedPost.user_id}`}
                                            className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-xs font-black text-[#14100a] hover:brightness-110 transition"
                                            style={{ background: avatarColorFor(selectedPost.instagram_handle || 'anon') }}
                                            title={t.viewProfile}
                                        >
                                            {(selectedPost.instagram_handle || 'A').replace('@', '').charAt(0).toUpperCase()}
                                        </Link>
                                        {selectedPost.instagram_url ? (
                                            <a
                                                href={selectedPost.instagram_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-bold text-xs uppercase tracking-wide hover:underline flex items-center gap-1 truncate"
                                                style={{ color: modalTheme?.accent ?? 'var(--color-accent)' }}
                                            >
                                                <span className="truncate">{selectedPost.instagram_handle || t.anonymous}</span> ↗
                                            </a>
                                        ) : (
                                            <Link
                                                href={`/comunidad/u/${selectedPost.user_id}`}
                                                className="font-bold text-xs uppercase tracking-wide hover:underline truncate"
                                                style={{ color: modalTheme?.accent ?? 'var(--color-accent)' }}
                                            >
                                                {selectedPost.instagram_handle || t.anonymous}
                                            </Link>
                                        )}
                                    </div>
                                    <button
                                        ref={closeButtonRef}
                                        onClick={closeModal}
                                        aria-label={t.close}
                                        className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text)] bg-[var(--color-surface-2)] border border-[var(--color-border)]"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div className="flex-1 flex flex-col justify-center py-6">
                                    <AnimatePresence mode="wait">
                                        {editingPostId === selectedPost.id ? (
                                            <motion.div
                                                key="editing"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="flex flex-col gap-2"
                                            >
                                                <textarea
                                                    rows={3}
                                                    maxLength={TITLE_MAX_LENGTH}
                                                    value={editText}
                                                    onChange={(e) => setEditText(e.target.value)}
                                                    className={`${inputClass} resize-none`}
                                                />
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => handleEdit(selectedPost.id)}
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
                                            <motion.p
                                                key="text"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="text-sm font-medium text-[var(--color-text)] leading-relaxed whitespace-pre-line"
                                            >
                                                {selectedPost.title}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div
                                    className="w-full pt-4 flex flex-col gap-2.5"
                                    style={{ borderTop: `1px solid ${modalTheme ? `${modalTheme.accent}40` : 'var(--color-border)'}` }}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 1.3 }}
                                            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                                            onClick={() => handleToggleLike(selectedPost.id, selectedPost.post_likes || [])}
                                            aria-pressed={user ? (selectedPost.post_likes || []).some((l) => l.user_id === user.id) : false}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${user && (selectedPost.post_likes || []).some((l) => l.user_id === user.id)
                                                ? 'bg-[var(--color-accent-2)]/10 text-[var(--color-accent-2)] border-[var(--color-accent-2)]/30'
                                                : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:text-[var(--color-text)]'
                                                }`}
                                        >
                                            <motion.span
                                                key={user && (selectedPost.post_likes || []).some((l) => l.user_id === user.id) ? 'liked' : 'unliked'}
                                                initial={{ scale: 0.6 }}
                                                animate={{ scale: 1 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                {user && (selectedPost.post_likes || []).some((l) => l.user_id === user.id) ? '❤️' : '🤍'}
                                            </motion.span>
                                            <span>{(selectedPost.post_likes || []).length}</span>
                                        </motion.button>

                                        {user?.id === selectedPost.user_id && editingPostId !== selectedPost.id && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingPostId(selectedPost.id);
                                                        setEditText(selectedPost.title);
                                                    }}
                                                    className="text-[10px] bg-[var(--color-surface-2)] text-[var(--color-accent)] hover:brightness-110 px-2.5 py-1 rounded-full font-bold uppercase border border-[var(--color-border)] tracking-wider transition-colors"
                                                >
                                                    {t.edit}
                                                </button>
                                                <button
                                                    onClick={() => requestDelete(selectedPost.id, selectedPost.image_url)}
                                                    className="text-[10px] bg-[var(--color-accent-2)]/10 text-[var(--color-accent-2)] hover:bg-[var(--color-accent-2)]/20 px-2.5 py-1 rounded-full font-bold uppercase border border-[var(--color-accent-2)]/30 tracking-wider transition-colors"
                                                >
                                                    {t.delete}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-[10px] text-[var(--color-text-faint)] font-semibold">
                                        {new Date(selectedPost.created_at).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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





