import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Paper,
} from '@mui/material';
import { playSound } from '../../utils/audio';

interface GameBaseProps {
  title: string;
  items: Array<{
    id: string;
    question: string;
    answer: string;
    options?: string[];
  }>;
  onComplete?: () => void;
  renderQuestion: (item: any) => React.ReactNode;
  renderOptions?: (item: any, onSelect: (option: string) => void) => React.ReactNode;
  checkAnswer: (item: any, answer: string) => boolean;
}

const GameBase: React.FC<GameBaseProps> = ({
  title,
  items,
  onComplete,
  renderQuestion,
  renderOptions,
  checkAnswer,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);

  const currentItem = items[currentIndex];

  const handleAnswerSelect = useCallback((answer: string) => {
    setSelectedAnswer(answer);
    const isCorrect = checkAnswer(currentItem, answer);
    if (isCorrect) {
      setScore(prev => prev + 1);
      playSound.correct();
    } else {
      playSound.incorrect();
    }
    setShowFeedback(true);
  }, [currentItem, checkAnswer]);

  const handleNext = useCallback(() => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      playSound.levelComplete();
      onComplete?.();
    }
  }, [currentIndex, items.length, onComplete]);

  const progress = ((currentIndex + 1) / items.length) * 100;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {title}
      </Typography>
      
      <LinearProgress 
        variant="determinate" 
        value={progress} 
        sx={{ mb: 3, height: 8, borderRadius: 4 }}
      />

      <Card sx={{ mb: 3 }}>
        <CardContent>
          {renderQuestion(currentItem)}
          
          {renderOptions && (
            <Box sx={{ mt: 3 }}>
              {renderOptions(currentItem, handleAnswerSelect)}
            </Box>
          )}
        </CardContent>
      </Card>

      {showFeedback && (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="body1">
            {checkAnswer(currentItem, selectedAnswer!) ? 'Correct!' : 'Incorrect. Try again!'}
          </Typography>
        </Paper>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Typography variant="body1">
          Score: {score}/{items.length}
        </Typography>
        
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={!showFeedback}
        >
          {currentIndex < items.length - 1 ? 'Next' : 'Complete'}
        </Button>
      </Box>
    </Box>
  );
};

export default GameBase; 