import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PhaseSponge from './PhaseSponge';
import PhaseEcho from './PhaseEcho';
import PhaseHunter from './PhaseHunter';
import PhasePerformer from './PhasePerformer';
import PhysicsScene from './PhysicsScene'; // Import PhysicsScene

interface LessonContainerProps {
  day: any;
  lang: string;
  onLessonComplete: () => void;
  onExit: () => void;
}

type Phase = 'sponge' | 'echo' | 'hunter' | 'performer';

const LessonContainer: React.FC<LessonContainerProps> = ({ day, lang, onLessonComplete, onExit }) => {
  const [phase, setPhase] = useState<Phase>('sponge');
  const [showPhysics, setShowPhysics] = useState(false);

  useEffect(() => {
    // Enable physics for Math days (8 & 9)
    if (day.id === 8 || day.id === 9) {
      setShowPhysics(true);
    } else {
      setShowPhysics(false);
    }
  }, [day]);

  const handleNextPhase = () => {
    setPhase((currentPhase) => {
      switch (currentPhase) {
        case 'sponge':
          return 'echo';
        case 'echo':
          return 'hunter';
        case 'hunter':
          return 'performer';
        case 'performer':
          return currentPhase; // Should be handled by onComplete
        default:
          return 'sponge';
      }
    });
  };

  const getPhaseIndex = (p: Phase) => {
    return ['sponge', 'echo', 'hunter', 'performer'].indexOf(p);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-canvas">
      {/* Physics Layer (Background) */}
      {showPhysics && (
        <div className="absolute inset-0 z-0">
          <PhysicsScene dayId={day.id} />
        </div>
      )}

      {/* Top Bar */}
      <div className="absolute top-0 left-0 z-50 flex w-full items-center justify-between p-4 md:p-6 pointer-events-none">
        <motion.button
          onClick={onExit}
          whileTap={{ scale: 0.9 }}
          className="pointer-events-auto rounded-full bg-white/50 p-3 text-slate-500 backdrop-blur-sm transition-colors hover:bg-white hover:text-slate-900 active:bg-slate-100"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </motion.button>

        {/* Progress Dots */}
        <div className="flex gap-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
          {['sponge', 'echo', 'hunter', 'performer'].map((p, i) => (
            <div
              key={p}
              className={`h-2.5 rounded-full transition-all duration-500 ${
                i <= getPhaseIndex(phase)
                  ? 'w-8 bg-brand shadow-[0_0_10px_rgba(217,119,6,0.5)]'
                  : 'w-2.5 bg-slate-200/50'
              }`}
            />
          ))}
        </div>

        <div className="w-12" /> {/* Spacer for symmetry */}
      </div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 h-full w-full pt-20" // Add padding top to clear header
        >
          {/* Re-enable pointer events for the actual phase content wrapper */}
          <div className="h-full w-full pointer-events-auto">
            {phase === 'sponge' && (
              <PhaseSponge day={day} lang={lang} onComplete={handleNextPhase} />
            )}
            {phase === 'echo' && (
              <PhaseEcho day={day} lang={lang} onComplete={handleNextPhase} />
            )}
            {phase === 'hunter' && (
              <PhaseHunter day={day} lang={lang} onComplete={handleNextPhase} />
            )}
            {phase === 'performer' && (
              <PhasePerformer day={day} onComplete={onLessonComplete} />
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default LessonContainer;
