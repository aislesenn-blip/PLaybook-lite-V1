import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { playSound } from '../../lib/soundManager';
import { fetchImage } from '../../lib/imageFetcher';

interface PhaseSpongeProps {
  day: any;
  lang: string;
  onComplete: () => void;
}

const PhaseSponge: React.FC<PhaseSpongeProps> = ({ day, lang, onComplete }) => {
  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    // Play sound
    playSound(lang, day.id, 'sponge');

    // Fetch image
    const getImg = async () => {
      const url = await fetchImage(`${day.word} child learning`);
      setImageUrl(url);
    };
    getImg();

    // Auto-advance
    const timer = setTimeout(() => {
      onComplete();
    }, 5000);

    return () => clearTimeout(timer);
  }, [day, lang, onComplete]);

  return (
    <div className="flex h-full flex-col items-center justify-center text-center p-6">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="mb-8 overflow-hidden rounded-3xl shadow-2xl ring-8 ring-slate-50"
      >
        {imageUrl ? (
           <img src={imageUrl} alt={day.word} className="h-64 w-64 object-cover" />
        ) : (
          <div className="flex h-64 w-64 items-center justify-center bg-blue-100">
             <span className="text-9xl font-black text-blue-600">{day.sound}</span>
          </div>
        )}
      </motion.div>

      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-5xl font-bold text-slate-800"
      >
        {day.word}
      </motion.h2>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-4 text-2xl text-slate-500"
      >
        Listen carefully...
      </motion.p>
    </div>
  );
};

export default PhaseSponge;
