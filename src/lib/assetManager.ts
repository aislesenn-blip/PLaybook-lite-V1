// Asset Manager for Playbook Lite v1.0
// Handles dynamic pre-caching of language packs for Day 1-15 + System Audio.
// "Bulletproof" Loader: Tries multiple file extensions recursively until it finds the asset.

const CACHE_NAME = 'playbook-assets-v1';
const BASE_URL = '/assets/audio/';

// Base system files needed for any language
// These are assumed to be in the `public/assets/audio/system/` folder
// Canonical paths (Clean .mp3)
const SYSTEM_ASSETS = [
  `${BASE_URL}system/welcome_generic.mp3`,
  `${BASE_URL}system/success_high.mp3`,
  `${BASE_URL}system/try_again.mp3`,
];

// Generates the full list of CANONICAL URLs for a specific language (Day 1-15)
// We return clean .mp3 paths. The loader will handle the messy extensions.
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

// Helper: Tries to fetch a URL with multiple extension variations
// Returns the Response if found, or null if all fail.
const fetchWithFallback = async (canonicalUrl: string): Promise<Response | null> => {
  // Variations to try, in order of likelihood based on audit
  const variations = [
    canonicalUrl,                  // 1. Try clean .mp3
    `${canonicalUrl}.mp3`,         // 2. Try .mp3.mp3
    `${canonicalUrl}.mpeg`,        // 3. Try .mp3.mpeg (English Day 1 Sound)
    canonicalUrl.replace('.mp3', '.mpeg'), // 4. Try replacing extension entirely
    canonicalUrl.replace('.mp3', '.mp4'),  // 5. Try video container (.mp4) - CRITICAL FIX
    `${canonicalUrl}.mp4`          // 6. Try .mp3.mp4 (Unlikely but safe)
  ];

  for (const url of variations) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        console.log(`[AssetManager] Found: ${url}`);
        return response;
      }
    } catch (e) {
      // Ignore network errors for variations, try next
    }
  }
  return null;
};

// Downloads missing assets and stores them in the persistent cache
// USES THE TRY-CHAIN STRATEGY
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
  const fetchAndCache = async (canonicalUrl: string) => {
    try {
      // 1. Try to find the file using the robust fallback logic
      const response = await fetchWithFallback(canonicalUrl);

      if (!response) {
        console.warn(`[AssetManager] Critical 404: Could not find ANY variation for ${canonicalUrl}`);
        // We resolve successfully effectively skipping it to avoid blocking the user.
        return;
      }

      // 2. Store in cache under the CANONICAL URL
      // This "masks" the messy extension from the app.
      // The app asks for "day1_sound.mp3", checking the cache, and finds this response.
      await cache.put(canonicalUrl, response);

    } catch (error) {
      console.warn(`[AssetManager] Network Error for ${canonicalUrl}:`, error);
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
