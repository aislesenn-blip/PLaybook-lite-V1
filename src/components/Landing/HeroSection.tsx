import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { saveParentData } from '../../lib/supabaseClient';
import { ArrowRightIcon, DevicePhoneMobileIcon, StarIcon, LockClosedIcon, PlusIcon, ArrowUpOnSquareIcon } from '@heroicons/react/24/solid';
import QRCode from 'react-qr-code';

const HeroSection = () => {
  const [mobile, setMobile] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showIOSInstall, setShowIOSInstall] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detect environment
    const ua = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    setIsDesktop(!isMobile);
    setIsIOS(/iPhone|iPad|iPod/i.test(ua));

    // Check if app is already running in standalone mode (installed)
    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();
    window.addEventListener('resize', checkStandalone); // Handle orientation changes/updates

    // PWA Install Prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    return () => window.removeEventListener('resize', checkStandalone);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mobile.length > 5) {
      await saveParentData(mobile);
      setSubmitted(true);
    }
  };

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        setDeferredPrompt(null);
      });
    }
  };

  const testAudio = async () => {
    const paths = [
      '/assets/audio/en/day1_sound.mp3',
      '/assets/audio/en/day1_sound.mp3.mpeg',
      '/assets/audio/en/day10_hero.mp3.mp3'
    ];
    let report = "DIAGNOSTIC REPORT:\n";
    for (const path of paths) {
      try {
        const res = await fetch(path);
        report += `${path}: ${res.status} (${res.ok ? 'OK' : 'FAIL'})\n`;
      } catch (e) {
        report += `${path}: NETWORK ERROR\n`;
      }
    }
    alert(report);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-900 text-white">
      {/* Cinematic Background */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center opacity-60 transition-transform duration-[20s] hover:scale-105"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")' }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center pt-24 pb-12 px-6 text-center">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute top-8 left-8 font-serif text-2xl font-bold tracking-wider text-white"
        >
          Playbook Lite
        </motion.div>

        <h1 className="mb-4 text-center text-xl font-bold text-red-500 bg-white/10 p-2 rounded">
          ⚠️ DEBUG MODE: VERSION 5.0 (AUDIO FIX APPLIED) ⚠️
        </h1>
        <div className="mb-4 flex flex-col items-center gap-2">
           <button
             onClick={testAudio}
             className="bg-red-600 px-4 py-2 rounded text-white font-bold hover:bg-red-700"
           >
             TEST AUDIO PATHS
           </button>
           <div className="text-xs text-slate-400 font-mono">
             Status: Standalone={String(isStandalone)}, Prompt={String(!!deferredPrompt)}
           </div>
        </div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="max-w-4xl text-5xl font-extrabold leading-tight tracking-tight md:text-7xl"
        >
          Give your child the <span className="text-amber-500">confidence</span> to speak clearly before the world asks them to.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-6 max-w-2xl text-xl leading-relaxed text-slate-300"
        >
          Playbook Lite is a daily 10-minute AI learning journey designed to build early language clarity and speaking confidence.
        </motion.p>

        {/* Input Mechanism */}
        {!submitted ? (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            onSubmit={handleSubmit}
            className="mt-12 flex w-full max-w-md flex-col gap-4 md:flex-row"
          >
            <input
              type="tel"
              placeholder="Enter Parent Mobile Number"
              className="flex-1 rounded-full border border-white/20 bg-white/10 px-6 py-4 text-white placeholder-white/50 backdrop-blur-md focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
            />
            <button
              type="submit"
              className="group flex items-center justify-center gap-2 rounded-full bg-amber-600 px-8 py-4 font-bold text-white transition-all hover:bg-amber-500 hover:shadow-[0_0_20px_rgba(217,119,6,0.5)]"
            >
              Access Playbook <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.form>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-12 flex flex-col items-center gap-6 rounded-2xl border border-emerald-500/30 bg-emerald-900/20 p-8 backdrop-blur-xl"
          >
            <div className="text-xl font-medium text-emerald-400">Welcome to Playbook.</div>

            {/* Smart Download Logic with Bulletproof Fallbacks */}
            {isStandalone ? (
              <a
                href="/app"
                className="flex items-center gap-2 rounded-full bg-emerald-600 px-8 py-3 font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500"
              >
                <DevicePhoneMobileIcon className="h-5 w-5" /> Open App
              </a>
            ) : isDesktop ? (
              <div className="flex flex-col items-center gap-2">
                <div className="bg-white p-2 rounded-lg">
                  <QRCode value={window.location.href} size={128} />
                </div>
                <span className="text-sm text-slate-300">Scan to install on your phone</span>
              </div>
            ) : isIOS ? (
              <>
                {!showIOSInstall ? (
                   <button
                    onClick={() => setShowIOSInstall(true)}
                    className="flex items-center gap-2 rounded-full bg-white text-slate-900 px-8 py-3 font-bold shadow-lg transition-all hover:bg-slate-100"
                  >
                    <ArrowUpOnSquareIcon className="h-5 w-5" /> Install on iPhone
                  </button>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-center text-sm text-slate-300 bg-white/5 p-4 rounded-xl border border-white/10">
                    <p className="flex items-center gap-2">
                      Tap the Share button <ArrowUpOnSquareIcon className="h-5 w-5 text-blue-400" />
                    </p>
                    <p className="flex items-center gap-2">
                      Scroll down and tap 'Add to Home Screen' <PlusIcon className="h-5 w-5 text-white" />
                    </p>
                  </div>
                )}
              </>
            ) : deferredPrompt ? (
               <button
                onClick={handleInstall}
                className="flex items-center gap-2 rounded-full bg-emerald-600 px-8 py-3 font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500"
              >
                <DevicePhoneMobileIcon className="h-5 w-5" /> Download App
              </button>
            ) : (
               <button
                onClick={() => alert("Tap the browser options menu (⋮), then select 'Add to Home Screen'.")}
                className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-3 font-bold text-slate-300 transition-all hover:bg-white/10 hover:text-white"
              >
                <PlusIcon className="h-5 w-5" /> How to Install
              </button>
            )}

            {!isStandalone && (
              <a href="/app" className="text-sm text-white/50 underline hover:text-white">Continue in Browser</a>
            )}
          </motion.div>
        )}
      </div>

      {/* The Ecosystem */}
      <div className="relative w-full overflow-hidden bg-slate-900/80 py-16 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="mb-8 text-2xl font-bold tracking-tight text-white">The Playbook Family</h2>
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {/* Playbook Lite */}
            <div className="min-w-[280px] shrink-0 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-slate-800 to-slate-900 p-6 shadow-xl shadow-amber-900/20">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Playbook Lite</h3>
                <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-bold text-emerald-400">ACTIVE</span>
              </div>
              <p className="mt-2 text-sm text-slate-400">The Voice Awakening.</p>
              <div className="mt-4 flex gap-1 text-amber-500">
                <StarIcon className="h-4 w-4" />
                <StarIcon className="h-4 w-4" />
                <StarIcon className="h-4 w-4" />
              </div>
            </div>

            {/* Playbook Plus */}
            <div className="min-w-[280px] shrink-0 rounded-2xl border border-white/5 bg-white/5 p-6 opacity-60 backdrop-blur-sm grayscale transition-all hover:opacity-80 hover:grayscale-0">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Playbook Plus</h3>
                <LockClosedIcon className="h-4 w-4 text-slate-500" />
              </div>
              <div className="mt-4 rounded-full bg-white/10 px-3 py-1 text-xs text-white/50 w-fit">Unreleased</div>
            </div>

            {/* Playbook Pro */}
            <div className="min-w-[280px] shrink-0 rounded-2xl border border-white/5 bg-white/5 p-6 opacity-40 backdrop-blur-sm grayscale">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Playbook Pro</h3>
                <LockClosedIcon className="h-4 w-4 text-slate-500" />
              </div>
              <div className="mt-4 rounded-full bg-white/10 px-3 py-1 text-xs text-white/50 w-fit">Unreleased</div>
            </div>

             {/* Playbook X */}
             <div className="min-w-[280px] shrink-0 rounded-2xl border border-white/5 bg-white/5 p-6 opacity-40 backdrop-blur-sm grayscale">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Playbook X</h3>
                <LockClosedIcon className="h-4 w-4 text-slate-500" />
              </div>
              <div className="mt-4 rounded-full bg-white/10 px-3 py-1 text-xs text-white/50 w-fit">Enterprise Only</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default HeroSection;
