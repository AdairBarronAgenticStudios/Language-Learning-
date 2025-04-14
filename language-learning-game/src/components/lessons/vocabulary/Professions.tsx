import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useGame } from '../../../contexts/GameContext';

const professions = [
  { spanish: 'médico/médica', english: 'doctor', image: '👨‍⚕️' },
  { spanish: 'profesor/profesora', english: 'teacher', image: '👨‍🏫' },
  { spanish: 'ingeniero/ingeniera', english: 'engineer', image: '👨‍💻' },
  { spanish: 'abogado/abogada', english: 'lawyer', image: '👨‍⚖️' },
  { spanish: 'arquitecto/arquitecta', english: 'architect', image: '👨‍🎨' },
  { spanish: 'chef/cocinero', english: 'chef', image: '👨‍🍳' },
  { spanish: 'científico/científica', english: 'scientist', image: '👨‍🔬' },
  { spanish: 'artista', english: 'artist', image: '🎨' },
  { spanish: 'músico/música', english: 'musician', image: '🎵' },
  { spanish: 'empresario/empresaria', english: 'businessman/businesswoman', image: '💼' },
];

const Professions: React.FC = () => {
  const context = useGame();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [showComplete, setShowComplete] = useState(false);

  useEffect(() => {
    if (currentIndex >= professions.length) {
      setShowComplete(true);
      if (context) {
        context.completeLevel('vocabulary_professions', score);
      }
    }
  }, [currentIndex, score, context]);

  const handleNext = () => {
    setCurrentIndex(prev => prev + 1);
    setShowAnswer(false);
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
    setScore(prev => prev + 1);
  };

  const handleContinue = async () => {
    try {
      setShowComplete(false);
      window.location.href = '/learn';
    } catch (error) {
      console.error('Error completing level:', error);
    }
  };

  if (currentIndex >= professions.length) {
    return null;
  }

  const currentProfession = professions[currentIndex];

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Professions in Spanish
      </Typography>
      
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center" justifyContent="center">
            <Grid item xs={12} textAlign="center">
              <Typography variant="h1" sx={{ fontSize: '4rem', mb: 2 }}>
                {currentProfession.image}
              </Typography>
              <Typography variant="h5" gutterBottom>
                {showAnswer ? currentProfession.spanish : '???'}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {currentProfession.english}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        {!showAnswer ? (
          <Button variant="contained" color="primary" onClick={handleShowAnswer}>
            Show Answer
          </Button>
        ) : (
          <Button variant="contained" color="primary" onClick={handleNext}>
            Next
          </Button>
        )}
      </Box>

      <Dialog open={showComplete} onClose={() => {}}>
        <DialogTitle>Lesson Complete!</DialogTitle>
        <DialogContent>
          <Typography>
            Congratulations! You've completed the Professions lesson.
            Score: {score}/{professions.length}
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

export default Professions; 