/**
 * Global app state: language, limits, favorites, offline, theme.
 */

import { create } from 'zustand';

export interface AppState {
  language: string;
  setLanguage: (lang: string) => void;
  favorites: string[];
  addFavorite: (guideId: string) => void;
  removeFavorite: (guideId: string) => void;
  guidesViewedToday: number;
  incrementGuidesViewedToday: () => void;
  resetGuidesViewedToday: () => void;
  lastViewedDate: string | null;
  ttsAutoPlay: boolean;
  setTtsAutoPlay: (on: boolean) => void;
  highContrast: boolean;
  setHighContrast: (on: boolean) => void;
}

const TODAY = () => new Date().toISOString().slice(0, 10);

export const useAppStore = create<AppState>((set) => ({
  language: 'en',
  setLanguage: (language) => set({ language }),
  favorites: [],
  addFavorite: (guideId) =>
    set((s) =>
      s.favorites.includes(guideId) ? s : { favorites: [...s.favorites, guideId] }
    ),
  removeFavorite: (guideId) =>
    set((s) => ({ favorites: s.favorites.filter((id) => id !== guideId) })),
  guidesViewedToday: 0,
  lastViewedDate: null,
  incrementGuidesViewedToday: () =>
    set((s) => {
      const today = TODAY();
      if (s.lastViewedDate !== today)
        return {
          guidesViewedToday: 1,
          lastViewedDate: today,
        };
      return { guidesViewedToday: s.guidesViewedToday + 1 };
    }),
  resetGuidesViewedToday: () =>
    set({ guidesViewedToday: 0, lastViewedDate: null }),
  ttsAutoPlay: false,
  setTtsAutoPlay: (ttsAutoPlay) => set({ ttsAutoPlay }),
  highContrast: false,
  setHighContrast: (highContrast) => set({ highContrast }),
}));
