import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

interface PhasePerformerProps {
  day: any;
  onComplete: () => void;
}

const PhasePerformer: React.FC<PhasePerformerProps> = ({ day, onComplete }) => {
  useEffect(() => {
    // Fire confetti immediately
    const duration = 5 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      // launch a few confetti from the left edge
      confetti({
        particleCount: 7,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      // and launch a few from the right edge
      confetti({
        particleCount: 7,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });

      // keep going until we are out of time
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      } else {
        // Complete after celebration
        setTimeout(onComplete, 2000);
      }
    }());
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex h-screen w-full flex-col items-center justify-center bg-brand text-center text-white"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-amber-600 mix-blend-overlay opacity-50" />

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1.2, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, delay: 0.5 }}
        className="z-10"
      >
        <h1 className="mb-8 text-6xl font-black uppercase tracking-wider drop-shadow-lg md:text-8xl">
          {day.hero_line}
        </h1>
      </motion.div>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1 }}
        className="z-10 mt-12 rounded-full bg-white/20 px-8 py-4 backdrop-blur-md"
      >
        <p className="text-2xl font-bold uppercase tracking-widest text-white drop-shadow-md">
          Stand up and say: {day.hero_line}!
        </p>
      </motion.div>
    </motion.div>
  );
};

export default PhasePerformer;
