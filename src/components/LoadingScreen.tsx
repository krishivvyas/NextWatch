import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { useEffect, useState } from 'react';

const MOVIE_QUOTES = [
  { quote: "May the Force be with you.", film: "Star Wars, 1977" },
  { quote: "You can't handle the truth!", film: "A Few Good Men, 1992" },
  { quote: "To infinity and beyond.", film: "Toy Story, 1995" },
  { quote: "Why so serious?", film: "The Dark Knight, 2008" },
  { quote: "Elementary, my dear Watson.", film: "The Adventures of Sherlock Holmes" },
  { quote: "I'll be back.", film: "The Terminator, 1984" },
  { quote: "Here's looking at you, kid.", film: "Casablanca, 1942" },
  { quote: "You had me at hello.", film: "Jerry Maguire, 1996" },
];

const POWER_LEVELS = [
  "Scouting power level...",
  "Unlocking Bankai...",
  "Activating Sage Mode...",
  "Summoning the Nine-Tails...",
  "Breaking through limits...",
  "Final form detected!",
];

// Sharingan tomoe path
function SharinganSpinner() {
  return (
    <div className="relative w-40 h-40">
      {/* Outer ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
        className="absolute inset-0 rounded-full border-4 border-red-600"
        style={{ boxShadow: '0 0 20px #dc2626, inset 0 0 20px rgba(220,38,38,0.3)' }}
      />
      {/* Middle ring */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
        className="absolute inset-4 rounded-full border-2 border-red-800"
      />
      {/* Tomoe dots */}
      {[0, 120, 240].map((deg) => (
        <motion.div
          key={deg}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
          className="absolute inset-0"
          style={{ transformOrigin: '50% 50%', rotate: `${deg}deg` }}
        >
          <div
            className="absolute w-4 h-4 rounded-full bg-red-600"
            style={{ top: '8px', left: 'calc(50% - 8px)', boxShadow: '0 0 8px #dc2626' }}
          />
        </motion.div>
      ))}
      {/* Center pupil */}
      <div
        className="absolute inset-0 m-auto w-8 h-8 rounded-full"
        style={{ background: 'radial-gradient(circle, #1a0000, #dc2626)', boxShadow: '0 0 12px #dc2626' }}
      />
    </div>
  );
}

// Film reel countdown frames
function FilmReel() {
  const [frame, setFrame] = useState(5);
  useEffect(() => {
    const id = setInterval(() => setFrame(f => f <= 0 ? 5 : f - 1), 600);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative">
      {/* Outer circle with notches */}
      <div className="relative w-40 h-40">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
          className="absolute inset-0"
        >
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                width: '100%',
                height: '100%',
                transformOrigin: '50% 50%',
                rotate: `${i * 30}deg`,
              }}
            >
              <div
                className="absolute w-3 h-3 rounded-sm bg-gray-800"
                style={{ top: '2px', left: 'calc(50% - 6px)', border: '1px solid #333' }}
              />
            </div>
          ))}
          {/* Spokes */}
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <div
              key={deg}
              className="absolute inset-0"
              style={{ transformOrigin: '50% 50%', rotate: `${deg}deg` }}
            >
              <div className="absolute h-0.5 bg-gray-700" style={{ top: '50%', left: '30%', right: '30%' }} />
            </div>
          ))}
        </motion.div>

        {/* Center countdown number */}
        <AnimatePresence mode="wait">
          <motion.div
            key={frame}
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <span
              className="text-5xl font-bold"
              style={{ fontFamily: "'Bebas Neue', serif", color: '#d4af37' }}
            >
              {frame === 0 ? '🎬' : frame}
            </span>
          </motion.div>
        </AnimatePresence>
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-gray-800" style={{ boxShadow: '0 0 30px rgba(196,18,48,0.3)' }} />
      </div>
    </div>
  );
}

export default function LoadingScreen() {
  const { theme } = useAppStore();
  const isAnime = theme === 'anime';

  const [powerLabel, setPowerLabel] = useState(POWER_LEVELS[0]);
  const [powerValue, setPowerValue] = useState(0);
  const [quoteIdx, setQuoteIdx] = useState(0);

  useEffect(() => {
    if (isAnime) {
      let idx = 0;
      const id = setInterval(() => {
        idx = (idx + 1) % POWER_LEVELS.length;
        setPowerLabel(POWER_LEVELS[idx]);
      }, 1000);
      const powerInterval = setInterval(() => {
        setPowerValue(v => Math.min(v + Math.floor(Math.random() * 800 + 100), 9001));
      }, 150);
      return () => { clearInterval(id); clearInterval(powerInterval); };
    } else {
      const id = setInterval(() => {
        setQuoteIdx(q => (q + 1) % MOVIE_QUOTES.length);
      }, 2000);
      return () => clearInterval(id);
    }
  }, [isAnime]);

  // ANIME LOADING SCREEN
  if (isAnime) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
        style={{ background: '#080b14' }}
      >
        {/* Background neon circles */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(244,63,94,0.1) 0%, transparent 70%)' }} />
        </div>

        <SharinganSpinner />

        <div className="mt-12 text-center">
          <motion.p
            key={powerLabel}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 uppercase tracking-widest text-sm font-bold mb-4"
            style={{ fontFamily: "'Rajdhani', sans-serif" }}
          >
            {powerLabel}
          </motion.p>

          {/* Power level scouter */}
          <div
            className="relative px-8 py-4 border-2 border-yellow-400/40 rounded-sm"
            style={{ boxShadow: '0 0 20px rgba(250,204,21,0.2)', background: 'rgba(250,204,21,0.05)' }}
          >
            <p className="text-xs uppercase tracking-widest text-yellow-400/60 mb-1">Power Level</p>
            <motion.p
              className="text-5xl font-bold"
              style={{ fontFamily: "'Bebas Neue', sans-serif", color: '#facc15', textShadow: '0 0 20px #facc15' }}
            >
              {powerValue.toLocaleString()}
            </motion.p>
            {powerValue >= 9000 && (
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-red-500 font-bold text-xs mt-1 uppercase"
                style={{ textShadow: '0 0 10px #f43f5e' }}
              >
                IT'S OVER 9000!!
              </motion.p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // CINEMA LOADING SCREEN
  return (
    <div
      className="film-grain min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: '#000' }}
    >
      {/* Spotlight from top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top, rgba(196,18,48,0.15) 0%, transparent 70%)' }} />

      {/* Letterbox */}
      <div className="absolute top-0 left-0 right-0 h-12 bg-black z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-black z-10" />

      <FilmReel />

      <div className="mt-12 text-center max-w-xl px-8">
        <p className="text-xs uppercase tracking-[0.4em] text-gray-600 mb-8" style={{ fontFamily: "'Inter', serif" }}>
          — Now Loading —
        </p>

        <AnimatePresence mode="wait">
          <motion.div
            key={quoteIdx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
          >
            <p
              className="text-2xl md:text-3xl font-light italic mb-4"
              style={{ color: '#f5f0e8', fontFamily: "'Inter', serif", lineHeight: 1.6 }}
            >
              &ldquo;{MOVIE_QUOTES[quoteIdx].quote}&rdquo;
            </p>
            <p
              className="text-xs uppercase tracking-widest"
              style={{ color: '#d4af37' }}
            >
              — {MOVIE_QUOTES[quoteIdx].film}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
