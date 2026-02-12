# Playbook Lite: System Architecture Report

**Date:** {new Date().toLocaleDateString()}
**Version:** 1.0 (Production Candidate)
**Architect:** Jules

## 1. The User Journey & Data Flow

### Landing Page (Parent Acquisition)
*   **Capture:** The parent enters their mobile number in `HeroSection.tsx`.
*   **Action:** `handleSubmit` calls `saveParentData(mobile)` from `src/lib/supabaseClient.ts`.
*   **Data Flow:** The function attempts to insert `{ mobile_number: mobile }` into the Supabase `parents` table.
*   **Fallback:** If the Supabase connection fails (or is mocked), it logs the error and saves to `localStorage` as a fallback to allow the user to proceed.

### Onboarding (Child Personalization)
*   **Component:** `src/components/App/Onboarding.tsx`
*   **Storage:** When the parent enters the child's name and selects a language, this data is stored in **LocalStorage** keys: `childName` and `childLang`.
*   **Reasoning:** Storing this locally ensures immediate, offline-first access to the child's profile without needing a round-trip database fetch on every app load.

### Smart Install (PWA Logic)
*   **Detection:** `HeroSection.tsx` uses `navigator.userAgent` to detect the device type.
*   **Android:** Shows "Download App". On click, it triggers the browser's native `beforeinstallprompt` event (captured in a `useEffect` listener).
*   **iOS:** Shows "Install on iPhone". On click, it reveals a tooltip instructing the user to tap "Share" (Box Arrow Up) -> "Add to Home Screen" (Plus), as iOS Safari does not support programmatic install prompts.
*   **Desktop:** Uses `react-qr-code` to generate a QR code pointing to `window.location.href`, allowing easy transfer to mobile.

---

## 2. The "Velvet Rope" (Lock Mechanism)

### Logic Overview (`src/lib/subscriptionLock.ts`)
The monetization logic enforces a strict 48-hour free trial.

### Trial Check
1.  **Initialization:** On app load, `checkSubscriptionStatus()` is called.
2.  **Timestamp:** It checks for `firstOpenDate` in `localStorage`. If missing, it sets it to `Date.now()`.
3.  **Calculation:** `const hoursSinceFirstOpen = (Date.now() - firstOpenDate) / (1000 * 60 * 60);`
4.  **Verdict:** If `hoursSinceFirstOpen > 48` AND `isPremium` is false, the user is redirected to `/locked`.

### Unlocking (`LockScreen.tsx`)
1.  **Input:** The user enters a license key.
2.  **Verification:** The app compares the input against a hardcoded "VIP" key (`PLAYBOOK-LITE-VIP`) or queries Supabase `license_keys` table (simulated in current build).
3.  **Success:** If valid, `localStorage.setItem('isPremium', 'true')` is set, permanently unlocking the app.
4.  **Offline Behavior:** The lock logic relies primarily on `localStorage` timestamps. If offline, the lock **remains active** if the time has passed. It does not default to open, preserving the premium value.

---

## 3. The "Brain" (Offline AI Worker)

### Architecture
The speech recognition engine runs in a dedicated **Web Worker** (`src/workers/whisper.worker.ts`) to prevent the Main Thread (UI) from freezing during heavy processing.

### Message Passing
1.  **Load:** `PhaseEcho.tsx` sends `{ type: 'load' }` to the worker on mount. The worker uses `@xenova/transformers` to load the quantized Whisper model from the cache.
2.  **Transcribe:** When recording stops, `PhaseEcho` sends `{ type: 'generate', audio: audioData }`.
3.  **Response:** The worker processes the Float32Array audio data and posts back `{ status: 'complete', output: [text] }`.

### Confidence Score
*   **Algorithm:** Levenshtein Distance (String Matching).
*   **Logic:** The transcribed text is compared to the target `day.word`.
*   **Formula:** `matchPercentage = (1 - (distance / maxLength)) * 100`
*   **Threshold:** A score > 70% is considered a "Pass".
*   **Feedback:**
    *   **Pass:** Triggers confetti and success sound.
    *   **Fail (Low Score):** Shows "Almost there! Try again!" (Muscle Icon).
    *   **Fail (Noise):** Shows "I'm listening..." (Ear Icon) if the input was silence or noise.

---

## 4. The Physics Engine (Math Lessons)

### Integration
*   **Library:** `matter-js`
*   **Component:** `src/components/App/PhysicsScene.tsx` (Used in Days 8 & 9).
*   **Rendering:** A `canvas` element is ref-linked to the Matter.js `Render.create()` method.

### Interaction
*   **Setup:** The engine creates a world with static "ground" and "walls".
*   **Objects:** Falling objects (Circles/Rectangles representing numbers) are added as `Bodies`.
*   **Touch/Mouse:** A `MouseConstraint` is added to the world, allowing users to drag and throw the objects.
*   **Reactivity:** The objects respond to gravity and collisions physically. Currently, sound feedback on collision is **not** implemented in the base logic (simulated visual only), but can be added via Matter.js collision events.

---

## Summary
The system is designed for **Offline-First Reliability**. Critical user progress and lock states are stored locally, while the heavy lifting of AI is offloaded to a worker, ensuring a smooth experience even on lower-end devices.
