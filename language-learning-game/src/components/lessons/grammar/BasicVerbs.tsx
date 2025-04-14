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
} from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { useGame } from '../../../contexts/GameContext';

interface VerbConjugation {
  infinitive: string;
  english: string;
  conjugations: {
    pronoun: string;
    form: string;
    example: string;
  }[];
}

const basicVerbs: VerbConjugation[] = [
  {
    infinitive: 'ser',
    english: 'to be',
    conjugations: [
      { pronoun: 'yo', form: 'soy', example: 'Yo soy estudiante.' },
      { pronoun: 'tú', form: 'eres', example: 'Tú eres profesor.' },
      { pronoun: 'él/ella', form: 'es', example: 'Ella es doctora.' },
      { pronoun: 'nosotros', form: 'somos', example: 'Nosotros somos amigos.' },
      { pronoun: 'vosotros', form: 'sois', example: 'Vosotros sois estudiantes.' },
      { pronoun: 'ellos/ellas', form: 'son', example: 'Ellos son familia.' },
    ],
  },
  {
    infinitive: 'estar',
    english: 'to be (location/state)',
    conjugations: [
      { pronoun: 'yo', form: 'estoy', example: 'Yo estoy en casa.' },
      { pronoun: 'tú', form: 'estás', example: 'Tú estás feliz.' },
      { pronoun: 'él/ella', form: 'está', example: 'Él está ocupado.' },
      { pronoun: 'nosotros', form: 'estamos', example: 'Nosotros estamos listos.' },
      { pronoun: 'vosotros', form: 'estáis', example: 'Vosotros estáis aquí.' },
      { pronoun: 'ellos/ellas', form: 'están', example: 'Ellas están en la escuela.' },
    ],
  },
  {
    infinitive: 'tener',
    english: 'to have',
    conjugations: [
      { pronoun: 'yo', form: 'tengo', example: 'Yo tengo un libro.' },
      { pronoun: 'tú', form: 'tienes', example: 'Tú tienes una casa.' },
      { pronoun: 'él/ella', form: 'tiene', example: 'Él tiene un carro.' },
      { pronoun: 'nosotros', form: 'tenemos', example: 'Nosotros tenemos tiempo.' },
      { pronoun: 'vosotros', form: 'tenéis', example: 'Vosotros tenéis razón.' },
      { pronoun: 'ellos/ellas', form: 'tienen', example: 'Ellos tienen hambre.' },
    ],
  },
];

const BasicVerbs: React.FC = () => {
  const context = useGame();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showExample, setShowExample] = useState(false);
  const [lessonComplete, setLessonComplete] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const progress = ((currentIndex + 1) / basicVerbs.length) * 100;

  const handleNext = useCallback(() => {
    if (currentIndex < basicVerbs.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowExample(false);
    } else {
      setLessonComplete(true);
      if (context) {
        Promise.resolve(context.completeLevel('grammar_1', 100))
          .then(() => {
            console.log('Basic verbs lesson completed successfully');
          })
          .catch((error: Error) => {
            console.error('Error completing basic verbs lesson:', error);
          });
      }
    }
  }, [currentIndex, context]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setShowExample(false);
    }
  };

  const handleComplete = useCallback(() => {
    if (context) {
      Promise.resolve(context.completeLevel('grammar_1', 100))
        .then(() => {
          console.log('Basic verbs lesson completed successfully');
          window.location.href = '/learn';
        })
        .catch((error: Error) => {
          console.error('Error completing basic verbs lesson:', error);
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

  const currentVerb = basicVerbs[currentIndex];

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Basic Spanish Verbs
        </Typography>
        
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ mb: 4, height: 10, borderRadius: 5 }}
        />

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography variant="h3" component="div" gutterBottom>
                {currentVerb.infinitive}
              </Typography>
              <Typography variant="h5" color="text.secondary">
                {currentVerb.english}
              </Typography>
              <Tooltip title="Listen to pronunciation">
                <IconButton 
                  onClick={() => pronounceText(currentVerb.infinitive)}
                  disabled={isPlaying}
                  color="primary"
                >
                  <VolumeUpIcon />
                </IconButton>
              </Tooltip>
            </Box>

            <Grid container spacing={2}>
              {currentVerb.conjugations.map((conjugation, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" color="primary">
                        {conjugation.pronoun}
                      </Typography>
                      <Typography variant="h5">
                        {conjugation.form}
                      </Typography>
                      {showExample && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                            {conjugation.example}
                          </Typography>
                          <Tooltip title="Listen to example">
                            <IconButton 
                              onClick={() => pronounceText(conjugation.example)}
                              disabled={isPlaying}
                              size="small"
                              color="primary"
                            >
                              <VolumeUpIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="outlined"
                onClick={() => setShowExample(!showExample)}
                sx={{ mt: 2 }}
              >
                {showExample ? 'Hide Examples' : 'Show Examples'}
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
            {currentIndex < basicVerbs.length - 1 ? 'Next' : 'Complete'}
          </Button>
        </Box>
      </Box>

      <Dialog open={lessonComplete} onClose={handleComplete}>
        <DialogTitle>¡Felicitaciones!</DialogTitle>
        <DialogContent>
          <Typography>
            You've completed the Basic Verbs lesson! You can now understand and use some of the most important Spanish verbs.
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

export default BasicVerbs; 