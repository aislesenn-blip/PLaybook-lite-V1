// Asset Manager for Playbook Lite v1.0
// Handles dynamic pre-caching of language packs for Day 1-15 + System Audio.
// Ensures "Silicon Valley" level onboarding: No buffering, 100% offline.

const CACHE_NAME = 'playbook-assets-v1';
const BASE_URL = '/assets/audio/';

// Base system files needed for any language
// These are assumed to be in the `public/assets/audio/system/` folder
const SYSTEM_ASSETS = [
  `${BASE_URL}system/welcome_generic.mp3`,
  `${BASE_URL}system/success_high.mp3`,
  `${BASE_URL}system/try_again.mp3`,
];

// Generates the full list of URLs for a specific language (Day 1-15)
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

      // NOTE: Files in public/assets/audio/ mostly have double extensions (.mp3.mp3).
      // We must match the physical file names found in the directory.
      let filename = `day${i}_${mappedPhase}.mp3.mp3`;

      // CRITICAL: Handle specific file exceptions based on physical reality
      // English Day 1 Sound has a unique extension (.mpeg)
      if (langCode === 'en' && i === 1 && mappedPhase === 'sound') {
        filename = `day${i}_${mappedPhase}.mp3.mpeg`;
      }

      // Construct strict path: /assets/audio/${langCode}/${filename}
      assets.push(`${BASE_URL}${langCode}/${filename}`);
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
        // If 404, we warn but do NOT throw, so the loader completes.
        console.warn(`[AssetManager] 404 Missing: ${url}`);
        // We resolve successfully effectively skipping it to avoid blocking the user.
        return;
      }
      // Store in cache
      await cache.put(url, response);
    } catch (error) {
      console.warn(`[AssetManager] Network Error for ${url}:`, error);
      // Depending on strictness, we might throw here if offline, but
      // if we want to let the user in even with partial assets, we just log.
      // However, if offline completely, fetch throws.
      // We will suppress individual errors to allow "partial success".
    } finally {
      completed++;
      const progress = Math.round((completed / total) * 100);
      onProgress(progress);
    }
  };

  // Execute downloads in parallel
  // This ensures that even if some fail (404), the progress reaches 100%.
  await Promise.all(urls.map(fetchAndCache));
};
