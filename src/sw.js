// Service Worker for Playbook Lite v1.0
// Strategy: Smart Pre-caching for Day 1-5 + Network First (Dynamic)
// "Omni-Format" Loader: Handles messy extensions (.mp3, .mpeg, .mp4, .mp3.mp3)

const CACHE_NAME = 'playbook-assets-v1'; // MATCHING assetManager.ts

// 1. DEFINE PRECACHE URLS (CRITICAL BATCH)
// Includes App Shell, System Audio, and Content for Days 1-5
const PRECACHE_URLS = [
  // App Shell
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa-192x192.png',
  '/pwa-512x512.png',

  // System Audio (Assumed paths based on project structure)
  '/assets/audio/system/welcome_generic.mp3',
  '/assets/audio/system/success_high.mp3',
  '/assets/audio/system/try_again.mp3',
];

// Helper to generate curriculum paths for Day 1-5 (Matching physical reality in assetManager.ts)
const languages = ['en', 'sw', 'fr'];
const phases = ['sponge', 'echo', 'hunter', 'hero'];

// Phase mapping based on file structure (sponge -> sound, echo -> word, hunter -> phrase, hero -> hero)
const phaseMap = {
  sponge: 'sound',
  echo: 'word',
  hunter: 'phrase',
  hero: 'hero',
};

languages.forEach(lang => {
  for (let i = 5; i <= 5; i++) { // Optimization: Only precache Day 1-5 loop if needed, but original code did 1-5
     // Original code had loop 1..5, correcting my manual paste error if any.
  }
});

// Re-implementing the loop correctly based on original file content
PRECACHE_URLS.length = 0; // Reset to safe defaults + loop
PRECACHE_URLS.push(
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/assets/audio/system/welcome_generic.mp3',
  '/assets/audio/system/success_high.mp3',
  '/assets/audio/system/try_again.mp3'
);

languages.forEach(lang => {
  for (let i = 1; i <= 5; i++) {
    phases.forEach(phase => {
      const mappedPhase = phaseMap[phase] || phase;
      const filename = `day${i}_${mappedPhase}.mp3`;
      PRECACHE_URLS.push(`/assets/audio/${lang}/${filename}`);
    });
  }
});


// Helper: Tries to fetch a URL with multiple extension variations
// Mirrors assetManager.ts logic exactly
const fetchWithFallback = async (canonicalUrl) => {
  // Variations to try, in order of likelihood based on audit
  const variations = [
    canonicalUrl,                  // 1. Try clean .mp3
    `${canonicalUrl}.mp3`,         // 2. Try .mp3.mp3
    `${canonicalUrl}.mpeg`,        // 3. Try .mp3.mpeg
    canonicalUrl.replace('.mp3', '.mpeg'), // 4. Try replacing extension entirely
    canonicalUrl.replace('.mp3', '.mp4'),  // 5. Try video container (.mp4) - CRITICAL FIX
    `${canonicalUrl}.mp4`          // 6. Try .mp3.mp4
  ];

  for (const url of variations) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        console.log(`[SW] Found: ${url}`);
        return response;
      }
    } catch (e) {
      // Ignore network errors for variations, try next
    }
  }
  return null;
};

// 2. INSTALL: Smart Cache with Graceful Degradation & Recursive Try-Chain
self.addEventListener('install', (event) => {
  console.log('[SW] Installing... Pre-caching critical assets (Omni-Format Mode).');
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Instead of cache.addAll which fails atomically if ONE file is missing,
      // we iterate and cache individually to ensure maximum success rate.

      const cachePromises = PRECACHE_URLS.map(async (url) => {
        try {
          // Use the robust fallback logic
          const response = await fetchWithFallback(url);
          if (!response) {
            console.warn(`[SW] Failed to fetch ${url} (All variations failed) - Skipping.`);
            return;
          }
          // Store in cache under the CANONICAL URL
          // This "masks" the messy extension from the app.
          return cache.put(url, response);
        } catch (error) {
          console.warn(`[SW] Network error caching ${url} - Skipping.`);
          // Suppress error to allow installation to proceed
        }
      });

      // Wait for all attempts to finish (whether success or fail)
      await Promise.all(cachePromises);
      console.log('[SW] Pre-caching complete (with graceful degradation).');
    })
  );
  self.skipWaiting();
});

// 3. ACTIVATE: Cleanup Old Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 4. FETCH: Handle Requests
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests (like Supabase or Unsplash) for aggressive caching if needed,
  // but for this PWA, we want to cache app assets.

  // Skip POST requests (Supabase writes)
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // STRATEGY: Cache First for Audio Assets
  // Why? Because we store canonical paths (day1.mp3) but fetch masked variations (.mpeg).
  // If we try network first for .mp3, it will 404. We MUST check the cache first.
  if (url.pathname.startsWith('/assets/audio/')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          // Found in cache (masked successfully during install)
          return cachedResponse;
        }
        // Not in cache? Try network (and cache if found)
        return fetch(event.request).then((networkResponse) => {
             // Valid response?
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            // Clone and Cache
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
            return networkResponse;
        });
      })
    );
    return;
  }

  // STRATEGY: Network First for everything else (App Shell, API, etc.)
  // This ensures fresh content when online, but robust offline support.
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Valid response?
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone and Cache
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      })
      .catch(() => {
        // Network failed, look in cache
        return caches.match(event.request).then((response) => {
            if (response) return response;

            // Note: We could apply fetchWithFallback here too, but it's expensive for runtime.
            // We rely on the install phase to capture the correct files.
        });
      })
  );
});

// Injection point for Workbox (required by vite-plugin-pwa)
// eslint-disable-next-line no-unused-vars
console.log('Workbox Manifest:', self.__WB_MANIFEST);
