import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowPathIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

interface LanguageSetupModalProps {
  isVisible: boolean;
  lang: string;
  progress: number;
  status: 'checking' | 'downloading' | 'complete' | 'error';
  onRetry: () => void;
  onClose: () => void;
}

const LanguageSetupModal: React.FC<LanguageSetupModalProps> = ({ isVisible, lang, progress, status, onRetry, onClose }) => {
  // Determine title based on language
  const getTitle = () => {
    switch (lang) {
      case 'swahili': return 'Inaandaa Mwalimu wa Kiswahili...';
      case 'french': return 'Initialisation du professeur français...';
      default: return 'Initializing Playbook AI...';
    }
  };

  const getStatusText = () => {
    if (status === 'checking') return 'Scanning offline cache...';
    if (status === 'downloading') return `Downloading Assets: ${progress}%`;
    if (status === 'complete') return 'Ready to Play!';
    if (status === 'error') return 'Connection Failed. Please Retry.';
    return '';
  };

  // Close modal automatically on complete after a short delay
  useEffect(() => {
    if (status === 'complete') {
      const timer = setTimeout(() => {
        onClose();
      }, 1500); // 1.5s delay to show 100% success state
      return () => clearTimeout(timer);
    }
  }, [status, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl ring-1 ring-slate-200"
          >
            <div className="flex flex-col items-center gap-6 text-center">

              {/* Progress Visual */}
              <div className="relative flex h-24 w-24 items-center justify-center">
                {/* Circular Track */}
                <svg className="absolute inset-0 h-full w-full rotate-[-90deg]">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="40%"
                    fill="transparent"
                    stroke="#E2E8F0"
                    strokeWidth="8"
                  />
                  {/* Progress Arc */}
                  <motion.circle
                    cx="50%"
                    cy="50%"
                    r="40%"
                    fill="transparent"
                    stroke={status === 'error' ? '#EF4444' : '#10B981'}
                    strokeWidth="8"
                    strokeDasharray="251.2" // 2 * PI * r (approx)
                    strokeDashoffset={251.2 - (251.2 * progress) / 100}
                    initial={{ strokeDashoffset: 251.2 }}
                    animate={{ strokeDashoffset: 251.2 - (251.2 * progress) / 100 }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    strokeLinecap="round"
                  />
                </svg>

                {/* Center Icon/Text */}
                {status === 'complete' ? (
                  <CheckCircleIcon className="h-10 w-10 text-emerald-500 animate-bounce" />
                ) : status === 'error' ? (
                  <ArrowPathIcon className="h-10 w-10 text-red-500" />
                ) : (
                  <span className="text-xl font-bold text-slate-700">{progress}%</span>
                )}
              </div>

              {/* Text Content */}
              <div>
                <h3 className="text-lg font-bold text-slate-800">{getTitle()}</h3>
                <p className={`mt-2 text-sm font-medium ${status === 'error' ? 'text-red-500' : 'text-slate-500'}`}>
                  {getStatusText()}
                </p>
              </div>

              {/* Retry Button (Only on Error) */}
              {status === 'error' && (
                <button
                  onClick={onRetry}
                  className="mt-2 flex items-center gap-2 rounded-full bg-slate-900 px-6 py-2 text-sm font-bold text-white shadow-lg hover:bg-slate-700 active:scale-95 transition-transform"
                >
                  <ArrowPathIcon className="h-4 w-4" /> Retry Download
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LanguageSetupModal;
