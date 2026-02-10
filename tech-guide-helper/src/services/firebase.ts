/**
 * Firebase stub: auth, Firestore, analytics.
 * Replace placeholder config with your project values in app config / env.
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAnalytics, Analytics, isSupported } from 'firebase/analytics';
import { Guide } from '../types/guide';

/**
 * Firebase config logic. 
 * Secrets are loaded from EXPO_PUBLIC_* environment variables.
 * These variables should be defined in a .env file (not checked into git).
 * Note: Expo bundles these into the app at build time.
 */
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID ?? '',
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let analytics: Analytics | null = null;

export function initFirebase(): void {
  if (getApps().length > 0) return;
  if (!firebaseConfig.apiKey) {
    __DEV__ && console.log('Firebase config missing; running without Firebase.');
    return;
  }
  console.log(firebaseConfig);
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  isSupported().then((yes) => {
    if (yes && app) analytics = getAnalytics(app);
  });
}

export function getFirebaseAuth(): Auth | null {
  return auth;
}

export function getFirebaseDb(): Firestore | null {
  return db;
}

export function getFirebaseAnalytics(): Analytics | null {
  return analytics;
}

/** Firestore collection name for guides (CMS). */
export const GUIDES_COLLECTION = 'guides';

/** Fetch a single guide by id from Firestore. Returns null if not found or Firebase not configured. */
export async function fetchGuideFromFirestore(guideId: string): Promise<Guide | null> {
  if (!db) return null;
  const { doc, getDoc } = await import('firebase/firestore');
  const ref = doc(db, GUIDES_COLLECTION, guideId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Guide;
}

/** Fetch multiple guides by language and optional device. */
export async function fetchGuidesFromFirestore(options: {
  language: string;
  deviceFamily?: string;
  limit?: number;
}): Promise<Guide[]> {
  if (!db) return [];
  const { collection, query, where, orderBy, limit, getDocs } = await import('firebase/firestore');
  const constraints = [
    where('language', '==', options.language),
    orderBy('lastUpdated', 'desc'),
  ];
  if (options.deviceFamily) {
    constraints.unshift(where('deviceFamily', 'array-contains', options.deviceFamily));
  }
  const q = query(
    collection(db, GUIDES_COLLECTION),
    ...constraints,
    limit(options.limit ?? 50)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Guide));
}
