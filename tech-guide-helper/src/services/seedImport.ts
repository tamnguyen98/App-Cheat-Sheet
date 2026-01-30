/**
 * First-launch seed import: load bundled JSON guides into local storage.
 * Treat seed guides identically to CMS-fetched (versioned, tagged).
 */

import { Guide } from '../types/guide';
import { SEED_GUIDE_IDS } from '../data/seed-guides';
import { isSeedImported, markSeedImported, saveGuide } from './storage';

type SeedModule = () => Guide;

const seedModules: Record<string, SeedModule> = {
  'zoom-join-android': () => require('../data/seed-guides/zoom-join-android.json') as Guide,
  'zoom-join-ios': () => require('../data/seed-guides/zoom-join-ios.json') as Guide,
  'email-setup-android': () => require('../data/seed-guides/email-setup-android.json') as Guide,
  'phone-basics-calls-android': () =>
    require('../data/seed-guides/phone-basics-calls-android.json') as Guide,
  'photos-save-android': () => require('../data/seed-guides/photos-save-android.json') as Guide,
  'security-wifi-android': () => require('../data/seed-guides/security-wifi-android.json') as Guide,
  'zoom-join-android-es': () => require('../data/seed-guides/zoom-join-android-es.json') as Guide,
};

export async function runSeedImportIfNeeded(): Promise<boolean> {
  const already = await isSeedImported();
  if (already) return false;
  for (const id of SEED_GUIDE_IDS) {
    const loader = seedModules[id];
    if (loader) {
      try {
        const guide = loader();
        if (guide?.id) await saveGuide(guide);
      } catch (e) {
        __DEV__ && console.warn('Seed import failed for', id, e);
      }
    }
  }
  await markSeedImported();
  return true;
}
