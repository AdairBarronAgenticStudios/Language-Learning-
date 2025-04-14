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
    sentence: 'Espero que ___ (llegar) a tiempo.',
    verb: 'llegar',
    answer: 'llegues',
    translation: 'I hope you arrive on time.',
    explanation: 'Use subjunctive after "espero que" to express hope or desire',
  },
  {
    sentence: 'Es importante que ___ (estudiar) todos los días.',
    verb: 'estudiar',
    answer: 'estudies',
    translation: 'It is important that you study every day.',
    explanation: 'Use subjunctive after expressions of importance or necessity',
  },
  {
    sentence: 'Quiero que ellos ___ (venir) a la fiesta.',
    verb: 'venir',
    answer: 'vengan',
    translation: 'I want them to come to the party.',
    explanation: 'Use subjunctive after "quiero que" to express wishes',
  },
  {
    sentence: 'No creo que ___ (ser) una buena idea.',
    verb: 'ser',
    answer: 'sea',
    translation: 'I don\'t think it\'s a good idea.',
    explanation: 'Use subjunctive after negative expressions of belief',
  },
  {
    sentence: 'Ojalá ___ (hacer) buen tiempo mañana.',
    verb: 'hacer',
    answer: 'haga',
    translation: 'I hope the weather is good tomorrow.',
    explanation: 'Use subjunctive after "ojalá" to express wishes',
  },
  {
    sentence: 'Dudo que él ___ (poder) terminar a tiempo.',
    verb: 'poder',
    answer: 'pueda',
    translation: 'I doubt he can finish on time.',
    explanation: 'Use subjunctive after expressions of doubt',
  },
];

const SubjunctiveMood: React.FC = () => {
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
        context.completeLevel('grammar_subjunctive', score);
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
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Subjunctive Mood
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Complete the sentence using the subjunctive form of "{currentExercise.verb}"
          </Typography>

          <Typography variant="body1" gutterBottom>
            {currentExercise.sentence}
          </Typography>

          <Typography variant="body2" color="text.secondary" gutterBottom>
            Translation: {currentExercise.translation}
          </Typography>

          <TextField
            fullWidth
            label="Enter the subjunctive form"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            disabled={showAnswer}
            sx={{ my: 2 }}
          />

          {showAnswer && (
            <Box sx={{ mt: 2 }}>
              <Typography
                color={userAnswer.toLowerCase().trim() === currentExercise.answer ? 'success.main' : 'error.main'}
                gutterBottom
              >
                {userAnswer.toLowerCase().trim() === currentExercise.answer
                  ? '¡Correcto!'
                  : `The correct answer is: ${currentExercise.answer}`}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
                Explanation: {currentExercise.explanation}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        {!showAnswer ? (
          <Button
            variant="contained"
            color="primary"
            onClick={handleCheck}
            disabled={!userAnswer.trim()}
          >
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
            Congratulations! You've completed the Subjunctive Mood lesson.
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

export default SubjunctiveMood; 