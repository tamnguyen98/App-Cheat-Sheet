import { useEffect, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { getFirebaseAuth } from '../services/firebase';
import { useAppStore } from '../store/useAppStore';
import { api } from '../services/api';
import { useTranslation } from 'react-i18next';

/**
 * Hook to manage global authentication state and hydrate user settings.
 */
export function useAuth() {
    const { i18n } = useTranslation();
    const setAuth = useAppStore((s) => s.setAuth);
    const setLanguage = useAppStore((s) => s.setLanguage);
    const setTtsAutoPlay = useAppStore((s) => s.setTtsAutoPlay);
    const setHighContrast = useAppStore((s) => s.setHighContrast);

    const hydrateFromBackend = useCallback(async () => {
        try {
            const profile = await api.getMe();
            if (profile.settings) {
                if (profile.settings.language) {
                    setLanguage(profile.settings.language);
                    i18n.changeLanguage(profile.settings.language);
                }
                if (profile.settings.ttsAutoPlay !== undefined) setTtsAutoPlay(profile.settings.ttsAutoPlay);
                if (profile.settings.highContrast !== undefined) setHighContrast(profile.settings.highContrast);
            }
        } catch (e) {
            console.warn('[Auth] Failed to hydrate settings from backend', e);
        }
    }, [setLanguage, i18n, setTtsAutoPlay, setHighContrast]);

    useEffect(() => {
        const auth = getFirebaseAuth();
        if (!auth) return;

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Industry standard: The store tracks ID token for UI/checks, 
                // but api.ts will fetch a fresh one on-demand.
                const token = await user.getIdToken();
                setAuth(user.email, token);
                hydrateFromBackend();
            } else {
                setAuth(null, null);
            }
        });

        return unsubscribe;
    }, [setAuth, hydrateFromBackend]);
}
