// Service Worker for Playbook Lite v1.0
// Strategy: Cache-First for Audio, Network-First for App Shell
// Simplified for Clean Audio Files (Standard .mp3)

const CACHE_NAME = 'playbook-assets-v2';

// 1. DEFINE PRECACHE URLS (CRITICAL BATCH)
// Includes App Shell, System Audio, and Content for Days 1-5
const PRECACHE_URLS = [
  // App Shell
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa-192x192.png',
  '/pwa-512x512.png',

  // System Audio
  '/assets/audio/system/welcome_generic.mp3',
  '/assets/audio/system/success_high.mp3',
  '/assets/audio/system/try_again.mp3',
];

// Helper to generate curriculum paths for Day 1-5
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
      const filename = `day${i}_${mappedPhase}.mp3`;
      PRECACHE_URLS.push(`/assets/audio/${lang}/${filename}`);
    });
  }
});

// 2. INSTALL: Pre-cache critical assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing... Pre-caching critical assets (v2).');
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Use cache.addAll now that files are clean and consistent.
      // If one fails, we want to know about it (fail-fast), or we can keep the loop for robustness.
      // Keeping the loop for now to be safe against single file 404s not breaking the whole install.

      const cachePromises = PRECACHE_URLS.map(async (url) => {
        try {
          const response = await fetch(url);
          if (response.ok) {
            return cache.put(url, response);
          } else {
            console.warn(`[SW] Failed to fetch ${url} during install.`);
          }
        } catch (error) {
          console.warn(`[SW] Network error caching ${url} during install.`);
        }
      });

      await Promise.all(cachePromises);
      console.log('[SW] Pre-caching complete.');
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

// 4. FETCH: Strategy Router
self.addEventListener('fetch', (event) => {
  // Skip POST requests (Supabase writes)
  if (event.request.method !== 'GET') return;

  // STRATEGY: Cache First for Audio (.mp3)
  if (event.request.url.endsWith('.mp3')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) {
          return cached;
        }
        return fetch(event.request).then((response) => {
          // Cache the new audio file for next time
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        });
      })
    );
  }
  // STRATEGY: Network First for everything else (App Shell, API, etc.)
  else {
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
          return caches.match(event.request);
        })
    );
  }
});

// Injection point for Workbox (required by vite-plugin-pwa)

console.log('Workbox Manifest:', self.__WB_MANIFEST);
