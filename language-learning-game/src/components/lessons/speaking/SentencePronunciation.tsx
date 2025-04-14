import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useGame } from '../../../contexts/GameContext';

const sentences = [
  {
    spanish: '¿Cómo está tu familia?',
    pronunciation: 'KOH-moh es-TAH too fah-MEE-lee-ah',
    english: 'How is your family?',
  },
  {
    spanish: 'Me gusta viajar en tren.',
    pronunciation: 'meh GOOS-tah bee-ah-HAR en tren',
    english: 'I like traveling by train.',
  },
  {
    spanish: '¿Dónde está el restaurante?',
    pronunciation: 'DOHN-deh es-TAH el res-tow-RAHN-teh',
    english: 'Where is the restaurant?',
  },
  {
    spanish: 'El tiempo está muy bonito hoy.',
    pronunciation: 'el tee-EMP-oh es-TAH moo-ee boh-NEE-toh oy',
    english: 'The weather is very nice today.',
  },
  {
    spanish: '¿Podemos practicar español juntos?',
    pronunciation: 'poh-DEH-mohs prak-tee-KAR es-pahn-YOHL HOON-tohs',
    english: 'Can we practice Spanish together?',
  },
];

const SentencePronunciation: React.FC = () => {
  const context = useGame();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPronunciation, setShowPronunciation] = useState(false);
  const [score, setScore] = useState(0);
  const [showComplete, setShowComplete] = useState(false);

  useEffect(() => {
    if (currentIndex >= sentences.length) {
      setShowComplete(true);
      if (context) {
        context.completeLevel('speaking_sentences', score);
      }
    }
  }, [currentIndex, score, context]);

  const handleShowPronunciation = () => {
    setShowPronunciation(true);
    setScore(prev => prev + 1);
  };

  const handleNext = () => {
    setCurrentIndex(prev => prev + 1);
    setShowPronunciation(false);
  };

  const handleContinue = async () => {
    try {
      setShowComplete(false);
      window.location.href = '/learn';
    } catch (error) {
      console.error('Error completing level:', error);
    }
  };

  if (currentIndex >= sentences.length) {
    return null;
  }

  const currentSentence = sentences[currentIndex];

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Sentence Pronunciation
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {currentSentence.spanish}
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            {currentSentence.english}
          </Typography>
          
          {showPronunciation && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="h6" gutterBottom>
                Pronunciation Guide:
              </Typography>
              <Typography variant="body1">
                {currentSentence.pronunciation}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        {!showPronunciation ? (
          <Button variant="contained" color="primary" onClick={handleShowPronunciation}>
            Show Pronunciation
          </Button>
        ) : (
          <Button variant="contained" color="primary" onClick={handleNext}>
            Next Sentence
          </Button>
        )}
      </Box>

      <Dialog open={showComplete} onClose={() => {}}>
        <DialogTitle>Lesson Complete!</DialogTitle>
        <DialogContent>
          <Typography>
            Congratulations! You've completed the Sentence Pronunciation lesson.
            Score: {score}/{sentences.length}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleContinue} color="primary">
            Continue
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SentencePronunciation; 