import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { useState, useEffect } from 'react';
import { Shuffle } from 'lucide-react';

const ANIME_GENRES  = ['1','27','25','62','18','36','4','8','10','22'];
const MOVIE_GENRES  = ['Action','Drama','Thriller','Comedy','Sci-Fi','Horror','Romance','Mystery','Adventure'];
const ERAS          = ['any','2020','2015','2010','2000','1990'];
const COMMITMENTS   = ['quick','long','movie'];
const RATINGS       = ['pg','pg13','r17'];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function pickSome<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
}

interface Star {
  w: string; h: string; top: string; left: string;
  opacity: number; animation: string; delay: string;
}

export default function LandingPage() {
  const { setTheme, setStep, setResults } = useAppStore();
  const [hoveredCard, setHoveredCard] = useState<'anime' | 'movie' | null>(null);
  const [selected, setSelected] = useState<'anime' | 'movie' | null>(null);
  const [surprising, setSurprising] = useState(false);
  // Start empty — populated client-side only to avoid SSR hydration mismatch
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    setStars(
      Array.from({ length: 60 }, () => ({
        w:         (Math.random() * 2 + 1) + 'px',
        h:         (Math.random() * 2 + 1) + 'px',
        top:       Math.random() * 100 + '%',
        left:      Math.random() * 100 + '%',
        opacity:   Math.random() * 0.5 + 0.1,
        animation: `pulse ${Math.random() * 3 + 2}s ease-in-out infinite`,
        delay:     Math.random() * 2 + 's',
      }))
    );
  }, []); // runs once after mount, never on server

  const handleSelect = (theme: 'anime' | 'movie') => {
    setSelected(theme);
    setTheme(theme);
    setTimeout(() => setStep('questionnaire'), 800);
  };

  const handleSurpriseMe = async () => {
    if (surprising) return;
    setSurprising(true);

    // Pick a random theme
    const theme = Math.random() < 0.5 ? 'anime' : 'movie';
    setTheme(theme);
    setStep('loading');

    try {
      const answers = theme === 'anime'
        ? {
            genres:     pickSome(ANIME_GENRES, 3),
            commitment: pickRandom(COMMITMENTS),
            rating:     pickRandom(RATINGS),
            era:        pickRandom(ERAS),
          }
        : {
            genres:     pickSome(MOVIE_GENRES, 3),
            language:   'en',
            era:        pickRandom(ERAS),
          };

      const endpoint = theme === 'anime' ? '/api/recommend/anime' : '/api/recommend/movie';
      const res  = await fetch(endpoint, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(answers),
      });
      const data = await res.json();
      setResults(data.results ?? []);
    } catch (e) {
      console.error('[SurpriseMe]', e);
      setResults([]);
    } finally {
      setStep('results');
      setSurprising(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at center, #0d1117 0%, #05080f 100%)' }}
    >
      {/* ── SURPRISE ME BUTTON ── */}
      <motion.button
        id="btn-surprise-me"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        onClick={handleSurpriseMe}
        disabled={surprising}
        whileHover={{ scale: 1.07 }}
        whileTap={{ scale: 0.95 }}
        className="absolute top-6 left-6 z-20 flex items-center gap-2.5 px-5 py-2.5 text-sm font-bold uppercase tracking-widest"
        style={{
          background:   'rgba(255,255,255,0.04)',
          border:       '1px solid rgba(255,255,255,0.12)',
          backdropFilter: 'blur(8px)',
          color:        surprising ? '#4a5568' : '#e2e8f0',
          cursor:       surprising ? 'not-allowed' : 'pointer',
          letterSpacing: '0.15em',
        }}
      >
        <motion.div
          animate={surprising ? { rotate: 360 } : { rotate: 0 }}
          transition={surprising ? { repeat: Infinity, duration: 0.8, ease: 'linear' } : {}}
        >
          <Shuffle className="w-4 h-4" />
        </motion.div>
        {surprising ? 'Fetching...' : 'Surprise Me'}
      </motion.button>
      {/* Ambient stars — rendered client-side only */}
      <div className="absolute inset-0 pointer-events-none">
        {stars.map((s, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: s.w,
              height: s.h,
              top: s.top,
              left: s.left,
              opacity: s.opacity,
              animation: s.animation,
              animationDelay: s.delay,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="text-center mb-12 z-10"
      >
        <h1
          className="font-display text-7xl md:text-9xl tracking-wider uppercase mb-4"
          style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.1em', color: '#f8fafc' }}
        >
          NextWatch
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 font-light tracking-widest">
          What are we watching today?
        </p>
      </motion.div>

      {/* The two cards */}
      <div className="flex flex-col md:flex-row gap-0 w-full max-w-6xl z-10 h-[55vh] min-h-[400px]">

        {/* ── ANIME CARD ── */}
        <motion.div
          id="card-anime"
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => handleSelect('anime')}
          onMouseEnter={() => setHoveredCard('anime')}
          onMouseLeave={() => setHoveredCard(null)}
          className="flex-1 relative overflow-hidden cursor-pointer group"
          style={{
            clipPath: 'polygon(0 0, 95% 0, 100% 100%, 0 100%)',
            borderRight: '3px solid #facc15',
          }}
        >
          {/* Background image */}
          <img
            src="https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=2000&auto=format&fit=crop"
            alt="Anime"
            className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
            style={{ filter: hoveredCard === 'anime' ? 'saturate(1.4) brightness(0.6)' : 'saturate(1.2) brightness(0.4)' }}
          />

          {/* Neon overlay gradient */}
          <div
            className="absolute inset-0 transition-opacity duration-500"
            style={{
              background: 'linear-gradient(135deg, rgba(244,63,94,0.4) 0%, rgba(168,85,247,0.2) 50%, transparent 100%)',
              opacity: hoveredCard === 'anime' ? 1 : 0.6,
            }}
          />

          {/* Speed lines */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'repeating-conic-gradient(from 0deg at 50% 120%, transparent 0deg, transparent 3deg, rgba(250,204,21,0.04) 3deg, rgba(250,204,21,0.04) 6deg)',
              opacity: hoveredCard === 'anime' ? 1 : 0,
              transition: 'opacity 0.5s ease',
            }}
          />

          {/* Top-left kanji accent */}
          <div className="absolute top-6 left-6 text-5xl opacity-20 select-none" style={{ fontFamily: "'Noto Serif JP', serif", color: '#facc15' }}>
            観
          </div>

          {/* CEL border accent at bottom */}
          <div
            className="absolute bottom-0 left-0 right-0 h-1"
            style={{ background: 'linear-gradient(90deg, #f43f5e, #facc15, #a855f7)' }}
          />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
            <motion.div
              animate={{ textShadow: hoveredCard === 'anime'
                ? '0 0 20px #facc15, 0 0 40px #f43f5e, 0 0 80px #f43f5e'
                : '2px 2px 0 #000'
              }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <div className="text-6xl mb-3">⛩️</div>
              <h2
                className="text-5xl md:text-7xl font-display uppercase tracking-widest text-white mb-2"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                Anime Realm
              </h2>
              <p className="text-yellow-400 tracking-[0.3em] uppercase text-sm font-semibold opacity-80">
                アニメの世界へ
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: hoveredCard === 'anime' ? 1 : 0, y: hoveredCard === 'anime' ? 0 : 10 }}
              transition={{ duration: 0.3 }}
              className="mt-6 px-8 py-3 rounded-none border-2 border-yellow-400 text-yellow-400 font-bold tracking-widest text-sm uppercase"
              style={{ boxShadow: '4px 4px 0px #f43f5e' }}
            >
              Enter the Realm →
            </motion.div>
          </div>
        </motion.div>

        {/* ── CINEMA CARD ── */}
        <motion.div
          id="card-cinema"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => handleSelect('movie')}
          onMouseEnter={() => setHoveredCard('movie')}
          onMouseLeave={() => setHoveredCard(null)}
          className="flex-1 relative overflow-hidden cursor-pointer group"
          style={{
            clipPath: 'polygon(5% 0, 100% 0, 100% 100%, 0 100%)',
            borderLeft: '3px solid #d4af37',
            marginLeft: '-3px',
          }}
        >
          {/* Background image */}
          <img
            src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2000&auto=format&fit=crop"
            alt="Cinema"
            className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
            style={{ filter: hoveredCard === 'movie' ? 'sepia(0.3) brightness(0.5)' : 'sepia(0.6) brightness(0.25)' }}
          />

          {/* Red theater overlay */}
          <div
            className="absolute inset-0 transition-opacity duration-500"
            style={{
              background: 'linear-gradient(135deg, transparent 0%, rgba(196,18,48,0.3) 50%, rgba(0,0,0,0.7) 100%)',
              opacity: hoveredCard === 'movie' ? 1 : 0.8,
            }}
          />

          {/* Film strip dots on edges */}
          <div
            className="absolute top-0 bottom-0 left-0 w-8 film-strip-dots opacity-30"
          />
          <div
            className="absolute top-0 bottom-0 right-0 w-8 film-strip-dots opacity-30"
          />

          {/* Letterbox bars */}
          <div className="absolute top-0 left-0 right-0 h-8 bg-black opacity-80" />
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-black opacity-80" />

          {/* Gold accent line */}
          <div
            className="absolute top-0 left-0 right-0 h-1"
            style={{ background: 'linear-gradient(90deg, transparent, #d4af37, #c41230, transparent)' }}
          />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
            <motion.div
              animate={{ textShadow: hoveredCard === 'movie'
                ? '0 0 30px rgba(196,18,48,0.8), 2px 2px 4px #000'
                : '2px 2px 4px rgba(0,0,0,0.9)'
              }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <div className="text-6xl mb-3">🎬</div>
              <h2
                className="text-5xl md:text-7xl uppercase tracking-widest mb-2"
                style={{
                  fontFamily: "'Bebas Neue', serif",
                  color: hoveredCard === 'movie' ? '#d4af37' : '#f5f0e8',
                  transition: 'color 0.4s ease',
                }}
              >
                Cinema & TV
              </h2>
              <p className="tracking-[0.3em] uppercase text-sm font-light opacity-70" style={{ color: '#d4af37' }}>
                The Silver Screen Awaits
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: hoveredCard === 'movie' ? 1 : 0, y: hoveredCard === 'movie' ? 0 : 10 }}
              transition={{ duration: 0.3 }}
              className="mt-6 px-8 py-3 border-2 text-sm font-bold tracking-widest uppercase"
              style={{ borderColor: '#d4af37', color: '#d4af37', fontFamily: "'Inter', serif" }}
            >
              Roll Film →
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Footer hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="mt-8 text-center z-10"
      >
        <p className="text-xs text-gray-600 tracking-widest uppercase mb-1">
          Powered by AniList API · TVMaze API · No account required
        </p>
        <p className="text-xs tracking-widest text-gray-500 font-medium">
          Crafted with 💖 by <span className="text-yellow-500 font-bold">LaughingHermit</span>
        </p>
      </motion.div>
    </div>
  );
}
