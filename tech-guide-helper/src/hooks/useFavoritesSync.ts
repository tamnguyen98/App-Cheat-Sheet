/**
 * useFavoritesSync: Manages debounced sync of favorites to backend.
 * Logic: 
 * 1. 30s session-based debounce (sync only once every 30s, don't reset timer).
 * 2. Background sync (force immediate sync when app goes to background).
 */

import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { api } from '../services/api';

const SYNC_DELAY_MS = 30000; // 30 seconds

export function useFavoritesSync() {
    const favorites = useAppStore((s) => s.favorites);
    const idToken = useAppStore((s) => s.idToken);
    const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const favoritesRef = useRef(favorites);

    // Keep ref updated so background sync has latest data
    useEffect(() => {
        favoritesRef.current = favorites;
    }, [favorites]);

    const performSync = async () => {
        if (!idToken) return;
        if (syncTimeoutRef.current) {
            clearTimeout(syncTimeoutRef.current);
            syncTimeoutRef.current = null;
        }

        if (favoritesRef.current.length > 0) {
            try {
                console.log('[Sync] Syncing favorites to backend...', favoritesRef.current);
                await api.syncFavorites(favoritesRef.current);
            } catch (e) {
                console.error('[Sync] Failed to sync favorites', e);
            }
        }
    };

    // Debounced sync logic (session-style: fire 30s after first change)
    useEffect(() => {
        if (!idToken) return;

        // Start timer only if not already running
        if (!syncTimeoutRef.current) {
            syncTimeoutRef.current = setTimeout(performSync, SYNC_DELAY_MS);
        }

        // Cleanup on unmount (though this hook usually stays alive at root)
        return () => {
            if (syncTimeoutRef.current) {
                clearTimeout(syncTimeoutRef.current);
            }
        };
    }, [favorites, idToken]);

    // AppState monitoring for background/foreground
    useEffect(() => {
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (nextAppState === 'inactive' || nextAppState === 'background') {
                // App is leaving, force immediate sync if there's a pending timer
                if (syncTimeoutRef.current) {
                    performSync();
                }
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => {
            subscription.remove();
        };
    }, [idToken]);
}
