import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Grid, Button } from '@mui/material';
import { useGame } from '../../contexts/GameContext';

interface Word {
  id: string;
  original: string;
  translation: string;
}

interface VocabularyGameProps {
  words: Word[];
  onComplete: (score: number) => void;
  difficulty?: 'easy' | 'medium' | 'hard';
}

const VocabularyGame: React.FC<VocabularyGameProps> = ({
  words,
  onComplete,
  difficulty = 'easy'
}) => {
  const { updateScore, updateLives } = useGame();
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedTranslation, setSelectedTranslation] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);
  const [shuffledTranslations, setShuffledTranslations] = useState<string[]>([]);
  const [score, setScore] = useState(0);

  // Shuffle translations when game starts
  useEffect(() => {
    setShuffledTranslations(
      words.map(w => w.translation).sort(() => Math.random() - 0.5)
    );
  }, [words]);

  const handleWordClick = (word: Word) => {
    if (matchedPairs.includes(word.id)) return;
    setSelectedWord(word.id);
  };

  const handleTranslationClick = (translation: string) => {
    if (!selectedWord) return;

    setSelectedTranslation(translation);
    const selectedWordObj = words.find(w => w.id === selectedWord);

    if (selectedWordObj?.translation === translation) {
      // Correct match
      setMatchedPairs(prev => [...prev, selectedWord]);
      setScore(prev => prev + 10);
      updateScore(10);

      // Check if game is complete
      if (matchedPairs.length + 1 === words.length) {
        onComplete(score + 10);
      }
    } else {
      // Incorrect match
      updateLives(-1);
    }

    // Reset selection
    setTimeout(() => {
      setSelectedWord(null);
      setSelectedTranslation(null);
    }, 1000);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom align="center">
        Match the Words
      </Typography>
      
      <Typography variant="h6" gutterBottom>
        Score: {score}
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={6}>
          {words.map(word => (
            <Button
              key={word.id}
              fullWidth
              variant={selectedWord === word.id ? 'contained' : 'outlined'}
              sx={{
                my: 1,
                opacity: matchedPairs.includes(word.id) ? 0.5 : 1,
                bgcolor: matchedPairs.includes(word.id) ? 'success.light' : undefined
              }}
              onClick={() => handleWordClick(word)}
              disabled={matchedPairs.includes(word.id)}
            >
              {word.original}
            </Button>
          ))}
        </Grid>

        <Grid item xs={6}>
          {shuffledTranslations.map((translation, index) => (
            <Button
              key={index}
              fullWidth
              variant={selectedTranslation === translation ? 'contained' : 'outlined'}
              sx={{
                my: 1,
                opacity: words.some(w => w.translation === translation && matchedPairs.includes(w.id)) ? 0.5 : 1,
                bgcolor: words.some(w => w.translation === translation && matchedPairs.includes(w.id)) 
                  ? 'success.light' 
                  : undefined
              }}
              onClick={() => handleTranslationClick(translation)}
              disabled={words.some(w => w.translation === translation && matchedPairs.includes(w.id))}
            >
              {translation}
            </Button>
          ))}
        </Grid>
      </Grid>
    </Paper>
  );
};

export default VocabularyGame; 