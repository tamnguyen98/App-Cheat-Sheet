/**
 * Guide schema: matches Firestore and bundled seed JSON.
 * Content lives in data/CMS only — never hardcoded in components.
 */

export interface GuideStep {
  id?: string; // Client-side unique ID for stable keys
  stepNumber: number;
  text: string;
  image: string;
  tts: string;
}

export type GuideStatus = 'draft' | 'private' | 'public' | 'pending-review' | 'rejected';

export interface Guide {
  id: string;
  baseId?: string; // Root ID without language suffix
  title: string;
  version: number;
  lastUpdated: string;
  deviceFamilies: string[];
  language: string;
  steps: GuideStep[];
  category: string;
  creatorUid?: string;
  isPrivate?: boolean;
  status?: GuideStatus;
}

export interface GuideBuilderState {
  title: string;
  category: string;
  deviceFamilies: string[]; // Default to current device initially
  steps: GuideStep[];
}

export type DeviceFamily = 'android-generic' | 'ios-iphone' | 'web' | string;
export type GuideCategory = 'Video Calls' | 'Phone Basics' | 'Email' | 'Photos' | 'Security' | string;
