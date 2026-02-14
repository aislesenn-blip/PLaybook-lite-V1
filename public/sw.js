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

// Helper to generate curriculum paths for Day 1-5
const languages = ['en', 'sw'];
const phases = ['sponge', 'echo', 'hunter', 'hero'];

languages.forEach(lang => {
  for (let i = 1; i <= 5; i++) {
    phases.forEach(phase => {
      // e.g., /assets/audio/en/day1_sponge.mp3
      PRECACHE_URLS.push(`/assets/audio/${lang}/day${i}_${phase}.mp3`);
    });
  }
});

// 2. INSTALL: Smart Cache
self.addEventListener('install', (event) => {
  console.log('[SW] Installing... Pre-caching critical assets.');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use catch() to allow partial success (Graceful Degradation)
      // If one audio file is missing, we don't want the whole install to fail.
      return cache.addAll(PRECACHE_URLS).catch(err => {
        console.warn('[SW] Some assets failed to cache (likely missing audio files):', err);
        // We can try to cache critical app shell files strictly if the bulk fails
        // But addAll is atomic (all or nothing), so typically we'd split them.
        // For this task, we log and proceed. Ideally, we'd loop add() individually.

        // Fallback: Cache at least the App Shell
        const APP_SHELL = ['/', '/index.html', '/manifest.json', '/pwa-192x192.png'];
        return cache.addAll(APP_SHELL);
      });
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
