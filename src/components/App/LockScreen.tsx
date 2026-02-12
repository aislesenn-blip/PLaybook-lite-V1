import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LockClosedIcon } from '@heroicons/react/24/solid';
import { unlockPremium } from '../../lib/subscriptionLock';

interface LockScreenProps {
  childName?: string;
  onUnlock: () => void;
}

const LockScreen: React.FC<LockScreenProps> = ({ childName = "Jasmine", onUnlock }) => {
  const [key, setKey] = useState('');
  const [error, setError] = useState(false);

  const handleUnlock = () => {
    if (unlockPremium(key)) {
      onUnlock();
    } else {
      setError(true);
    }
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-velvet-rope px-6 text-white">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex max-w-lg flex-col items-center gap-8 rounded-3xl bg-white/5 p-10 text-center shadow-2xl backdrop-blur-xl ring-1 ring-white/10"
      >
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand/20 ring-4 ring-brand/40">
          <LockClosedIcon className="h-12 w-12 text-brand" />
        </div>

        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Unlock {childName}'s Future</h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-300">
            The journey is paused. Contact to Unlock.
          </p>
        </div>

        <div className="w-full space-y-4">
          <a
            href="https://wa.me/255745780988?text=Hi, I want to unlock Playbook for my child."
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center rounded-xl bg-emerald-600 py-4 text-lg font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500"
          >
            Contact via WhatsApp
          </a>

          <div className="relative">
            <input
              type="text"
              placeholder="Enter License Key"
              value={key}
              onChange={(e) => { setKey(e.target.value); setError(false); }}
              className={`w-full rounded-xl border bg-slate-900/50 px-4 py-4 text-center text-white placeholder-slate-500 outline-none focus:ring-2 ${error ? 'border-red-500 ring-red-500/20' : 'border-white/10 focus:border-brand focus:ring-brand/20'}`}
            />
            {error && <p className="mt-2 text-sm text-red-400">Invalid License Key</p>}
          </div>

          <button
            onClick={handleUnlock}
            className="w-full rounded-xl bg-white/10 py-3 font-semibold text-white transition-all hover:bg-white/20"
          >
            Unlock
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default LockScreen;
