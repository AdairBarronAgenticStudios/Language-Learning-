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

const familyVocabulary: VocabularyWord[] = [
  {
    spanish: 'madre',
    english: 'mother',
    example: 'Mi madre cocina muy bien.',
  },
  {
    spanish: 'padre',
    english: 'father',
    example: 'Mi padre trabaja en un hospital.',
  },
  {
    spanish: 'hermano',
    english: 'brother',
    example: 'Mi hermano es mayor que yo.',
  },
  {
    spanish: 'hermana',
    english: 'sister',
    example: 'Mi hermana estudia medicina.',
  },
  {
    spanish: 'abuelo',
    english: 'grandfather',
    example: 'Mi abuelo cuenta historias interesantes.',
  },
  {
    spanish: 'abuela',
    english: 'grandmother',
    example: 'Mi abuela hace galletas deliciosas.',
  },
  {
    spanish: 'tío',
    english: 'uncle',
    example: 'Mi tío vive en Madrid.',
  },
  {
    spanish: 'tía',
    english: 'aunt',
    example: 'Mi tía es profesora.',
  },
];

const FamilyVocabulary: React.FC = () => {
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

  const progress = ((currentIndex + 1) / familyVocabulary.length) * 100;

  const handleNext = useCallback(() => {
    if (currentIndex < familyVocabulary.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowExample(false);
      setShowTranslation(false);
    } else {
      setLessonComplete(true);
      if (context) {
        context.completeLevel('vocabulary_family', 100);
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

  const currentWord = familyVocabulary[currentIndex];

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Family Members Vocabulary
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
            disabled={currentIndex === familyVocabulary.length - 1 && !showTranslation}
          >
            {currentIndex === familyVocabulary.length - 1 ? 'Complete' : 'Next'}
          </Button>
        </Box>
      </Box>

      <Dialog open={lessonComplete} onClose={handleComplete}>
        <DialogTitle>¡Felicitaciones!</DialogTitle>
        <DialogContent>
          <Typography>
            You've completed the Family Members vocabulary lesson! You can now recognize and use basic family-related words in Spanish.
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

export default FamilyVocabulary; 