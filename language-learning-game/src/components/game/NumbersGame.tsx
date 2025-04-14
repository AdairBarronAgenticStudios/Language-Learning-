import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import { VolumeUp as VolumeUpIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import GameContext from '../../contexts/GameContext';
import { playSound } from '../../utils/audio';

interface NumberQuestion {
  number: number;
  spanish: string;
  pronunciation: string;
  options: string[];
  correctIndex: number;
}

const questions: NumberQuestion[] = [
  {
    number: 1,
    spanish: 'uno',
    pronunciation: 'oo-no',
    options: ['uno', 'dos', 'tres', 'cuatro'],
    correctIndex: 0
  },
  {
    number: 2,
    spanish: 'dos',
    pronunciation: 'dohs',
    options: ['tres', 'dos', 'uno', 'cinco'],
    correctIndex: 1
  },
  {
    number: 3,
    spanish: 'tres',
    pronunciation: 'trehs',
    options: ['cuatro', 'uno', 'tres', 'dos'],
    correctIndex: 2
  },
  {
    number: 4,
    spanish: 'cuatro',
    pronunciation: 'kwah-troh',
    options: ['cinco', 'seis', 'dos', 'cuatro'],
    correctIndex: 3
  },
  {
    number: 5,
    spanish: 'cinco',
    pronunciation: 'seen-koh',
    options: ['cinco', 'siete', 'seis', 'ocho'],
    correctIndex: 0
  },
  {
    number: 6,
    spanish: 'seis',
    pronunciation: 'say-ees',
    options: ['tres', 'seis', 'siete', 'uno'],
    correctIndex: 1
  },
  {
    number: 7,
    spanish: 'siete',
    pronunciation: 'see-eh-teh',
    options: ['ocho', 'cinco', 'siete', 'cuatro'],
    correctIndex: 2
  },
  {
    number: 8,
    spanish: 'ocho',
    pronunciation: 'oh-choh',
    options: ['siete', 'seis', 'cinco', 'ocho'],
    correctIndex: 3
  }
];

const QUESTION_TIME = 15; // seconds per question
const POINTS_PER_CORRECT = 10;
const POINTS_TIME_BONUS = 5; // bonus points for quick answers

const NumbersGame: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(GameContext);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [currentScore, setCurrentScore] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState<NumberQuestion[]>(() => 
    [...questions].sort(() => Math.random() - 0.5)
  );
  const [lives, setLives] = useState(3);

  const nextQuestion = useCallback(() => {
    if (!context) {
      console.log('nextQuestion: No context available');
      return;
    }
    
    console.log('nextQuestion: Called with currentQuestionIndex:', currentQuestionIndex);
    setCurrentQuestionIndex(prevIndex => {
      const nextIndex = prevIndex + 1;
      console.log(`nextQuestion: Calculating next index. Current: ${prevIndex}, Next: ${nextIndex}, Total Questions: ${shuffledQuestions.length}`);
      
      if (nextIndex >= shuffledQuestions.length) {
        console.log('nextQuestion: Reached end of questions, showing completion dialog');
        setShowLevelComplete(true);
        return prevIndex;
      } else {
        console.log('nextQuestion: Moving to next question:', nextIndex);
        setTimeLeft(QUESTION_TIME);
        setSelectedAnswer(null);
        setIsAnswerLocked(false);
        setShowSuccess(false);
        return nextIndex;
      }
    });
  }, [context, shuffledQuestions.length]);

  const handleTimeout = useCallback(() => {
    if (!context || isAnswerLocked) {
      console.log('handleTimeout: Blocked -', !context ? 'No context' : 'Answer locked');
      return;
    }
    
    console.log('handleTimeout: Time expired for question:', currentQuestionIndex);
    setIsAnswerLocked(true);
    playSound.incorrect();
    
    setLives(prevLives => {
      const newLives = prevLives - 1;
      console.log(`handleTimeout: Decreasing lives from ${prevLives} to ${newLives}`);
      context.updateLives(-1);
      
      if (newLives <= 0) {
        console.log('handleTimeout: Game over - no lives remaining');
        setTimeout(() => setShowGameOver(true), 1000);
      } else {
        console.log('handleTimeout: Moving to next question after timeout');
        setTimeout(nextQuestion, 1500);
      }
      return newLives;
    });
  }, [context, isAnswerLocked, nextQuestion, currentQuestionIndex]);

  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null;

    if (!isAnswerLocked) {
      timerId = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerId) clearInterval(timerId);
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [isAnswerLocked, handleTimeout]);

  useEffect(() => {
    if (lives <= 0) {
      setShowGameOver(true);
    }
  }, [lives]);

  // Early return if no context
  if (!context) {
    return <div>Error: Game context not found</div>;
  }

  const currentQuestion = shuffledQuestions[currentQuestionIndex];

  if (!currentQuestion) {
    return <Box sx={{ py: 4, textAlign: 'center' }}>
      <CircularProgress />
      <Typography>Loading questions...</Typography>
    </Box>;
  }

  const handleAnswerClick = (answerIndex: number) => {
    if (isAnswerLocked) {
      console.log('handleAnswerClick: Blocked - Answer already locked');
      return;
    }
    
    console.log(`handleAnswerClick: Selected answer ${answerIndex} for question ${currentQuestionIndex}`);
    setSelectedAnswer(answerIndex);
    setIsAnswerLocked(true);
    
    if (answerIndex === currentQuestion.correctIndex) {
      const timeBonus = Math.floor((timeLeft / QUESTION_TIME) * POINTS_TIME_BONUS);
      const points = POINTS_PER_CORRECT + timeBonus;
      
      console.log(`handleAnswerClick: Correct answer! Points: ${points} (Base: ${POINTS_PER_CORRECT}, Time Bonus: ${timeBonus})`);
      setCurrentScore(prev => {
        const newScore = prev + points;
        console.log(`handleAnswerClick: Updating score from ${prev} to ${newScore}`);
        return newScore;
      });
      
      context.updateScore(points);
      setShowSuccess(true);
      playSound.correct();
      
      console.log('handleAnswerClick: Moving to next question after correct answer');
      setTimeout(nextQuestion, 1000);
    } else {
      console.log(`handleAnswerClick: Incorrect answer. Selected: ${answerIndex}, Correct: ${currentQuestion.correctIndex}`);
      playSound.incorrect();
      
      setLives(prevLives => {
        const newLives = prevLives - 1;
        console.log(`handleAnswerClick: Decreasing lives from ${prevLives} to ${newLives}`);
        context.updateLives(-1);
        
        if (newLives <= 0) {
          console.log('handleAnswerClick: Game over - no lives remaining');
          setTimeout(() => setShowGameOver(true), 1000);
        } else {
          console.log('handleAnswerClick: Moving to next question after incorrect answer');
          setTimeout(nextQuestion, 1500);
        }
        return newLives;
      });
    }
  };

  const resetGame = () => {
    console.log('resetGame: Initializing game reset');
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    setShuffledQuestions(shuffled);
    setCurrentQuestionIndex(0);
    setTimeLeft(QUESTION_TIME);
    setCurrentScore(0);
    setShowGameOver(false);
    setShowLevelComplete(false);
    setSelectedAnswer(null);
    setIsAnswerLocked(false);
    setLives(3);
    context.updateLives(3 - context.gameProgress.lives);
    console.log('resetGame: Game state reset complete');
  };

  const handleContinue = async () => {
    if (!context) {
      console.error('handleContinue: No context available');
      return;
    }
    
    console.log('handleContinue: Starting level completion process');
    console.log('Current state:', {
      currentScore,
      lives,
      currentQuestionIndex,
      isAnswerLocked,
      showLevelComplete: true
    });
    
    try {
      console.log(`handleContinue: Attempting to complete numbers practice with score ${currentScore}`);
      await context.completeLevel('numbers', currentScore);
      console.log('handleContinue: Level completion successful');
      
      // Reset all state before navigation
      console.log('handleContinue: Resetting game state');
      setShowLevelComplete(false);
      setCurrentScore(0);
      setLives(3);
      setCurrentQuestionIndex(0);
      setTimeLeft(QUESTION_TIME);
      setSelectedAnswer(null);
      setIsAnswerLocked(false);
      setShowSuccess(false);
      
      // Force a small delay to ensure state updates are processed
      console.log('handleContinue: Adding small delay before navigation');
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('handleContinue: Navigating to /practice');
      // Try using window.location as a fallback if navigate doesn't work
      try {
        navigate('/practice', { replace: true });
      } catch (navError) {
        console.error('handleContinue: Navigation failed, using window.location', navError);
        window.location.href = '/practice';
      }
    } catch (error) {
      console.error('handleContinue: Error during level completion:', error);
      console.log('handleContinue: Attempting navigation despite error');
      window.location.href = '/practice';
    }
  };

  const speakText = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    speechSynthesis.speak(utterance);
  };

  return (
    <Box sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, maxWidth: '800px', mx: 'auto' }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Numbers - Números
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6">
            Score: {currentScore}
          </Typography>
          <Typography variant="h6">
            Lives: {lives}
          </Typography>
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress
              variant="determinate"
              value={(timeLeft / QUESTION_TIME) * 100}
              color={timeLeft < 5 ? "error" : "primary"}
            />
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="caption" component="div" color="text.secondary">
                {timeLeft}s
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h1" sx={{ 
            fontSize: '120px', 
            fontWeight: 'bold',
            color: 'primary.main',
            textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
            mb: 2
          }}>
            {currentQuestion.number}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <Typography variant="subtitle1" color="text.secondary">
              Pronunciation: {currentQuestion.pronunciation}
            </Typography>
            <IconButton 
              size="small"
              onClick={() => speakText(currentQuestion.spanish)}
            >
              <VolumeUpIcon />
            </IconButton>
          </Box>
        </Box>

        <Grid container spacing={2}>
          {currentQuestion.options.map((option, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={() => handleAnswerClick(index)}
                disabled={isAnswerLocked}
                sx={{
                  minHeight: '60px',
                  fontSize: '1.2rem',
                  backgroundColor: isAnswerLocked ? (
                    index === currentQuestion.correctIndex ? 'success.main' :
                    index === selectedAnswer ? 'error.main' : 'default'
                  ) : 'primary.main',
                  '&:hover': {
                    backgroundColor: isAnswerLocked ? (
                      index === currentQuestion.correctIndex ? 'success.dark' :
                      index === selectedAnswer ? 'error.dark' : 'default'
                    ) : 'primary.dark',
                  }
                }}
              >
                {option}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Fade in={showSuccess}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 2, 
            position: 'fixed', 
            bottom: 20, 
            left: '50%', 
            transform: 'translateX(-50%)',
            bgcolor: 'success.light',
            color: 'white',
          }}
        >
          <Typography variant="h6" align="center">
            ¡Excelente! +{POINTS_PER_CORRECT} points
            {timeLeft > 0 && ` (+${Math.floor((timeLeft / QUESTION_TIME) * POINTS_TIME_BONUS)} time bonus)`}
          </Typography>
        </Paper>
      </Fade>

      <Dialog
        open={showGameOver}
        aria-labelledby="game-over-dialog"
        onClose={() => {}}
      >
        <DialogTitle id="game-over-dialog" sx={{ textAlign: 'center' }}>
          ¡Game Over!
        </DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom align="center">
            Final Score: {currentScore}
          </Typography>
          <Typography align="center">
            You ran out of lives! Would you like to try again?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => {
              setShowGameOver(false);
              resetGame();
            }}
            sx={{ minWidth: 120 }}
          >
            Try Again
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/practice')}
            sx={{ minWidth: 120 }}
          >
            Exit Practice
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showLevelComplete}
        aria-labelledby="level-complete-dialog"
        onClose={() => {}}
      >
        <DialogTitle id="level-complete-dialog" sx={{ textAlign: 'center' }}>
          ¡Felicitaciones! Practice Complete!
        </DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom align="center">
            Score: {currentScore}
          </Typography>
          <Typography align="center">
            You've mastered the numbers! Ready for another challenge?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleContinue}
            sx={{ minWidth: 120 }}
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NumbersGame; 