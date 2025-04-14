import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Container,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
} from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { useGame } from '../../../contexts/GameContext';

interface VocabularyWord {
  spanish: string;
  english: string;
  example: string;
}

const commonObjects: VocabularyWord[] = [
  {
    spanish: 'mesa',
    english: 'table',
    example: 'Los libros están sobre la mesa.',
  },
  {
    spanish: 'silla',
    english: 'chair',
    example: 'Por favor, siéntate en la silla.',
  },
  {
    spanish: 'libro',
    english: 'book',
    example: 'Me gusta leer este libro.',
  },
  {
    spanish: 'lápiz',
    english: 'pencil',
    example: 'Necesito un lápiz para escribir.',
  },
  {
    spanish: 'teléfono',
    english: 'phone',
    example: 'Mi teléfono está en mi bolsillo.',
  },
  {
    spanish: 'ventana',
    english: 'window',
    example: 'Abre la ventana, por favor.',
  },
  {
    spanish: 'puerta',
    english: 'door',
    example: 'La puerta está cerrada.',
  },
  {
    spanish: 'reloj',
    english: 'clock/watch',
    example: 'El reloj marca las tres.',
  },
  {
    spanish: 'computadora',
    english: 'computer',
    example: 'Trabajo en mi computadora todos los días.',
  },
  {
    spanish: 'bolso',
    english: 'bag',
    example: 'Mi bolso está lleno de cosas.',
  }
];

const CommonObjects: React.FC = () => {
  const context = useGame();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showExample, setShowExample] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [lessonComplete, setLessonComplete] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Initialize speech synthesis voices
  React.useEffect(() => {
    const initVoices = () => {
      // Load voices if they're not already loaded
      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.addEventListener('voiceschanged', () => {
          // Voices are now loaded
          console.log('Voices loaded:', window.speechSynthesis.getVoices().length);
        });
      }
    };

    initVoices();
    
    // Cleanup function to cancel any ongoing speech when component unmounts
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const progress = ((currentIndex + 1) / commonObjects.length) * 100;

  const handleNext = useCallback(() => {
    if (currentIndex < commonObjects.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowExample(false);
      setShowTranslation(false);
    } else {
      setLessonComplete(true);
      if (context) {
        context.completeLevel('vocabulary_objects', 100);
      }
    }
  }, [currentIndex, context]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setShowExample(false);
      setShowTranslation(false);
    }
  };

  const handleComplete = () => {
    // Navigate back to the vocabulary menu
    window.location.href = '/learn';
  };

  const pronounceWord = (text: string) => {
    if (isPlaying) return; // Prevent multiple simultaneous pronunciations

    setIsPlaying(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES'; // Set language to Spanish
    utterance.rate = 0.7; // Even slower rate for better clarity
    utterance.pitch = 1.0; // Natural pitch
    utterance.volume = 1.0; // Maximum volume

    // Try to find a Spanish female voice for better clarity
    const voices = window.speechSynthesis.getVoices();
    const spanishVoice = voices.find(voice => 
      voice.lang.startsWith('es') && voice.name.includes('Monica')
    ) || voices.find(voice => 
      voice.lang.startsWith('es')
    );

    if (spanishVoice) {
      utterance.voice = spanishVoice;
    }

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = () => {
      console.error('Error playing pronunciation');
      setIsPlaying(false);
    };

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Small delay to ensure clean start
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 50);
  };

  const currentWord = commonObjects[currentIndex];

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Common Objects Vocabulary
        </Typography>
        
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ mb: 4, height: 10, borderRadius: 5 }}
        />

        <Card 
          sx={{ 
            minHeight: 300,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: 3,
            mb: 3,
            cursor: 'pointer',
            '&:hover': {
              boxShadow: 6,
            },
          }}
          onClick={() => setShowTranslation(!showTranslation)}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
              <Typography variant="h3" component="div" gutterBottom align="center">
                {currentWord.spanish}
              </Typography>
              <Tooltip title="Listen to pronunciation">
                <IconButton 
                  onClick={(e) => {
                    e.stopPropagation();
                    pronounceWord(currentWord.spanish);
                  }}
                  disabled={isPlaying}
                  color="primary"
                  sx={{ 
                    ml: 2,
                    animation: isPlaying ? 'pulse 1s infinite' : 'none',
                    '@keyframes pulse': {
                      '0%': { transform: 'scale(1)' },
                      '50%': { transform: 'scale(1.1)' },
                      '100%': { transform: 'scale(1)' },
                    },
                  }}
                >
                  <VolumeUpIcon />
                </IconButton>
              </Tooltip>
            </Box>
            
            {showTranslation && (
              <Typography variant="h4" color="text.secondary" align="center">
                {currentWord.english}
              </Typography>
            )}
            
            <Button
              variant="outlined"
              onClick={(e) => {
                e.stopPropagation();
                setShowExample(!showExample);
              }}
              sx={{ mt: 3 }}
            >
              {showExample ? 'Hide Example' : 'Show Example'}
            </Button>
            
            {showExample && (
              <Box sx={{ mt: 2 }}>
                <Typography 
                  variant="body1" 
                  sx={{ fontStyle: 'italic' }}
                  align="center"
                >
                  {currentWord.example}
                </Typography>
                <Tooltip title="Listen to example">
                  <IconButton 
                    onClick={(e) => {
                      e.stopPropagation();
                      pronounceWord(currentWord.example);
                    }}
                    disabled={isPlaying}
                    color="primary"
                    sx={{ mt: 1 }}
                  >
                    <VolumeUpIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            variant="outlined"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            Previous
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={currentIndex === commonObjects.length - 1 && !showTranslation}
          >
            {currentIndex === commonObjects.length - 1 ? 'Complete' : 'Next'}
          </Button>
        </Box>
      </Box>

      <Dialog open={lessonComplete} onClose={handleComplete}>
        <DialogTitle>¡Felicitaciones!</DialogTitle>
        <DialogContent>
          <Typography>
            You've completed the Common Objects vocabulary lesson! You can now recognize and use basic words for everyday objects in Spanish.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleComplete} variant="contained">
            Continue Learning
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CommonObjects; 