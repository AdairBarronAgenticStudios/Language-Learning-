import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useGame } from '../../../contexts/GameContext';

const exercises = [
  {
    sentence: 'Yo ___ (comer) una manzana ayer.',
    verb: 'comer',
    answer: 'comí',
    translation: 'I ate an apple yesterday.',
  },
  {
    sentence: 'Ella ___ (estudiar) español el año pasado.',
    verb: 'estudiar',
    answer: 'estudió',
    translation: 'She studied Spanish last year.',
  },
  {
    sentence: 'Nosotros ___ (vivir) en Madrid por dos años.',
    verb: 'vivir',
    answer: 'vivimos',
    translation: 'We lived in Madrid for two years.',
  },
  {
    sentence: 'Ellos ___ (bailar) toda la noche.',
    verb: 'bailar',
    answer: 'bailaron',
    translation: 'They danced all night.',
  },
  {
    sentence: 'Tú ___ (hablar) con Juan esta mañana.',
    verb: 'hablar',
    answer: 'hablaste',
    translation: 'You spoke with Juan this morning.',
  },
];

const PastTense: React.FC = () => {
  const context = useGame();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [showComplete, setShowComplete] = useState(false);

  useEffect(() => {
    if (currentIndex >= exercises.length) {
      setShowComplete(true);
      if (context) {
        context.completeLevel('grammar_past_tense', score);
      }
    }
  }, [currentIndex, score, context]);

  const handleCheck = () => {
    if (userAnswer.toLowerCase().trim() === exercises[currentIndex].answer) {
      setScore(prev => prev + 1);
    }
    setShowAnswer(true);
  };

  const handleNext = () => {
    setCurrentIndex(prev => prev + 1);
    setUserAnswer('');
    setShowAnswer(false);
  };

  const handleContinue = async () => {
    try {
      setShowComplete(false);
      window.location.href = '/learn';
    } catch (error) {
      console.error('Error completing level:', error);
    }
  };

  if (currentIndex >= exercises.length) {
    return null;
  }

  const currentExercise = exercises[currentIndex];

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Past Tense (Pretérito)
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="body1" gutterBottom>
            {currentExercise.sentence}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Translation: {currentExercise.translation}
          </Typography>
          
          <TextField
            fullWidth
            label={`Enter the past tense of "${currentExercise.verb}"`}
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            disabled={showAnswer}
            sx={{ mt: 2 }}
          />

          {showAnswer && (
            <Box sx={{ mt: 2 }}>
              <Typography color={userAnswer.toLowerCase().trim() === currentExercise.answer ? 'success.main' : 'error.main'}>
                Correct answer: {currentExercise.answer}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        {!showAnswer ? (
          <Button variant="contained" color="primary" onClick={handleCheck}>
            Check Answer
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
            Congratulations! You've completed the Past Tense lesson.
            Score: {score}/{exercises.length}
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

export default PastTense; 