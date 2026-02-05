/**
 * Backend API Client: handles auth tokens, timeouts, and JSON parsing.
 * Host: https://localhost:7253
 */

import { useAppStore } from '../store/useAppStore';
import { Guide } from '../types/guide';
import { getFirebaseAuth } from './firebase';

const BASE_URL = 'http://192.168.2.107:5001';
const TIMEOUT_MS = 10000;

export interface UserSettings {
    language: string;
    ttsAutoPlay: boolean;
    highContrast: boolean;
}

export interface UserProfile {
    email: string;
    settings: UserSettings;
}

/** Response shape for GET /me/library */
export interface LibraryResponse {
    favorites: Guide[];
    created: Guide[];
}

/** Error wrapper for API failures. */
export class ApiError extends Error {
    constructor(public status: number, message: string) {
        super(message);
        this.name = 'ApiError';
    }
}

/** Generic fetch wrapper with auth and timeout. */
async function apiRequest<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const auth = getFirebaseAuth();
    const user = auth?.currentUser;
    const idToken = user ? await user.getIdToken() : null;

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');
    if (idToken) {
        headers.set('Authorization', `Bearer ${idToken}`);
    }

    const url = `${BASE_URL}${path}`;
    const method = options.method || 'GET';

    // Log request details
    console.log(`[API Request] ${method} ${url}`, {
        headers: Object.fromEntries(headers.entries()),
        body: options.body ? JSON.parse(options.body as string) : null,
    });

    try {
        const response = await fetch(url, {
            ...options,
            headers,
            signal: controller.signal,
        });

        clearTimeout(id);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[API Error Response] ${method} ${url}`, {
                status: response.status,
                statusText: response.statusText,
                body: errorText,
            });
            throw new ApiError(response.status, errorText || response.statusText);
        }

        if (response.status === 204) return {} as T;
        const data = await response.json();
        return data;
    } catch (error: any) {
        clearTimeout(id);
        if (error.name === 'AbortError') {
            console.error(`[API Timeout] ${method} ${url}`);
            throw new Error('Request timed out');
        }
        console.error(`[API Network Error] ${method} ${url}`, error);
        throw error;
    }
}

export const api = {
    /** Fetch guides with filters. */
    async getGuides(params: {
        lang?: string;
        device?: string;
        category?: string;
        search?: string;
        limit?: number;
        offset?: number;
        creatorUid?: string;
    }): Promise<Guide[]> {
        const query = new URLSearchParams(params as any).toString();
        return apiRequest<Guide[]>(`/guides?${query}`);
    },

    /** Batch fetch guides by IDs. */
    async batchFetchGuides(ids: string[]): Promise<Guide[]> {
        if (ids.length === 0) return [];
        return apiRequest<Guide[]>('/guides/batch', {
            method: 'POST',
            body: JSON.stringify(ids),
        });
    },

    /** Fetch a single guide by base id. */
    async getGuide(baseId: string, params: { lang?: string; device?: string }): Promise<Guide> {
        const query = new URLSearchParams(params as any).toString();
        return apiRequest<Guide>(`/guides/${baseId}?${query}`);
    },

    /** Get current user profile and settings. */
    async getMe(): Promise<UserProfile> {
        return apiRequest<UserProfile>('/me');
    },

    /** Update user settings. */
    async patchMeSettings(settings: Partial<UserSettings>): Promise<UserProfile> {
        return apiRequest<UserProfile>('/me/settings', {
            method: 'PATCH',
            body: JSON.stringify(settings),
        });
    },

    /** Sync full favorites list to backend. */
    async syncFavorites(ids: string[]): Promise<void> {
        return apiRequest<void>('/me/favorites', {
            method: 'POST',
            body: JSON.stringify(ids),
        });
    },

    /** Get guides created by the current user along with their favorites. */
    async getMyLibrary(params: { limit?: number; offset?: number }): Promise<LibraryResponse> {
        const query = new URLSearchParams(params as any).toString();
        return apiRequest<LibraryResponse>(`/me/library?${query}`);
    },
};
