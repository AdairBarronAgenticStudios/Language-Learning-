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
  Divider,
} from '@mui/material';
import { useGame } from '../../../contexts/GameContext';

const regionalExpressions = [
  {
    region: 'Spain (Madrid)',
    phrase: '¿Qué tal tío?',
    pronunciation: 'keh tahl TEE-oh',
    meaning: 'How are you, mate?',
    notes: 'In Spain, "tío/tía" is commonly used as "dude/mate". The "z" and "c" sounds are pronounced as "th".',
    variations: {
      'Mexico': '¿Qué onda güey?',
      'Argentina': '¿Qué hacés, che?',
      'Colombia': '¿Qué más, parcero?',
    },
  },
  {
    region: 'Argentina (Buenos Aires)',
    phrase: 'Che, ¿vos sabés?',
    pronunciation: 'cheh, bohs sah-BEHS',
    meaning: 'Hey, do you know?',
    notes: 'Argentinians use "vos" instead of "tú" and have a distinct "sh" sound for "ll" and "y".',
    variations: {
      'Spain': '¿Tú sabes?',
      'Mexico': '¿Tú sabes?',
      'Colombia': '¿Tú sabes?',
    },
  },
  {
    region: 'Mexico (Mexico City)',
    phrase: '¡Órale, está padre!',
    pronunciation: 'OH-rah-leh, ehs-TAH PAH-dreh',
    meaning: 'Cool, that\'s awesome!',
    notes: '"Padre" meaning "cool" is uniquely Mexican. The intonation is generally more melodic.',
    variations: {
      'Spain': '¡Qué guay!',
      'Argentina': '¡Qué copado!',
      'Colombia': '¡Qué chévere!',
    },
  },
  {
    region: 'Colombia (Bogotá)',
    phrase: '¡Qué chévere, parce!',
    pronunciation: 'keh CHEH-beh-reh, PAR-seh',
    meaning: 'How cool, buddy!',
    notes: 'Colombian Spanish is known for its clear pronunciation and use of "parcero/parce" for friend.',
    variations: {
      'Spain': '¡Qué guay, tío!',
      'Mexico': '¡Qué padre, güey!',
      'Argentina': '¡Qué copado, che!',
    },
  },
  {
    region: 'Caribbean Spanish',
    phrase: '¿Qué lo qué?',
    pronunciation: 'keh loh keh',
    meaning: 'What\'s up?',
    notes: 'Caribbean Spanish often drops the "s" at the end of words and has a faster rhythm.',
    variations: {
      'Spain': '¿Qué pasa?',
      'Mexico': '¿Qué onda?',
      'Argentina': '¿Qué hacés?',
    },
  },
];

const RegionalAccents: React.FC = () => {
  const context = useGame();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [score, setScore] = useState(0);
  const [showComplete, setShowComplete] = useState(false);

  useEffect(() => {
    if (currentIndex >= regionalExpressions.length) {
      setShowComplete(true);
      if (context) {
        context.completeLevel('speaking_regional', score);
      }
    }
  }, [currentIndex, score, context]);

  const handleShowDetails = () => {
    setShowDetails(true);
    setScore(prev => prev + 1);
  };

  const handleNext = () => {
    setCurrentIndex(prev => prev + 1);
    setShowDetails(false);
  };

  const handleContinue = async () => {
    try {
      setShowComplete(false);
      window.location.href = '/learn';
    } catch (error) {
      console.error('Error completing level:', error);
    }
  };

  if (currentIndex >= regionalExpressions.length) {
    return null;
  }

  const currentExpression = regionalExpressions[currentIndex];

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Regional Accents and Expressions
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {currentExpression.region}
          </Typography>

          <Typography variant="h6" gutterBottom>
            {currentExpression.phrase}
          </Typography>

          <Typography variant="body1" color="text.secondary" gutterBottom>
            Meaning: {currentExpression.meaning}
          </Typography>

          {showDetails && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Pronunciation Guide:
              </Typography>
              <Typography variant="body1" gutterBottom>
                {currentExpression.pronunciation}
              </Typography>

              <Typography variant="h6" sx={{ mt: 3 }} gutterBottom>
                Regional Notes:
              </Typography>
              <Typography variant="body1" gutterBottom>
                {currentExpression.notes}
              </Typography>

              <Typography variant="h6" sx={{ mt: 3 }} gutterBottom>
                Regional Variations:
              </Typography>
              {Object.entries(currentExpression.variations).map(([region, phrase]) => (
                <Box key={region} sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    <strong>{region}:</strong> {phrase}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        {!showDetails ? (
          <Button variant="contained" color="primary" onClick={handleShowDetails}>
            Show Details
          </Button>
        ) : (
          <Button variant="contained" color="primary" onClick={handleNext}>
            Next Expression
          </Button>
        )}
      </Box>

      <Dialog open={showComplete} onClose={() => {}}>
        <DialogTitle>Lesson Complete!</DialogTitle>
        <DialogContent>
          <Typography>
            Congratulations! You've completed the Regional Accents and Expressions lesson.
            Score: {score}/{regionalExpressions.length}
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

export default RegionalAccents; 