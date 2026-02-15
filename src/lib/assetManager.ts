// Asset Manager for Playbook Lite v1.0
// Handles dynamic pre-caching of language packs for Day 1-15 + System Audio.
// Simplified Loader: Standard .mp3 files only.

// UPDATED: Sync with sw.js to prevent deletion loop
const CACHE_NAME = 'playbook-assets-v5-FINAL';
const BASE_URL = '/assets/audio/';

// Base system files needed for any language
// These are assumed to be in the `public/assets/audio/system/` folder
// Canonical paths (Clean .mp3)
const SYSTEM_ASSETS = [
  `${BASE_URL}system/welcome_generic.mp3`,
  `${BASE_URL}system/success_high.mp3`,
  `${BASE_URL}system/success_medium.mp3`, // Added
  `${BASE_URL}system/try_again.mp3`,
  `${BASE_URL}system/locked_message.mp3`, // Added
];

// Generates the full list of CANONICAL URLs for a specific language (Day 1-15)
// We return clean .mp3 paths.
export const getLanguageAssets = (lang: string): string[] => {
  const assets: string[] = [...SYSTEM_ASSETS];
  const phases = ['sponge', 'echo', 'hunter', 'hero'];
  const dayCount = 15; // Production Requirement: Level 1 (First 15 Days)

  // Mapping language names to folder codes
  let langCode = lang;
  if (lang === 'english') langCode = 'en';
  if (lang === 'swahili') langCode = 'sw';
  if (lang === 'french') langCode = 'fr';

  // Phase mapping based on file structure
  const phaseMap: Record<string, string> = {
    sponge: 'sound',
    echo: 'word',
    hunter: 'phrase',
    hero: 'hero',
  };

  for (let i = 1; i <= dayCount; i++) {
    phases.forEach((phase) => {
      const mappedPhase = phaseMap[phase] || phase;
      // ALWAYS use the clean, canonical filename here.
      // e.g., day1_sound.mp3
      let filename = `day${i}_${mappedPhase}.mp3`;

      // Construct canonical path: /assets/audio/${langCode}/${filename}
      assets.push(`${BASE_URL}${langCode}/${filename}`);
    });
  }

  return assets;
};

// Checks which assets are missing from the cache (using canonical paths)
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
// USES SIMPLE FETCH -> CACHE STRATEGY
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
      // 1. Fetch directly
      // UPDATED: Using CORS mode for safety with CDN/Vercel
      const response = await fetch(url, { mode: 'cors' });

      if (response.ok) {
        // 2. Store in cache
        await cache.put(url, response);
      } else {
        console.warn(`[AssetManager] Failed to fetch: ${url}`);
      }

    } catch (error) {
      console.warn(`[AssetManager] Network Error for ${url}:`, error);
    } finally {
      completed++;
      const progress = Math.round((completed / total) * 100);
      onProgress(progress);
    }
  };

  // Execute downloads in parallel
  await Promise.all(urls.map(fetchAndCache));
};
