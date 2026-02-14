import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkSubscriptionStatus } from '../lib/subscriptionLock';
import { curriculum } from '../lib/curriculumData';
import Onboarding from '../components/App/Onboarding';
import LessonContainer from '../components/App/LessonContainer';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, PlayIcon, LockClosedIcon } from '@heroicons/react/24/solid';

const AppView = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [childName, setChildName] = useState<string | null>(null);
  const [lang, setLang] = useState<string>('english');
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [currentDay, setCurrentDay] = useState<any | null>(null);

  useEffect(() => {
    // 1. Check Lock Status
    if (checkSubscriptionStatus()) {
      navigate('/locked');
      return;
    }

    // 2. Load User Data
    const storedName = localStorage.getItem('childName');
    const storedLang = localStorage.getItem('childLang') || 'english';
    const storedProgress = JSON.parse(localStorage.getItem('completedDays') || '[]');

    if (storedName) {
      setChildName(storedName);
      setLang(storedLang);
      setCompletedDays(storedProgress);
    }

    setLoading(false);
  }, [navigate]);

  const handleOnboardingComplete = (name: string, language: string) => {
    // Save to localStorage immediately
    localStorage.setItem('childName', name);
    localStorage.setItem('childLang', language);
    setChildName(name);
    setLang(language);
  };

  const handleDaySelect = (day: any) => {
    setCurrentDay(day);
  };

  const handleLessonComplete = () => {
    if (currentDay) {
      const newCompleted = [...new Set([...completedDays, currentDay.id])];
      setCompletedDays(newCompleted);
      localStorage.setItem('completedDays', JSON.stringify(newCompleted));
      setCurrentDay(null); // Go back to dashboard
    }
  };

  // Helper for Greeting
  const getGreeting = () => {
    switch (lang) {
      case 'swahili': return 'Hujambo';
      case 'french': return 'Bonjour';
      default: return 'Hello';
    }
  };

  if (loading) return null;

  if (!childName) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // Dashboard Data
  const currentCurriculum = curriculum[lang as keyof typeof curriculum] || curriculum.english;

  return (
    <AnimatePresence mode="wait">
      {currentDay ? (
        <motion.div
          key="lesson-container"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 bg-white"
        >
          <LessonContainer
            day={currentDay}
            lang={lang}
            onLessonComplete={handleLessonComplete}
            onExit={() => setCurrentDay(null)}
          />
        </motion.div>
      ) : (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="min-h-screen bg-canvas px-6 py-12"
        >
          <header className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-main">
                {getGreeting()}, <span className="text-brand">{childName}</span>
              </h1>
              <p className="mt-1 text-slate-500">{currentCurriculum.level_name}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-xl font-bold text-slate-600 shadow-sm">
              {childName ? childName[0].toUpperCase() : 'C'}
            </div>
          </header>

          <div className="grid gap-4 pb-20 md:grid-cols-2 lg:grid-cols-3">
            {currentCurriculum.days.map((day: any, index: number) => {
              const isCompleted = completedDays.includes(day.id);
              // Unlock logic: Day 1 always open. Subsequent days open if previous is completed.
              const isLocked = index === 0 ? false : !completedDays.includes(currentCurriculum.days[index - 1].id);

              return (
                <motion.button
                  key={day.id}
                  disabled={isLocked}
                  onClick={() => !isLocked && handleDaySelect(day)}
                  whileHover={!isLocked ? { scale: 1.02 } : {}}
                  whileTap={!isLocked ? { scale: 0.95 } : {}}
                  className={`group relative flex w-full items-center justify-between overflow-hidden rounded-2xl border p-6 text-left transition-all duration-200 ease-in-out active:scale-95 ${
                    isLocked
                      ? 'cursor-not-allowed border-slate-100 bg-slate-50 opacity-60'
                      : isCompleted
                        ? 'border-emerald-200 bg-emerald-50 hover:border-emerald-300'
                        : 'border-white bg-white shadow-lg ring-1 ring-slate-900/5 hover:shadow-xl hover:ring-slate-900/10'
                  }`}
                >
                  <div className="z-10 flex flex-col gap-1">
                    <span className={`text-xs font-bold uppercase tracking-wider ${
                      isCompleted ? 'text-emerald-600' : 'text-slate-400'
                    }`}>
                      Day {day.id}
                    </span>
                    <h3 className={`text-lg font-bold ${isLocked ? 'text-slate-400' : 'text-slate-800'}`}>
                      {day.theme}
                    </h3>
                    <p className="text-sm text-slate-500">{day.word}</p>
                  </div>

                  <div className="z-10">
                    {isCompleted ? (
                      <CheckCircleIcon className="h-8 w-8 text-emerald-500" />
                    ) : isLocked ? (
                      <LockClosedIcon className="h-6 w-6 text-slate-300" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white shadow-lg shadow-brand/30 transition-transform group-hover:scale-110">
                        <PlayIcon className="ml-0.5 h-5 w-5" />
                      </div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AppView;
