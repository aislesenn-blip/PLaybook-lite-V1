import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { curriculum } from '../../lib/curriculumData';
import { fetchImage } from '../../lib/imageFetcher';

interface PhaseHunterProps {
  day: any;
  lang: string;
  onComplete: () => void;
}

const PhaseHunter: React.FC<PhaseHunterProps> = ({ day, lang, onComplete }) => {
  const [options, setOptions] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const loadOptions = async () => {
      // Generate options: 1 correct + 2 random from same language
      const currentLangData = curriculum[lang as keyof typeof curriculum];
      const otherDays = currentLangData.days.filter((d: any) => d.word !== day.word);

      // Shuffle and pick 2
      const shuffledOthers = otherDays.sort(() => 0.5 - Math.random()).slice(0, 2);

      // Combine and shuffle again
      const allOptions = [day, ...shuffledOthers].sort(() => 0.5 - Math.random());

      // Fetch images
      const optionsWithImages = await Promise.all(allOptions.map(async (opt: any) => {
        const imageUrl = await fetchImage(opt.word);
        return {
          ...opt,
          imageUrl
        };
      }));

      setOptions(optionsWithImages);
    };

    loadOptions();
  }, [day, lang]);

  const handleSelect = (word: string) => {
    setSelected(word);
    if (word === day.word) {
      // Correct!
      setTimeout(onComplete, 1000);
    } else {
      // Incorrect
      setTimeout(() => setSelected(null), 1000);
    }
  };

  return (
    <div className="flex h-full flex-col items-center justify-center p-6 text-center">
      <motion.h2
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-8 text-4xl font-bold text-slate-800"
      >
        Where is the <span className="text-brand">{day.word}</span>?
      </motion.h2>

      <div className="grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
        {options.map((opt, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSelect(opt.word)}
            className={`flex aspect-square flex-col items-center justify-center rounded-3xl border-4 bg-white p-4 shadow-xl transition-all ${
              selected === opt.word
                ? opt.word === day.word
                  ? 'border-emerald-500 bg-emerald-50 ring-4 ring-emerald-200'
                  : 'border-red-500 bg-red-50 ring-4 ring-red-200'
                : 'border-slate-100 hover:border-brand hover:shadow-2xl'
            }`}
          >
            <div className="mb-4 h-32 w-32 overflow-hidden rounded-2xl bg-slate-100">
              {opt.imageUrl ? (
                <img src={opt.imageUrl} alt={opt.word} className="h-full w-full object-cover" />
              ) : (
                <div className={`flex h-full w-full items-center justify-center text-4xl font-bold text-white ${
                  ['bg-orange-400', 'bg-blue-400', 'bg-purple-400'][i % 3]
                }`}>
                  {opt.word[0]}
                </div>
              )}
            </div>
            <span className="text-2xl font-bold text-slate-700">{opt.word}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default PhaseHunter;
