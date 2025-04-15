// Spanish pronunciation utility

// Pre-load pronunciation audio elements for better performance
const loadAudio = (src: string): HTMLAudioElement => {
  const audio = new Audio(src);
  audio.preload = 'auto';
  return audio;
};

// Game sound effects
const soundEffects = {
  correct: loadAudio('/sounds/correct.mp3'),
  incorrect: loadAudio('/sounds/incorrect.mp3'),
  levelComplete: loadAudio('/sounds/level-complete.mp3')
};

// Pronunciation audio mapping for common Spanish phrases
export const pronunciationAudios: Record<string, HTMLAudioElement> = {
  // We'll populate this dynamically for phrases we need
};

// Play the sound effect
export const playSound = {
  correct: () => {
    soundEffects.correct.currentTime = 0;
    soundEffects.correct.play().catch(error => console.error('Audio playback error:', error));
  },
  incorrect: () => {
    soundEffects.incorrect.currentTime = 0;
    soundEffects.incorrect.play().catch(error => console.error('Audio playback error:', error));
  },
  levelComplete: () => {
    soundEffects.levelComplete.currentTime = 0;
    soundEffects.levelComplete.play().catch(error => console.error('Audio playback error:', error));
  }
};

// Text-to-speech fallback with better browser compatibility
export const speakSpanish = (text: string): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      if (!window.speechSynthesis) {
        console.error('Speech synthesis not supported');
        resolve(false);
        return;
      }

      // Force stop any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 0.7;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Initialize voices synchronously first
      const voices = speechSynthesis.getVoices();
      const spanishVoice = voices.find(voice => voice.lang.startsWith('es'));
      
      if (spanishVoice) {
        utterance.voice = spanishVoice;
        console.log('Using Spanish voice:', spanishVoice.name);
      } else {
        console.log('No Spanish voice found, using default voice');
      }

      // Set up event handlers
      utterance.onend = () => {
        console.log('Speech completed successfully');
        resolve(true);
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        resolve(false);
      };

      // Ensure the speech synthesis is in a clean state
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }

      // Add the utterance to the queue and start speaking
      speechSynthesis.speak(utterance);

      // Workaround for Chrome bug where speech can get stuck
      const timeoutMs = text.length * 100;
      setTimeout(() => {
        if (speechSynthesis.speaking) {
          speechSynthesis.pause();
          speechSynthesis.resume();
        }
      }, timeoutMs);

    } catch (error) {
      console.error('Speech synthesis error:', error);
      resolve(false);
    }
  });
};

// The main pronunciation function that tries multiple approaches
export const pronounceSpanish = async (
  text: string, 
  onStart: () => void,
  onComplete: () => void
): Promise<void> => {
  try {
    onStart();
    
    // Try speech synthesis
    const speechSuccess = await speakSpanish(text);
    
    if (!speechSuccess) {
      // If speech synthesis fails, show a message to the user
      console.warn('Speech synthesis failed. Please try another browser or device.');
    }
    
    // Always complete after a reasonable delay
    setTimeout(() => {
      onComplete();
    }, Math.min(text.length * 100, 5000)); // Proportional to text length, max 5 seconds
  } catch (error) {
    console.error('Pronunciation error:', error);
    onComplete();
  }
}; 