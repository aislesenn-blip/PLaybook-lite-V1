import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkSubscriptionStatus } from '../lib/subscriptionLock';
import { curriculum } from '../lib/curriculumData';
import Onboarding from '../components/App/Onboarding';
import LessonContainer from '../components/App/LessonContainer';
import { motion } from 'framer-motion';
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

  if (loading) return null;

  if (!childName) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  if (currentDay) {
    return (
      <LessonContainer
        day={currentDay}
        lang={lang}
        onLessonComplete={handleLessonComplete}
        onExit={() => setCurrentDay(null)}
      />
    );
  }

  // Dashboard
  const currentCurriculum = curriculum[lang as keyof typeof curriculum] || curriculum.english;

  return (
    <div className="min-h-screen bg-canvas px-6 py-12">
      <header className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-main">
            Good Morning, <span className="text-brand">{childName || 'Champion'}</span>
          </h1>
          <p className="text-slate-500">{currentCurriculum.level_name}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-xl font-bold text-slate-600">
          {childName ? childName[0] : 'C'}
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {currentCurriculum.days.map((day: any, index: number) => {
          const isCompleted = completedDays.includes(day.id);
          // Unlock previous day or Day 1
          const isLocked = index === 0 ? false : !completedDays.includes(currentCurriculum.days[index - 1].id);

          return (
            <motion.button
              key={day.id}
              disabled={isLocked}
              onClick={() => !isLocked && handleDaySelect(day)}
              whileHover={!isLocked ? { scale: 1.02 } : {}}
              whileTap={!isLocked ? { scale: 0.98 } : {}}
              className={`relative flex w-full items-center justify-between overflow-hidden rounded-2xl border p-6 text-left transition-all ${
                isLocked
                  ? 'cursor-not-allowed border-slate-100 bg-slate-50 opacity-60'
                  : isCompleted
                    ? 'border-emerald-200 bg-emerald-50 hover:border-emerald-300'
                    : 'border-white bg-white shadow-lg hover:shadow-xl ring-1 ring-slate-900/5'
              }`}
            >
              <div className="z-10">
                <span className={`text-xs font-bold uppercase tracking-wider ${
                  isCompleted ? 'text-emerald-600' : 'text-slate-400'
                }`}>
                  Day {day.id}
                </span>
                <h3 className="text-lg font-bold text-slate-800">{day.theme}</h3>
                <p className="text-sm text-slate-500">{day.word}</p>
              </div>

              <div className="z-10">
                {isCompleted ? (
                  <CheckCircleIcon className="h-8 w-8 text-emerald-500" />
                ) : isLocked ? (
                  <LockClosedIcon className="h-6 w-6 text-slate-300" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white shadow-lg shadow-brand/30">
                    <PlayIcon className="h-5 w-5 ml-0.5" />
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default AppView;
