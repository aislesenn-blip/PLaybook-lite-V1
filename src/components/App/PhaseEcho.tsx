import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { MicrophoneIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { transcriptionService } from '../../lib/transcriptionService';
import { AudioRecorder } from '../../lib/audioRecorder';
import { calculateMatchPercentage } from '../../lib/utils';
import { playSound } from '../../lib/soundManager';

interface PhaseEchoProps {
  day: any;
  lang: string;
  onComplete: () => void;
}

const PhaseEcho: React.FC<PhaseEchoProps> = ({ day, lang, onComplete }) => {
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'success' | 'retry'>('idle');
  const [transcribedText, setTranscribedText] = useState('');
  const [matchScore, setMatchScore] = useState(0);
  const recorderRef = useRef<AudioRecorder | null>(null);

  useEffect(() => {
    // Load model on mount if not already
    transcriptionService.loadModel((progress) => {
      console.log('Model loading progress:', progress);
    });

    // Start listening process
    startListening();

    // Expose debug helper for automated testing (DEV only)
    if (import.meta.env.DEV) {
      (window as any).debugSkipEcho = () => {
        console.log('Skipping Echo Phase (Debug)');
        setStatus('success');
        setTimeout(onComplete, 500);
      };
    }

    return () => {
      stopListening();
      if (import.meta.env.DEV) {
        delete (window as any).debugSkipEcho;
      }
    };
  }, [day]);

  const startListening = async () => {
    try {
      setStatus('listening');
      setTranscribedText('');
      setMatchScore(0);

      recorderRef.current = new AudioRecorder();
      await recorderRef.current.start();

      // Listen for 4 seconds then stop
      setTimeout(async () => {
        if (recorderRef.current) {
          const audioData = await recorderRef.current.stop();
          processAudio(audioData);
        }
      }, 4000);

    } catch (err) {
      console.error('Microphone error:', err);
      setStatus('retry');
    }
  };

  const stopListening = async () => {
    if (recorderRef.current) {
      await recorderRef.current.stop();
      recorderRef.current = null;
    }
  };

  const processAudio = async (audioData: Float32Array) => {
    setStatus('processing');

    transcriptionService.transcribe(
      audioData,
      (text) => {
        console.log('Transcribed:', text);
        setTranscribedText(text);

        const score = calculateMatchPercentage(day.word, text);
        setMatchScore(score);

        if (score > 70) {
          setStatus('success');
          // playSound supports 'success' now
          playSound(lang, day.id, 'success');
          setTimeout(onComplete, 2000);
        } else {
          setStatus('retry');
        }
      },
      (err) => {
        console.error('Transcription error:', err);
        setStatus('retry');
      }
    );
  };

  const handleRetry = () => {
    startListening();
  };

  return (
    <div className="flex h-full flex-col items-center justify-center text-center p-6">
      <div className="mb-8 relative flex items-center justify-center">
        {/* Pulsing Effect */}
        {status === 'listening' && (
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute h-64 w-64 rounded-full bg-amber-500/20"
          />
        )}

        <motion.div
          animate={{ scale: status === 'listening' ? 1.1 : 1 }}
          className={`flex h-48 w-48 items-center justify-center rounded-full shadow-2xl transition-colors ${
            status === 'listening' ? 'bg-amber-100 text-amber-600 ring-4 ring-amber-200' :
            status === 'processing' ? 'bg-blue-100 text-blue-600 ring-4 ring-blue-200' :
            status === 'success' ? 'bg-emerald-100 text-emerald-600 ring-4 ring-emerald-200' :
            'bg-slate-100 text-slate-400'
          }`}
        >
          {status === 'success' ? (
            <CheckCircleIcon className="h-24 w-24" />
          ) : status === 'retry' ? (
            <XCircleIcon className="h-24 w-24 text-red-500" />
          ) : (
            <MicrophoneIcon className="h-24 w-24" />
          )}
        </motion.div>
      </div>

      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-3xl font-bold text-slate-800"
      >
        {status === 'listening' ? "I'm listening..." :
         status === 'processing' ? "Thinking..." :
         status === 'success' ? "Great Job!" :
         status === 'retry' ? "Try again!" :
         "Ready?"}
      </motion.h2>

      <div className="mt-4 flex flex-col items-center gap-2 h-16">
        {transcribedText && <span className="text-lg italic text-slate-600">"{transcribedText}"</span>}
        {(status === 'success' || status === 'retry') && matchScore > 0 && (
          <span className={`text-sm font-bold ${matchScore > 70 ? 'text-emerald-600' : 'text-red-500'}`}>
            Match: {Math.round(matchScore)}%
          </span>
        )}
      </div>

      {status === 'retry' && (
        <button
          onClick={handleRetry}
          className="mt-8 rounded-full bg-amber-600 px-8 py-3 font-bold text-white shadow-lg hover:bg-amber-500"
        >
          Tap to Retry
        </button>
      )}
    </div>
  );
};

export default PhaseEcho;
