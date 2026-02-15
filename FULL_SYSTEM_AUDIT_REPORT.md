# Playbook Lite - Comprehensive System Audit Report

## Executive Summary
**Status:** ⚠️ **CRITICAL ARCHITECTURAL FLAWS DETECTED**
The application "Playbook Lite" is a sophisticated PWA built with React, Vite, and TypeScript. It features advanced capabilities like offline speech recognition (Whisper), physics simulations (Matter.js), and a robust caching strategy.

However, the application is currently **functionally broken** in its default state due to missing routing logic in `App.tsx` and incorrect asset paths in `soundManager.ts`. While the individual components are high-quality, they are not correctly wired together to form a navigable application.

## 🚨 Critical Issues (Must Fix Immediately)

1.  **Missing Router Configuration (`src/App.tsx`)**
    -   **Problem:** `App.tsx` simply renders `<HeroSection />`. There is no `react-router-dom` configuration (`<BrowserRouter>`, `<Routes>`).
    -   **Impact:** The Dashboard (`AppView.tsx`), Privacy Policy, and Terms pages are unreachable. Clicking "Open App" or "Privacy" on the landing page causes a full reload that just shows the landing page again (infinite loop).
    -   **Fix:** Refactor `App.tsx` to use `BrowserRouter` and define routes for `/`, `/app`, `/privacy`, `/terms`.

2.  **Broken Audio Paths (`src/lib/soundManager.ts`)**
    -   **Problem:** The `playSound` function constructs paths using `/src/assets/audio/...`.
    -   **Impact:** In a production build, `src/` does not exist. All audio playback attempts will fail with 404 errors.
    -   **Fix:** Change paths to start with `/assets/audio/...` (matching the `public/` folder structure).

3.  **Hardcoded Language in Speech Recognition (`src/workers/whisper.worker.ts`)**
    -   **Problem:** The Whisper worker hardcodes `language: 'english'` in the transcription pipeline.
    -   **Impact:** The "Echo" phase (speech practice) will fail to correctly recognize Swahili or French inputs, making the app unusable for those curricula.
    -   **Fix:** Pass the selected language code from `PhaseEcho.tsx` to the worker and use it dynamically.

4.  **Security Risk: Exposed API Key (`src/lib/imageFetcher.ts`)**
    -   **Problem:** The Unsplash Access Key is hardcoded in the source file.
    -   **Impact:** If the repo is public, this key can be scraped and abused, leading to rate limiting or costs.
    -   **Fix:** Move to `.env` (`VITE_UNSPLASH_KEY`) and access via `import.meta.env`.

---

## Detailed File Analysis

### 1. Root Configuration & Environment

| File | Purpose | Status | Connections | Potential Problems |
| :--- | :--- | :--- | :--- | :--- |
| `package.json` | Project dependencies and scripts. | ✅ Good | Uses `vite`, `typescript`, `react-router-dom`, `@xenova/transformers`. | `workbox-*` packages in `devDependencies` usually fine with `vite-plugin-pwa`. |
| `vite.config.ts` | Build configuration. | ✅ Good | Configures `VitePWA` with `injectManifest` (pointing to `src/sw.js`). | None. |
| `tsconfig.json` | TypeScript compiler options. | ✅ Good | Strict mode enabled. References app/node configs. | None. |
| `tailwind.config.js` | CSS styling configuration. | ✅ Good | Defines custom colors (`brand`, `canvas`, `velvet-rope`). | None. |
| `vercel.json` | Deployment configuration. | ✅ Good | Rewrites all routes to `index.html` for SPA support. | None. |
| `index.html` | Entry HTML file. | ✅ Good | Links `manifest.json`, `main.tsx`, and Inter font. | None. |

### 2. Core Architecture (`src/`)

| File | Purpose | Status | Connections | Potential Problems |
| :--- | :--- | :--- | :--- | :--- |
| `main.tsx` | App Entry Point. | ✅ Good | Mounts `App.tsx`, registers Service Worker (`immediate: true`). | None. |
| `App.tsx` | Main Component. | ❌ **CRITICAL** | Imports `HeroSection`. | **MISSING ROUTING.** Only renders `HeroSection`. Orphaned components (`AppView`, `Home`, etc.). |
| `sw.js` | Service Worker. | ✅ Good | Imports `workbox-*`. Handles asset caching. | Dependent on correct file naming in `public/assets/`. |
| `index.css` | Global Styles. | ✅ Good | Tailwind imports. | None. |

### 3. Library & Utilities (`src/lib/`)

