/**
 * Offline storage: expo-file-system + LRU in-memory cache.
 * Seed guides are imported here on first launch.
 */

import * as FileSystem from 'expo-file-system/legacy';
import { LRUCache } from 'lru-cache';
import { Guide } from '../types/guide';

const CACHE_DIR = `${FileSystem.documentDirectory ?? ''}app-cheat-sheet/`;
const GUIDES_DIR = `${CACHE_DIR}guides/`;
const META_FILE = `${CACHE_DIR}meta.json`;
const SEED_IMPORTED_KEY = 'seedImported';

const memoryCache = new LRUCache<string, Guide>({
  max: 100,
  ttl: 1000 * 60 * 60 * 24,
});

export interface StorageMeta {
  seedImported: boolean;
  lastSync?: string;
}

async function ensureDirs(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
  if (!dirInfo.exists) await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
  const guidesInfo = await FileSystem.getInfoAsync(GUIDES_DIR);
  if (!guidesInfo.exists) await FileSystem.makeDirectoryAsync(GUIDES_DIR, { intermediates: true });
}

export async function getStorageMeta(): Promise<StorageMeta> {
  try {
    const info = await FileSystem.getInfoAsync(META_FILE);
    if (!info.exists) return { seedImported: false };
    const raw = await FileSystem.readAsStringAsync(META_FILE);
    return JSON.parse(raw) as StorageMeta;
  } catch {
    return { seedImported: false };
  }
}

export async function setStorageMeta(meta: StorageMeta): Promise<void> {
  await ensureDirs();
  await FileSystem.writeAsStringAsync(META_FILE, JSON.stringify(meta));
}

export async function isSeedImported(): Promise<boolean> {
  const meta = await getStorageMeta();
  return meta.seedImported === true;
}

export async function markSeedImported(): Promise<void> {
  const meta = await getStorageMeta();
  await setStorageMeta({ ...meta, seedImported: true });
}

export function getGuidePath(id: string): string {
  return `${GUIDES_DIR}${id}.json`;
}

export async function saveGuide(guide: Guide): Promise<void> {
  await ensureDirs();
  memoryCache.set(guide.id, guide);
  await FileSystem.writeAsStringAsync(getGuidePath(guide.id), JSON.stringify(guide));
}

export async function loadGuide(id: string): Promise<Guide | null> {
  const cached = memoryCache.get(id);
  if (cached) return cached;
  const path = getGuidePath(id);
  const info = await FileSystem.getInfoAsync(path);
  if (!info.exists) return null;
  try {
    const raw = await FileSystem.readAsStringAsync(path);
    const guide = JSON.parse(raw) as Guide;
    memoryCache.set(id, guide);
    return guide;
  } catch {
    return null;
  }
}

export async function loadAllGuides(): Promise<Guide[]> {
  await ensureDirs();
  const list = await FileSystem.readDirectoryAsync(GUIDES_DIR);
  const guides: Guide[] = [];
  for (const name of list) {
    if (!name.endsWith('.json')) continue;
    const id = name.replace(/\.json$/, '');
    const g = await loadGuide(id);
    if (g) guides.push(g);
  }
  return guides;
}

export async function deleteGuide(id: string): Promise<void> {
  memoryCache.delete(id);
  const path = getGuidePath(id);
  const info = await FileSystem.getInfoAsync(path);
  if (info.exists) await FileSystem.deleteAsync(path);
}
