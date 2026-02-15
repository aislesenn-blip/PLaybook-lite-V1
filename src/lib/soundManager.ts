// src/lib/soundManager.ts

export const playSound = async (lang: string, dayId: number, type: 'sponge' | 'echo' | 'hunter' | 'performer' | 'success' | 'try_again') => {
  let path = '';

  // Language Code Mapping
  let langCode = lang;
  if (lang === 'english') langCode = 'en';
  if (lang === 'swahili') langCode = 'sw';
  if (lang === 'french') langCode = 'fr';

  if (type === 'success') {
    path = `/assets/audio/system/success_medium.mp3`;
  } else if (type === 'try_again') {
    path = `/assets/audio/system/try_again.mp3`;
  } else {
    // Phase Mapping (Must match file system: sound, word, phrase, hero)
    let filenamePart: string = type;
    if (type === 'sponge') filenamePart = 'sound';
    if (type === 'echo') filenamePart = 'word';
    if (type === 'hunter') filenamePart = 'phrase';
    if (type === 'performer') filenamePart = 'hero';

    path = `/assets/audio/${langCode}/day${dayId}_${filenamePart}.mp3`;
  }

  console.log(`Playing sound: ${path}`);
  try {
    const audio = new Audio(path);
    await audio.play();
  } catch (e) {
    console.warn(`Audio file not found or could not play: ${path}`, e);
  }
};