| File | Purpose | Status | Connections | Potential Problems |
| :--- | :--- | :--- | :--- | :--- |
| `assetManager.ts` | Asset Caching Logic. | ✅ Good | Used by `Onboarding.tsx` to pre-cache audio. | Hardcoded list of system assets must match `public/`. |
| `audioRecorder.ts` | Microphone handling. | ⚠️ Legacy | Used by `PhaseEcho`. | Uses deprecated `ScriptProcessorNode`. May have latency issues. |
| `curriculumData.ts` | Lesson content (EN, SW, FR). | ✅ Good | Used by `AppView` and Phases. | Hardcoded data; difficult to update without redeploy. |
| `imageFetcher.ts` | Unsplash API wrapper. | ⚠️ Security | Used by `PhaseSponge`, `PhaseHunter`. | **Exposed API Key.** Fallback logic is good (SVGs). |
| `soundManager.ts` | Audio playback helper. | ❌ **CRITICAL** | Used by all Phases. | **Invalid Paths:** Uses `/src/assets/`, needs `/assets/`. |
| `subscriptionLock.ts` | Freemium logic (48h trial). | ⚠️ Weak | Used by `AppView`, `LockScreen`. | Relies on client-side time/storage (easily bypassed). |
| `supabaseClient.ts` | Backend connection. | ⚠️ Weak | Used by `HeroSection`. | Falls back to `localStorage` silently if Supabase fails/missing env. |
| `transcriptionService.ts` | Wrapper for Whisper Worker. | ✅ Good | Connects `PhaseEcho` to `whisper.worker.ts`. | None. |
| `utils.ts` | Helper functions. | ✅ Good | `cn` (Tailwind), Levenshtein distance. | None. |

### 4. Workers (`src/workers/`)

| File | Purpose | Status | Connections | Potential Problems |
| :--- | :--- | :--- | :--- | :--- |
| `whisper.worker.ts` | AI Speech Recognition. | ❌ **High Risk** | Loaded by `transcriptionService.ts`. | **Hardcoded Language:** `language: 'english'` breaks multilingual support. Heavy download (40MB+). |

### 5. Components (`src/components/`)

#### Landing (`src/components/Landing/`)
| File | Purpose | Status | Connections | Potential Problems |
| :--- | :--- | :--- | :--- | :--- |
| `HeroSection.tsx` | Main Landing UI. | ⚠️ Issues | Links to `/app`, `/privacy`. | Links cause full reload (no `Link` component). Navigation loop due to `App.tsx` issue. |
| `FeatureCards.tsx` | Landing Features. | ✅ Good | Visual only. | None. |
| `Testimonials.tsx` | Social Proof. | ✅ Good | Visual only. | None. |
| `Footer.tsx` | Site Footer. | ⚠️ Issues | Links to `/privacy`, `/terms`. | Same navigation issue as Hero. |

#### App (`src/components/App/`)
| File | Purpose | Status | Connections | Potential Problems |
| :--- | :--- | :--- | :--- | :--- |
| `LessonContainer.tsx` | Lesson Controller. | ✅ Good | Manages Phase state. | None. |
| `Onboarding.tsx` | User Setup. | ✅ Good | Calls `assetManager`. | Good offline-first pattern. |
| `LockScreen.tsx` | Premium Gate. | ✅ Good | Calls `subscriptionLock`. | None. |
| `PhaseSponge.tsx` | "Listen" Phase. | ✅ Good | Uses `soundManager`, `imageFetcher`. | Fails if sound paths are broken. |
| `PhaseEcho.tsx` | "Speak" Phase. | ❌ **Risky** | Uses `audioRecorder`, `transcriptionService`. | **Most complex point of failure.** Dependent on broken Sound and Whisper Worker. |
| `PhaseHunter.tsx` | "Find" Phase. | ✅ Good | Uses `curriculumData`. | None. |
| `PhasePerformer.tsx` | "Celebrate" Phase. | ✅ Good | Uses `canvas-confetti`. | None. |
| `PhysicsScene.tsx` | Matter.js Simulation. | ✅ Good | Used in Days 8 & 9. | None. |

### 6. Pages (`src/pages/`)

| File | Purpose | Status | Connections | Potential Problems |
| :--- | :--- | :--- | :--- | :--- |
| `AppView.tsx` | Main Dashboard. | ✅ Good | Connects Onboarding -> Dashboard -> Lesson. | **Orphaned**: Not reachable due to missing Router. |
| `Home.tsx` | Landing Wrapper. | ✅ Good | Wraps Landing components. | **Orphaned**. |
| `Privacy.tsx` | Static Page. | ✅ Good | Text only. | **Orphaned**. |
| `Terms.tsx` | Static Page. | ✅ Good | Text only. | **Orphaned**. |

### 7. Public Assets (`public/`)

| File | Purpose | Status | Connections | Potential Problems |
| :--- | :--- | :--- | :--- | :--- |
| `assets/audio/` | Audio Files. | ✅ Good | Structure matches `assetManager` expectations. | None. |
| `manifest.json` | PWA Manifest. | ✅ Good | Referenced in `index.html`. | None. |

---

## Conclusion & Recommendations

The "Playbook Lite" codebase contains high-quality, production-ready components but fails at the architectural level due to a lack of routing and incorrect asset paths. The core "Echo" feature is also at risk for non-English users.

**Immediate Next Steps:**
1.  **Implement Router:** Rewrite `App.tsx` to use `react-router-dom` and route to `Home`, `AppView`, `Privacy`, `Terms`.
2.  **Fix Sound Paths:** Update `soundManager.ts` to use `/assets/audio/...`.
3.  **Fix Whisper Worker:** Pass `language` dynamically to `whisper.worker.ts`.
4.  **Secure API Key:** Move Unsplash key to `.env`.
