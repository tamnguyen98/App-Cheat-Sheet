/**
 * Global app state: language, limits, favorites, offline, theme.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Guide } from '../types/guide';

export interface AppState {
  // ... (keep interface same)
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
  viewedGuides: string[];
  addViewedGuide: (guideId: string) => void;
  userEmail: string | null;
  idToken: string | null;
  setAuth: (email: string | null, token: string | null) => void;
  favoriteGuides: Guide[];
  setFavoriteGuides: (guides: Guide[]) => void;
  appendFavoriteGuides: (guides: Guide[]) => void;
  myGuides: Guide[];
  setMyGuides: (guides: Guide[]) => void;
  appendMyGuides: (guides: Guide[]) => void;
  isLoadingFavorites: boolean;
  setIsLoadingFavorites: (loading: boolean) => void;
  isLoadingMyGuides: boolean;
  setIsLoadingMyGuides: (loading: boolean) => void;
}

const TODAY = () => new Date().toISOString().slice(0, 10);

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
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
      viewedGuides: [],
      addViewedGuide: (guideId) =>
        set((s) => {
          const filtered = s.viewedGuides.filter((id) => id !== guideId);
          const updated = [guideId, ...filtered];
          return { viewedGuides: updated.slice(0, 20) };
        }),
      userEmail: null,
      idToken: null,
      setAuth: (userEmail, idToken) => set({ userEmail, idToken }),
      favoriteGuides: [],
      setFavoriteGuides: (favoriteGuides) => set({ favoriteGuides }),
      appendFavoriteGuides: (guides) => set((s) => ({ favoriteGuides: [...s.favoriteGuides, ...guides] })),
      myGuides: [],
      setMyGuides: (myGuides) => set({ myGuides }),
      appendMyGuides: (guides) => set((s) => ({ myGuides: [...s.myGuides, ...guides] })),
      isLoadingFavorites: false,
      setIsLoadingFavorites: (isLoadingFavorites) => set({ isLoadingFavorites }),
      isLoadingMyGuides: false,
      setIsLoadingMyGuides: (isLoadingMyGuides) => set({ isLoadingMyGuides }),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist specific keys to avoid bloat
      partialize: (state) => ({
        language: state.language,
        favorites: state.favorites,
        viewedGuides: state.viewedGuides,
        ttsAutoPlay: state.ttsAutoPlay,
        highContrast: state.highContrast,
        guidesViewedToday: state.guidesViewedToday,
        lastViewedDate: state.lastViewedDate,
      }),
    }
  )
);

