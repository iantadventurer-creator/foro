'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { GallerySkeleton } from '@/components/ui/GallerySkeleton';
import { StudDivider } from '@/components/ui/StudDivider';
import { QrCodeButton } from '@/components/ui/QrCodeButton';
import { supabase } from '@/lib/supabaseClient';

type FeedItem = {
  id: string;
  title: string;
  captionFull: string;
  tags: string[];
  src: string;
  videoUrl: string | null;
  permalink: string;
  mediaType: 'VIDEO' | 'IMAGE';
  author: string;
  date: string;
  /** Nombre de la subcarpeta del bucket (p. ej. "STAR WARS"), o null si la foto está suelta en la raíz. */
  category: string | null;
  /** Fecha real (no formateada) para poder ordenar por más reciente entre categorías. */
  createdAtMs: number;
};

/** Nombre del bucket público de Supabase Storage donde se suben las fotos de la galería. */
const GALLERY_BUCKET = 'galeria';
const VIDEO_EXTENSIONS = ['mp4', 'mov', 'webm'];

/** "STAR WARS" → "Star Wars", pero conserva las siglas cortas (p. ej. "DC") en mayúsculas. */
function formatCategoryLabel(raw: string): string {
  return raw
    .toLowerCase()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => (word.length <= 2 ? word.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1)))
    .join(' ');
}

/** Color de acento propio por categoría/franquicia, con su sombra "de canto" y el color de texto legible sobre ese fondo. */
const CATEGORY_THEMES: Record<string, { accent: string; shadow: string; ink: string }> = {
  'star wars': { accent: '#E8B923', shadow: '#8a6e14', ink: '#1a1300' },
  ninjago: { accent: '#FF6B00', shadow: '#a34500', ink: '#2b1200' },
  marvel: { accent: '#C0110C', shadow: '#6e0a07', ink: '#ffffff' },
  dc: { accent: '#0476F2', shadow: '#024a99', ink: '#ffffff' },
  minecraft: { accent: '#5C9E31', shadow: '#375f1d', ink: '#ffffff' },
  chill: { accent: '#8B7CF6', shadow: '#4f4499', ink: '#ffffff' },
};

function getCategoryTheme(category: string | null): { accent: string; shadow: string; ink: string } | null {
  if (!category) return null;
  return CATEGORY_THEMES[category.trim().toLowerCase()] || null;
}

