import { create } from 'zustand';

export type Theme = 'none' | 'anime' | 'movie';
export type Step = 'landing' | 'questionnaire' | 'loading' | 'results';

interface AppState {
  theme: Theme;
  step: Step;
  answers: Record<string, string | string[]>;
  results: any[];
  
  setTheme: (theme: Theme) => void;
  setStep: (step: Step) => void;
  setAnswer: (key: string, value: string | string[]) => void;
  setResults: (results: any[]) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  theme: 'none',
  step: 'landing',
  answers: {},
  results: [],

  setTheme: (theme) => set({ theme }),
  setStep: (step) => set({ step }),
  setAnswer: (key, value) =>
    set((state) => ({
      answers: { ...state.answers, [key]: value },
    })),
  setResults: (results) => set({ results }),
  reset: () => set({ theme: 'none', step: 'landing', answers: {}, results: [] }),
}));
