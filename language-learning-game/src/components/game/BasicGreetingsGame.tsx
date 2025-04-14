import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { VolumeUp as VolumeUpIcon } from '@mui/icons-material';
import { useGame } from '../../contexts/GameContext';
import { playSound } from '../../utils/audio';
import { useNavigate } from 'react-router-dom';

interface Greeting {
  id: string;
  spanish: string;
  english: string;
  pronunciation: string;
}

interface GameCard {
  id: string;
  greetingId: string;
  text: string;
  isSpanish: boolean;
  pronunciation?: string;
}

const greetings: Greeting[] = [
  {
    id: '1',
    spanish: 'Hola',
    english: 'Hello',
    pronunciation: 'OH-lah'
  },
  {
    id: '2',
    spanish: 'Buenos días',
    english: 'Good morning',
    pronunciation: 'BWEH-nohs DEE-ahs'
  },
  {
    id: '3',
    spanish: '¿Cómo estás?',
    english: 'How are you?',
    pronunciation: 'KOH-moh ehs-TAHS'
  },
  {
    id: '4',
    spanish: 'Gracias',
    english: 'Thank you',
    pronunciation: 'GRAH-see-ahs'
  },
  {
    id: '5',
    spanish: 'Por favor',
    english: 'Please',
    pronunciation: 'pohr fah-VOHR'
  },
  {
    id: '6',
    spanish: 'Hasta luego',
    english: 'See you later',
    pronunciation: 'AHS-tah LWEH-goh'
  }
];

const BasicGreetingsGame: React.FC = () => {
  const navigate = useNavigate();
  const { updateScore, updateLives, gameProgress, completeLevel } = useGame();
  const [selectedCard, setSelectedCard] = useState<GameCard | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [gameCards, setGameCards] = useState<GameCard[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);

  const resetGame = () => {
    setMatchedPairs([]);
    setSelectedCard(null);
    setCurrentScore(0);
    setShowGameOver(false);
    setShowLevelComplete(false);
    // Reset lives to 3
    updateLives(3 - gameProgress.lives);
    // Reshuffle cards
    setGameCards(initializeGame());
  };

  // Initialize game on mount and reset on unmount
  useEffect(() => {
    resetGame(); // Initialize the game

    // Cleanup function that runs when component unmounts
    return () => {
      // Reset lives to 3 when leaving the game
      updateLives(3 - gameProgress.lives);
    };
  }, []); // Empty dependency array means this runs once on mount

  // Initialize and shuffle cards
  const initializeGame = () => {
    const cards: GameCard[] = [];
    greetings.forEach(greeting => {
      // Create Spanish card
      cards.push({
        id: `spanish-${greeting.id}`,
        greetingId: greeting.id,
        text: greeting.spanish,
        isSpanish: true,
        pronunciation: greeting.pronunciation
      });
      // Create English card
      cards.push({
        id: `english-${greeting.id}`,
        greetingId: greeting.id,
        text: greeting.english,
        isSpanish: false
      });
    });
    // Shuffle cards
    return [...cards].sort(() => Math.random() - 0.5);
  };

  // Check for game over when lives change
  useEffect(() => {
    if (gameProgress.lives <= 0) {
      setShowGameOver(true);
    }
  }, [gameProgress.lives]);

  // Handle card selection
  const handleCardClick = (card: GameCard) => {
    if (matchedPairs.includes(card.greetingId) || card.id === selectedCard?.id || gameProgress.lives <= 0) return;

    if (!selectedCard) {
      setSelectedCard(card);
      return;
    }

    // Check if it's a match
    if (card.greetingId === selectedCard.greetingId && card.isSpanish !== selectedCard.isSpanish) {
      // Match found
      const newMatchedPairs = [...matchedPairs, card.greetingId];
      setMatchedPairs(newMatchedPairs);
      const newScore = currentScore + 10;
      setCurrentScore(newScore);
      updateScore(10);
      setShowSuccess(true);
      playSound.correct();
      setTimeout(() => setShowSuccess(false), 1000);

      // Check if level is complete
      if (newMatchedPairs.length === greetings.length) {
        playSound.levelComplete();
        completeLevel('level1', newScore);
        setShowLevelComplete(true);
      }
    } else {
      // No match
      updateLives(-1);
      playSound.incorrect();
    }

    setSelectedCard(null);
  };

  const handleRetry = () => {
    // Reset the game state
    setMatchedPairs([]);
    setSelectedCard(null);
    setCurrentScore(0);
    setShowGameOver(false);
    // Reset lives to 3
    updateLives(3 - gameProgress.lives);
    // Reshuffle cards
    setGameCards(initializeGame());
  };

  const handleContinue = () => {
    try {
      // Close the dialog and reset the game state
      setShowLevelComplete(false);
      setMatchedPairs([]);
      setSelectedCard(null);
      setCurrentScore(0);
      // Reset lives
      updateLives(3 - gameProgress.lives);
      // Navigate using window.location
      window.location.href = '/practice';
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  // Text-to-speech function
  const speakText = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom align="center">
          Basic Greetings
        </Typography>
        <Typography variant="h6" gutterBottom align="center">
          Score: {currentScore} | Lives: {gameProgress.lives}
        </Typography>
        <Typography variant="body1" align="center" sx={{ mb: 3 }}>
          Match the Spanish words with their English translations. 
          Select one card from each language to make a pair!
        </Typography>

        <Grid container spacing={1.5} sx={{ maxWidth: '1200px', mx: 'auto' }}>
          {gameCards.map((card) => (
            <Grid item xs={6} sm={4} md={3} key={card.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  opacity: matchedPairs.includes(card.greetingId) ? 0.7 : 1,
                  transform: selectedCard?.id === card.id ? 'scale(1.05)' : 'none',
                  transition: 'all 0.2s ease',
                  bgcolor: matchedPairs.includes(card.greetingId) 
                    ? 'success.light' 
                    : selectedCard?.id === card.id 
                    ? 'primary.light'
                    : 'background.paper',
                  '&:hover': {
                    transform: matchedPairs.includes(card.greetingId) ? 'none' : 'scale(1.02)',
                    boxShadow: 3,
                  },
                  height: '100%', // Make all cards the same height
                }}
                onClick={() => handleCardClick(card)}
              >
                <CardContent sx={{ p: 1.5 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mb: card.isSpanish && card.pronunciation ? 1 : 0
                  }}>
                    <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>
                      {card.text}
                    </Typography>
                    {card.isSpanish && (
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          speakText(card.text);
                        }}
                      >
                        <VolumeUpIcon />
                      </IconButton>
                    )}
                  </Box>
                  {card.isSpanish && card.pronunciation && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                      Pronunciation: {card.pronunciation}
                    </Typography>
                  )}
                </CardContent>
              </Card>
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
            ¡Excelente! +10 points
          </Typography>
        </Paper>
      </Fade>

      <Dialog
        open={showGameOver}
        aria-labelledby="game-over-dialog"
        onClose={() => {}} // Empty onClose to prevent closing by clicking outside
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
            onClick={handleRetry}
            sx={{ minWidth: 120 }}
          >
            Try Again
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => window.location.reload()}
            sx={{ minWidth: 120 }}
          >
            Exit Level
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showLevelComplete}
        aria-labelledby="level-complete-dialog"
      >
        <DialogTitle id="level-complete-dialog">
          ¡Felicitaciones! Level Complete!
        </DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            Score: {currentScore}
          </Typography>
          <Typography>
            You've mastered the basic greetings! Ready for the next challenge?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleContinue}
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BasicGreetingsGame; 