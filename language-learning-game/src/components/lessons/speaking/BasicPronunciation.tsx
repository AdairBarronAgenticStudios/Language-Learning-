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
  Grid,
  Divider,
} from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { useGame } from '../../../contexts/GameContext';

interface PronunciationRule {
  letter: string;
  sound: string;
  description: string;
  examples: {
    word: string;
    translation: string;
  }[];
}

const pronunciationRules: PronunciationRule[] = [
  {
    letter: 'ñ',
    sound: 'ny',
    description: 'Similar to "ny" in "canyon"',
    examples: [
      { word: 'niño', translation: 'child' },
      { word: 'español', translation: 'Spanish' },
      { word: 'mañana', translation: 'tomorrow' },
    ],
  },
  {
    letter: 'rr',
    sound: 'rolled r',
    description: 'A strongly rolled "r" sound',
    examples: [
      { word: 'perro', translation: 'dog' },
      { word: 'carro', translation: 'car' },
      { word: 'arroz', translation: 'rice' },
    ],
  },
  {
    letter: 'll',
    sound: 'y',
    description: 'Similar to "y" in "yes"',
    examples: [
      { word: 'llamar', translation: 'to call' },
      { word: 'lluvia', translation: 'rain' },
      { word: 'pollo', translation: 'chicken' },
    ],
  },
  {
    letter: 'j',
    sound: 'h',
    description: 'Similar to "h" in "hot" but stronger',
    examples: [
      { word: 'jardín', translation: 'garden' },
      { word: 'trabajo', translation: 'work' },
      { word: 'jugar', translation: 'to play' },
    ],
  },
  {
    letter: 'h',
    sound: 'silent',
    description: 'Always silent in Spanish',
    examples: [
      { word: 'hola', translation: 'hello' },
      { word: 'hacer', translation: 'to do/make' },
      { word: 'ahora', translation: 'now' },
    ],
  },
];

const BasicPronunciation: React.FC = () => {
  const context = useGame();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [lessonComplete, setLessonComplete] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const progress = ((currentIndex + 1) / pronunciationRules.length) * 100;

  const handleNext = useCallback(() => {
    if (currentIndex < pronunciationRules.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowTranslation(false);
    } else {
      setLessonComplete(true);
      if (context) {
        Promise.resolve(context.completeLevel('speaking_1', 100))
          .then(() => {
            console.log('Basic pronunciation lesson completed successfully');
          })
          .catch((error: Error) => {
            console.error('Error completing pronunciation lesson:', error);
          });
      }
    }
  }, [currentIndex, context]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setShowTranslation(false);
    }
  };

  const handleComplete = useCallback(() => {
    if (context) {
      Promise.resolve(context.completeLevel('speaking_1', 100))
        .then(() => {
          console.log('Basic pronunciation lesson completed successfully');
          window.location.href = '/learn';
        })
        .catch((error: Error) => {
          console.error('Error completing pronunciation lesson:', error);
          window.location.href = '/learn';
        });
    } else {
      window.location.href = '/learn';
    }
  }, [context]);

  const pronounceText = (text: string) => {
    if (isPlaying) return;

    setIsPlaying(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.7;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

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

    window.speechSynthesis.cancel();
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 50);
  };

  const currentRule = pronunciationRules[currentIndex];

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Basic Spanish Pronunciation
        </Typography>
        
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ mb: 4, height: 10, borderRadius: 5 }}
        />

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography variant="h2" component="div" gutterBottom>
                {currentRule.letter}
              </Typography>
              <Typography variant="h5" color="text.secondary" gutterBottom>
                Sounds like: "{currentRule.sound}"
              </Typography>
              <Typography variant="body1" paragraph>
                {currentRule.description}
              </Typography>
              <Divider sx={{ my: 3 }} />
            </Box>

            <Typography variant="h6" gutterBottom align="center">
              Practice with these words:
            </Typography>

            <Grid container spacing={2} sx={{ mt: 2 }}>
              {currentRule.examples.map((example, index) => (
                <Grid item xs={12} sm={4} key={index}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" gutterBottom>
                          {example.word}
                        </Typography>
                        {showTranslation && (
                          <Typography color="text.secondary">
                            {example.translation}
                          </Typography>
                        )}
                        <Tooltip title="Listen to pronunciation">
                          <IconButton 
                            onClick={() => pronounceText(example.word)}
                            disabled={isPlaying}
                            color="primary"
                            sx={{ mt: 1 }}
                          >
                            <VolumeUpIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="outlined"
                onClick={() => setShowTranslation(!showTranslation)}
                sx={{ mt: 2 }}
              >
                {showTranslation ? 'Hide Translations' : 'Show Translations'}
              </Button>
            </Box>
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
            color="primary"
            onClick={handleNext}
            disabled={lessonComplete}
          >
            {currentIndex < pronunciationRules.length - 1 ? 'Next' : 'Complete'}
          </Button>
        </Box>
      </Box>

      <Dialog open={lessonComplete} onClose={handleComplete}>
        <DialogTitle>¡Felicitaciones!</DialogTitle>
        <DialogContent>
          <Typography>
            You've completed the Basic Pronunciation lesson! You can now understand and practice some of the most important Spanish pronunciation rules.
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

export default BasicPronunciation; 