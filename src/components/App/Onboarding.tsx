import React, { useState } from 'react';
import { motion } from 'framer-motion';

const languages = [
  { code: 'english', label: 'English', flag: '🇬🇧' },
  { code: 'swahili', label: 'Swahili', flag: '🇹🇿' },
  { code: 'french', label: 'French', flag: '🇫🇷' }
];

interface OnboardingProps {
  onComplete: (name: string, lang: string) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [selectedLang, setSelectedLang] = useState(languages[0].code);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onComplete(name, selectedLang);
    }
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-canvas px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl ring-1 ring-slate-900/5"
      >
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-text-main">Welcome, Champion!</h2>
          <p className="mt-2 text-slate-500">Let's start your journey.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">What is your child's name?</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jasmine, Andrew, Mohammed"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-lg font-medium outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Choose a Language</label>
            <div className="grid grid-cols-3 gap-3">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setSelectedLang(lang.code)}
                  className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-4 transition-all ${
                    selectedLang === lang.code
                      ? 'border-brand bg-brand/5 ring-2 ring-brand/20'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span className={`text-sm font-medium ${selectedLang === lang.code ? 'text-brand' : 'text-slate-600'}`}>
                    {lang.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="mt-4 w-full rounded-xl bg-brand py-4 text-lg font-bold text-white shadow-lg shadow-brand/20 transition-all hover:bg-amber-700 hover:shadow-brand/40 active:scale-[0.98]"
          >
            Start Adventure
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Onboarding;
