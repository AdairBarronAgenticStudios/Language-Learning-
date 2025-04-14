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

const businessTerms = [
  {
    spanish: 'la reunión',
    english: 'meeting',
    context: 'Tenemos una reunión importante con los clientes mañana.',
    usage: 'Used to discuss formal gatherings in a business context',
  },
  {
    spanish: 'el informe',
    english: 'report',
    context: 'Necesito entregar el informe trimestral esta tarde.',
    usage: 'Used for formal business documents and presentations',
  },
  {
    spanish: 'el presupuesto',
    english: 'budget',
    context: 'El presupuesto para el proyecto es limitado.',
    usage: 'Used when discussing financial planning and resources',
  },
  {
    spanish: 'la negociación',
    english: 'negotiation',
    context: 'La negociación con los proveedores fue exitosa.',
    usage: 'Used in business discussions and deal-making',
  },
  {
    spanish: 'el contrato',
    english: 'contract',
    context: 'Debemos revisar los términos del contrato.',
    usage: 'Used in legal and business agreements',
  },
  {
    spanish: 'la inversión',
    english: 'investment',
    context: 'La inversión en tecnología es fundamental.',
    usage: 'Used when discussing financial commitments',
  },
  {
    spanish: 'el accionista',
    english: 'shareholder',
    context: 'Los accionistas esperan buenos resultados.',
    usage: 'Used in corporate and investment contexts',
  },
  {
    spanish: 'la estrategia',
    english: 'strategy',
    context: 'Nuestra estrategia de mercado es innovadora.',
    usage: 'Used in business planning and development',
  },
];

const BusinessTerms: React.FC = () => {
  const context = useGame();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [showComplete, setShowComplete] = useState(false);

  useEffect(() => {
    if (currentIndex >= businessTerms.length) {
      setShowComplete(true);
      if (context) {
        context.completeLevel('vocabulary_business', score);
      }
    }
  }, [currentIndex, score, context]);

  const handleCheck = () => {
    if (userAnswer.toLowerCase().trim() === businessTerms[currentIndex].spanish.toLowerCase()) {
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

  if (currentIndex >= businessTerms.length) {
    return null;
  }

  const currentTerm = businessTerms[currentIndex];

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Business Spanish Vocabulary
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            English Term: {currentTerm.english}
          </Typography>
          
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Example: {currentTerm.context}
          </Typography>

          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
            Usage: {currentTerm.usage}
          </Typography>

          <TextField
            fullWidth
            label="Enter the Spanish term"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            disabled={showAnswer}
            sx={{ mb: 2 }}
          />

          {showAnswer && (
            <Box sx={{ mt: 2 }}>
              <Typography
                color={userAnswer.toLowerCase().trim() === currentTerm.spanish.toLowerCase() ? 'success.main' : 'error.main'}
              >
                {userAnswer.toLowerCase().trim() === currentTerm.spanish.toLowerCase()
                  ? '¡Correcto!'
                  : `The correct answer is: ${currentTerm.spanish}`}
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
            Congratulations! You've completed the Business Spanish Vocabulary lesson.
            Score: {score}/{businessTerms.length}
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

export default BusinessTerms; 