function FilterPill({
  children,
  onClick,
  active,
  theme,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active: boolean;
  theme?: { accent: string; shadow: string; ink: string } | null;
}) {
  return (
    <motion.button
      onClick={onClick}
      aria-pressed={active}
      whileTap={active ? { y: 1 } : undefined}
      style={
        active && theme
          ? { background: theme.accent, color: theme.ink, borderColor: theme.accent, boxShadow: `0 3px 0 0 ${theme.shadow}` }
          : undefined
      }
      className={`px-6 py-3 rounded-full text-sm font-semibold uppercase tracking-wider transition-colors duration-200 whitespace-nowrap border ${active
          ? theme
            ? ''
            : 'bg-[var(--color-accent)] text-[var(--color-accent-ink)] border-[var(--color-accent)] shadow-[0_3px_0_0_var(--shadow-accent)]'
          : 'bg-transparent text-[var(--color-text-muted)] border-[var(--color-border)] hover:text-[var(--color-text)] hover:border-[var(--color-text-muted)]'
        }`}
    >
      {children}
    </motion.button>
  );
}

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
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  // Mantiene el atributo lang del documento sincronizado con el selector ES/EN
  // (accesibilidad para lectores de pantalla y SEO).
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const openItem = (item: FeedItem) => {
    lastFocusedRef.current = document.activeElement as HTMLElement;
    setSelectedItem(item);
  };

  const closeModal = () => setSelectedItem(null);

  // Cierra el modal con Escape y devuelve el foco a quien lo abrió al cerrarse.
  useEffect(() => {
    if (!selectedItem) return;
    closeButtonRef.current?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') closeModal();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      lastFocusedRef.current?.focus();
    };
  }, [selectedItem]);

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
        captionFull: '',
        tags: [],
        src: publicUrl,
        videoUrl: isVideoType ? publicUrl : null,
        permalink: 'https://instagram.com/iantadventurer',
        mediaType: isVideoType ? 'VIDEO' : 'IMAGE',
        author: '@iantadventurer',
        category,
        createdAtMs,
        date: createdAt
          ? new Date(createdAt).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })
          : '',
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
          .list('', { sortBy: { column: 'name', order: 'asc' } });

        if (error) throw error;

        const items: FeedItem[] = [];

        for (const entry of rootEntries || []) {
          if (!entry.name || entry.name.startsWith('.')) continue;
          const isFolder = entry.id === null;

          if (isFolder) {
            const { data: subEntries } = await supabase.storage
              .from(GALLERY_BUCKET)
              .list(entry.name, { sortBy: { column: 'created_at', order: 'desc' } });

            for (const file of subEntries || []) {
              if (!file.name || file.name.startsWith('.') || file.id === null) continue;
              items.push(buildItem(file, entry.name, `${entry.name}/${file.name}`));
            }
          } else {
            items.push(buildItem(entry, null, entry.name));
          }
        }

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
  }, [lang, retryCount]);

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
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
    if (!filterCategory) return feedItems;
    return feedItems.filter((item) => item.category === filterCategory);
  }, [feedItems, filterCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedItems = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, safePage]);

  const previewShots = feedItems.slice(0, 3);
  const modalTheme = getCategoryTheme(selectedItem?.category ?? null);

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
      gallery: {
        title: 'Universo creado',
        subtitle: 'Cada escena es un set construido desde cero: piezas, luz y paciencia.',
        filterAll: 'Todo',
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
      gallery: {
        title: 'Crafted universe',
        subtitle: 'Every scene is a set built from scratch: bricks, light, and patience.',
        filterAll: 'All',
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
    <main className="min-h-screen text-[var(--color-text)] font-sans relative z-0 overflow-x-hidden">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-[var(--color-ink)]/85 backdrop-blur-md border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <a href="#top" className="flex items-center gap-3 group">
            <div className="w-9 h-9 shadow-[0_3px_0_0_var(--shadow-accent)] group-hover:-translate-y-0.5 group-hover:shadow-[0_4px_0_0_var(--shadow-accent)] transition-all rounded-md overflow-hidden">
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
              <span className="text-[10px] text-[var(--color-accent)] font-semibold tracking-[0.2em] uppercase">Studio</span>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[var(--color-text-muted)]">
            <a href="#gallery" className="group relative py-1 hover:text-[var(--color-text)] transition-colors">
              {t.nav.gallery}
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-[var(--color-accent)] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
            </a>
            <Link href="/comunidad" className="group relative py-1 hover:text-[var(--color-text)] transition-colors">
              {t.nav.community}
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-[var(--color-accent-2)] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
            </Link>
            <a href="#about" className="group relative py-1 hover:text-[var(--color-text)] transition-colors">
              {t.nav.about}
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-[var(--color-accent-3)] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
            </a>
            <QrCodeButton
              label={t.footer.qrLabel}
              className="group relative py-1 hover:text-[var(--color-text)] transition-colors"
            >
              {t.footer.qrLabel}
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-[var(--color-accent-4)] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
            </QrCodeButton>
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
              className="font-button hidden sm:inline-flex items-center text-xs font-bold uppercase tracking-wide text-[var(--color-accent-ink)] bg-[var(--color-accent)] px-5 py-2.5 rounded-full shadow-[0_3px_0_0_var(--shadow-accent)] hover:brightness-110 transition-[filter]"
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
                <QrCodeButton
                  label={t.footer.qrLabel}
                  className="block w-full text-left py-3 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                  onBeforeOpen={() => setMobileMenuOpen(false)}
                />
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
          <motion.div variants={fadeUp} initial="hidden" animate="visible" className="inline-flex items-center gap-2 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-accent)] text-xs font-bold px-4 py-2 rounded-full mb-6 uppercase tracking-widest">
            {t.hero.badge}
          </motion.div>

          <motion.h1 variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.05 }} className="font-display text-4xl md:text-6xl font-semibold tracking-tight text-[var(--color-text)] mb-6 leading-[1.05]">
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
              className="font-button inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[var(--color-accent-ink)] bg-[var(--color-accent)] px-7 py-3.5 rounded-full shadow-[0_5px_0_0_var(--shadow-accent)] hover:brightness-110 transition-[filter]"
            >
              {t.hero.btnExplore} ↓
            </motion.a>
            <motion.div whileHover={{ y: -3 }} whileTap={{ y: 2 }}>
              <Link href="/comunidad" className="font-button inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-white bg-[var(--color-accent-3)] px-7 py-3.5 rounded-full shadow-[0_5px_0_0_var(--shadow-accent-3)] hover:brightness-110 transition-[filter]">
                {t.nav.community}
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <div className="relative h-72 md:h-96 hidden sm:block" aria-hidden="true">
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

      <StudDivider />

      {/* GALLERY */}
      <section id="gallery" className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        <div className="mb-12 flex flex-col items-center text-center gap-6">
          <div>
            <motion.h2 initial={{ opacity: 0, y: -10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-[var(--color-text)]">
              {t.gallery.title}
            </motion.h2>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">{t.gallery.subtitle}</p>
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
            {t.gallery.empty}
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
                        <div className="absolute top-3 right-3 bg-[var(--color-accent-2)] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                          Reel
                        </div>
                      )}
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
            onClick={closeModal}
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
              <div className="w-full md:w-3/5 bg-black relative min-h-[320px] md:min-h-[480px] flex items-center justify-center overflow-hidden">
                {!selectedItem.videoUrl && (
                  <div
                    className="absolute inset-0 bg-cover bg-center filter blur-2xl opacity-30 scale-110 pointer-events-none"
                    style={{ backgroundImage: `url(${selectedItem.src})` }}
                  />
                )}
                {selectedItem.videoUrl ? (
                  <video src={selectedItem.videoUrl} controls autoPlay loop className="relative z-10 max-h-[60vh] w-full object-contain" />
                ) : (
                  <Image
                    src={selectedItem.src}
                    alt={selectedItem.title}
                    width={0}
                    height={0}
                    sizes="(max-width: 768px) 100vw, 60vw"
                    className="relative z-10 max-h-[60vh] w-full h-auto object-contain"
                  />
                )}
              </div>
              <div className="w-full md:w-2/5 p-6 flex flex-col">
                <div className="flex justify-between items-center">
                  <span
                    className="text-xs font-bold uppercase tracking-widest"
                    style={{ color: modalTheme?.accent ?? 'var(--color-accent)' }}
                  >
                    {selectedItem.author}
                  </span>
                  <button
                    ref={closeButtonRef}
                    onClick={closeModal}
                    aria-label={t.modal.close}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text)] bg-[var(--color-surface-2)] border border-[var(--color-border)]"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                  <h3 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight text-[var(--color-text)] mb-3">{selectedItem.title}</h3>
                  {selectedItem.captionFull.trim() && (
                    <p className="text-sm text-[var(--color-text-muted)] whitespace-pre-line leading-relaxed mb-6">{selectedItem.captionFull}</p>
                  )}
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
                        boxShadow: `0 4px 0 0 ${modalTheme?.shadow ?? 'var(--shadow-accent)'}`,
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

      {/* ABOUT */}
      <section id="about" className="max-w-5xl mx-auto px-6 py-20 relative z-10">
        <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-10 items-center bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-8 md:p-14">
          <div>
            <span className="text-xs font-bold text-[var(--color-accent)] uppercase tracking-widest">{t.aboutSection.eyebrow}</span>
            <h3 className="font-display text-2xl md:text-3xl font-semibold text-[var(--color-text)] mt-3 mb-5 tracking-tight">{t.aboutSection.title}</h3>
            <p className="text-[var(--color-text-muted)] text-base leading-relaxed">{t.aboutSection.desc}</p>
          </div>
          <div className="flex md:flex-col gap-4 md:gap-6 md:border-l md:border-[var(--color-border)] md:pl-10">
            <a href="https://instagram.com/iantadventurer" target="_blank" rel="noopener noreferrer" className="font-button inline-flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-text)] border border-[var(--color-border)] px-6 py-3.5 rounded-full hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition whitespace-nowrap">
              {t.aboutSection.cta}
            </a>
          </div>
        </div>
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
            <div className="flex flex-col gap-2 text-[var(--color-text-muted)]">
              <a href="#gallery" className="hover:text-[var(--color-text)] w-fit">{t.nav.gallery}</a>
              <Link href="/comunidad" className="hover:text-[var(--color-text)] w-fit">{t.nav.community}</Link>
              <a href="#about" className="hover:text-[var(--color-text)] w-fit">{t.nav.about}</a>
            </div>
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-faint)] block mb-3">{t.footer.followTitle}</span>
            <div className="flex flex-col gap-2">
              <a href="https://instagram.com/iantadventurer" target="_blank" rel="noopener noreferrer" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] w-fit block">Instagram ↗</a>
              <QrCodeButton label={t.footer.qrLabel} />
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
