/**
 * App bootstrap: Firebase init + first-launch seed import.
 * Call once at app root before rendering navigation.
 */

import { initFirebase } from './services/firebase';
import { runSeedImportIfNeeded } from './services/seedImport';

let bootstrapped = false;

export async function bootstrap(): Promise<void> {
  if (bootstrapped) return;
  initFirebase();
  await runSeedImportIfNeeded();
  bootstrapped = true;
}
