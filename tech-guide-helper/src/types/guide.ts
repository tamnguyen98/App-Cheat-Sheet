/**
 * Guide schema: matches Firestore and bundled seed JSON.
 * Content lives in data/CMS only — never hardcoded in components.
 */

export interface GuideStep {
  stepNumber: number;
  text: string;
  image: string;
  tts: string;
}

export interface Guide {
  id: string;
  title: string;
  version: number;
  lastUpdated: string;
  deviceFamily: string[];
  language: string;
  steps: GuideStep[];
  category: string;
}

export type DeviceFamily = 'android-generic' | 'ios-iphone' | 'web' | string;
export type GuideCategory = 'Video Calls' | 'Phone Basics' | 'Email' | 'Photos' | 'Security' | string;
