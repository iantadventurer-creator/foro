'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { GallerySkeleton } from '@/components/ui/GallerySkeleton';
import { StudDivider } from '@/components/ui/StudDivider';
import { QrCodeModal, pickRandomQrColor } from '@/components/ui/QrCodeButton';
import { FilterPill } from '@/components/ui/FilterPill';
import { supabase } from '@/lib/supabaseClient';
import { useBodyScrollLock } from '@/lib/useBodyScrollLock';
import { useModal } from '@/lib/useModal';
import { categoryTextColor, formatCategoryLabel, getCategoryTheme } from '@/lib/categoryThemes';

type FeedItem = {
  id: string;
  title: string;
  src: string;
  videoUrl: string | null;
  permalink: string;
  mediaType: 'VIDEO' | 'IMAGE';
  author: string;
  /** Nombre de la subcarpeta del bucket (p. ej. "STAR WARS"), o null si la foto está suelta en la raíz. */
  category: string | null;
  /** Fecha real (no formateada) para poder ordenar por más reciente entre categorías. */
  createdAtMs: number;
};

/** Nombre del bucket público de Supabase Storage donde se suben las fotos de la galería. */
const GALLERY_BUCKET = 'galeria';
const VIDEO_EXTENSIONS = ['mp4', 'mov', 'webm'];
// Supabase limita cada listado a 100 archivos por defecto; sin esto, una
// carpeta con más fotos las perdería en silencio.
const GALLERY_LIST_LIMIT = 1000;
const FAVORITES_STORAGE_KEY = 'iantbuild:favorites';


const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 260, damping: 24 },
  },
};

