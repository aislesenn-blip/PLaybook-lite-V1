import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

// --- Configuration ---
const STROKE_WIDTH = 16; // Thicker for easier tracing
const PATH_COLOR = '#0ea5e9'; // sky-500
const PATH_BG_COLOR = '#e2e8f0'; // slate-200
const SUCCESS_THRESHOLD = 0.85; // Lower threshold (85%)

// Map Day 1-15 to Letters A-O
// Single-stroke approximations where possible.
const LETTER_PATHS: Record<number, string> = {
  1: "M 50 15 L 15 85 M 50 15 L 85 85 M 25 55 L 75 55", // A
  2: "M 25 15 L 25 85 M 25 15 C 60 15 60 50 25 50 C 60 50 60 85 25 85", // B
  3: "M 75 20 C 25 20 25 80 75 80", // C
  4: "M 25 15 L 25 85 M 25 15 C 75 15 75 85 25 85", // D
  5: "M 75 15 L 25 15 L 25 85 L 75 85 M 25 50 L 65 50", // E
  6: "M 75 15 L 25 15 L 25 85 M 25 50 L 65 50", // F
  7: "M 75 20 C 25 20 25 80 50 80 L 75 80 L 75 50", // G
  8: "M 25 15 L 25 85 M 75 15 L 75 85 M 25 50 L 75 50", // H
  9: "M 25 15 L 75 15 M 50 15 L 50 85 M 25 85 L 75 85", // I
  10: "M 60 15 L 60 65 C 60 85 30 85 30 65", // J
  11: "M 25 15 L 25 85 M 75 15 L 25 50 L 75 85", // K
  12: "M 25 15 L 25 85 L 75 85", // L
  13: "M 15 85 L 15 15 L 50 50 L 85 15 L 85 85", // M
  14: "M 25 85 L 25 15 L 75 85 L 75 15", // N
  15: "M 50 15 A 35 35 0 1 0 50 85 A 35 35 0 1 0 50 15", // O
};

// Generic Shape for undefined days
const GENERIC_SHAPE = "M 50 50 m -30 0 a 30 30 0 1 0 60 0 a 30 30 0 1 0 -60 0";

interface TracingWarmupProps {
  dayId: number;
  onComplete: () => void;
}

const TracingWarmup: React.FC<TracingWarmupProps> = ({ dayId, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);
  const [pathData, setPathData] = useState(GENERIC_SHAPE);
  const [dotPos, setDotPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Set path data based on day
    const d = LETTER_PATHS[dayId] || GENERIC_SHAPE;
    setPathData(d);
    setProgress(0);
    setIsComplete(false);
  }, [dayId]);

  useEffect(() => {
    if (pathRef.current) {
      const len = pathRef.current.getTotalLength();
      setPathLength(len);
      // Initialize dot position
      const point = pathRef.current.getPointAtLength(0);
      setDotPos({ x: point.x, y: point.y });
    }
  }, [pathData]);

  // Update dot position whenever progress changes
  useEffect(() => {
    if (pathRef.current && pathLength > 0) {
      const point = pathRef.current.getPointAtLength(progress * pathLength);
      setDotPos({ x: point.x, y: point.y });
    }
  }, [progress, pathLength]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isComplete || !pathRef.current) return;

    // Use getBoundingClientRect for accurate relative coordinates
    // We assume the SVG fills the 80x80 container which is centrally aligned
    const svgElement = pathRef.current.closest('svg');
    if (!svgElement) return;

    const rect = svgElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Normalize coordinates to viewBox 0-100
    // If viewBox is 0 0 100 100
    const svgX = (x / rect.width) * 100;
    const svgY = (y / rect.height) * 100;

    // Logic: Find closest point on path ahead of current progress
    const currentLen = progress * pathLength;
    const searchRadius = 35; // Increased tolerance (35 units)
    const stepSize = 5; // Faster tracing allowed

    // Current point on path
    const pointAtCurrent = pathRef.current.getPointAtLength(currentLen);
    const distToCurrent = Math.hypot(svgX - pointAtCurrent.x, svgY - pointAtCurrent.y);

    // If we are close to the current "head", allow advancing
    if (distToCurrent < searchRadius) {
       // Check a bit ahead to see if we are moving in the right direction
       const nextLen = Math.min(currentLen + stepSize, pathLength);
       const pointAtNext = pathRef.current.getPointAtLength(nextLen);
       const distToNext = Math.hypot(svgX - pointAtNext.x, svgY - pointAtNext.y);

       // If moving towards next point is closer than staying at current (or just reasonably close)
       // Actually, just checking if we are close to "next" is enough if "current" is also close.
       if (distToNext < searchRadius) {
           const newProgress = nextLen / pathLength;
           setProgress(newProgress);
           if (newProgress >= SUCCESS_THRESHOLD) handleSuccess();
       }
    }
  };

  const handleSuccess = () => {
    if (isComplete) return;
    setIsComplete(true);
    setProgress(1);

    // Play Sound
    try {
        const audio = new Audio('/assets/audio/system/success_medium.mp3');
        audio.play().catch(err => console.warn("Audio play failed", err));
    } catch (e) {
        console.warn("Audio init failed", e);
    }

    // Confetti
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#0ea5e9', '#facc15', '#ffffff']
    });

    // Delay transition
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-md touch-none"
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerMove}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <h2 className="text-4xl font-black text-slate-800 tracking-tight">
          Let's Warm Up!
        </h2>
        <p className="text-slate-500 mt-2 font-medium">Trace the shape to begin.</p>
      </motion.div>

      <div className="relative h-72 w-72 touch-none select-none">
        <svg
          viewBox="0 0 100 100"
          className="h-full w-full drop-shadow-2xl"
          style={{ touchAction: 'none' }}
        >
          {/* Background Path (Track) */}
          <path
            d={pathData}
            fill="none"
            stroke={PATH_BG_COLOR}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Foreground Path (Liquid) */}
          <motion.path
            ref={pathRef}
            d={pathData}
            fill="none"
            stroke={PATH_COLOR}
            strokeWidth={STROKE_WIDTH}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={pathLength}
            strokeDashoffset={pathLength * (1 - progress)}
            style={{
                filter: 'drop-shadow(0 0 10px rgba(14, 165, 233, 0.6))',
            }}
          />

          {/* Guide Dot / "Pen Tip" */}
          {!isComplete && (
            <motion.circle
              cx={dotPos.x}
              cy={dotPos.y}
              r={STROKE_WIDTH * 0.8}
              fill="#facc15" // Yellow
              className="pointer-events-none shadow-lg"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          )}
        </svg>

        {/* Hand Hint Animation (Only initially) */}
        {progress === 0 && !isComplete && (
           <motion.div
             className="absolute pointer-events-none text-5xl"
             style={{
                 top: `${(dotPos.y / 100) * 100}%`,
                 left: `${(dotPos.x / 100) * 100}%`,
                 marginLeft: '10px',
                 marginTop: '10px'
             }}
             initial={{ opacity: 0, scale: 0.5 }}
             animate={{ opacity: 1, scale: 1, x: [0, 10, 0], y: [0, 10, 0] }}
             transition={{ duration: 2, repeat: Infinity }}
           >
             👆
           </motion.div>
        )}
      </div>
    </div>
  );
};

export default TracingWarmup;
