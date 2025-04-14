// Audio objects for sound effects
const sounds = {
  correct: new Audio('/sounds/correct.mp3'),
  incorrect: new Audio('/sounds/incorrect.mp3'),
  levelComplete: new Audio('/sounds/level-complete.mp3')
};

// Function to play sounds
export const playSound = {
  correct: () => {
    sounds.correct.currentTime = 0;
    sounds.correct.play();
  },
  incorrect: () => {
    sounds.incorrect.currentTime = 0;
    sounds.incorrect.play();
  },
  levelComplete: () => {
    sounds.levelComplete.currentTime = 0;
    sounds.levelComplete.play();
  }
};

// Preload sounds
export const preloadAudio = () => {
  Object.values(sounds).forEach(sound => {
    sound.load();
  });
}; 