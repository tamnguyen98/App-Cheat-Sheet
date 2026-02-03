/**
 * Backend API Client: handles auth tokens, timeouts, and JSON parsing.
 * Host: https://localhost:7253
 */

import { useAppStore } from '../store/useAppStore';
import { Guide } from '../types/guide';

const BASE_URL = 'https://localhost:7253';
// const BASE_URL = 'https://localhost:7253';
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
    const { idToken } = useAppStore.getState();

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');
    if (idToken) {
        headers.set('Authorization', `Bearer ${idToken}`);
    }

    console.log('API Request:', {
        method: options.method || 'GET',
        url: `${BASE_URL}${path}`,
        headers,
    });

    try {
        const response = await fetch(`${BASE_URL}${path}`, {
            ...options,
            headers,
            signal: controller.signal,
        });

        clearTimeout(id);

        if (!response.ok) {
            const errorText = await response.text();
            throw new ApiError(response.status, errorText || response.statusText);
        }

        if (response.status === 204) return {} as T;
        return await response.json();
    } catch (error: any) {
        clearTimeout(id);
        if (error.name === 'AbortError') {
            throw new Error('Request timed out');
        }
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
    }): Promise<Guide[]> {
        const query = new URLSearchParams(params as any).toString();
        return apiRequest<Guide[]>(`/guides?${query}`);
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
        console.log('API Request:', {
            method: 'PATCH',
            url: `${BASE_URL}/me/settings`,
            body: JSON.stringify(settings),
        });
        return apiRequest<UserProfile>('/me/settings', {
            method: 'PATCH',
            body: JSON.stringify(settings),
        });
    },
};
