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
├── App.tsx                          # Root: bootstrap, Paper, NavigationContainer + ref, NavigationRefProvider
├── app.json                         # PWA web config (manifest, themeColor, standalone)
├── index.ts                         # Entry (registerRootComponent)
├── package.json                     # Expo 54, React Navigation, Firebase, zustand, i18next, etc.
├── .env.example                     # Firebase env placeholders
├── tsconfig.json
├── assets/                           # Icons (Expo default)
└── src/
    ├── bootstrap.ts                 # Firebase init + first-launch seed import
    ├── types/
    │   └── guide.ts                 # Guide / GuideStep schema
    ├── data/
    │   └── seed-guides/
    │       ├── index.ts             # SEED_GUIDE_IDS manifest
    │       └── ...                  # Bundled JSON guides
    ├── services/
    │   ├── api.ts                   # Central backend client with auto-auth (Firebase)
    │   ├── firebase.ts              # Auth/Firestore/analytics stub + fetchGuide(s)
    │   ├── storage.ts               # expo-file-system/legacy + LRU cache, meta, save/load guides
    │   └── seedImport.ts            # First-launch import of bundled JSON into storage
    ├── store/
    │   └── useAppStore.ts           # Zustand: language, favorites, history (viewedGuides), TTS/high-contrast
    ├── theme/
    │   └── colors.ts                # Centralized palette: Default + High Contrast
    ├── i18n/
    │   ├── index.ts                 # i18next init
    │   ├── en.ts                    # English strings
    │   ├── es.ts                    # Spanish strings
    │   └── vi.ts                    # Vietnamese strings
    ├── context/
    │   └── NavigationRefContext.tsx # Root nav ref provider + useNavigationRef
    ├── hooks/
    │   ├── useAppNavigation.ts      # goToHome(), resetToHome(), goToGuide(guideId)
    │   └── useTheme.ts              # Hook to access current theme (Default/High Contrast)
    ├── components/
    │   ├── HomeButton.tsx           # Persistent HOME (uses goToHome); dynamic theme
    │   └── LargeSearchBar.tsx       # Central search bar; dynamic theme
    ├── screens/
    │   ├── SearchScreen.tsx         # Google-like search + top-inquiry chips
    │   ├── HomeScreen.tsx           # Browse: History (Recently Viewed) + categories
    │   ├── GuideDetailScreen.tsx   # Steps, progress, TTS, Favorites toggle, HOME
    │   ├── LibraryScreen.tsx        # Combined "Your Guides" + "Favorites" sections (collapsible)
    │   └── SettingsScreen.tsx       # Language (EN/ES/VI), high contrast toggle, TTS, Firebase Auth
    └── navigation/
        ├── types.ts                 # Navigation types (RootTabParamList etc.)
        ├── MainTabs.tsx              # Bottom tabs: Home (Browse), Library, Settings
        └── RootNavigator.tsx         # Stack: MainTabs, GuideDetail
```

## Features & Implementation

- **Internationalization (i18n):** Full support for **English, Spanish, and Vietnamese**.
- **Backend Sync:** 
  - Centralized API client (`src/services/api.ts`) with custom fetch wrapper.
  - Automatic Firebase ID token attachment for protected routes.
  - Settings (Language, TTS, High Contrast) sync to backend on update and hydrate on sign-in.
- **Unified Navigation:**
  - **Search Landing:** Primary entry point with predictive chips.
  - **Browse (Home):** Dynamic dashboard showing **Recently Viewed** history and categories.
  - **Library:** Merged "Your Guides" and "Favorites" with collapsible accordion UI.
- **Firebase Auth:** 
  - Integrated into Settings for Sign In / Sign Up.
  - State managed in Zustand for instant UI updates.

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
