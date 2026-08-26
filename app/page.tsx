'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { GallerySkeleton } from '@/components/ui/GallerySkeleton';

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
};

type FilterType = 'ALL' | 'REELS' | 'PHOTOS';

/** Forma (parcial) de un post tal como lo devuelve el feed de Behold/Instagram. */
type BeholdRawPost = {
  id?: string;
  caption?: string;
  mediaType?: string;
  videoUrl?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  permalink?: string;
  timestamp?: string | number;
  sizes?: { medium?: { mediaUrl?: string } };
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 260, damping: 24 },
  },
};

function FilterPill({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-colors duration-200 whitespace-nowrap border ${active
          ? 'bg-[var(--color-accent)] text-[#1a1300] border-[var(--color-accent)]'
          : 'bg-transparent text-[var(--color-text-muted)] border-[var(--color-border)] hover:text-[var(--color-text)] hover:border-[var(--color-text-muted)]'
        }`}
    >
      {children}
    </button>
  );
}

export default function Home() {
  const [lang, setLang] = useState<'es' | 'en'>('es');
  const [selectedItem, setSelectedItem] = useState<FeedItem | null>(null);
  const [filterType, setFilterType] = useState<FilterType>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedError, setFeedError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

    async function loadInstagramFeed() {
      setLoading(true);
      setFeedError(false);
      try {
        const response = await fetch('/api/behold');
        if (!response.ok) throw new Error('Error al conectar');
        const data = await response.json();
        const rawPosts: BeholdRawPost[] = Array.isArray(data) ? data : (data.posts || data.data || []);

        const formattedPosts: FeedItem[] = rawPosts.map((item, index) => {
          const caption = item.caption || '';
          const isVideoType = item.mediaType === 'VIDEO' || item.mediaType === 'REEL' || !!item.videoUrl;

          return {
            id: item.id || `feed-${index}`,
            title: caption ? caption.split('\n')[0] : 'Toy Photography',
            captionFull: caption,
            tags: (caption.match(/#[a-zA-Z0-9_]+/g) || []).map((t: string) => t.toLowerCase()),
            src: item.thumbnailUrl || item.mediaUrl || item.sizes?.medium?.mediaUrl || item.permalink || '',
            videoUrl: isVideoType ? (item.mediaUrl || item.videoUrl || null) : null,
            permalink: item.permalink || 'https://instagram.com/iantadventurer',
            mediaType: isVideoType ? 'VIDEO' : 'IMAGE',
            author: '@iantadventurer',
            date: item.timestamp
              ? new Date(item.timestamp).toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })
              : '',
          };
        });
        if (!cancelled) setFeedItems(formattedPosts);
      } catch (error) {
        console.error('Error cargando el feed:', error);
        if (!cancelled) setFeedError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadInstagramFeed();
    return () => {
      cancelled = true;
    };
  }, [lang, retryCount]);

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const filteredItems = useMemo(() => {
    return feedItems.filter((item) => {
      if (filterType === 'REELS' && item.mediaType !== 'VIDEO') return false;
      if (filterType === 'PHOTOS' && item.mediaType === 'VIDEO') return false;
      return true;
    });
  }, [feedItems, filterType]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedItems = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, safePage]);

  const previewShots = feedItems.slice(0, 3);

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
        filters: { all: 'Todo', reels: 'Reels', photos: 'Fotografías' },
        empty: 'No hay publicaciones con este filtro.',
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
        filters: { all: 'All', reels: 'Reels', photos: 'Photographs' },
        empty: 'No posts match this filter.',
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
      },
      disclaimer: 'LEGO® is a registered trademark of The LEGO Group, which does not sponsor or endorse this website.',
    },
  };

  const t = content[lang];

  return (
    <main className="min-h-screen bg-[var(--color-ink)] text-[var(--color-text)] font-sans relative overflow-x-hidden">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-[var(--color-ink)]/85 backdrop-blur-md border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
          <a href="#top" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-[var(--color-accent)] flex items-center justify-center gap-1 p-1.5 group-hover:-translate-y-0.5 transition-transform">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1a1300]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#1a1300]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#1a1300]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#1a1300]" />
            </div>
            <div className="leading-none">
              <span className="font-display font-semibold text-base tracking-tight text-[var(--color-text)] block">IanTBuild</span>
              <span className="text-[10px] text-[var(--color-accent)] font-semibold tracking-[0.2em] uppercase">Studio</span>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--color-text-muted)]">
            <a href="#gallery" className="hover:text-[var(--color-text)] transition-colors">{t.nav.gallery}</a>
            <Link href="/comunidad" className="hover:text-[var(--color-text)] transition-colors">{t.nav.community}</Link>
            <a href="#about" className="hover:text-[var(--color-text)] transition-colors">{t.nav.about}</a>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1 bg-[var(--color-surface)] p-1 rounded-full border border-[var(--color-border)]">
              <button onClick={() => setLang('es')} aria-pressed={lang === 'es'} className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${lang === 'es' ? 'bg-[var(--color-accent)] text-[#1a1300]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}>ES</button>
              <button onClick={() => setLang('en')} aria-pressed={lang === 'en'} className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${lang === 'en' ? 'bg-[var(--color-accent)] text-[#1a1300]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'}`}>EN</button>
            </div>
            <a href="https://instagram.com/iantadventurer" target="_blank" rel="noopener noreferrer" className="hidden sm:inline-flex items-center text-xs font-bold uppercase tracking-wide text-[#1a1300] bg-[var(--color-accent)] px-5 py-2.5 rounded-full hover:brightness-110 transition">
              {t.nav.cta}
            </a>
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
              <div className="px-6 py-5 flex flex-col gap-4 text-sm font-semibold">
                <a href="#gallery" onClick={() => setMobileMenuOpen(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">{t.nav.gallery}</a>
                <Link href="/comunidad" onClick={() => setMobileMenuOpen(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">{t.nav.community}</Link>
                <a href="#about" onClick={() => setMobileMenuOpen(false)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">{t.nav.about}</a>
                <div className="flex items-center gap-1 bg-[var(--color-surface)] p-1 rounded-full border border-[var(--color-border)] w-fit">
                  <button onClick={() => setLang('es')} className={`px-3 py-1 rounded-full text-xs font-bold ${lang === 'es' ? 'bg-[var(--color-accent)] text-[#1a1300]' : 'text-[var(--color-text-muted)]'}`}>ES</button>
                  <button onClick={() => setLang('en')} className={`px-3 py-1 rounded-full text-xs font-bold ${lang === 'en' ? 'bg-[var(--color-accent)] text-[#1a1300]' : 'text-[var(--color-text-muted)]'}`}>EN</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* HERO */}
      <section id="top" className="relative max-w-7xl mx-auto px-6 pt-20 pb-24 grid md:grid-cols-2 gap-16 items-center">
        <div className="absolute top-10 left-0 w-[28rem] h-[28rem] bg-[var(--color-accent-3)]/10 rounded-full blur-[130px] pointer-events-none -z-10" />
        <div className="absolute bottom-0 right-0 w-[24rem] h-[24rem] bg-[var(--color-accent)]/10 rounded-full blur-[130px] pointer-events-none -z-10" />

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
            <a href="#gallery" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[#1a1300] bg-[var(--color-accent)] px-7 py-3.5 rounded-full hover:brightness-110 transition">
              {t.hero.btnExplore} ↓
            </a>
            <Link href="/comunidad" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-[var(--color-text)] border border-[var(--color-border)] px-7 py-3.5 rounded-full hover:border-[var(--color-text-muted)] transition">
              {t.nav.community} ✨
            </Link>
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
                <img src={item.src} alt="" className="w-full h-full object-cover" />
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

      {/* GALLERY */}
      <section id="gallery" className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        <div className="flex flex-col gap-6 mb-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
            <div>
              <motion.h2 initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="font-display text-2xl md:text-3xl font-semibold tracking-tight text-[var(--color-text)]">
                {t.gallery.title}
              </motion.h2>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">{t.gallery.subtitle}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <FilterPill onClick={() => { setFilterType('ALL'); setCurrentPage(1); }} active={filterType === 'ALL'}>{t.gallery.filters.all}</FilterPill>
              <FilterPill onClick={() => { setFilterType('REELS'); setCurrentPage(1); }} active={filterType === 'REELS'}>{t.gallery.filters.reels}</FilterPill>
              <FilterPill onClick={() => { setFilterType('PHOTOS'); setCurrentPage(1); }} active={filterType === 'PHOTOS'}>{t.gallery.filters.photos}</FilterPill>
            </div>
          </div>
        </div>

        {loading ? (
          <GallerySkeleton />
        ) : feedError ? (
          <div className="flex flex-col items-center text-center py-24 gap-4 border border-dashed border-[var(--color-border)] rounded-2xl">
            <p className="text-[var(--color-text)] font-semibold">{t.gallery.errorTitle}</p>
            <p className="text-sm text-[var(--color-text-muted)] max-w-xs">{t.gallery.errorDesc}</p>
            <button onClick={() => setRetryCount((c) => c + 1)} className="mt-2 text-xs font-bold uppercase tracking-wide bg-[var(--color-accent)] text-[#1a1300] px-5 py-2.5 rounded-full hover:brightness-110 transition">
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
                    className="mb-6 break-inside-avoid group cursor-pointer rounded-2xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-accent)]/60 transition-colors relative focus-visible:border-[var(--color-accent)]"
                  >
                    <div className="relative overflow-hidden bg-black">
                      <img
                        src={item.src}
                        alt={item.title}
                        loading="lazy"
                        className="w-full h-auto object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                      />
                      {isVideo && (
                        <div className="absolute top-3 right-3 bg-[var(--color-accent-2)] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                          Reel
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 pt-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <figcaption className="text-sm font-semibold text-white line-clamp-1">{item.title}</figcaption>
                        <p className="text-xs text-white/70 mt-0.5">{item.date}</p>
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
                          ? 'bg-[var(--color-accent)] text-[#1a1300] border-[var(--color-accent)]'
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
                  <video src={selectedItem.videoUrl} controls autoPlay loop className="relative z-10 max-h-[75vh] w-full object-contain" />
                ) : (
                  <img src={selectedItem.src} alt={selectedItem.title} className="relative z-10 max-h-[75vh] w-full object-contain" />
                )}
              </div>
              <div className="w-full md:w-2/5 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-5">
                    <span className="text-xs font-bold text-[var(--color-accent)] uppercase tracking-widest">{selectedItem.author}</span>
                    <button
                      ref={closeButtonRef}
                      onClick={closeModal}
                      aria-label={t.modal.close}
                      className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text)] bg-[var(--color-surface-2)] border border-[var(--color-border)]"
                    >
                      ✕
                    </button>
                  </div>
                  <h3 className="font-display text-lg font-semibold text-[var(--color-text)] mb-3">{selectedItem.title}</h3>
                  <p className="text-sm text-[var(--color-text-muted)] whitespace-pre-line leading-relaxed mb-6">{selectedItem.captionFull}</p>
                </div>
                <div className="pt-4 border-t border-[var(--color-border)] flex flex-col gap-2.5">
                  <a
                    href={selectedItem.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center text-xs font-bold uppercase tracking-wider text-[#1a1300] bg-[var(--color-accent)] py-3 rounded-full hover:brightness-110 transition"
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
            <a href="https://instagram.com/iantadventurer" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-text)] border border-[var(--color-border)] px-6 py-3.5 rounded-full hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition whitespace-nowrap">
              {t.aboutSection.cta}
            </a>
          </div>
        </div>
      </section>

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
            <a href="https://instagram.com/iantadventurer" target="_blank" rel="noopener noreferrer" className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] w-fit block">Instagram ↗</a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-[var(--color-border)] text-xs text-[var(--color-text-faint)]">
          {t.disclaimer}
        </div>
      </footer>
    </main>
  );
}
