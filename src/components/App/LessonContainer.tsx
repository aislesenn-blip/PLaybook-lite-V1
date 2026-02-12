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

  const nextPhase = () => {
    switch (phase) {
      case 'sponge':
        setPhase('echo');
        break;
      case 'echo':
        setPhase('hunter');
        break;
      case 'hunter':
        setPhase('performer');
        break;
      case 'performer':
        onLessonComplete();
        break;
    }
  };

  const getPhaseIndex = () => {
    return ['sponge', 'echo', 'hunter', 'performer'].indexOf(phase);
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
      <div className="absolute top-0 left-0 z-50 flex w-full items-center justify-between p-4 md:p-6">
        <button
          onClick={onExit}
          className="rounded-full bg-white/50 p-2 text-slate-500 backdrop-blur-sm transition-colors hover:bg-white hover:text-slate-900"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Progress Dots */}
        <div className="flex gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-2 w-2 rounded-full transition-all duration-500 ${
                i <= getPhaseIndex() ? 'w-8 bg-brand' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Main Content Area */}
      {/* Ensure content is above physics (z-10) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 h-full w-full pt-16 pointer-events-none" // pointer-events-none to let clicks pass to physics?
          // Wait, if I set pointer-events-none, buttons inside phases won't work.
          // I need to set pointer-events-auto on interactive elements inside phases.
          // Or just let physics capture clicks if no UI element is clicked.
          // Matter.js MouseConstraint attaches to canvas.
          // If the canvas is z-0 and this div is z-10, clicks on this div will block canvas.
          // I should make this div transparent to clicks where empty.
        >
          {/* Re-enable pointer events for the actual phase content wrapper */}
          <div className="h-full w-full pointer-events-auto">
            {phase === 'sponge' && (
              <PhaseSponge day={day} lang={lang} onComplete={nextPhase} />
            )}
            {phase === 'echo' && (
              <PhaseEcho day={day} lang={lang} onComplete={nextPhase} />
            )}
            {phase === 'hunter' && (
              <PhaseHunter day={day} lang={lang} onComplete={nextPhase} />
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
