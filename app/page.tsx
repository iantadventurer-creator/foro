'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { QrCodeModal, pickRandomQrColor } from '@/components/ui/QrCodeButton';
import { StudDivider } from '@/components/ui/StudDivider';
import { SiteHeader, type ActiveSection } from '@/components/home/SiteHeader';
import { Hero } from '@/components/home/Hero';
import { IntroSection } from '@/components/home/IntroSection';
import { GallerySection } from '@/components/home/GallerySection';
import { Lightbox } from '@/components/home/Lightbox';
import { AboutSection } from '@/components/home/AboutSection';
import { SiteFooter } from '@/components/home/SiteFooter';
import { homeContent } from '@/lib/homeContent';
import { loadGalleryItems, type FeedItem } from '@/lib/gallery';
import { useFavorites } from '@/lib/useFavorites';
import { useBodyScrollLock } from '@/lib/useBodyScrollLock';

const ITEMS_PER_PAGE = 12;

export default function Home() {
  const [lang, setLang] = useState<'es' | 'en'>('es');
  const [selectedItem, setSelectedItem] = useState<FeedItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedError, setFeedError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [activeSection, setActiveSection] = useState<ActiveSection>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrColorIndex, setQrColorIndex] = useState<number | null>(null);
  const { favorites, toggleFavorite } = useFavorites();

  const galleryRef = useRef<HTMLElement | null>(null);
  const aboutRef = useRef<HTMLElement | null>(null);
  const t = homeContent[lang];

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
  useBodyScrollLock(qrOpen);

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

  useEffect(() => {
    let cancelled = false;

    async function loadGallery() {
      setLoading(true);
      setFeedError(false);
      try {
        const items = await loadGalleryItems();
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

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedItems = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, safePage]);

  const selectCategory = (category: string | null) => {
    setFilterCategory(category);
    setCurrentPage(1);
  };

  // Vuelve a la página 1 al cambiar el filtro de favoritos (si no, se podría
  // quedar en una página que ya no existe para el nuevo filtro).
  const toggleOnlyFavorites = () => {
    setShowOnlyFavorites((v) => !v);
    setCurrentPage(1);
  };

  const closeLightbox = useCallback(() => setSelectedItem(null), []);

  return (
    <main id="contenido" tabIndex={-1} className="min-h-screen text-[var(--color-text)] font-sans relative z-0 overflow-x-hidden focus:outline-none">
      <SiteHeader t={t} lang={lang} onLangChange={setLang} activeSection={activeSection} onOpenQr={openQr} />
      <Hero t={t} previewShots={feedItems.slice(0, 3)} />
      <IntroSection t={t} />
      <GallerySection
        t={t}
        sectionRef={galleryRef}
        items={paginatedItems}
        totalItems={filteredItems.length}
        loading={loading}
        feedError={feedError}
        categories={categories}
        filterCategory={filterCategory}
        showOnlyFavorites={showOnlyFavorites}
        favorites={favorites}
        totalPages={totalPages}
        safePage={safePage}
        onSelectCategory={selectCategory}
        onToggleOnlyFavorites={toggleOnlyFavorites}
        onRetry={() => setRetryCount((c) => c + 1)}
        onOpenItem={setSelectedItem}
        onToggleFavorite={toggleFavorite}
        onPageChange={setCurrentPage}
      />
      <Lightbox
        t={t}
        item={selectedItem}
        items={filteredItems}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        onSelect={setSelectedItem}
        onClose={closeLightbox}
      />
      <QrCodeModal isOpen={qrOpen} colorIndex={qrColorIndex} onClose={closeQr} />
      <AboutSection t={t} sectionRef={aboutRef} />
      <StudDivider />
      <SiteFooter t={t} onOpenQr={openQr} />
    </main>
  );
}
