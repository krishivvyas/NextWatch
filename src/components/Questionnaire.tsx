import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const animeGenres = [
  { id: '1', label: 'Action' },
  { id: '27', label: 'Shonen' },
  { id: '25', label: 'Shojo' },
  { id: '62', label: 'Isekai' },
  { id: '18', label: 'Mecha' },
  { id: '36', label: 'Slice of Life' },
  { id: '4', label: 'Comedy' },
  { id: '8', label: 'Drama' },
  { id: '10', label: 'Fantasy' },
  { id: '22', label: 'Romance' },
];

// IDs here match TVMaze genre strings exactly (used for filtering)
const movieGenres = [
  { id: 'Thriller',         label: 'Thriller' },
  { id: 'Science-Fiction',  label: 'Sci-Fi' },
  { id: 'Rom-Com',          label: 'Rom-Com' },
  { id: 'Horror',           label: 'Horror' },
  { id: 'Action',           label: 'Action' },
  { id: 'Drama',            label: 'Drama' },
  { id: 'Crime',            label: 'Crime' },
  { id: 'Mystery',          label: 'Mystery' },
  { id: 'Adventure',        label: 'Adventure' },
  { id: 'Supernatural',     label: 'Supernatural' },
  { id: 'Comedy',           label: 'Comedy' },
];

