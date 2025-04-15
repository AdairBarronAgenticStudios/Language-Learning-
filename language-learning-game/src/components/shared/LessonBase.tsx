import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  LinearProgress,
  Paper,
} from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { playSound } from '../../utils/audio';

interface LessonBaseProps {
  title: string;
  items: Array<{
    id: string;
    question: string;
    answer: string;
    example?: string;
    audio?: string;
  }>;
  onComplete?: () => void;
  renderQuestion: (item: any) => React.ReactNode;
  renderAnswer: (item: any) => React.ReactNode;
}

const LessonBase: React.FC<LessonBaseProps> = ({
  title,
  items,
  onComplete,
  renderQuestion,
  renderAnswer,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentItem = items[currentIndex];

  const handleNext = useCallback(() => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      playSound.levelComplete();
      onComplete?.();
    }
  }, [currentIndex, items.length, onComplete]);

  const handlePlayAudio = useCallback(async () => {
    if (currentItem.audio) {
      setIsPlaying(true);
      // Here you would implement the audio playback logic
      // For now, we'll just play a success sound
      playSound.correct();
      setIsPlaying(false);
    }
  }, [currentItem.audio]);

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
          
          {currentItem.audio && (
            <IconButton 
              onClick={handlePlayAudio} 
              disabled={isPlaying}
              sx={{ mt: 2 }}
            >
              <VolumeUpIcon />
            </IconButton>
          )}
        </CardContent>
      </Card>

      {showAnswer && (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          {renderAnswer(currentItem)}
        </Paper>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          variant="contained"
          onClick={() => setShowAnswer(true)}
          disabled={showAnswer}
        >
          Show Answer
        </Button>
        
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={!showAnswer}
        >
          {currentIndex < items.length - 1 ? 'Next' : 'Complete'}
        </Button>
      </Box>
    </Box>
  );
};

export default LessonBase; 