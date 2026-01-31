/**
 * First-launch seed import: load bundled JSON guides into local storage.
 * Treat seed guides identically to CMS-fetched (versioned, tagged).
 */

import { Guide } from '../types/guide';
import { SEED_GUIDE_IDS } from '../data/seed-guides';
import { isSeedImported, loadGuide, markSeedImported, saveGuide } from './storage';

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

export const ASSET_MAP: Record<string, any> = {
  "assets/guides/zoom/mobile/zoom-landing-page.png": require("../../assets/guides/zoom/mobile/zoom-landing-page.png"),
  "assets/guides/zoom/mobile/zoom-meeting-info-input-page-meeting-id.png": require("../../assets/guides/zoom/mobile/zoom-meeting-info-input-page-meeting-id.png"),
  "assets/guides/zoom/mobile/zoom-meeting-info-input-page-name.png": require("../../assets/guides/zoom/mobile/zoom-meeting-info-input-page-name.png"),
  "assets/guides/zoom/mobile/zoom-meeting-passcode-input.png": require("../../assets/guides/zoom/mobile/zoom-meeting-passcode-input.png"),
  "assets/guides/zoom/mobile/zoom-meeting-finalize-page.png": require("../../assets/guides/zoom/mobile/zoom-meeting-finalize-page.png"),
  "assets/guides/zoom/mobile/icon.webp": require("../../assets/guides/zoom/mobile/icon.webp"),
  // Add others here as you create them
};

export async function runSeedImportIfNeeded(): Promise<boolean> {
  // We remove the early 'return false' check during development 
  // so we can check for version updates on every boot.
  
  let importedAny = false;

  for (const id of SEED_GUIDE_IDS) {
    const loader = seedModules[id];
    if (loader) {
      try {
        const bundledGuide = loader();
        // Use the existing loadGuide to see what version is on the phone
        const existingGuide = await loadGuide(id); 

        // If it doesn't exist OR the version in code is higher, overwrite it
        if (!existingGuide || bundledGuide.version > existingGuide.version) {
          console.log(`[Seed] Updating ${id}: v${existingGuide?.version ?? 0} -> v${bundledGuide.version}`);
          await saveGuide(bundledGuide);
          importedAny = true;
        }
      } catch (e) {
        if (__DEV__) console.warn('Seed import failed for', id, e);
      }
    }
  }

  await markSeedImported();
  return importedAny;
}