export default function Home() {
  const [lang, setLang] = useState<'es' | 'en'>('es');
  const [selectedItem, setSelectedItem] = useState<FeedItem | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedError, setFeedError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrColorIndex, setQrColorIndex] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  // Carga los favoritos guardados en este navegador (localStorage, no hay
  // cuenta de por medio). Puede fallar en modo incógnito estricto — no pasa
  // nada, simplemente no persisten.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setFavorites(new Set(JSON.parse(raw)));
    } catch {
      // localStorage no disponible; los favoritos solo viven en memoria.
    }
  }, []);

  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([...next]));
      } catch {
        // Igual que arriba: si no hay localStorage, el favorito no sobrevive un refresh.
      }
      return next;
    });
  };

  // El estado del modal del QR vive acá arriba (no dentro del botón que lo
  // abre) a propósito: el botón del menú móvil cierra ese menú en el mismo
  // clic que abre el QR, y si el modal viviera dentro del bloque del menú,
  // cerrarlo desmontaría también el componente que sostiene el estado —
  // el QR se abriría y se destruiría casi al instante.
  const openQr = () => {
    setQrColorIndex((prev) => pickRandomQrColor(prev));
    setQrOpen(true);
  };
  const closeQr = () => setQrOpen(false);

  // Bloquea el scroll de fondo mientras el lightbox de fotos o el QR
  // están abiertos (antes se podía seguir desplazando la página detrás).
  useBodyScrollLock(qrOpen);

  // Cierra el menú móvil y, una vez terminada su animación de colapso (para
  // que la cabecera ya tenga su altura final), hace scroll a la sección.
  // Si se hiciera el salto de ancla nativo al mismo tiempo que se anima el
  // cierre del menú, el navegador calcula el destino con la cabecera todavía
  // expandida y el scroll termina descuadrado (parece que el enlace "no hace nada").
  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 350);
  };

  const ITEMS_PER_PAGE = 12;
  const galleryRef = useRef<HTMLElement | null>(null);
  const aboutRef = useRef<HTMLElement | null>(null);
  const [activeSection, setActiveSection] = useState<'gallery' | 'about' | null>(null);

  // Mantiene el atributo lang del documento sincronizado con el selector ES/EN
  // (accesibilidad para lectores de pantalla y SEO).
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // Resalta en el nav qué sección se está viendo mientras se hace scroll
  // (se considera "activa" la sección que cruza la franja central de la pantalla).
  useEffect(() => {
    const sections: { id: 'gallery' | 'about'; el: HTMLElement | null }[] = [
      { id: 'gallery', el: galleryRef.current },
      { id: 'about', el: aboutRef.current },
    ];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const match = sections.find((s) => s.el === entry.target);
          if (match) setActiveSection(match.id);
        });
      },
      { rootMargin: '-40% 0px -40% 0px' }
    );
    sections.forEach((s) => { if (s.el) observer.observe(s.el); });
    return () => observer.disconnect();
  }, []);

  const openItem = (item: FeedItem) => {
    setSelectedItem(item);
    setZoomed(false);
  };

  const closeModal = useCallback(() => setSelectedItem(null), []);
  // Escape, trampa de foco, devolución del foco y protección contra el
  // "click fantasma" en móvil: todo en el hook compartido con la comunidad.
  const { closeButtonRef, dialogRef, handleBackdropClick: handleModalBackdropClick } = useModal(!!selectedItem, closeModal);

  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    function buildItem(
      file: { id: string | null; name: string; created_at?: string | null; updated_at?: string | null },
      category: string | null,
      storagePath: string
    ): FeedItem {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const isVideoType = VIDEO_EXTENSIONS.includes(ext);
      const { data: { publicUrl } } = supabase.storage.from(GALLERY_BUCKET).getPublicUrl(storagePath);
      const createdAt = file.created_at || file.updated_at;
      const createdAtMs = createdAt ? new Date(createdAt).getTime() : 0;

      return {
        id: storagePath,
        title: category ? formatCategoryLabel(category) : 'Toy Photography',
        src: publicUrl,
        videoUrl: isVideoType ? publicUrl : null,
        permalink: 'https://instagram.com/iantadventurer',
        mediaType: isVideoType ? 'VIDEO' : 'IMAGE',
        author: '@iantadventurer',
        category,
        createdAtMs,
      };
    }

    // Una "carpeta" en Supabase Storage se distingue de un archivo porque no
    // trae metadata (id es null). Cada subcarpeta del bucket se trata como
    // una categoría de la galería (su nombre es el que se muestra en el filtro).
    async function loadGallery() {
      setLoading(true);
      setFeedError(false);
      try {
        const { data: rootEntries, error } = await supabase.storage
          .from(GALLERY_BUCKET)
          .list('', { limit: GALLERY_LIST_LIMIT, sortBy: { column: 'name', order: 'asc' } });

        if (error) throw error;

        // Cada subcarpeta se lista en paralelo (antes era una espera tras otra).
        const groups = await Promise.all(
          (rootEntries || [])
            .filter((entry) => entry.name && !entry.name.startsWith('.'))
            .map(async (entry): Promise<FeedItem[]> => {
              const isFolder = entry.id === null;
              if (!isFolder) return [buildItem(entry, null, entry.name)];

              const { data: subEntries } = await supabase.storage
                .from(GALLERY_BUCKET)
                .list(entry.name, { limit: GALLERY_LIST_LIMIT, sortBy: { column: 'created_at', order: 'desc' } });

              return (subEntries || [])
                .filter((file) => file.name && !file.name.startsWith('.') && file.id !== null)
                .map((file) => buildItem(file, entry.name, `${entry.name}/${file.name}`));
            })
        );
        const items = groups.flat();

        items.sort((a, b) => b.createdAtMs - a.createdAtMs);
        if (!cancelled) setFeedItems(items);
      } catch (error) {
        console.error('Error cargando la galería:', error);
        if (!cancelled) setFeedError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadGallery();
    return () => {
      cancelled = true;
    };
  }, [retryCount]);

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // Sin permiso de portapapeles (o contexto no seguro): no se muestra "copiado".
    }
  };

  // Categorías disponibles = nombres de subcarpeta encontrados, en el orden en que aparecen.
  const categories = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    for (const item of feedItems) {
      if (item.category && !seen.has(item.category)) {
        seen.add(item.category);
        list.push(item.category);
      }
    }
    return list;
  }, [feedItems]);

  const filteredItems = useMemo(() => {
    return feedItems.filter((item) => {
      if (filterCategory && item.category !== filterCategory) return false;
      if (showOnlyFavorites && !favorites.has(item.id)) return false;
      return true;
    });
  }, [feedItems, filterCategory, showOnlyFavorites, favorites]);

  // Vuelve a la página 1 cuando cambia el filtro de favoritos (si no, se
  // podría quedar en una página que ya no existe para el nuevo filtro).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [showOnlyFavorites]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedItems = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, safePage]);

  const previewShots = feedItems.slice(0, 3);
  const modalTheme = getCategoryTheme(selectedItem?.category ?? null);
  const activeGalleryTheme = getCategoryTheme(filterCategory);

  // Navegación del lightbox: se mueve dentro de la lista ya filtrada por
  // categoría (no solo la página actual), así "siguiente" no se corta al
  // llegar al final de una página.
  const selectedIndex = selectedItem ? filteredItems.findIndex((i) => i.id === selectedItem.id) : -1;
  const hasPrev = selectedIndex > 0;
  const hasNext = selectedIndex !== -1 && selectedIndex < filteredItems.length - 1;
  const goToPrev = () => { if (hasPrev) openItem(filteredItems[selectedIndex - 1]); };
  const goToNext = () => { if (hasNext) openItem(filteredItems[selectedIndex + 1]); };

  // Flechas del teclado para pasar de foto sin cerrar el modal. goToPrev/
  // goToNext no hace falta listarlas: se derivan por completo de
  // selectedIndex/hasPrev/hasNext/filteredItems, que ya están en las deps.
  useEffect(() => {
    if (!selectedItem) return;
    function handleArrowKeys(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'ArrowRight') goToNext();
    }
    document.addEventListener('keydown', handleArrowKeys);
    return () => document.removeEventListener('keydown', handleArrowKeys);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItem, hasPrev, hasNext, selectedIndex, filteredItems]);

  const content = {
    es: {
      nav: { gallery: 'Galería', community: 'Comunidad', about: 'Sobre mí', cta: 'Instagram', menu: 'Abrir menú' },
      hero: {
        badge: 'Fotografía de miniaturas',
        title: 'Pieza a pieza, historias a escala de bolsillo.',
        description: 'Dioramas construidos a mano, iluminación cinematográfica y un ojo obsesionado con el detalle. Bienvenido al set de @iantadventurer.',
        btnExplore: 'Ver la galería',
        stat1: 'Fotos publicadas',
        stat2: 'Universo',
      },
      intro: {
        eyebrow: 'Qué encontrarás aquí',
        title: 'Tres espacios, una sola pasión',
        cards: [
          { title: 'Galería', desc: 'Mis fotos de dioramas y minifiguras LEGO, ordenadas por universo: Star Wars, Ninjago, Marvel y más.', cta: 'Ver las fotos' },
          { title: 'Comunidad', desc: 'Crea una cuenta gratis, publica tus propias fotos LEGO y dale me gusta a las de otros fans.', cta: 'Entrar a la comunidad' },
          { title: 'Sobre mí', desc: 'Quién soy, cómo trabajo y dónde seguir mis novedades.', cta: 'Conocerme' },
        ],
      },
      gallery: {
        eyebrow: 'Galería',
        title: 'Fotos de miniaturas LEGO',
        subtitle: 'Toca una foto para verla en grande. Filtra por universo y guarda tus favoritas con el corazón.',
        filterAll: 'Todo',
        favorites: 'Favoritos',
        noResults: 'Todavía no marcaste ninguna foto como favorita.',
        empty: 'Aún no hay fotos en la galería.',
        errorTitle: 'No se pudo cargar el feed',
        errorDesc: 'Hubo un problema de conexión con Instagram. Puedes intentarlo de nuevo.',
        retry: 'Reintentar',
      },
      aboutSection: {
        eyebrow: 'Detrás del lente',
        title: 'De fan de LEGO a fotógrafo de sets',
        desc: '"Fan de los Legos desde niño. Ahora uso la fotografía para que cobren vida en mis propios escenarios."',
        cta: 'Seguir en Instagram',
      },
      modal: {
        viewOnIg: 'Ver en Instagram',
        copyLink: 'Copiar enlace',
        copied: '¡Enlace copiado!',
        close: 'Cerrar',
        prev: 'Foto anterior',
        next: 'Foto siguiente',
        addFavorite: 'Agregar a favoritos',
        removeFavorite: 'Quitar de favoritos',
      },
      footer: {
        tagline: 'Un portafolio inmersivo de fotografía de miniaturas.',
        linksTitle: 'Explorar',
        followTitle: 'Seguir',
        qrLabel: 'Código QR',
      },
      disclaimer: 'LEGO® es una marca registrada de The LEGO Group, que no patrocina ni respalda este sitio web.',
    },
    en: {
      nav: { gallery: 'Gallery', community: 'Community', about: 'About', cta: 'Instagram', menu: 'Open menu' },
      hero: {
        badge: 'Miniature photography',
        title: 'Brick by brick, pocket-scale stories.',
        description: 'Hand-built dioramas, cinematic lighting, and an eye obsessed with detail. Welcome to the set of @iantadventurer.',
        btnExplore: 'View gallery',
        stat1: 'Photos published',
        stat2: 'Universe',
      },
      intro: {
        eyebrow: 'What you will find here',
        title: 'Three spaces, one passion',
        cards: [
          { title: 'Gallery', desc: 'My LEGO diorama and minifigure photos, sorted by universe: Star Wars, Ninjago, Marvel and more.', cta: 'See the photos' },
          { title: 'Community', desc: "Create a free account, post your own LEGO photos and like other fans' work.", cta: 'Join the community' },
          { title: 'About me', desc: 'Who I am, how I work and where to follow my updates.', cta: 'Meet me' },
        ],
      },
      gallery: {
        eyebrow: 'Gallery',
        title: 'LEGO miniature photos',
        subtitle: 'Tap a photo to see it larger. Filter by universe and save your favorites with the heart.',
        filterAll: 'All',
        favorites: 'Favorites',
        noResults: "You haven't favorited any photos yet.",
        empty: 'No photos in the gallery yet.',
        errorTitle: "Couldn't load the feed",
        errorDesc: 'There was a connection issue with Instagram. You can try again.',
        retry: 'Retry',
      },
      aboutSection: {
        eyebrow: 'Behind the lens',
        title: 'From LEGO fan to set photographer',
        desc: 'Every shot combines advanced lighting techniques, meticulous set building, and a passion for snapping the perfect personality into each figure.',
        cta: 'Follow on Instagram',
      },
      modal: {
        viewOnIg: 'View on Instagram',
        copyLink: 'Copy link',
        copied: 'Link copied!',
        close: 'Close',
        prev: 'Previous photo',
        next: 'Next photo',
        addFavorite: 'Add to favorites',
        removeFavorite: 'Remove from favorites',
      },
      footer: {
        tagline: 'An immersive miniature photography portfolio.',
        linksTitle: 'Explore',
        followTitle: 'Follow',
        qrLabel: 'QR code',
      },
      disclaimer: 'LEGO® is a registered trademark of The LEGO Group, which does not sponsor or endorse this website.',
    },
  };

  const t = content[lang];

  return (
    <main id="contenido" tabIndex={-1} className="min-h-screen text-[var(--color-text)] font-sans relative z-0 overflow-x-hidden focus:outline-none">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-[var(--color-ink)]/85 backdrop-blur-md border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <a href="#top" className="flex items-center gap-3 group">
            <div className="w-9 h-9 shadow-[0_8px_24px_-8px_var(--shadow-accent)] group-hover:-translate-y-0.5 group-hover:shadow-[0_8px_24px_-8px_var(--shadow-accent)] transition-all rounded-md overflow-hidden">
              <svg viewBox="0 0 36 36" className="w-full h-full" aria-hidden="true">
                <rect x="0" y="0" width="36" height="36" fill="var(--color-accent)" />
                {[[11, 11], [25, 11], [11, 25], [25, 25]].map(([cx, cy]) => (
                  <g key={`${cx}-${cy}`}>
                    <circle cx={cx + 1} cy={cy + 1.5} r="5.5" fill="rgba(0,0,0,0.3)" />
                    <circle cx={cx} cy={cy} r="5.5" fill="var(--color-accent)" />
                    <circle cx={cx - 2} cy={cy - 2} r="1.7" fill="white" opacity="0.5" />
                  </g>
                ))}
              </svg>
            </div>
            <div className="leading-none">
              <span className="font-display font-semibold text-base tracking-tight text-[var(--color-text)] block">IanTBuild</span>
              <span className="text-[10px] text-[var(--color-accent-text)] font-semibold tracking-[0.2em] uppercase">Studio</span>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[var(--color-text-muted)]">
            <a href="#gallery" className="group relative py-1 hover:text-[var(--color-text)] transition-colors">
              {t.nav.gallery}
              <span className={`absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-[var(--color-accent)] transition-transform duration-300 origin-center ${activeSection === 'gallery' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
            </a>
            <Link href="/comunidad" className="group relative py-1 hover:text-[var(--color-text)] transition-colors">
              {t.nav.community}
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-[var(--color-accent-2)] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
            </Link>
            <a href="#about" className="group relative py-1 hover:text-[var(--color-text)] transition-colors">
              {t.nav.about}
              <span className={`absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-[var(--color-accent-3)] transition-transform duration-300 origin-center ${activeSection === 'about' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
            </a>
            <button
              onClick={openQr}
              aria-label={t.footer.qrLabel}
              className="group relative py-1 hover:text-[var(--color-text)] transition-colors"
            >
              {t.footer.qrLabel}
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-[var(--color-accent-4)] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1 bg-[var(--color-surface)] p-1 rounded-full border border-[var(--color-border)]">
              <button onClick={() => setLang('es')} aria-pressed={lang === 'es'} className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${lang === 'es' ? 'bg-[var(--color-accent)] text-[var(--color-accent-ink)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}>ES</button>
              <button onClick={() => setLang('en')} aria-pressed={lang === 'en'} className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${lang === 'en' ? 'bg-[var(--color-accent)] text-[var(--color-accent-ink)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}>EN</button>
            </div>
            <motion.a
              whileHover={{ y: -2 }}
              whileTap={{ y: 1 }}
              href="https://instagram.com/iantadventurer"
              target="_blank"
              rel="noopener noreferrer"
              className="font-button hidden sm:inline-flex items-center text-xs font-bold uppercase tracking-wide text-[var(--color-accent-ink)] bg-[var(--color-accent)] px-5 py-2.5 rounded-full shadow-[0_8px_24px_-8px_var(--shadow-accent)] hover:brightness-110 transition-[filter]"
            >
              {t.nav.cta}
            </motion.a>
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-expanded={mobileMenuOpen}
              aria-label={t.nav.menu}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-text)]"
            >
              <div className="flex flex-col gap-1.5 items-end">
                <span className={`h-0.5 bg-current transition-all ${mobileMenuOpen ? 'w-5 rotate-45 translate-y-2' : 'w-5'}`} />
                <span className={`h-0.5 bg-current transition-all ${mobileMenuOpen ? 'opacity-0' : 'w-4'}`} />
                <span className={`h-0.5 bg-current transition-all ${mobileMenuOpen ? 'w-5 -rotate-45 -translate-y-2' : 'w-3'}`} />
              </div>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-[var(--color-border)]"
            >
              <div className="px-6 py-3 flex flex-col text-sm font-semibold">
                <a href="#gallery" onClick={(e) => { e.preventDefault(); scrollToSection('gallery'); }} className="block py-3 text-[var(--color-text-muted)] hover:text-[var(--color-text)]">{t.nav.gallery}</a>
                <Link href="/comunidad" onClick={() => setMobileMenuOpen(false)} className="block py-3 text-[var(--color-text-muted)] hover:text-[var(--color-text)]">{t.nav.community}</Link>
                <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }} className="block py-3 text-[var(--color-text-muted)] hover:text-[var(--color-text)]">{t.nav.about}</a>
                <button
                  onClick={() => { setMobileMenuOpen(false); openQr(); }}
                  aria-label={t.footer.qrLabel}
                  className="block w-full text-left py-3 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                >
                  {t.footer.qrLabel}
                </button>
                <div className="flex items-center gap-1 bg-[var(--color-surface)] p-1 rounded-full border border-[var(--color-border)] w-fit mt-2">
                  <button onClick={() => setLang('es')} className={`px-3 py-1 rounded-full text-xs font-bold ${lang === 'es' ? 'bg-[var(--color-accent)] text-[var(--color-accent-ink)]' : 'text-[var(--color-text-muted)]'}`}>ES</button>
                  <button onClick={() => setLang('en')} className={`px-3 py-1 rounded-full text-xs font-bold ${lang === 'en' ? 'bg-[var(--color-accent)] text-[var(--color-accent-ink)]' : 'text-[var(--color-text-muted)]'}`}>EN</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* HERO */}
      <section id="top" className="relative z-0 overflow-hidden max-w-7xl mx-auto px-6 pt-20 pb-24 grid md:grid-cols-2 gap-16 items-center">
        <div className="absolute top-10 left-0 w-64 h-64 md:w-[28rem] md:h-[28rem] bg-[var(--color-accent-3)]/10 rounded-full blur-[130px] pointer-events-none -z-10" />
        <div className="absolute bottom-0 right-0 w-56 h-56 md:w-[24rem] md:h-[24rem] bg-[var(--color-accent)]/10 rounded-full blur-[130px] pointer-events-none -z-10" />

        <div>
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="inline-flex items-center gap-2 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-accent-text)] text-xs font-bold px-4 py-2 rounded-full mb-6 uppercase tracking-widest">
            {t.hero.badge}
          </motion.div>

          <motion.h1 variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.05 }} className="font-display text-4xl md:text-6xl font-semibold tracking-tight mb-6 leading-[1.05] bg-gradient-to-b from-white to-[#a9b5d3] bg-clip-text text-transparent">
            {t.hero.title}
          </motion.h1>
          <motion.p variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }} className="text-[var(--color-text-muted)] text-base md:text-lg max-w-lg mb-10 leading-relaxed">
            {t.hero.description}
          </motion.p>
          <motion.div variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.15 }} className="flex flex-wrap gap-4">
            <motion.a
              whileHover={{ y: -3 }}
              whileTap={{ y: 2 }}
              href="#gallery"
              className="font-button inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[var(--color-accent-ink)] bg-[var(--color-accent)] px-7 py-3.5 rounded-full shadow-[0_8px_24px_-8px_var(--shadow-accent)] hover:brightness-110 transition-[filter]"
            >
              {t.hero.btnExplore} ↓
            </motion.a>
            <motion.div whileHover={{ y: -3 }} whileTap={{ y: 2 }}>
              <Link href="/comunidad" className="font-button inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-white bg-[var(--color-accent-3)] px-7 py-3.5 rounded-full shadow-[0_8px_24px_-8px_var(--shadow-accent-3)] hover:brightness-110 transition-[filter]">
                {t.nav.community}
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <div className="relative h-64 sm:h-72 md:h-96" aria-hidden="true">
          {previewShots.length > 0 ? (
            previewShots.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30, rotate: 0 }}
                animate={{ opacity: 1, y: 0, rotate: [-6, 4, -3][i] }}
                transition={{ delay: 0.1 * i, type: 'spring', stiffness: 200, damping: 20 }}
                whileHover={{ rotate: 0, scale: 1.03, zIndex: 10 }}
                className="absolute rounded-2xl border-4 border-[var(--color-surface)] shadow-2xl overflow-hidden bg-black"
                style={{
                  width: '55%',
                  aspectRatio: '4 / 5',
                  top: `${[0, 30, 10][i]}%`,
                  left: `${[5, 45, 25][i]}%`,
                  zIndex: [1, 2, 3][i],
                }}
              >
                <Image src={item.src} alt="" fill sizes="(max-width: 1024px) 50vw, 400px" className="object-cover" />
              </motion.div>
            ))
          ) : (
            <>
              <div className="absolute rounded-2xl bg-gradient-to-br from-[var(--color-accent-3)]/30 to-transparent border border-[var(--color-border)]" style={{ width: '55%', aspectRatio: '4/5', top: '0%', left: '5%' }} />
              <div className="absolute rounded-2xl bg-gradient-to-br from-[var(--color-accent)]/30 to-transparent border border-[var(--color-border)]" style={{ width: '55%', aspectRatio: '4/5', top: '30%', left: '45%' }} />
            </>
          )}
        </div>
      </section>

      {/* QUÉ ENCONTRARÁS */}
      <section id="intro" className="max-w-7xl mx-auto px-6 pb-20 relative z-10">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-accent-text)] mb-3">{t.intro.eyebrow}</p>
          <h2 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">{t.intro.title}</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {t.intro.cards.map((card, i) => {
            const tone = ['var(--color-accent)', 'var(--color-accent-3)', 'var(--color-accent-4)'][i];
            const href = ['#gallery', '/comunidad', '#about'][i];
            const icon = [
              <path key="g" d="M4 7a2 2 0 0 1 2-2h1.5l1-1.5h7l1 1.5H18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Zm8 9.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />,
              <path key="c" d="M16 11a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm-8 0a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm0 2c-2.3 0-7 1.2-7 3.5V19h8v-2.5c0-1 .4-1.9 1.1-2.7C9.4 13.3 8.6 13 8 13Zm8 0c-2.3 0-7 1.2-7 3.5V19h14v-2.5c0-2.3-4.7-3.5-7-3.5Z" />,
              <path key="a" d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Zm0 2c-3 0-8 1.5-8 4.5V21h16v-2.5c0-3-5-4.5-8-4.5Z" />,
            ][i];
            const cardClass = 'group relative flex flex-col h-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/70 backdrop-blur-sm p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--card-tone)]/60';
            const inner = (
              <>
                <span
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: `color-mix(in srgb, ${tone} 16%, transparent)`, color: tone }}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">{icon}</svg>
                </span>
                <h3 className="font-display text-lg font-semibold mb-2">{card.title}</h3>
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-6">{card.desc}</p>
                <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: tone }}>
                  {card.cta}
                  <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </span>
              </>
            );
            const style = { '--card-tone': tone } as React.CSSProperties;
            return href.startsWith('/') ? (
              <Link key={card.title} href={href} className={cardClass} style={style}>{inner}</Link>
            ) : (
              <a key={card.title} href={href} className={cardClass} style={style}>{inner}</a>
            );
          })}
        </div>
      </section>

      {/* GALLERY */}
      <section id="gallery" ref={galleryRef} className="max-w-7xl mx-auto px-6 py-16 relative z-10 overflow-hidden">
        <motion.div
          aria-hidden="true"
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] rounded-full blur-[160px] pointer-events-none -z-10"
          animate={{ backgroundColor: activeGalleryTheme ? `${activeGalleryTheme.accent}26` : 'rgba(0,0,0,0)' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
        <div className="mb-12 flex flex-col items-center text-center gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-accent-text)] mb-3">{t.gallery.eyebrow}</p>
            <motion.h2 initial={{ opacity: 0, y: -10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-[var(--color-text)]">
              {t.gallery.title}
            </motion.h2>
            <p className="text-sm text-[var(--color-text-muted)] mt-2 max-w-md mx-auto">{t.gallery.subtitle}</p>
          </div>
          {categories.length > 0 && (
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <FilterPill onClick={() => { setFilterCategory(null); setCurrentPage(1); }} active={filterCategory === null}>
                {t.gallery.filterAll}
              </FilterPill>
              {categories.map((cat) => (
                <FilterPill
                  key={cat}
                  onClick={() => { setFilterCategory(cat); setCurrentPage(1); }}
                  active={filterCategory === cat}
                  theme={getCategoryTheme(cat)}
                >
                  {formatCategoryLabel(cat)}
                </FilterPill>
              ))}
              <FilterPill
                onClick={() => setShowOnlyFavorites((v) => !v)}
                active={showOnlyFavorites}
                theme={{ accent: '#e0245e', shadow: '#8a1638', ink: '#ffffff' }}
              >
                ♥ {t.gallery.favorites}
              </FilterPill>
            </div>
          )}
        </div>

        {loading ? (
          <GallerySkeleton />
        ) : feedError ? (
          <div className="flex flex-col items-center text-center py-24 gap-4 border border-dashed border-[var(--color-border)] rounded-2xl">
            <p className="text-[var(--color-text)] font-semibold">{t.gallery.errorTitle}</p>
            <p className="text-sm text-[var(--color-text-muted)] max-w-xs">{t.gallery.errorDesc}</p>
            <button onClick={() => setRetryCount((c) => c + 1)} className="mt-2 text-xs font-bold uppercase tracking-wide bg-[var(--color-accent)] text-[var(--color-accent-ink)] px-5 py-2.5 rounded-full hover:brightness-110 transition">
              {t.gallery.retry}
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 text-[var(--color-text-muted)] font-medium text-sm border border-dashed border-[var(--color-border)] rounded-2xl">
            {showOnlyFavorites ? t.gallery.noResults : t.gallery.empty}
          </div>
        ) : (
          <>
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
              {paginatedItems.map((item) => {
                const isVideo = item.mediaType === 'VIDEO';
                const cardTheme = getCategoryTheme(item.category);
                return (
                  <motion.figure
                    key={item.id}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '80px' }}
                    onClick={() => openItem(item)}
                    role="button"
                    tabIndex={0}
                    aria-label={item.title}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openItem(item);
                      }
                    }}
                    style={{ '--card-accent': cardTheme?.accent ?? 'var(--color-accent)' } as React.CSSProperties}
                    className="mb-6 break-inside-avoid group cursor-pointer rounded-2xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--card-accent)]/60 transition-colors relative focus-visible:border-[var(--card-accent)]"
                  >
                    <div className="relative overflow-hidden bg-black">
                      <Image
                        src={item.src}
                        alt={item.title}
                        width={0}
                        height={0}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="w-full h-auto object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                      />
                      {isVideo && (
                        <div className="absolute top-3 right-3 bg-[var(--color-accent-2)] text-[#2a1600] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                          Reel
                        </div>
                      )}
                      <motion.button
                        whileTap={{ scale: 1.3 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                        onClick={(e) => toggleFavorite(item.id, e)}
                        aria-label={favorites.has(item.id) ? t.modal.removeFavorite : t.modal.addFavorite}
                        aria-pressed={favorites.has(item.id)}
                        className={`absolute top-3 left-3 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-base transition-all ${favorites.has(item.id) ? 'opacity-100' : 'opacity-70 hover:opacity-100'
                          }`}
                      >
                        <motion.span
                          key={favorites.has(item.id) ? 'fav' : 'unfav'}
                          initial={{ scale: 0.6 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.2 }}
                          style={{ color: favorites.has(item.id) ? '#e0245e' : '#ffffff' }}
                        >
                          {favorites.has(item.id) ? '♥' : '♡'}
                        </motion.span>
                      </motion.button>
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 pt-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <figcaption
                          className="text-sm font-bold line-clamp-1"
                          style={{ color: cardTheme?.accent ?? '#ffffff' }}
                        >
                          {item.title}
                        </figcaption>
                      </div>
                    </div>
                  </motion.figure>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                {Array.from({ length: totalPages }, (_, index) => {
                  const pageNum = index + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => {
                        setCurrentPage(pageNum);
                        document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      aria-current={safePage === pageNum ? 'page' : undefined}
                      className={`w-9 h-9 rounded-full font-bold text-xs transition-all border flex items-center justify-center ${safePage === pageNum
                          ? 'bg-[var(--color-accent)] text-[var(--color-accent-ink)] border-[var(--color-accent)]'
                          : 'bg-transparent text-[var(--color-text-muted)] border-[var(--color-border)] hover:text-[var(--color-text)]'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>

      {/* LIGHTBOX */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleModalBackdropClick}
            ref={dialogRef as React.Ref<HTMLDivElement>}
            role="dialog"
            aria-modal="true"
            aria-label={selectedItem.title}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
          >
            <motion.div
              initial={{ scale: 0.95, y: 16, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 16, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col md:flex-row shadow-2xl"
            >
              <div className={`w-full md:w-3/5 bg-black relative min-h-[320px] md:min-h-[480px] flex items-center justify-center ${zoomed ? 'overflow-auto' : 'overflow-hidden'}`}>
                {filteredItems.length > 1 && !zoomed && (
                  <span className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-full bg-black/50 text-white text-[11px] font-bold tracking-wide border border-white/20 backdrop-blur-sm tabular-nums">
                    {selectedIndex + 1} / {filteredItems.length}
                  </span>
                )}
                <button
                  onClick={goToPrev}
                  disabled={!hasPrev || zoomed}
                  aria-label={t.modal.prev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white text-2xl leading-none border border-white/20 backdrop-blur-sm hover:bg-black/70 transition-colors disabled:opacity-0 disabled:pointer-events-none"
                >
                  ‹
                </button>
                <button
                  onClick={goToNext}
                  disabled={!hasNext || zoomed}
                  aria-label={t.modal.next}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/50 text-white text-2xl leading-none border border-white/20 backdrop-blur-sm hover:bg-black/70 transition-colors disabled:opacity-0 disabled:pointer-events-none"
                >
                  ›
                </button>
                {!selectedItem.videoUrl && !zoomed && (
                  <div
                    className="absolute inset-0 bg-cover bg-center filter blur-2xl opacity-30 scale-110 pointer-events-none"
                    style={{ backgroundImage: `url(${selectedItem.src})` }}
                  />
                )}
                {selectedItem.videoUrl ? (
                  <video src={selectedItem.videoUrl} controls autoPlay loop className="relative z-10 max-h-[60vh] w-full object-contain" />
                ) : zoomed ? (
                  <Image
                    src={selectedItem.src}
                    alt={selectedItem.title}
                    width={0}
                    height={0}
                    sizes="90vw"
                    onClick={() => setZoomed(false)}
                    className="relative z-10 max-w-none w-auto h-auto cursor-zoom-out"
                  />
                ) : (
                  <Image
                    src={selectedItem.src}
                    alt={selectedItem.title}
                    width={0}
                    height={0}
                    sizes="(max-width: 768px) 100vw, 60vw"
                    onClick={() => setZoomed(true)}
                    className="relative z-10 max-h-[60vh] w-full h-auto object-contain cursor-zoom-in"
                  />
                )}
              </div>
              <div className="w-full md:w-2/5 p-6 flex flex-col">
                <div className="flex justify-between items-center">
                  <span
                    className="text-xs font-bold uppercase tracking-widest"
                    style={{ color: categoryTextColor(modalTheme) }}
                  >
                    {selectedItem.author}
                  </span>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileTap={{ scale: 1.3 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                      onClick={() => toggleFavorite(selectedItem.id)}
                      aria-label={favorites.has(selectedItem.id) ? t.modal.removeFavorite : t.modal.addFavorite}
                      aria-pressed={favorites.has(selectedItem.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] text-base"
                    >
                      <motion.span
                        key={favorites.has(selectedItem.id) ? 'fav' : 'unfav'}
                        initial={{ scale: 0.6 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                        style={{ color: favorites.has(selectedItem.id) ? '#e0245e' : 'var(--color-text-muted)' }}
                      >
                        {favorites.has(selectedItem.id) ? '♥' : '♡'}
                      </motion.span>
                    </motion.button>
                    <button
                      ref={closeButtonRef}
                      onClick={closeModal}
                      aria-label={t.modal.close}
                      className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text)] bg-[var(--color-surface-2)] border border-[var(--color-border)]"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                  <h3 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight text-[var(--color-text)] mb-3">{selectedItem.title}</h3>
                  <div
                    className="w-full pt-4 mt-3 flex flex-col gap-2.5"
                    style={{ borderTop: `1px solid ${modalTheme ? `${modalTheme.accent}40` : 'var(--color-border)'}` }}
                  >
                    <a
                      href={selectedItem.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-button block text-center text-xs font-bold uppercase tracking-wider py-3 rounded-full hover:brightness-110 transition"
                      style={{
                        color: modalTheme?.ink ?? 'var(--color-accent-ink)',
                        background: modalTheme?.accent ?? 'var(--color-accent)',
                        boxShadow: `0 8px 24px -8px ${modalTheme?.accent ?? 'var(--shadow-accent)'}`,
                      }}
                    >
                      {t.modal.viewOnIg} ↗
                    </a>
                    <button
                      onClick={() => handleCopyLink(selectedItem.permalink)}
                      className="block w-full text-center text-xs font-bold uppercase tracking-wider text-[var(--color-text)] bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] py-3 rounded-full border border-[var(--color-border)] transition-all"
                    >
                      {copied ? t.modal.copied + ' ✨' : t.modal.copyLink}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <QrCodeModal isOpen={qrOpen} colorIndex={qrColorIndex} onClose={closeQr} />

      {/* ABOUT */}
      <section id="about" ref={aboutRef} className="max-w-5xl mx-auto px-6 py-20 relative z-10">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid md:grid-cols-[1.2fr_0.8fr] gap-10 items-center bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-8 md:p-14"
        >
          <div>
            <span className="text-xs font-bold text-[var(--color-accent-text)] uppercase tracking-widest">{t.aboutSection.eyebrow}</span>
            <h3 className="font-display text-2xl md:text-3xl font-semibold text-[var(--color-text)] mt-3 mb-5 tracking-tight">{t.aboutSection.title}</h3>
            <p className="text-[var(--color-text-muted)] text-base leading-relaxed">{t.aboutSection.desc}</p>
          </div>
          <div className="flex md:flex-col gap-4 md:gap-6 md:border-l md:border-[var(--color-border)] md:pl-10">
            <a href="https://instagram.com/iantadventurer" target="_blank" rel="noopener noreferrer" className="font-button inline-flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-text)] border border-[var(--color-border)] px-6 py-3.5 rounded-full hover:border-[var(--color-accent)] hover:text-[var(--color-accent-text)] transition whitespace-nowrap">
              {t.aboutSection.cta}
            </a>
          </div>
        </motion.div>
      </section>

      <StudDivider />

      {/* FOOTER */}
      <footer className="border-t border-[var(--color-border)] py-14 px-6 relative z-10 mt-6">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-3 gap-10 text-sm">
          <div>
            <span className="font-display font-semibold text-[var(--color-text)] block mb-2">@iantadventurer</span>
            <p className="text-[var(--color-text-muted)] max-w-xs leading-relaxed">{t.footer.tagline}</p>
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-faint)] block mb-3">{t.footer.linksTitle}</span>
            <div className="flex flex-col gap-1 text-[var(--color-text-muted)]">
              <a href="#gallery" className="hover:text-[var(--color-text)] w-fit block py-1">{t.nav.gallery}</a>
              <Link href="/comunidad" className="hover:text-[var(--color-text)] w-fit block py-1">{t.nav.community}</Link>
              <a href="#about" className="hover:text-[var(--color-text)] w-fit block py-1">{t.nav.about}</a>
            </div>
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-faint)] block mb-3">{t.footer.followTitle}</span>
            <div className="flex flex-col gap-1">
              <a href="https://instagram.com/iantadventurer" target="_blank" rel="noopener noreferrer" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] w-fit block py-1">Instagram ↗</a>
              <button onClick={openQr} aria-label={t.footer.qrLabel} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] w-fit text-left py-1">
                {t.footer.qrLabel}
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-[var(--color-border)] text-xs text-[var(--color-text-faint)]">
          {t.disclaimer}
        </div>
      </footer>
    </main>
  );
}
