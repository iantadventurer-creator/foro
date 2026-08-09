'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, Variants, useMotionValue, useTransform } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://elfxllhdschknqtznzsq.supabase.co';
const supabaseAnonKey = 'sb_publishable_euWYboszDK8iVzfZdPPOHg_zNjs5pwF';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const snapIn: Variants = {
  hidden: { opacity: 0, y: -50, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 15, mass: 1 },
  },
};

function InteractiveCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-150, 150], [6, -6]);
  const rotateY = useTransform(x, [-150, 150], [-6, 6]);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left - rect.width / 2);
    y.set(event.clientY - rect.top - rect.height / 2);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ y: -10 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`perspective-1000 ${className}`}
    >
      {children}
    </motion.div>
  );
}

const FloatingBrick = ({ color, top, left, rotate, delay }: any) => (
  <motion.div
    initial={{ y: 0, rotate }}
    animate={{ y: [0, -30, 0], rotate: [rotate, rotate + 10, rotate] }}
    transition={{ duration: 6, repeat: Infinity, delay, ease: 'easeInOut' }}
    className={`absolute ${top} ${left} opacity-[0.07] pointer-events-none hidden md:block z-0`}
  >
    <div className={`w-32 h-16 ${color} rounded-sm relative border-t-2 border-white/30 shadow-2xl flex items-center justify-around px-3`}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className={`w-5 h-5 rounded-full border-t border-white/40 shadow-inner ${color}`} />
      ))}
    </div>
  </motion.div>
);

const BlockButton = ({ children, onClick, active, colorClass }: any) => (
  <motion.button
    whileTap={{ y: 4, boxShadow: '0 0px 0 0 transparent' }}
    onClick={onClick}
    className={`px-4 py-2 rounded-lg font-black text-xs uppercase tracking-wider transition-colors duration-200 whitespace-nowrap
      ${active ? `${colorClass} text-black border-2 border-transparent` : 'bg-[#1A2235] text-gray-400 border-2 border-[#2A344A] hover:text-white'}
      shadow-[0_4px_0_0_#0F1523]`}
  >
    {children}
  </motion.button>
);

