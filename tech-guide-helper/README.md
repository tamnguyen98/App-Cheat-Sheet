# App Cheat Sheet

A minimalist, visual quick-reference PWA/mobile app for tech-illiterate users (especially seniors), providing step-by-step guides for everyday tech tasks (e.g. Zoom setup, email, phone basics).

## Stack

- **React Native + Expo** (TypeScript)
- **Firebase** (Auth, Firestore, Analytics) — optional; configure via env
- **expo-speech** (TTS), **expo-file-system** (offline), **lru-cache**, **zustand**
- **React Navigation** (bottom tabs + stack), **react-native-paper**, **i18next** (en/es/vi)

## Project structure

```
app-cheat-sheet/
├── App.tsx                          # Root: bootstrap, useAuth/useFavoritesSync hooks
├── app.json                         # PWA web config (manifest, themeColor, standalone)
├── index.ts                         # Entry (registerRootComponent)
├── package.json                     # Expo 54, Zustand (with persistence), i18next
├── .env.example                     # Firebase env placeholders
├── tsconfig.json
├── assets/                           # Icons (Expo default)
└── src/
    ├── bootstrap.ts                 # Firebase init + first-launch seed import
    ├── types/
    │   └── guide.ts                 # Guide / GuideStep schema (+ baseId)
    ├── data/
    │   └── seed-guides/
    │       ├── index.ts             # SEED_GUIDE_IDS manifest
    │       └── ...                  # Bundled JSON guides
    ├── services/
    │   ├── api.ts                   # Central backend client with auto-auth & logging
    │   ├── firebase.ts              # Auth/Firestore/analytics utilities
    │   ├── storage.ts               # expo-file-system storage + LRU cache
    │   └── seedImport.ts            # First-launch import of bundled JSON
    ├── store/
    │   └── useAppStore.ts           # Zustand: Persisted settings, favorites, history
    ├── theme/
    │   └── colors.ts                # Centralized palette: Default + High Contrast
    ├── i18n/
    │   ├── index.ts                 # i18next init
    │   └── ...                      # Translation files (en/es/vi)
    ├── hooks/
    │   ├── useAuth.ts               # Global auth listener & settings hydration
    │   ├── useFavoritesSync.ts      # Debounced/background cloud sync for favorites
    │   ├── useAppNavigation.ts      # goToHome(), resetToHome(), goToGuide(guideId)
    │   └── useTheme.ts              # Dynamic theme selector hook
    ├── components/
    │   ├── HomeButton.tsx           # Persistent HOME; safety UX
    │   ├── LargeSearchBar.tsx       # Cloud + Local search bar
    │   ├── GuideForm.tsx            # Form for creating/editing guides
    │   └── StepEditor.tsx           # Individual step editor component
    ├── screens/
    │   ├── LandingScreen.tsx        # Entry: Language selector + Cloud Search + Top Inquiries
    │   ├── BrowseScreen.tsx         # Categories + History + Local/Cloud Search
    │   ├── GuideDetailScreen.tsx    # Steps, progress, TTS, Optimistic Favorites
    │   ├── LibraryScreen.tsx        # Favorites & Created Guides with Cloud-to-Local fallback
    │   ├── GuideEditorScreen.tsx    # Create/Edit Guide flow
    │   └── SettingsScreen.tsx       # Profile, High Contrast, TTS, Firebase Auth
    └── navigation/
        ├── types.ts                 # Navigation types (Landing, Browse, etc.)
        ├── MainTabs.tsx             # Bottom tabs: Browse, Library, Settings
        └── RootNavigator.tsx        # Stack: Landing, MainTabs, GuideDetail
```

## Features & Implementation

- **Internationalization (i18n):** Full support for **English, Spanish, and Vietnamese**. Selected language is accessible on the **Landing** screen and persisted offline.
- **Smart Favorites & Sync:**
  - **Optimistic UI:** Favorite toggles update instantly.
  - **Cloud Sync:** Debounced (30s) and background synchronization via `useFavoritesSync`.
  - **Local-to-Cloud Fallback:** The Library merges cloud data with local favorites to ensure "orphaned" or local-only guides are never lost.
- **Hybrid Search:**
  - Integrated into both **Landing** and **Browse** screens.
  - Merges results from the local filesystem and the backend API.
  - Automatic deduplication using `baseId`, preferring cloud-hosted or newer versions.
- **Offline Persistence:**
  - State managed via **Zustand** with `persist` middleware and `AsyncStorage`.
  - Language choice, favorites, and viewing history survive app restarts.
- **Backend Sync:** 
  - Centralized API client (`api.ts`) with automatic Firebase ID token refreshes and detailed logging.
  - Profile hydration ensures settings are restored across devices on sign-in.

## Setup

1. Install: `npm install`
2. (Optional) Firebase: copy `.env.example` to `.env` and set `EXPO_PUBLIC_FIREBASE_*` keys.
3. Run: `npm start` then `a` (Android), `i` (iOS), or `w` (web/PWA).

## Accessibility & Theme

- **Dynamic Theme:** Centralized palette in `colors.ts` with a **High Contrast Mode** (WCAG AA).
- **Large Targets:** Min 48dp touch targets, min 18pt text for senior legibility.
- **TTS:** Integrated `expo-speech` for step-by-step guidance.
- **Safety First:** Persistent "HOME" button on all screens to prevent user frustration.

## Conventions (.cursorrules)

- No hardcoded content; all strings and colors are dynamic.
- Atomic components with consistent a11y labeling.
- Clean separation between storage, API, and UI layers.
