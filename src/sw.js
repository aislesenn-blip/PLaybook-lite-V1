// Service Worker for Playbook Lite v1.0
// Strategy: Smart Pre-caching for Day 1-5 + Cache First for Audio
// Status: OPTIMIZED FOR CLEAN .MP3 FILES

const CACHE_NAME = 'playbook-assets-v2-CLEAN';

// 1. DEFINE PRECACHE URLS (CRITICAL BATCH)
// Includes App Shell, System Audio, and Content for Days 1-5
const PRECACHE_URLS = [
  // App Shell
  '/',
  '/index.html',
  '/manifest.json',
  '/pwa-192x192.png',
  '/pwa-512x512.png',

  // System Audio (Nimeongeza yote ili App iwe kamili)
  '/assets/audio/system/welcome_generic.mp3',
  '/assets/audio/system/success_high.mp3',
  '/assets/audio/system/success_medium.mp3', // Added
  '/assets/audio/system/try_again.mp3',
  '/assets/audio/system/locked_message.mp3',  // Added
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
      // HAPA NI SAFI: Inatafuta .mp3 moja kwa moja (hakuna .mpeg tena)
      const filename = `day${i}_${mappedPhase}.mp3`;
      PRECACHE_URLS.push(`/assets/audio/${lang}/${filename}`);
    });
  }
});

// 2. INSTALL: Simple Pre-caching
self.addEventListener('install', (event) => {
  console.log('[SW] Installing... Pre-caching critical assets.');
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Fetch and cache all precache URLs
      // Tunatumia map badala ya addAll ili faili moja likikosekana, isiue process nzima
      const cachePromises = PRECACHE_URLS.map(async (url) => {
        try {
          const response = await fetch(url);
          if (response.ok) {
            return cache.put(url, response);
          } else {
             console.warn(`[SW] Failed to fetch ${url} (Status: ${response.status})`);
          }
        } catch (error) {
          console.warn(`[SW] Network error caching ${url} - Skipping.`);
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

// 4. FETCH: Handle Requests
self.addEventListener('fetch', (event) => {
  // IGNORE: Hatu-cache requests za kwenda nje (mfano Google Fonts au Supabase APIs)
  if (!event.request.url.startsWith(self.location.origin)) {
     return;
  }

  // STRATEGY: CACHE FIRST FOR MP3 (Hii ndiyo muhimu zaidi)
  if (event.request.url.endsWith('.mp3')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        // Akikuta kwenye cache anatoa, akikosa anaenda network
        return cached || fetch(event.request);
      })
    );
  } else {
    // STRATEGY: NETWORK FIRST (Stale-While-Revalidate fallback)
    // Hii inahakikisha HTML na JS vinakuwa fresh, ila kama hamna net anatoa cache
    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
  }
});

// Injection point for Workbox (REQUIRED for Vite Build)
// eslint-disable-next-line no-unused-vars
const manifest = self.__WB_MANIFEST;
console.log('Workbox Manifest Loaded', manifest);
