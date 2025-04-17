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

// Text-to-speech with improved reliability
export const speakSpanish = (text: string): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      if (!window.speechSynthesis) {
        console.error('Speech synthesis not supported');
        resolve(false);
        return;
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 0.8; // Slightly faster but still clear
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Get available voices
      let voices = window.speechSynthesis.getVoices();
      
      // If voices array is empty, wait for them to load
      if (voices.length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          voices = window.speechSynthesis.getVoices();
          const spanishVoice = voices.find(voice => 
            voice.lang.startsWith('es') && voice.name.includes('Monica')
          ) || voices.find(voice => 
            voice.lang.startsWith('es')
          );

          if (spanishVoice) {
            utterance.voice = spanishVoice;
            console.log('Using Spanish voice:', spanishVoice.name);
          }
        };
      } else {
        const spanishVoice = voices.find(voice => 
          voice.lang.startsWith('es') && voice.name.includes('Monica')
        ) || voices.find(voice => 
          voice.lang.startsWith('es')
        );

        if (spanishVoice) {
          utterance.voice = spanishVoice;
          console.log('Using Spanish voice:', spanishVoice.name);
        }
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

      // Ensure clean state and speak
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }

      // Small delay to ensure clean state
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 50);

    } catch (error) {
      console.error('Speech synthesis error:', error);
      resolve(false);
    }
  });
};

// The main pronunciation function with improved reliability
export const pronounceSpanish = async (
  text: string, 
  onStart: () => void,
  onComplete: () => void
): Promise<void> => {
  try {
    onStart();
    
    // Ensure speech synthesis is in a clean state
    if (window.speechSynthesis?.speaking) {
      window.speechSynthesis.cancel();
    }

    // Try speech synthesis with timeout
    const speechPromise = speakSpanish(text);
    const timeoutPromise = new Promise<boolean>(resolve => {
      setTimeout(() => resolve(false), 10000); // 10 second timeout
    });

    // Race between speech completion and timeout
    const success = await Promise.race([speechPromise, timeoutPromise]);
    
    if (!success) {
      console.warn('Speech synthesis failed or timed out');
    }
    
    onComplete();
  } catch (error) {
    console.error('Pronunciation error:', error);
    onComplete();
  }
}; 