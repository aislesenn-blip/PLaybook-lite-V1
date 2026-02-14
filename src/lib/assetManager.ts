// Asset Manager for Playbook Lite v1.0
// Handles dynamic pre-caching of language packs for Day 1-15 + System Audio.
// Ensures "Silicon Valley" level onboarding: No buffering, 100% offline.

const CACHE_NAME = 'playbook-assets-v1';

// Base system files needed for any language
const SYSTEM_ASSETS = [
  '/assets/audio/system/welcome_generic.mp3',
  '/assets/audio/system/success_high.mp3',
  '/assets/audio/system/try_again.mp3',
  // Add other shared UI sounds here if needed
];

// Generates the full list of URLs for a specific language (Day 1-15)
export const getLanguageAssets = (lang: string): string[] => {
  const assets: string[] = [...SYSTEM_ASSETS];
  const phases = ['sponge', 'echo', 'hunter', 'hero'];
  const dayCount = 15; // Production Requirement: Level 1 (First 15 Days)

  for (let i = 1; i <= dayCount; i++) {
    phases.forEach((phase) => {
      // e.g., /assets/audio/en/day1_sponge.mp3
      assets.push(`/assets/audio/${lang}/day${i}_${phase}.mp3`);
    });
  }

  return assets;
};

// Checks which assets are missing from the cache
export const checkMissingAssets = async (urls: string[]): Promise<string[]> => {
  if (!('caches' in window)) return []; // Fallback for environments without Cache API

  const cache = await caches.open(CACHE_NAME);
  const missing: string[] = [];

  // Use Promise.all for parallel checking (faster)
  await Promise.all(
    urls.map(async (url) => {
      const match = await cache.match(url);
      if (!match) {
        missing.push(url);
      }
    })
  );

  return missing;
};

// Downloads missing assets and stores them in the persistent cache
// Reports progress via callback (0-100)
export const downloadAssets = async (
  urls: string[],
  onProgress: (progress: number) => void
): Promise<void> => {
  if (urls.length === 0) {
    onProgress(100);
    return;
  }

  const cache = await caches.open(CACHE_NAME);
  let completed = 0;
  const total = urls.length;

  // Function to process a single URL
  const fetchAndCache = async (url: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
      }
      // Store in cache
      await cache.put(url, response);
    } catch (error) {
      console.warn(`[AssetManager] Error downloading ${url}:`, error);
      // We could re-throw here to stop everything, or log and continue (graceful degradation).
      // For "Silicon Valley" robustness, we usually want to know if critical assets fail.
      throw error;
    } finally {
      completed++;
      const progress = Math.round((completed / total) * 100);
      onProgress(progress);
    }
  };

  // Execute downloads in parallel with a concurrency limit if needed (browsers handle well usually)
  // For simplicity and speed, Promise.all on the whole batch (browser limits active connections automatically)
  await Promise.all(urls.map(fetchAndCache));
};
