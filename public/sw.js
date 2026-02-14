// Service Worker for Playbook Lite v1.0
// Strategy: Smart Pre-caching for Day 1-5 + Network First (Dynamic)

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
  for (let i = 1; i <= 5; i++) {
    phases.forEach(phase => {
      const mappedPhase = phaseMap[phase] || phase;

      // Default: Double extension as per physical file structure audit
      let filename = `day${i}_${mappedPhase}.mp3.mp3`;

      // CRITICAL EXCEPTION: English Day 1 Sound has .mpeg extension
      if (lang === 'en' && i === 1 && mappedPhase === 'sound') {
        filename = `day${i}_${mappedPhase}.mp3.mpeg`;
      }

      // Strict path construction
      PRECACHE_URLS.push(`/assets/audio/${lang}/${filename}`);
    });
  }
});

// 2. INSTALL: Smart Cache with Graceful Degradation
self.addEventListener('install', (event) => {
  console.log('[SW] Installing... Pre-caching critical assets.');
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Instead of cache.addAll which fails atomically if ONE file is missing,
      // we iterate and cache individually to ensure maximum success rate.

      const cachePromises = PRECACHE_URLS.map(async (url) => {
        try {
          const response = await fetch(url);
          if (!response.ok) {
            console.warn(`[SW] Failed to fetch ${url} (Status: ${response.status}) - Skipping.`);
            return;
          }
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

// 4. FETCH: Network First, falling back to Cache
// This ensures fresh content when online, but robust offline support.
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests (like Supabase or Unsplash) for aggressive caching if needed,
  // but for this PWA, we want to cache app assets.

  // Skip POST requests (Supabase writes)
  if (event.request.method !== 'GET') return;

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

            // Optional: Return a specific fallback page for navigation requests if cache misses
            // if (event.request.mode === 'navigate') {
            //   return caches.match('/offline.html');
            // }
        });
      })
  );
});
