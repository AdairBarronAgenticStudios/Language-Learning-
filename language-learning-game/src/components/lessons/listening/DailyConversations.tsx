import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useGame } from '../../../contexts/GameContext';

const conversations = [
  {
    dialog: [
      { speaker: 'María', text: '¿Qué vas a hacer este fin de semana?' },
      { speaker: 'Juan', text: 'Voy a visitar a mis abuelos.' },
    ],
    question: '¿Qué va a hacer Juan?',
    options: [
      'Va a quedarse en casa',
      'Va a visitar a sus abuelos',
      'Va a trabajar',
      'Va a estudiar',
    ],
    correctAnswer: 1,
  },
  {
    dialog: [
      { speaker: 'Carlos', text: '¿Has visto mi libro de español?' },
      { speaker: 'Ana', text: 'Sí, está sobre la mesa de la cocina.' },
    ],
    question: '¿Dónde está el libro?',
    options: [
      'En el dormitorio',
      'En la sala',
      'Sobre la mesa de la cocina',
      'En el jardín',
    ],
    correctAnswer: 2,
  },
  {
    dialog: [
      { speaker: 'Pedro', text: '¿A qué hora empieza la película?' },
      { speaker: 'Laura', text: 'La película empieza a las ocho de la noche.' },
    ],
    question: '¿Cuándo empieza la película?',
    options: [
      'A las siete de la noche',
      'A las ocho de la mañana',
      'A las ocho de la noche',
      'A las nueve de la noche',
    ],
    correctAnswer: 2,
  },
  {
    dialog: [
      { speaker: 'Elena', text: '¿Quieres ir al restaurante italiano?' },
      { speaker: 'Miguel', text: 'Lo siento, no me gusta la comida italiana.' },
    ],
    question: '¿Por qué Miguel no quiere ir al restaurante?',
    options: [
      'No tiene dinero',
      'No tiene hambre',
      'No le gusta la comida italiana',
      'Está ocupado',
    ],
    correctAnswer: 2,
  },
  {
    dialog: [
      { speaker: 'Sara', text: '¿Qué tiempo hace hoy?' },
      { speaker: 'David', text: 'Está lloviendo mucho.' },
    ],
    question: '¿Cómo está el tiempo?',
    options: [
      'Hace sol',
      'Está nevando',
      'Está lloviendo',
      'Hace viento',
    ],
    correctAnswer: 2,
  },
];

const DailyConversations: React.FC = () => {
  const context = useGame();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [showComplete, setShowComplete] = useState(false);

  useEffect(() => {
    if (currentIndex >= conversations.length) {
      setShowComplete(true);
      if (context) {
        context.completeLevel('listening_daily', score);
      }
    }
  }, [currentIndex, score, context]);

  const handleCheck = () => {
    if (selectedAnswer === conversations[currentIndex].correctAnswer) {
      setScore(prev => prev + 1);
    }
    setShowAnswer(true);
  };

  const handleNext = () => {
    setCurrentIndex(prev => prev + 1);
    setSelectedAnswer(null);
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

  if (currentIndex >= conversations.length) {
    return null;
  }

  const currentConversation = conversations[currentIndex];

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Daily Conversations
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ mb: 3 }}>
            {currentConversation.dialog.map((line, index) => (
              <Typography key={index} variant="body1" gutterBottom>
                <strong>{line.speaker}:</strong> {line.text}
              </Typography>
            ))}
          </Box>

          <Typography variant="h6" gutterBottom>
            {currentConversation.question}
          </Typography>

          <FormControl component="fieldset">
            <RadioGroup
              value={selectedAnswer}
              onChange={(e) => setSelectedAnswer(Number(e.target.value))}
            >
              {currentConversation.options.map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={index}
                  control={<Radio />}
                  label={option}
                  disabled={showAnswer}
                />
              ))}
            </RadioGroup>
          </FormControl>

          {showAnswer && (
            <Box sx={{ mt: 2 }}>
              <Typography
                color={selectedAnswer === currentConversation.correctAnswer ? 'success.main' : 'error.main'}
              >
                {selectedAnswer === currentConversation.correctAnswer
                  ? '¡Correcto!'
                  : `Incorrect. The correct answer is: ${currentConversation.options[currentConversation.correctAnswer]}`}
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
            disabled={selectedAnswer === null}
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
            Congratulations! You've completed the Daily Conversations lesson.
            Score: {score}/{conversations.length}
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

export default DailyConversations; 