/**
 * Seed guide manifest: list of bundled guide IDs for first-launch import.
 * Add new seed JSON files here and to assetBundlePatterns in app.json.
 */

export const SEED_GUIDE_IDS = [
  'zoom-join-android',
  'zoom-join-ios',
  'email-setup-android',
  'phone-basics-calls-android',
  'photos-save-android',
  'security-wifi-android',
  'zoom-join-android-es',
] as const;

export type SeedGuideId = (typeof SEED_GUIDE_IDS)[number];
