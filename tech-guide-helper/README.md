# App Cheat Sheet

A minimalist, visual quick-reference PWA/mobile app for tech-illiterate users (especially seniors), providing step-by-step guides for everyday tech tasks (e.g. Zoom setup, email, phone basics).

## Stack

- **React Native + Expo** (TypeScript)
- **Firebase** (Auth, Firestore, Analytics) — optional; configure via env
- **expo-speech** (TTS), **expo-file-system** (offline), **lru-cache**, **zustand**
- **React Navigation** (bottom tabs + stack), **react-native-paper**, **i18next** (en/es)

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
│   ├── adaptive-icon.png
│   ├── favicon.png
│   ├── icon.png
│   └── splash-icon.png
└── src/
    ├── bootstrap.ts                 # Firebase init + first-launch seed import
    ├── types/
    │   └── guide.ts                 # Guide / GuideStep schema
    ├── data/
    │   └── seed-guides/
    │       ├── index.ts             # SEED_GUIDE_IDS manifest
    │       ├── zoom-join-android.json
    │       ├── zoom-join-ios.json
    │       ├── email-setup-android.json
    │       ├── phone-basics-calls-android.json
    │       ├── photos-save-android.json
    │       ├── security-wifi-android.json
    │       └── zoom-join-android-es.json
    ├── services/
    │   ├── firebase.ts              # Auth/Firestore/analytics stub + fetchGuide(s)
    │   ├── storage.ts               # expo-file-system/legacy + LRU cache, meta, save/load guides
    │   └── seedImport.ts            # First-launch import of bundled JSON into storage
    ├── store/
    │   └── useAppStore.ts           # Zustand: language, favorites, guidesViewedToday, TTS/high-contrast
    ├── i18n/
    │   └── index.ts                 # i18next en/es (search, home, guide, library, favorites, settings)
    ├── context/
    │   └── NavigationRefContext.tsx # Root nav ref provider + useNavigationRef
    ├── hooks/
    │   └── useAppNavigation.ts      # goToHome(), resetToHome(), goToGuide(guideId) — type-safe, no casting
    ├── components/
    │   ├── HomeButton.tsx           # Persistent HOME (uses goToHome); a11y
    │   └── LargeSearchBar.tsx       # Central search bar; a11y
    ├── screens/
    │   ├── SearchScreen.tsx         # Landing: Google-like search + top-inquiry chips; link to Browse
    │   ├── HomeScreen.tsx           # Browse: headline, search, categories, guide list; HOME button
    │   ├── GuideDetailScreen.tsx   # Steps, progress, TTS, Next/Previous/Done (resetToHome), Favorites, HOME
    │   ├── LibraryScreen.tsx        # Local guides list; HOME
    │   ├── FavoritesScreen.tsx      # Favorites from store; HOME
    │   └── SettingsScreen.tsx       # Language, TTS auto-play, high contrast; HOME
    └── navigation/
        ├── types.ts                 # RootTabParamList, RootStackParamList, AppNavigationProp, GuideDetailRouteProp, RootNavigationRef
        ├── MainTabs.tsx              # Bottom tabs: Search, Home (Browse), Library, Favorites, Settings
        └── RootNavigator.tsx         # Stack: MainTabs, GuideDetail
```

## Navigation

- **Landing:** **Search** tab is the default (simple search + suggestive chips; “Browse all guides” goes to Home).
- **Tabs:** Search (landing), Browse (Home), Library, Favorites, Settings.
- **Stack:** MainTabs and GuideDetail. “Done” on GuideDetail uses **resetToHome()** (panic button: clears stack, shows Home tab).
- **Type-safe:** `useAppNavigation()` provides `goToHome()`, `resetToHome()`, `goToGuide(guideId)`; no `as never` or casting. Root ref is provided via `NavigationRefContext` and used in the hook.

## Setup

1. Install: `npm install`
2. (Optional) Firebase: copy `.env.example` to `.env` and set `EXPO_PUBLIC_FIREBASE_*` keys.
3. Run: `npm start` then `a` (Android), `i` (iOS), or `w` (web/PWA).

## PWA

- `app.json` configures web manifest (name, themeColor, display: standalone, startUrl).
- Expo web build produces a service worker for offline basics.
- Prompt "Add to Home Screen" after first guide can be added in-app later.

## Seed guides

- 7 JSON files in `src/data/seed-guides/` (Zoom join Android/iOS, email setup, phone basics, photos, Wi‑Fi, Zoom Spanish).
- On first launch, seed import runs once and writes guides to local storage; they are treated like CMS content (versioned, device/language tagged).

## Accessibility

- Large touch targets (min 48dp), min 18pt text, high contrast, TTS per step.
- Every interactive element has `accessibilityLabel`, `accessibilityRole`, `accessibilityHint`.
- Persistent **HOME** button on every screen (safety UX).

## Conventions (.cursorrules)

- No hardcoded guide content in components; content lives in JSON/Firestore only.
- Light theme (soft white bg, dark text), accent #2d7a5e.
- Optional login; no forced login on first open.
