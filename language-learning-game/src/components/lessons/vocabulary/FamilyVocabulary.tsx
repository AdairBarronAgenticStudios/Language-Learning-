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
} from '@mui/material';
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
            <Typography variant="h3" component="div" gutterBottom align="center">
              {currentWord.spanish}
            </Typography>
            
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
              <Typography 
                variant="body1" 
                sx={{ mt: 2, fontStyle: 'italic' }}
                align="center"
              >
                {currentWord.example}
              </Typography>
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