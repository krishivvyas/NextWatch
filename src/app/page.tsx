"use client";

import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import LandingPage from '../components/LandingPage';
import Questionnaire from '../components/Questionnaire';
import LoadingScreen from '../components/LoadingScreen';
import ResultsGallery from '../components/ResultsGallery';

export default function Home() {
  const { theme, step } = useAppStore();

  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove('theme-anime', 'theme-movie');
    document.body.classList.remove('film-grain', 'anime-speed-lines');

    if (theme === 'anime') {
      html.classList.add('theme-anime');
      document.body.classList.add('anime-speed-lines');
    } else if (theme === 'movie') {
      html.classList.add('theme-movie');
      document.body.classList.add('film-grain');
    }
  }, [theme]);

  return (
    <main className="min-h-screen relative">
      {step === 'landing' && <LandingPage />}
      {step === 'questionnaire' && <Questionnaire />}
      {step === 'loading' && <LoadingScreen />}
      {step === 'results' && <ResultsGallery />}
    </main>
  );
}
