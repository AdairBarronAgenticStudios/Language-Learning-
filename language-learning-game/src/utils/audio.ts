// Create Audio objects for our sound effects
const correctSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
const incorrectSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3');
const levelCompleteSound = new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3');

// Configure sounds
correctSound.volume = 0.5;
incorrectSound.volume = 0.3;
levelCompleteSound.volume = 0.7;

export const playSound = {
  correct: () => correctSound.play().catch(e => console.log('Audio playback failed:', e)),
  incorrect: () => incorrectSound.play().catch(e => console.log('Audio playback failed:', e)),
  levelComplete: () => levelCompleteSound.play().catch(e => console.log('Audio playback failed:', e)),
};

// Function to preload all audio files
export const preloadAudio = () => {
  correctSound.load();
  incorrectSound.load();
  levelCompleteSound.load();
}; 