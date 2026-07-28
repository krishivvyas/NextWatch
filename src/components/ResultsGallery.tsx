import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { RefreshCcw, Star, Tv, Calendar, Shuffle } from 'lucide-react';

// ── same pools used by LandingPage ──────────────────────────────────────────
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

export default function ResultsGallery() {
  const { results, theme, reset, setResults } = useAppStore();
  const [expandedId, setExpandedId]   = useState<string | number | null>(null);
  const [rerolling, setRerolling]     = useState(false);
  const [showToast, setShowToast]     = useState(false);
  const [toastMsg, setToastMsg]       = useState('');
  const cardRefs = useRef<Record<string | number, HTMLDivElement | null>>({});

  const isAnime   = theme === 'anime';
  const accentClass = isAnime ? 'text-yellow-400' : 'text-rose-500';
  const accentBg    = isAnime ? 'bg-yellow-400 text-slate-900' : 'bg-rose-600 text-white';

  // ── Reroll: fetch a completely new set of recs ───────────────────────────
  const handleSurprise = async () => {
    if (rerolling) return;
    setRerolling(true);
    setExpandedId(null);

    try {
      const answers = isAnime
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

      const endpoint = isAnime ? '/api/recommend/anime' : '/api/recommend/movie';
      const res  = await fetch(endpoint, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(answers),
      });
      const data = await res.json();
      const fresh = data.results ?? [];
      setResults(fresh);

      setToastMsg(fresh.length > 0 ? `🎲 New recs loaded — ${fresh.length} fresh picks!` : '😕 Nothing found, try again!');
    } catch {
      setToastMsg('⚠️ Something went wrong. Try again!');
    } finally {
      setRerolling(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  if (!results || results.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-3xl font-bold mb-4">No Matches Found</h2>
        <p className="mb-8 opacity-70">Try adjusting your preferences for a better match.</p>
        <div className="flex gap-3">
          <motion.button
            onClick={handleSurprise}
            disabled={rerolling}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold ${
              isAnime
                ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-slate-900'
                : 'bg-gradient-to-r from-rose-500 to-pink-600 text-white'
            }`}
          >
            <Shuffle className="w-5 h-5" />
            {rerolling ? 'Rolling…' : 'Try Again'}
          </motion.button>
          <button onClick={reset} className="flex items-center gap-2 px-6 py-3 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors">
            <RefreshCcw className="w-5 h-5" /> Start Over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-8 md:p-12 max-w-screen-2xl mx-auto">

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-2xl bg-gray-900/95 border border-white/10 backdrop-blur-xl shadow-2xl text-sm font-medium whitespace-nowrap"
          >
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Reroll loading overlay ────────────────────────────────────────── */}
      <AnimatePresence>
        {rerolling && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-6 backdrop-blur-md bg-black/60"
          >
            {/* Spinning dice */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
              className="text-6xl select-none"
            >
              🎲
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl font-bold tracking-wide"
            >
              Rolling the dice…
            </motion.p>
            <p className="text-sm opacity-50">Finding you a fresh set of picks</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 sm:mb-12">
        <div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">Your NextWatch</h2>
          <p className="mt-1 sm:mt-2 opacity-50 text-sm sm:text-base">{results.length} matches found</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Surprise Me / Reroll Button */}
          <motion.button
            onClick={handleSurprise}
            disabled={rerolling}
            whileHover={rerolling ? {} : { scale: 1.05 }}
            whileTap={rerolling ? {} : { scale: 0.95 }}
            className={`relative flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-full font-semibold text-sm sm:text-base flex-1 sm:flex-none justify-center overflow-hidden transition-all duration-300 ${
              rerolling ? 'opacity-70 cursor-not-allowed' : ''
            } ${
              isAnime
                ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-slate-900 shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50'
                : 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50'
            }`}
          >
            {/* Shimmer overlay */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700 ease-in-out pointer-events-none" />
            <motion.div
              animate={rerolling ? { rotate: 360 } : { rotate: 0 }}
              transition={rerolling ? { repeat: Infinity, duration: 0.7, ease: 'linear' } : {}}
            >
              <Shuffle className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.div>
            {rerolling ? 'Rolling…' : 'Surprise Me!'}
          </motion.button>

          {/* Start Over */}
          <button
            onClick={reset}
            className="flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-full border-2 border-gray-700 hover:border-gray-500 transition-all font-medium text-sm sm:text-base flex-1 sm:flex-none justify-center"
          >
            <RefreshCcw className="w-4 h-4 sm:w-5 sm:h-5" /> Start Over
          </button>
        </div>
      </div>

      {/* ── Grid ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {results.map((item, idx) => (
          <motion.div
            key={`${item.id}-${idx}`}
            ref={(el) => { cardRefs.current[item.id] = el; }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06, duration: 0.45 }}
            onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
            className="group relative rounded-2xl overflow-hidden bg-gray-900 shadow-2xl border border-white/5 cursor-pointer"
          >
            {/* Poster */}
            <div className="aspect-[2/3] w-full bg-gray-800 relative">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm">No Poster</div>
              )}

              {/* Score Badge */}
              <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 text-xs font-bold border border-white/10">
                <Star className={`w-3 h-3 ${accentClass}`} fill="currentColor" />
                {item.matchScore}%
              </div>

              {/* Status badge */}
              {item.status && (
                <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold ${item.status === 'Running' ? accentBg : 'bg-gray-700 text-gray-300'}`}>
                  {item.status === 'Running' ? '● Live' : item.status}
                </div>
              )}
            </div>

            {/* Static title strip */}
            <div className="p-3 border-t border-white/5">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{item.title}</p>
              <div className="flex items-center gap-2 mt-1 text-xs opacity-50">
                {item.premiered && <span>{item.premiered.slice(0, 4)}</span>}
                {item.score > 0 && <span>⭐ {item.score.toFixed(1)}</span>}
                {item.type && <span className="uppercase">{item.type}</span>}
              </div>
            </div>

            {/* Hover / Expanded overlay */}
            <div
              className={`absolute inset-0 transition-all duration-300 flex flex-col p-4 ${
                expandedId === item.id
                  ? 'opacity-100 bg-black/95 z-10 justify-start overflow-y-auto pt-6'
                  : 'opacity-0 group-hover:opacity-100 bg-gradient-to-t from-black via-black/85 to-black/20 justify-end'
              }`}
            >
              {expandedId === item.id && (
                <div className="absolute top-2 right-3 text-white/40 hover:text-white text-lg">✕</div>
              )}
              <h3 className={`font-bold mb-1 ${expandedId === item.id ? 'text-xl mt-4 text-white' : 'text-lg line-clamp-2'}`}>{item.title}</h3>

              <div className="flex flex-wrap gap-2 mb-2 text-xs opacity-70">
                {item.network && (
                  <span className="flex items-center gap-1"><Tv className="w-3 h-3" /> {item.network}</span>
                )}
                {item.premiered && (
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {item.premiered?.slice(0, 4)}</span>
                )}
              </div>

              {item.genres && item.genres.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {item.genres.map((g: string) => (
                    <span key={g} className="px-2 py-0.5 rounded-full bg-white/10 text-white text-xs">{g}</span>
                  ))}
                </div>
              )}

              <p className={`text-gray-300 ${expandedId === item.id ? 'text-sm mt-3 pb-4 leading-relaxed' : 'text-xs line-clamp-3'}`}>
                {item.synopsis || 'No synopsis available.'}
              </p>

              {expandedId !== item.id && (
                <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-wider text-center w-full">Tap for full info</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
