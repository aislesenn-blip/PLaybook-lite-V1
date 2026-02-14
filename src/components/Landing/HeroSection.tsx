import { useState, useEffect } from 'react';

const HeroSection = () => {
  const [report, setReport] = useState<string>('Running diagnostics...');

  useEffect(() => {
    const runDiagnostics = async () => {
      let log = "=== DIAGNOSTIC REPORT ===\n";

      // 1. BROWSER COMPATIBILITY AUDIT
      log += "\n[BROWSER]\n";
      log += `- User Agent: ${navigator.userAgent}\n`;
      const audio = new Audio();
      const mpegAudio = audio.canPlayType('audio/mpeg');
      const mpegVideo = audio.canPlayType('video/mpeg');
      log += `- Audio/MPEG Support: ${mpegAudio || 'NO'}\n`;
      log += `- Video/MPEG Support: ${mpegVideo || 'NO'}\n`;

      // 2. MANIFEST & ICON AUDIT
      log += "\n[PWA TEST]\n";
      try {
        const manifestRes = await fetch('/manifest.json');
        log += `- Manifest Fetch: ${manifestRes.status}\n`;
        const contentType = manifestRes.headers.get('content-type');
        log += `- Manifest Type: ${contentType}\n`;
      } catch (e: any) {
        log += `- Manifest Fetch: ERROR ${e.message}\n`;
      }

      try {
        const iconRes = await fetch('/pwa-192x192.png');
        log += `- Icon Fetch: ${iconRes.status}\n`;
      } catch (e: any) {
        log += `- Icon Fetch: ERROR ${e.message}\n`;
      }

      const manifestLink = document.querySelector('link[rel="manifest"]');
      log += `- Manifest Link: ${manifestLink ? 'EXISTS' : 'MISSING'}\n`;

      // Service Worker
      log += `- Service Worker: ${navigator.serviceWorker?.controller ? 'Active' : 'Null'}\n`;

      // 3. AUDIO PLAYBACK "FORCE" TEST & 5. FILE STRUCTURE
      log += "\n[ASSET TEST]\n";

      const testAudio = async (url: string, label: string) => {
         log += `- ${label} URL: ${url}\n`;
         try {
            const res = await fetch(url);
            log += `- ${label} Fetch: ${res.status}\n`;

            if (!res.ok) {
                log += `- ${label} Playback: SKIPPED (Fetch Failed)\n`;
                return;
            }

            // Attempt Playback
            await new Promise((resolve) => {
                const sound = new Audio(url);
                sound.volume = 0; // Mute

                // Set a timeout to catch hanging loads
                const timeoutId = setTimeout(() => {
                     log += `- ${label} Playback: TIMEOUT (State: ${sound.readyState})\n`;
                     resolve(true);
                }, 4000);

                sound.oncanplaythrough = () => {
                    clearTimeout(timeoutId);
                    log += `- ${label} Playback: SUCCESS (Can Play)\n`;
                    resolve(true);
                };

                sound.onerror = () => {
                    clearTimeout(timeoutId);
                    const err = sound.error;
                    let errMsg = 'Unknown Error';
                    if (err) {
                        switch (err.code) {
                            case err.MEDIA_ERR_ABORTED: errMsg = 'Aborted'; break;
                            case err.MEDIA_ERR_NETWORK: errMsg = 'Network'; break;
                            case err.MEDIA_ERR_DECODE: errMsg = 'Decode'; break;
                            case err.MEDIA_ERR_SRC_NOT_SUPPORTED: errMsg = 'Src Not Supported'; break;
                            default: errMsg = `Code ${err.code}`;
                        }
                    }
                    log += `- ${label} Playback: ERROR (${errMsg})\n`;
                    resolve(false);
                };

                // Trigger load
                sound.load();

                // Attempt play to trigger NotSupportedError if load works but decoding fails immediately
                const playPromise = sound.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        // Ignore NotAllowedError (user interaction required)
                        if (error.name !== 'NotAllowedError') {
                             // log += `- ${label} Playback Attempt: ${error.name}: ${error.message}\n`;
                        }
                    });
                }
            });

         } catch (e: any) {
            log += `- ${label} Fetch: NETWORK ERROR ${e.message}\n`;
         }
      };

      await testAudio('/assets/audio/en/day1_sound.mp3.mpeg', 'Day 1 (.mpeg)');
      await testAudio('/assets/audio/en/day10_hero.mp3.mp3', 'Day 10 (.mp3.mp3)');

      setReport(log);
    };

    runDiagnostics();
  }, []);

  return (
    <div className="min-h-screen w-full bg-black text-white p-4 font-mono text-xs overflow-auto">
      <pre>{report}</pre>
      <button
        className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded font-bold"
        onClick={() => window.location.reload()}
      >
        RERUN TEST
      </button>
    </div>
  );
};

export default HeroSection;