export default function Questionnaire() {
  const { theme, setStep, setResults } = useAppStore();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  
  // Local state for answers
  const [answers, setAnswers] = useState<Record<string, any>>({
    genres: [],
  });

  const isAnime = theme === 'anime';

  const questions = isAnime 
    ? [
        { key: 'genres', title: 'What genres are you craving?', type: 'multi', options: animeGenres },
        { key: 'commitment', title: 'Commitment Level?', type: 'single', options: [{id:'movie', label:'Movie'}, {id:'quick', label:'12-24 Ep (Quick Arc)'}, {id:'long', label:'100+ Ep (The Long Journey)'}] },
        { key: 'audio', title: 'Audio Preference?', type: 'single', options: [{id:'sub', label:'Subbed (Japanese)'}, {id:'dub', label:'Dubbed (English)'}] },
        { key: 'rating', title: 'Vibe / Rating?', type: 'single', options: [{id:'pg', label:'Wholesome (PG)'}, {id:'pg13', label:'Teen (PG-13)'}, {id:'r17', label:'Dark/Gory (R - 17+)'}] },
        { key: 'status', title: 'Ongoing or Ended?', type: 'single', options: [{id:'any', label:'Any'}, {id:'RELEASING', label:'Ongoing (Releasing)'}, {id:'FINISHED', label:'Ended (Finished)'}] },
        {
          key: 'era',
          title: 'Which Era? 🗓️',
          type: 'single',
          options: [
            { id: 'any',   label: 'Any Era' },
            { id: '2020',  label: '2020s — Ultra Recent' },
            { id: '2015',  label: '2015+ — Modern' },
            { id: '2010',  label: '2010s — New School' },
            { id: '2000',  label: '2000s — Early 2K' },
            { id: '1990',  label: '90s — Golden Age' },
            { id: '1980',  label: '80s & Older — Classics' },
          ]
        },
        { key: 'prompt', title: 'The "Reincarnation" Prompt', type: 'text', placeholder: '"I recently watched [Input Anime] and want something exactly like it..."' }
      ]
    : [
        { key: 'genres', title: 'What genres are you craving?', type: 'multi', options: movieGenres },
        { key: 'status', title: 'Ongoing or Ended?', type: 'single', options: [{id:'any', label:'Any'}, {id:'Running', label:'Ongoing (Running)'}, {id:'Ended', label:'Ended (Finished)'}] },
        {
          key: 'era',
          title: 'Which Era? 🎞️',
          type: 'single',
          options: [
            { id: 'any',   label: 'Any Era' },
            { id: '2020',  label: '2020s — Streaming Age' },
            { id: '2015',  label: '2015+ — Peak TV Era' },
            { id: '2010',  label: '2010s — New Golden Age' },
            { id: '2000',  label: '2000s — Cable Era' },
            { id: '1990',  label: '90s — Prestige TV Begins' },
            { id: '1980',  label: '80s & Older — Legacy' },
          ]
        },
        { key: 'prompt', title: 'The "Sequel" Prompt', type: 'text', placeholder: '"I loved [Input Show] and need that exact energy..."' }
      ];

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      submitAnswers();
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    } else {
      setStep('landing');
    }
  };

  const toggleGenre = (id: string) => {
    setAnswers(prev => {
      const currentGenres = prev.genres || [];
      return {
        ...prev,
        genres: currentGenres.includes(id) ? currentGenres.filter((g: string) => g !== id) : [...currentGenres, id]
      };
    });
  };

  const submitAnswers = async () => {
    setStep('loading');
    try {
      const endpoint = isAnime ? '/api/recommend/anime' : '/api/recommend/movie';
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers)
      });
      
      const data = await res.json();
      if (data.results) {
        setResults(data.results);
        setStep('results');
      } else {
        console.error(data.error);
        setStep('results'); // Show empty or error state
      }
    } catch (e) {
      console.error(e);
      setStep('results');
    }
  };

  const currentQ = questions[currentQuestion];
  
  // Validation for next button
  let isNextDisabled = false;
  if (currentQ.type === 'multi') {
    isNextDisabled = !answers[currentQ.key] || answers[currentQ.key].length === 0;
  } else if (currentQ.type === 'single') {
    isNextDisabled = !answers[currentQ.key];
  } else if (currentQ.type === 'text') {
    // Optional, allow skip
    isNextDisabled = false; 
  }


  // ────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────
  const animeProgressColor = 'bg-yellow-400';
  const cinemaProgressColor = 'bg-red-800';

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={isAnime
        ? { background: '#080b14' }
        : { background: '#000' }
      }
    >
      {/* ── ANIME BACKGROUND DECOR ── */}
      {isAnime && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #f43f5e, transparent)' }} />
          <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #a855f7, transparent)' }} />
          {/* Decorative kanji */}
          <div className="absolute top-8 right-8 text-8xl opacity-5 select-none"
            style={{ fontFamily: "'Noto Serif JP', serif", color: '#facc15' }}>選</div>
          <div className="absolute bottom-8 left-8 text-8xl opacity-5 select-none"
            style={{ fontFamily: "'Noto Serif JP', serif", color: '#f43f5e' }}>択</div>
        </div>
      )}

      {/* ── CINEMA BACKGROUND DECOR ── */}
      {!isAnime && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Spotlight */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px]"
            style={{ background: 'radial-gradient(ellipse at top, rgba(196,18,48,0.08) 0%, transparent 70%)' }} />
          {/* Film strip left */}
          <div className="absolute top-0 bottom-0 left-0 w-10 film-strip-dots opacity-20" />
          {/* Film strip right */}
          <div className="absolute top-0 bottom-0 right-0 w-10 film-strip-dots opacity-20" />
          {/* Letterbox */}
          <div className="absolute top-0 left-0 right-0 h-10 bg-black opacity-90" />
          <div className="absolute bottom-0 left-0 right-0 h-10 bg-black opacity-90" />
        </div>
      )}

      {/* Progress + Back */}
      <div className="relative z-10 w-full max-w-5xl mx-auto flex justify-between items-center px-8 pt-16 pb-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 transition-all"
          style={{ color: isAnime ? '#94a3b8' : '#8a8070' }}
        >
          <ChevronLeft className="w-6 h-6" />
          <span className="text-sm uppercase tracking-widest hidden md:inline">
            {isAnime ? '戻る' : 'Back'}
          </span>
        </button>

        {/* Progress bar */}
        <div className="flex gap-1.5 sm:gap-2 items-center">
          {questions.map((_, i) => (
            isAnime ? (
              <div
                key={i}
                className="h-1.5 transition-all duration-500"
                style={{
                  width: i <= currentQuestion ? '32px' : '16px',
                  background: i <= currentQuestion
                    ? 'linear-gradient(90deg, #f43f5e, #facc15)'
                    : 'rgba(255,255,255,0.1)',
                  boxShadow: i === currentQuestion ? '0 0 8px #facc15' : 'none',
                }}
              />
            ) : (
              <div
                key={i}
                className="h-0.5 transition-all duration-500"
                style={{
                  width: i <= currentQuestion ? '28px' : '14px',
                  background: i <= currentQuestion ? '#c41230' : 'rgba(212,175,55,0.2)',
                }}
              />
            )
          ))}
          <span className="text-[10px] sm:text-xs ml-1 sm:ml-2 opacity-40 tracking-widest">
            {currentQuestion + 1}/{questions.length}
          </span>
        </div>

        <div className="w-8 sm:w-16" />
      </div>

      {/* Question area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 max-w-5xl mx-auto w-full z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="w-full flex flex-col items-center"
          >
            {/* Question title */}
            {isAnime ? (
              <h2
                className="text-3xl sm:text-4xl md:text-6xl uppercase tracking-widest text-center mb-8 sm:mb-12 px-2"
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  color: '#facc15',
                  textShadow: '0 0 30px rgba(250,204,21,0.4), 2px 2px 0 #f43f5e',
                }}
              >
                {currentQ.title}
              </h2>
            ) : (
              <div className="text-center mb-8 sm:mb-12 px-2">
                <p className="text-[10px] sm:text-xs uppercase tracking-[0.4em] mb-2 sm:mb-3" style={{ color: '#c41230' }}>
                  Question {currentQuestion + 1}
                </p>
                <h2
                  className="text-2xl sm:text-3xl md:text-5xl font-light tracking-wide"
                  style={{ fontFamily: "'Inter', serif", color: '#f5f0e8' }}
                >
                  {currentQ.title}
                </h2>
                <div className="mt-3 sm:mt-4 mx-auto h-px w-16 sm:w-24" style={{ background: 'linear-gradient(90deg, transparent, #d4af37, transparent)' }} />
              </div>
            )}

            {/* Answer options */}
            {currentQ.type === 'text' ? (
              <div className="w-full max-w-2xl">
                <textarea
                  value={answers[currentQ.key] || ''}
                  onChange={(e) => setAnswers(prev => ({ ...prev, [currentQ.key]: e.target.value }))}
                  placeholder={currentQ.placeholder}
                  rows={5}
                  className="w-full resize-none p-4 sm:p-6 text-base sm:text-lg focus:outline-none transition-all"
                  style={isAnime ? {
                    background: 'rgba(250,204,21,0.05)',
                    border: '2px solid rgba(250,204,21,0.3)',
                    color: '#fff',
                    fontFamily: "'Rajdhani', sans-serif",
                    boxShadow: answers[currentQ.key] ? '0 0 20px rgba(250,204,21,0.2), inset 0 0 20px rgba(250,204,21,0.05)' : 'none',
                  } : {
                    background: 'transparent',
                    borderBottom: '2px solid rgba(212,175,55,0.4)',
                    borderTop: 'none',
                    borderLeft: 'none',
                    borderRight: 'none',
                    color: '#f5f0e8',
                    fontFamily: "'Inter', serif",
                    fontStyle: 'italic',
                  }}
                />
                <p className="mt-4 text-center text-sm opacity-40 tracking-widest uppercase">
                  {isAnime ? '（スキップ可能）Optional — skip if you like!' : 'Optional · Press Continue to skip'}
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap justify-center gap-4 w-full max-w-4xl">
                {currentQ.options?.map((opt) => {
                  const isSelected = currentQ.type === 'multi'
                    ? (answers[currentQ.key] || []).includes(opt.id)
                    : answers[currentQ.key] === opt.id;

                  if (isAnime) {
                    return (
                      <motion.button
                        key={opt.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          if (currentQ.type === 'multi') toggleGenre(opt.id);
                          if (currentQ.type === 'single') setAnswers(prev => ({ ...prev, [currentQ.key]: opt.id }));
                        }}
                        className="relative w-full sm:w-auto p-4 sm:p-5 text-sm sm:text-base font-bold uppercase tracking-widest transition-all duration-300 text-center"
                        style={{
                          fontFamily: "'Rajdhani', sans-serif",
                          minWidth: 'min(100%, 180px)',
                          background: isSelected ? 'rgba(250,204,21,0.12)' : 'rgba(255,255,255,0.02)',
                          border: isSelected ? '2px solid #facc15' : '2px solid rgba(255,255,255,0.1)',
                          color: isSelected ? '#facc15' : '#94a3b8',
                          boxShadow: isSelected
                            ? '4px 4px 0px #f43f5e, 0 0 20px rgba(250,204,21,0.3)'
                            : '2px 2px 0px rgba(0,0,0,0.5)',
                        }}
                      >
                        {isSelected && (
                          <span className="absolute top-1 right-2 text-xs" style={{ color: '#f43f5e' }}>✓</span>
                        )}
                        {opt.label}
                      </motion.button>
                    );
                  } else {
                    return (
                      <motion.button
                        key={opt.id}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          if (currentQ.type === 'multi') toggleGenre(opt.id);
                          if (currentQ.type === 'single') setAnswers(prev => ({ ...prev, [currentQ.key]: opt.id }));
                        }}
                        className="relative w-full sm:w-auto p-4 sm:p-5 text-sm sm:text-base font-light tracking-widest transition-all duration-300 text-center"
                        style={{
                          fontFamily: "'Inter', serif",
                          minWidth: 'min(100%, 200px)',
                          background: isSelected ? 'rgba(196,18,48,0.08)' : 'transparent',
                          border: 'none',
                          borderLeft: isSelected ? '3px solid #c41230' : '3px solid rgba(212,175,55,0.2)',
                          color: isSelected ? '#f5f0e8' : '#8a8070',
                          paddingLeft: '20px',
                        }}
                      >
                        {isSelected && (
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs" style={{ color: '#d4af37' }}>◆</span>
                        )}
                        {opt.label}
                      </motion.button>
                    );
                  }
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Continue button */}
      <div className="relative z-10 w-full max-w-5xl mx-auto flex justify-center sm:justify-end px-4 sm:px-8 pb-8 sm:pb-12 pt-6">
        <motion.button
          onClick={handleNext}
          disabled={isNextDisabled}
          whileHover={isNextDisabled ? {} : { scale: 1.04 }}
          whileTap={isNextDisabled ? {} : { scale: 0.97 }}
          className="flex items-center justify-center gap-2 sm:gap-3 px-8 sm:px-10 py-3 sm:py-4 font-bold uppercase tracking-widest text-xs sm:text-sm transition-all w-full sm:w-auto"
          style={isAnime ? {
            fontFamily: "'Rajdhani', sans-serif",
            background: isNextDisabled ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #facc15, #f59e0b)',
            color: isNextDisabled ? '#4a5568' : '#080b14',
            border: 'none',
            boxShadow: isNextDisabled ? 'none' : '4px 4px 0px #f43f5e',
            cursor: isNextDisabled ? 'not-allowed' : 'pointer',
          } : {
            fontFamily: "'Inter', serif",
            background: 'transparent',
            color: isNextDisabled ? '#4a5568' : '#d4af37',
            border: `1px solid ${isNextDisabled ? 'rgba(255,255,255,0.1)' : '#d4af37'}`,
            cursor: isNextDisabled ? 'not-allowed' : 'pointer',
          }}
        >
          {currentQuestion === questions.length - 1 ? (
            isAnime ? '✨ Find My NextWatch' : 'Find My NextWatch →'
          ) : (
            isAnime ? 'Next Stage →' : 'Continue →'
          )}
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
}