export default function Home() {
  const [lang, setLang] = useState<'es' | 'en'>('es');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [feedItems, setFeedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const ITEMS_PER_PAGE = 12;
  const BEHOLD_URL = 'https://feeds.behold.so/8rLncG8gRsaqP9kFJR2M?limit=250';

  useEffect(() => {
    async function loadInstagramFeed() {
      try {
        const response = await fetch(BEHOLD_URL);
        if (!response.ok) throw new Error('Error al conectar');
        const data = await response.json();
        const rawPosts = Array.isArray(data) ? data : (data.posts || data.data || []);

        if (rawPosts.length > 0) {
          const formattedPosts = rawPosts.map((item: any) => {
            const caption = item.caption || '';
            const matches = caption.match(/#[a-zA-Z0-9_]+/g) || [];
            const tags = matches.map((t: string) => t.toLowerCase());
            const isVideoType = item.mediaType === 'VIDEO' || item.mediaType === 'REEL' || !!item.videoUrl;

            return {
              id: item.id || Math.random().toString(),
              title: caption ? caption.split('\n')[0] : 'Toy Photography',
              captionFull: caption,
              tags: tags,
              src: item.thumbnailUrl || item.mediaUrl || item.sizes?.medium?.mediaUrl || item.permalink,
              videoUrl: isVideoType ? (item.mediaUrl || item.videoUrl) : null,
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
          setFeedItems(formattedPosts);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }
    loadInstagramFeed();
  }, [lang]);

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

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  const content = {
    es: {
      nav: { gallery: 'Galería', community: 'Comunidad Foro', about: 'Sobre Mí', cta: 'Abrir Instagram' },
      hero: {
        badgeWords: ['Pieza', 'por', 'pieza'],
        title: 'Donde los pequeños bloques cobran una gran vida.',
        description: 'Un portafolio inmersivo con dioramas épicos, iluminación cinematográfica y pura creatividad ensamblada.',
        btnExplore: 'Construir aventura',
      },
      gallery: {
        title: 'Universo Creado',
        filters: { all: 'Todo', reels: 'Reels', photos: 'Fotografías' },
      },
      aboutSection: {
        title: 'Detrás del lente',
        desc: '"Fan de los Legos desde niño. Ahora uso la fotografía para que cobren vida en mis propios escenarios."',
      },
      modal: {
        viewOnIg: 'Ver en Instagram ↗',
        copyLink: 'Copiar Enlace 🔗',
        copied: '¡Enlace copiado! ✨',
        close: 'Cerrar [X]',
      },
      disclaimer: 'LEGO® es una marca registrada de The LEGO Group, que no patrocina ni respalda este sitio web.',
    },
    en: {
      nav: { gallery: 'Gallery', community: 'Community Forum', about: 'About Me', cta: 'Open Instagram' },
      hero: {
        badgeWords: ['Brick', 'by', 'Brick'],
        title: 'Where small bricks come to giant life.',
        description: 'An immersive portfolio featuring epic dioramas, cinematic lighting, and pure miniature creativity assembled.',
        btnExplore: 'Build adventure',
      },
      gallery: {
        title: 'Crafted Universe',
        filters: { all: 'All', reels: 'Reels', photos: 'Photographs' },
      },
      aboutSection: {
        title: 'Behind the Lens',
        desc: 'Every shot combines advanced lighting techniques, meticulous set building, and a passion for snapping the perfect personality into each figure.',
      },
      modal: {
        viewOnIg: 'View on Instagram ↗',
        copyLink: 'Copy Link 🔗',
        copied: 'Link Copied! ✨',
        close: 'Close [X]',
      },
      disclaimer: 'LEGO® is a registered trademark of The LEGO Group, which does not sponsor or endorse this website.',
    },
  };

  const t = content[lang];

  return (
    <main className="min-h-screen bg-[#0B0F17] bg-[radial-gradient(rgba(255,255,255,0.03)_2px,transparent_2px)] bg-[length:24px_24px] text-white font-sans selection:bg-amber-400 selection:text-black relative overflow-x-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

      <FloatingBrick color="bg-red-600" top="top-32" left="left-10" rotate={-15} delay={0} />
      <FloatingBrick color="bg-blue-600" top="top-1/4" left="right-20" rotate={25} delay={1} />
      <FloatingBrick color="bg-amber-500" top="top-2/3" left="left-20" rotate={-10} delay={2} />

      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="sticky top-0 z-40 bg-[#0B0F17]/90 backdrop-blur-md border-b-4 border-[#1A2235] px-6 py-4"
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <motion.a whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} href="#" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-red-600 rounded-md border-t-2 border-red-400 shadow-[0_4px_0_0_#991b1b] flex flex-wrap p-1 gap-1 items-center justify-center group-hover:-translate-y-1 transition-transform">
              <div className="w-3 h-3 bg-red-700 rounded-full shadow-inner" />
              <div className="w-3 h-3 bg-red-700 rounded-full shadow-inner" />
              <div className="w-3 h-3 bg-red-700 rounded-full shadow-inner" />
              <div className="w-3 h-3 bg-red-700 rounded-full shadow-inner" />
            </div>
            <div>
              <span className="font-black text-sm tracking-tight text-white uppercase block">@iantadventurer</span>
              <span className="text-[10px] text-amber-400 font-bold tracking-widest uppercase">Studio</span>
            </div>
          </motion.a>

          <nav className="hidden md:flex items-center space-x-6 text-xs font-black uppercase tracking-wider text-gray-400">
            <a href="#gallery" className="hover:text-amber-400 transition-colors">{t.nav.gallery}</a>
            <a href="/comunidad" className="hover:text-amber-400 transition-colors text-amber-400">{t.nav.community} ✨</a>
            <a href="#about" className="hover:text-amber-400 transition-colors">{t.nav.about}</a>
          </nav>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-[#121824] p-1.5 rounded-lg border-2 border-[#1A2235]">
              <button onClick={() => setLang('es')} className={`px-3 py-1 rounded-md text-xs font-black transition-all ${lang === 'es' ? 'bg-amber-400 text-black shadow-sm' : 'text-gray-500 hover:text-white'}`}>ES</button>
              <button onClick={() => setLang('en')} className={`px-3 py-1 rounded-md text-xs font-black transition-all ${lang === 'en' ? 'bg-amber-400 text-black shadow-sm' : 'text-gray-500 hover:text-white'}`}>EN</button>
            </div>
            <motion.a whileHover={{ y: -2 }} whileTap={{ y: 2 }} href="https://instagram.com/iantadventurer" target="_blank" rel="noopener noreferrer" className="hidden sm:inline-flex items-center text-xs font-black uppercase tracking-wide text-black bg-blue-500 px-6 py-2.5 rounded-lg border-t-2 border-blue-300 shadow-[0_4px_0_0_#1e3a8a] transition-all">
              <span>{t.nav.cta}</span>
            </motion.a>
          </div>
        </div>
      </motion.header>

      <section className="max-w-4xl mx-auto px-6 pt-28 pb-20 text-center relative z-10">
        <motion.div
          className="inline-flex items-center gap-2 bg-[#1A2235] border-2 border-[#2A344A] text-amber-400 text-xs font-black px-4 py-2 rounded-md mb-6 uppercase tracking-widest shadow-lg"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.2 }
            }
          }}
        >
          {t.hero.badgeWords.map((word, i) => (
            <motion.span
              key={i}
              variants={{
                hidden: { opacity: 0, y: 15 },
                visible: { opacity: 1, y: 0 }
              }}
              transition={{ duration: 0.4, type: 'spring', stiffness: 300 }}
            >
              {word}
            </motion.span>
          ))}
        </motion.div>

        <motion.h1 variants={snapIn} initial="hidden" animate="visible" transition={{ delay: 0.1 }} className="text-4xl md:text-7xl font-black tracking-tighter text-white mb-6 leading-tight uppercase">
          {t.hero.title}
        </motion.h1>
        <motion.p variants={snapIn} initial="hidden" animate="visible" transition={{ delay: 0.2 }} className="text-gray-400 text-base md:text-lg max-w-xl mx-auto mb-10 font-bold leading-relaxed">
          {t.hero.description}
        </motion.p>
        <motion.div variants={snapIn} initial="hidden" animate="visible" transition={{ delay: 0.3 }} className="flex flex-wrap justify-center gap-4">
          <motion.a whileHover={{ y: -4 }} whileTap={{ y: 4 }} href="#gallery" className="inline-block text-sm font-black tracking-wider uppercase text-black bg-amber-400 px-10 py-4 rounded-xl shadow-[0_6px_0_0_#b45309] border-t-2 border-amber-200 transition-all">
            {t.hero.btnExplore} ↓
          </motion.a>
          <motion.a whileHover={{ y: -4 }} whileTap={{ y: 4 }} href="/comunidad" className="inline-block text-sm font-black tracking-wider uppercase text-white bg-[#1A2235] border-2 border-[#2A344A] px-8 py-4 rounded-xl shadow-[0_6px_0_0_#0F1523] transition-all hover:bg-[#2A344A]">
            {t.nav.community} ✨
          </motion.a>
        </motion.div>
      </section>

      <section id="gallery" className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        <div className="flex flex-col gap-6 mb-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
            <motion.h2 initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="text-3xl font-black tracking-tight text-white uppercase">
              {t.gallery.title}
            </motion.h2>
            <div className="flex items-center space-x-3">
              <BlockButton onClick={() => { setFilterType('ALL'); setCurrentPage(1); }} active={filterType === 'ALL'} colorClass="bg-amber-400">{t.gallery.filters.all}</BlockButton>
              <BlockButton onClick={() => { setFilterType('REELS'); setCurrentPage(1); }} active={filterType === 'REELS'} colorClass="bg-blue-500">{t.gallery.filters.reels}</BlockButton>
              <BlockButton onClick={() => { setFilterType('PHOTOS'); setCurrentPage(1); }} active={filterType === 'PHOTOS'} colorClass="bg-red-500">{t.gallery.filters.photos}</BlockButton>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-32 gap-6 text-amber-400 font-black text-sm tracking-widest uppercase">Ensamblando...</div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 text-gray-500 font-bold text-sm uppercase">No hay publicaciones con este filtro.</div>
        ) : (
          <>
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              <AnimatePresence mode="wait">
                {paginatedItems.map((item) => {
                  const isVideo = item.mediaType === 'VIDEO';
                  return (
                    <motion.div key={item.id} variants={snapIn} layout initial="hidden" whileInView="visible" viewport={{ once: true }} onClick={() => setSelectedItem(item)} className="relative">
                      <InteractiveCard className="group cursor-pointer bg-[#121824] border-4 border-[#1A2235] rounded-xl overflow-hidden shadow-[0_8px_0_0_#0F1523] hover:border-amber-400 transition-all duration-300">
                        <div className="aspect-[4/5] relative overflow-hidden bg-black">
                          <img src={item.src} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out opacity-90 group-hover:opacity-100" loading="lazy" />
                          {isVideo && <div className="absolute top-4 right-4 bg-red-600 text-white text-[10px] font-black px-3 py-1.5 rounded-md uppercase tracking-wider">Reel</div>}
                          {item.author && <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md text-amber-400 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wide border border-amber-400/30">{item.author}</div>}
                        </div>
                        <div className="p-5 flex justify-between items-center gap-4 bg-[#121824]">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-black text-white line-clamp-1 uppercase tracking-tight group-hover:text-amber-400">{item.title}</h3>
                            <p className="text-xs text-gray-500 font-bold mt-1">{item.date}</p>
                          </div>
                          <span className="w-9 h-9 aspect-square rounded-lg bg-[#1A2235] border-2 border-[#2A344A] inline-flex items-center justify-center text-white group-hover:bg-amber-400 group-hover:text-black font-black text-sm shadow-[0_3px_0_0_#0F1523] group-hover:shadow-[0_1px_0_0_#b45309] transition-all shrink-0 self-center">+</span>
                        </div>
                      </InteractiveCard>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>

            {/* PAGINACIÓN ESTILO BLOQUE */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-12">
                {Array.from({ length: totalPages }, (_, index) => {
                  const pageNum = index + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => {
                        setCurrentPage(pageNum);
                        document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`w-10 h-10 rounded-lg font-black text-xs transition-all border-2 flex items-center justify-center shadow-[0_4px_0_0_#0F1523] ${currentPage === pageNum
                          ? 'bg-amber-400 text-black border-transparent shadow-[0_2px_0_0_#b45309]'
                          : 'bg-[#121824] text-gray-400 border-[#2A344A] hover:text-white'
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

      {/* LIGHTBOX (Vista previa en pantalla completa) */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedItem(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#121824] border-4 border-[#1A2235] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col md:flex-row shadow-2xl overflow-hidden"
            >
              <div className="w-full md:w-3/5 bg-black relative min-h-[350px] md:min-h-[500px] flex items-center justify-center overflow-hidden">
                {!selectedItem.videoUrl && (
                  <div
                    className="absolute inset-0 bg-cover bg-center filter blur-xl opacity-40 scale-110 pointer-events-none"
                    style={{ backgroundImage: `url(${selectedItem.src})` }}
                  />
                )}
                {selectedItem.videoUrl ? (
                  <video src={selectedItem.videoUrl} controls autoPlay loop className="relative z-10 max-h-[75vh] w-full object-contain" />
                ) : (
                  <img src={selectedItem.src} alt={selectedItem.title} className="relative z-10 max-h-[75vh] w-full object-contain drop-shadow-2xl" />
                )}
              </div>
              <div className="w-full md:w-2/5 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-black text-amber-400 uppercase tracking-widest">{selectedItem.author}</span>
                    <button
                      onClick={() => setSelectedItem(null)}
                      className="text-xs font-black text-gray-400 hover:text-white bg-[#1A2235] px-3 py-1 rounded-lg border border-[#2A344A]"
                    >
                      {t.modal.close}
                    </button>
                  </div>
                  <h3 className="text-base font-black text-white uppercase tracking-tight mb-3">{selectedItem.title}</h3>
                  <p className="text-xs text-gray-300 font-bold whitespace-pre-line leading-relaxed mb-6">{selectedItem.captionFull}</p>
                </div>
                <div className="pt-4 border-t border-[#1A2235] flex flex-col gap-2.5">
                  <a
                    href={selectedItem.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center text-xs font-black uppercase tracking-wider text-black bg-amber-400 py-3 rounded-xl shadow-[0_4px_0_0_#b45309] border-t-2 border-amber-200"
                  >
                    {t.modal.viewOnIg}
                  </a>
                  <button
                    onClick={() => handleCopyLink(selectedItem.permalink)}
                    className="block w-full text-center text-xs font-black uppercase tracking-wider text-white bg-[#1A2235] hover:bg-[#2A344A] py-3 rounded-xl border-2 border-[#2A344A] shadow-[0_4px_0_0_#0F1523] transition-all"
                  >
                    {copied ? t.modal.copied : t.modal.copyLink}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <section id="about" className="max-w-4xl mx-auto px-6 py-10 text-center relative z-10">
        <div className="bg-[#121824] border-4 border-[#1A2235] rounded-2xl p-8 md:p-12 shadow-[0_10px_0_0_#0F1523]">
          <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter mt-4">{t.aboutSection.title}</h3>
          <p className="text-gray-400 text-sm md:text-base font-bold max-w-2xl mx-auto leading-relaxed mb-8">{t.aboutSection.desc}</p>
          <motion.a whileHover={{ y: -4 }} whileTap={{ y: 4 }} href="https://instagram.com/iantadventurer" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-black bg-blue-500 px-8 py-3.5 rounded-xl shadow-[0_5px_0_0_#1e3a8a] border-t-2 border-blue-300">
            <span>Seguir en Instagram</span>
          </motion.a>
        </div>
      </section>

      <footer className="border-t-4 border-[#1A2235] bg-[#0B0F17] py-12 px-6 relative z-10 mt-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left text-xs text-gray-500 font-bold">
          <div>
            <span className="font-black text-white tracking-widest block uppercase mb-2">@iantadventurer</span>
            <p className="max-w-xl">{t.disclaimer}</p>
          </div>
        </div>
      </footer>
    </main>
  );
}