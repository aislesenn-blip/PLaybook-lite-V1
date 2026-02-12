// src/lib/soundManager.ts

export const playSound = async (lang: string, dayId: number, type: 'sponge' | 'echo' | 'hunter' | 'performer' | 'success') => {
  let path = '';
  if (type === 'success') {
    path = `/src/assets/audio/success.mp3`; // Or specific success sound
  } else {
    path = `/src/assets/audio/${lang}/day${dayId}_${type}.mp3`;
  }

  console.log(`Playing sound: ${path}`);
  try {
    const audio = new Audio(path);
    await audio.play();
  } catch (e) {
    console.warn(`Audio file not found or could not play: ${path}`, e);
  }
};
