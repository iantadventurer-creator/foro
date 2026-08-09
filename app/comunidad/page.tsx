'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';

const supabaseUrl = 'https://elfxllhdschknqtznzsq.supabase.co';
const supabaseAnonKey = 'sb_publishable_euWYboszDK8iVzfZdPPOHg_zNjs5pwF';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ComunidadPage() {
    const [lang, setLang] = useState<'es' | 'en'>('es');
    const [posts, setPosts] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);
    const [filterMyPosts, setFilterMyPosts] = useState(false);

    // Estados para Registro / Login
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [instagramHandle, setInstagramHandle] = useState('');

    // Estados del Formulario del Foro
    const [newPostTitle, setNewPostTitle] = useState('');
    const [newPostInstagramUrl, setNewPostInstagramUrl] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    // Estados para Edición
    const [editingPostId, setEditingPostId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');

    const content = {
        es: {
            volver: '← Volver al Inicio',
            foro: 'Foro Comunidad',
            connectedAs: 'Conectado como: ',
            logout: 'Cerrar Sesión',
            newPostTitle: 'Nueva Publicación',
            placeholder: '¿Qué diorama o creación quieres compartir hoy?',
            instagramUrlPlaceholder: 'URL de tu perfil de Instagram (ej. https://instagram.com/tu_usuario)',
            publishBtn: 'Publicar 🚀',
            publishingBtn: 'Publicando...',
            feedTitle: 'Feed en Directo',
            filterAll: 'Todas las publicaciones',
            filterMine: 'Mis publicaciones',
            noPosts: 'Aún no hay publicaciones en el foro.',
            edit: 'Editar',
            delete: 'Borrar',
            save: 'Guardar',
            cancel: 'Cancelar',
            auth: {
                signInTitle: 'Iniciar Sesión en el Foro',
                signUpTitle: 'Crear una cuenta',
                signInDesc: 'Inicia sesión con tu cuenta para poder publicar y dar like.',
                signUpDesc: 'Regístrate para unirte a la comunidad y compartir tus fotos.',
                handlePlaceholder: 'Tu usuario de Instagram (ej. @tu_cuenta)',
                emailPlaceholder: 'Correo electrónico',
                passwordPlaceholder: 'Contraseña',
                toSignUp: '¿No tienes cuenta? Regístrate',
                toSignIn: '¿Ya tienes cuenta? Inicia sesión',
                loginBtn: 'Entrar 🚀',
                registerBtn: 'Registrarse 📝',
            }
        },
        en: {
            volver: '← Back to Home',
            foro: 'Community Forum',
            connectedAs: 'Logged in as: ',
            logout: 'Log Out',
            newPostTitle: 'New Post',
            placeholder: 'What diorama or creation do you want to share today?',
            instagramUrlPlaceholder: 'Your Instagram profile URL (e.g. https://instagram.com/your_account)',
            publishBtn: 'Post 🚀',
            publishingBtn: 'Posting...',
            feedTitle: 'Live Feed',
            filterAll: 'All posts',
            filterMine: 'My posts',
            noPosts: 'No posts in the forum yet.',
            edit: 'Edit',
            delete: 'Delete',
            save: 'Save',
            cancel: 'Cancel',
            auth: {
                signInTitle: 'Sign in to the Forum',
                signUpTitle: 'Create an Account',
                signInDesc: 'Sign in with your account to post and like.',
                signUpDesc: 'Register to join the community and share your photos.',
                handlePlaceholder: 'Your Instagram handle (e.g. @your_account)',
                emailPlaceholder: 'Email address',
                passwordPlaceholder: 'Password',
                toSignUp: "Don't have an account? Register",
                toSignIn: 'Already have an account? Sign in',
                loginBtn: 'Sign In 🚀',
                registerBtn: 'Register 📝',
            }
        }
    };

    const t = content[lang];

    useEffect(() => {
        async function checkUser() {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user || null);
        }
        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
        });

        loadCommunityPosts();
        return () => subscription.unsubscribe();
    }, []);

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
            if (data) setPosts(data);
        } catch (err) {
            console.error('Error cargando comunidad:', err);
        }
    };

    const handleToggleLike = async (postId: string, currentLikes: any[]) => {
        if (!user) {
            alert(lang === 'es' ? 'Debes iniciar sesión para dar "Me gusta".' : 'You must log in to like posts.');
            return;
        }

        const hasLiked = currentLikes.some((like: any) => like.user_id === user.id);

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
        } catch (err: any) {
            console.error('Error al actualizar like:', err);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { instagram_handle: instagramHandle } }
        });

        if (error) {
            alert(`Error: ${error.message}`);
            return;
        }

        if (data?.user && data.user.identities && data.user.identities.length === 0) {
            alert(lang === 'es' ? 'Este correo ya está registrado.' : 'This email is already registered.');
        } else {
            alert(lang === 'es' ? '¡Registro exitoso! Revisa tu correo.' : 'Registration successful! Check your email.');
            setIsSignUp(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            alert(`Error: ${error.message}`);
        } else {
            setEmail('');
            setPassword('');
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setFilterMyPosts(false);
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            alert(lang === 'es' ? 'Debes iniciar sesión.' : 'You must log in.');
            return;
        }
        if (!newPostTitle.trim() || !file) {
            alert(lang === 'es' ? 'Completa el mensaje y selecciona una imagen.' : 'Complete the message and select an image.');
            return;
        }

        setLoading(true);
        try {
            const fileExt = file.name.split('.').pop() || 'jpg';
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

            const { error: storageError } = await supabase.storage
                .from('foro-fotos')
                .upload(fileName, file);

            if (storageError) throw storageError;

            const { data: { publicUrl } } = supabase.storage
                .from('foro-fotos')
                .getPublicUrl(fileName);

            const authorHandle = user.user_metadata?.instagram_handle || user.email.split('@')[0];

            const { error: dbError } = await supabase
                .from('community_posts')
                .insert([
                    {
                        title: newPostTitle,
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
        } catch (error: any) {
            console.error('Error al subir:', error);
            alert(`Error: ${error.message || 'Desconocido'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (postId: string, imageUrl: string) => {
        if (!confirm(lang === 'es' ? '¿Estás seguro de eliminar este post?' : 'Are you sure you want to delete this post?')) return;

        try {
            const { error: dbError } = await supabase
                .from('community_posts')
                .delete()
                .eq('id', postId);

            if (dbError) throw dbError;

            const fileName = imageUrl.split('/').pop();
            if (fileName) {
                await supabase.storage.from('foro-fotos').remove([fileName]);
            }

            await loadCommunityPosts();
        } catch (err: any) {
            console.error('Error al eliminar:', err);
            alert(`Error: ${err.message}`);
        }
    };

    const handleEdit = async (postId: string) => {
        if (!editText.trim()) return;

        try {
            const { error } = await supabase
                .from('community_posts')
                .update({ title: editText })
                .eq('id', postId);

            if (error) throw error;

            setEditingPostId(null);
            setEditText('');
            await loadCommunityPosts();
        } catch (err: any) {
            console.error('Error al editar:', err);
            alert(`Error: ${err.message}`);
        }
    };

    const displayedPosts = posts.filter(post => {
        if (filterMyPosts && user) {
            return post.user_id === user.id;
        }
        return true;
    });

    return (
        <main className="min-h-screen bg-[#0B0F17] bg-[radial-gradient(rgba(255,255,255,0.03)_2px,transparent_2px)] bg-[length:24px_24px] text-white font-sans selection:bg-amber-400 selection:text-black">

            <header className="sticky top-0 z-40 bg-[#0B0F17]/90 backdrop-blur-md border-b-4 border-[#1A2235] px-6 py-4">
                <div className="max-w-2xl mx-auto flex justify-between items-center">
                    <a href="/" className="text-xs font-black uppercase text-amber-400 tracking-wider hover:underline">
                        {t.volver}
                    </a>

                    <div className="flex items-center space-x-4">
                        <span className="font-black text-xs uppercase tracking-widest text-gray-400 hidden sm:inline">{t.foro}</span>
                        <div className="flex items-center space-x-2 bg-[#121824] p-1.5 rounded-lg border-2 border-[#1A2235]">
                            <button onClick={() => setLang('es')} className={`px-3 py-1 rounded-md text-xs font-black transition-all ${lang === 'es' ? 'bg-amber-400 text-black shadow-sm' : 'text-gray-500 hover:text-white'}`}>ES</button>
                            <button onClick={() => setLang('en')} className={`px-3 py-1 rounded-md text-xs font-black transition-all ${lang === 'en' ? 'bg-amber-400 text-black shadow-sm' : 'text-gray-500 hover:text-white'}`}>EN</button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-2xl mx-auto px-4 py-8">

                {!user ? (
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#121824] border-4 border-[#1A2235] rounded-2xl p-6 shadow-[0_8px_0_0_#0F1523] mb-8"
                    >
                        <h2 className="text-lg font-black uppercase tracking-tight text-white mb-2">
                            {isSignUp ? t.auth.signUpTitle : t.auth.signInTitle}
                        </h2>
                        <p className="text-xs text-gray-400 mb-6 font-bold">
                            {isSignUp ? t.auth.signUpDesc : t.auth.signInDesc}
                        </p>

                        <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="flex flex-col gap-4">
                            {isSignUp && (
                                <input
                                    type="text"
                                    required
                                    placeholder={t.auth.handlePlaceholder}
                                    value={instagramHandle}
                                    onChange={(e) => setInstagramHandle(e.target.value)}
                                    className="bg-[#0B0F17] border-2 border-[#2A344A] rounded-xl px-4 py-3 text-xs text-white font-bold focus:outline-none focus:border-amber-400"
                                />
                            )}
                            <input
                                type="email"
                                required
                                placeholder={t.auth.emailPlaceholder}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-[#0B0F17] border-2 border-[#2A344A] rounded-xl px-4 py-3 text-xs text-white font-bold focus:outline-none focus:border-amber-400"
                            />
                            <input
                                type="password"
                                required
                                placeholder={t.auth.passwordPlaceholder}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-[#0B0F17] border-2 border-[#2A344A] rounded-xl px-4 py-3 text-xs text-white font-bold focus:outline-none focus:border-amber-400"
                            />

                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsSignUp(!isSignUp)}
                                    className="text-xs text-amber-400 font-bold hover:underline"
                                >
                                    {isSignUp ? t.auth.toSignIn : t.auth.toSignUp}
                                </button>
                                <motion.button
                                    whileHover={{ y: -2 }}
                                    whileTap={{ y: 2 }}
                                    type="submit"
                                    className="w-full sm:w-auto bg-amber-400 text-black font-black px-6 py-3 rounded-xl text-xs uppercase tracking-wider shadow-[0_4px_0_0_#b45309] border-t-2 border-amber-200"
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
                        className="bg-[#121824] border-4 border-[#1A2235] rounded-2xl p-6 shadow-[0_8px_0_0_#0F1523] mb-8"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-black text-amber-400 uppercase">
                                {t.connectedAs} {user.user_metadata?.instagram_handle || user.email.split('@')[0]}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="text-[10px] font-black uppercase bg-[#1A2235] text-gray-400 hover:text-white px-3 py-1 rounded-lg border border-[#2A344A]"
                            >
                                {t.logout}
                            </button>
                        </div>

                        <h2 className="text-lg font-black uppercase tracking-tight text-white mb-4">{t.newPostTitle}</h2>
                        <form onSubmit={handleUpload} className="flex flex-col gap-4">
                            <textarea
                                required
                                rows={3}
                                placeholder={t.placeholder}
                                value={newPostTitle}
                                onChange={(e) => setNewPostTitle(e.target.value)}
                                className="bg-[#0B0F17] border-2 border-[#2A344A] rounded-xl px-4 py-3 text-xs text-white font-bold focus:outline-none focus:border-amber-400 resize-none"
                            />
                            <input
                                type="url"
                                placeholder={t.instagramUrlPlaceholder}
                                value={newPostInstagramUrl}
                                onChange={(e) => setNewPostInstagramUrl(e.target.value)}
                                className="bg-[#0B0F17] border-2 border-[#2A344A] rounded-xl px-4 py-3 text-xs text-white font-bold focus:outline-none focus:border-amber-400"
                            />
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                <input
                                    type="file"
                                    accept="image/*"
                                    required
                                    onChange={(e) => e.target.files && setFile(e.target.files[0])}
                                    className="w-full sm:w-auto bg-[#0B0F17] text-gray-400 border-2 border-[#2A344A] rounded-xl px-4 py-2 text-xs font-bold file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-black file:bg-amber-400 file:text-black hover:file:cursor-pointer"
                                />
                                <motion.button
                                    whileHover={{ y: -2 }}
                                    whileTap={{ y: 2 }}
                                    type="submit"
                                    disabled={loading}
                                    className="w-full sm:w-auto bg-blue-500 text-white font-black px-6 py-3 rounded-xl text-xs uppercase tracking-wider shadow-[0_4px_0_0_#1e3a8a] border-t-2 border-blue-300 disabled:opacity-50"
                                >
                                    {loading ? t.publishingBtn : t.publishBtn}
                                </motion.button>
                            </div>
                        </form>
                    </motion.div>
                )}

                <div className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">{t.feedTitle}</h3>
                        {user && (
                            <div className="flex gap-2 bg-[#121824] p-1 rounded-lg border border-[#1A2235]">
                                <button
                                    onClick={() => setFilterMyPosts(false)}
                                    className={`px-3 py-1 rounded-md text-[10px] font-black uppercase transition-all ${!filterMyPosts ? 'bg-amber-400 text-black' : 'text-gray-400 hover:text-white'}`}
                                >
                                    {t.filterAll}
                                </button>
                                <button
                                    onClick={() => setFilterMyPosts(true)}
                                    className={`px-3 py-1 rounded-md text-[10px] font-black uppercase transition-all ${filterMyPosts ? 'bg-amber-400 text-black' : 'text-gray-400 hover:text-white'}`}
                                >
                                    {t.filterMine}
                                </button>
                            </div>
                        )}
                    </div>

                    {displayedPosts.length === 0 ? (
                        <div className="text-center py-16 bg-[#121824] border-4 border-[#1A2235] rounded-2xl text-gray-500 font-bold text-xs uppercase">
                            {t.noPosts}
                        </div>
                    ) : (
                        displayedPosts.map((post, index) => {
                            const likes = post.post_likes || [];
                            const hasLiked = user ? likes.some((l: any) => l.user_id === user.id) : false;

                            return (
                                <motion.div
                                    key={post.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className="bg-[#121824] border-4 border-[#1A2235] rounded-2xl p-5 shadow-[0_6px_0_0_#0F1523] flex flex-col gap-3"
                                >
                                    <div className="flex items-center justify-between">
                                        {post.instagram_url ? (
                                            <a
                                                href={post.instagram_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-black text-xs text-amber-400 uppercase tracking-wide hover:underline flex items-center gap-1"
                                            >
                                                {post.instagram_handle || 'Anónimo'} ↗
                                            </a>
                                        ) : (
                                            <span className="font-black text-xs text-amber-400 uppercase tracking-wide">
                                                {post.instagram_handle || 'Anónimo'}
                                            </span>
                                        )}

                                        <div className="flex items-center gap-3">
                                            {user?.id === post.user_id && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditingPostId(post.id);
                                                            setEditText(post.title);
                                                        }}
                                                        className="text-[10px] bg-[#1A2235] text-amber-400 hover:bg-[#252f48] px-2.5 py-1 rounded-lg font-black uppercase border border-[#2A344A] tracking-wider transition-colors shadow-sm"
                                                    >
                                                        {t.edit}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(post.id, post.image_url)}
                                                        className="text-[10px] bg-red-950/60 text-red-400 hover:bg-red-900/60 px-2.5 py-1 rounded-lg font-black uppercase border border-red-900/50 tracking-wider transition-colors shadow-sm"
                                                    >
                                                        {t.delete}
                                                    </button>
                                                </div>
                                            )}
                                            <span className="text-[10px] text-gray-500 font-bold">
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
                                                    value={editText}
                                                    onChange={(e) => setEditText(e.target.value)}
                                                    className="bg-[#0B0F17] border-2 border-[#2A344A] rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-amber-400 resize-none"
                                                />
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => handleEdit(post.id)}
                                                        className="bg-green-600 hover:bg-green-500 text-white font-black px-3 py-1.5 rounded-lg text-[10px] uppercase border border-green-500 shadow-sm"
                                                    >
                                                        {t.save}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setEditingPostId(null);
                                                            setEditText('');
                                                        }}
                                                        className="bg-gray-700 hover:bg-gray-600 text-white font-black px-3 py-1.5 rounded-lg text-[10px] uppercase border border-gray-600 shadow-sm"
                                                    >
                                                        {t.cancel}
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <p className="text-sm font-bold text-white leading-relaxed">{post.title}</p>
                                        )}
                                    </AnimatePresence>

                                    {post.image_url && (
                                        <div className="rounded-xl overflow-hidden border-2 border-[#2A344A] bg-black mt-2 flex justify-center items-center">
                                            <img
                                                src={post.image_url}
                                                alt="Post image"
                                                className="w-full h-auto max-h-[600px] object-contain"
                                            />
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 pt-2 border-t border-[#1A2235] mt-1">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 1.3 }}
                                            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                                            onClick={() => handleToggleLike(post.id, likes)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 text-xs font-black transition-all ${hasLiked
                                                    ? 'bg-red-500/10 text-red-500 border-red-500/30'
                                                    : 'bg-[#1A2235] text-gray-400 border-[#2A344A] hover:text-white'
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
        </main>
    );
}