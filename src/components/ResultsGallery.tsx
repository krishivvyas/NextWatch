import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { RefreshCcw, Star, Tv, Calendar } from 'lucide-react';

export default function ResultsGallery() {
  const { results, theme, reset } = useAppStore();
  const isAnime = theme === 'anime';
  const accentClass = isAnime ? 'text-yellow-400' : 'text-rose-500';
  const accentBg = isAnime ? 'bg-yellow-400 text-slate-900' : 'bg-rose-600 text-white';

  if (!results || results.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-3xl font-bold mb-4">No Matches Found</h2>
        <p className="mb-8 opacity-70">Try adjusting your preferences for a better match.</p>
        <button onClick={reset} className="flex items-center gap-2 px-6 py-3 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors">
          <RefreshCcw className="w-5 h-5" /> Start Over
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 md:p-12 max-w-screen-2xl mx-auto">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h2 className="text-4xl md:text-5xl font-bold">Your NextWatch</h2>
          <p className="mt-2 opacity-50">{results.length} matches found</p>
        </div>
        <button onClick={reset} className="flex items-center gap-2 px-6 py-3 rounded-full border-2 border-gray-700 hover:border-gray-500 transition-all font-medium">
          <RefreshCcw className="w-5 h-5" /> Start Over
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
        {results.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08, duration: 0.5 }}
            className="group relative rounded-2xl overflow-hidden bg-gray-900 shadow-2xl border border-white/5"
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

            {/* Static title strip below poster */}
            <div className="p-3 border-t border-white/5">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{item.title}</p>
              <div className="flex items-center gap-2 mt-1 text-xs opacity-50">
                {item.premiered && <span>{item.premiered.slice(0, 4)}</span>}
                {item.score > 0 && <span>⭐ {item.score.toFixed(1)}</span>}
                {item.type && <span className="uppercase">{item.type}</span>}
              </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/85 to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
              <h3 className="text-lg font-bold mb-1 line-clamp-2">{item.title}</h3>

              {/* Meta info */}
              <div className="flex flex-wrap gap-2 mb-2 text-xs opacity-70">
                {item.network && (
                  <span className="flex items-center gap-1"><Tv className="w-3 h-3" /> {item.network}</span>
                )}
                {item.premiered && (
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {item.premiered?.slice(0, 4)}</span>
                )}
              </div>

              {/* Genres */}
              {item.genres && item.genres.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {item.genres.slice(0, 3).map((g: string) => (
                    <span key={g} className="px-2 py-0.5 rounded-full bg-white/10 text-white text-xs">{g}</span>
                  ))}
                </div>
              )}

              <p className="text-xs text-gray-300 line-clamp-3">{item.synopsis || 'No synopsis available.'}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

