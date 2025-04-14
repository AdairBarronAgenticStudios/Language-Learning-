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
  IconButton,
  Tooltip,
  Divider,
  Paper,
} from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { useGame } from '../../../contexts/GameContext';

interface Conversation {
  title: string;
  description: string;
  dialogue: {
    spanish: string;
    english: string;
    speaker: 'A' | 'B';
  }[];
}

const conversations: Conversation[] = [
  {
    title: 'Greeting and Introduction',
    description: 'A basic conversation between two people meeting for the first time.',
    dialogue: [
      { speaker: 'A', spanish: '¡Hola! ¿Cómo estás?', english: 'Hello! How are you?' },
      { speaker: 'B', spanish: 'Bien, gracias. ¿Y tú?', english: 'Good, thank you. And you?' },
      { speaker: 'A', spanish: 'Muy bien. Me llamo Ana.', english: 'Very good. My name is Ana.' },
      { speaker: 'B', spanish: 'Mucho gusto. Soy Carlos.', english: 'Nice to meet you. I\'m Carlos.' },
    ],
  },
  {
    title: 'Ordering at a Café',
    description: 'A simple conversation ordering coffee at a café.',
    dialogue: [
      { speaker: 'A', spanish: 'Buenos días. ¿Qué desea?', english: 'Good morning. What would you like?' },
      { speaker: 'B', spanish: 'Un café con leche, por favor.', english: 'A coffee with milk, please.' },
      { speaker: 'A', spanish: '¿Algo más?', english: 'Anything else?' },
      { speaker: 'B', spanish: 'No, gracias. ¿Cuánto es?', english: 'No, thank you. How much is it?' },
      { speaker: 'A', spanish: 'Son tres euros.', english: 'It\'s three euros.' },
    ],
  },
  {
    title: 'Making Plans',
    description: 'Friends making plans to meet up.',
    dialogue: [
      { speaker: 'A', spanish: '¿Quieres ir al cine mañana?', english: 'Do you want to go to the movies tomorrow?' },
      { speaker: 'B', spanish: 'Sí, ¿a qué hora?', english: 'Yes, what time?' },
      { speaker: 'A', spanish: '¿A las siete de la tarde?', english: 'At seven in the evening?' },
      { speaker: 'B', spanish: 'Perfecto. Nos vemos mañana.', english: 'Perfect. See you tomorrow.' },
      { speaker: 'A', spanish: '¡Hasta mañana!', english: 'See you tomorrow!' },
    ],
  },
];

const BasicConversations: React.FC = () => {
  const context = useGame();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [lessonComplete, setLessonComplete] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingLine, setPlayingLine] = useState<number | null>(null);

  const progress = ((currentIndex + 1) / conversations.length) * 100;

  const handleNext = useCallback(() => {
    if (currentIndex < conversations.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowTranslation(false);
      setPlayingLine(null);
    } else {
      setLessonComplete(true);
      if (context) {
        Promise.resolve(context.completeLevel('listening_1', 100))
          .then(() => {
            console.log('Basic conversations lesson completed successfully');
          })
          .catch((error: Error) => {
            console.error('Error completing conversations lesson:', error);
          });
      }
    }
  }, [currentIndex, context]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setShowTranslation(false);
      setPlayingLine(null);
    }
  };

  const handleComplete = useCallback(() => {
    if (context) {
      Promise.resolve(context.completeLevel('listening_1', 100))
        .then(() => {
          console.log('Basic conversations lesson completed successfully');
          window.location.href = '/learn';
        })
        .catch((error: Error) => {
          console.error('Error completing conversations lesson:', error);
          window.location.href = '/learn';
        });
    } else {
      window.location.href = '/learn';
    }
  }, [context]);

  const pronounceText = (text: string, lineIndex: number) => {
    if (isPlaying) return;

    setIsPlaying(true);
    setPlayingLine(lineIndex);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.7;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const spanishVoice = voices.find(voice => 
      voice.lang.startsWith('es') && voice.name.includes('Monica')
    ) || voices.find(voice => 
      voice.lang.startsWith('es')
    );

    if (spanishVoice) {
      utterance.voice = spanishVoice;
    }

    utterance.onend = () => {
      setIsPlaying(false);
      setPlayingLine(null);
    };

    utterance.onerror = () => {
      console.error('Error playing pronunciation');
      setIsPlaying(false);
      setPlayingLine(null);
    };

    window.speechSynthesis.cancel();
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 50);
  };

  const playFullConversation = () => {
    if (isPlaying) return;

    const conversation = conversations[currentIndex];
    let currentLine = 0;

    const playNextLine = () => {
      if (currentLine < conversation.dialogue.length) {
        pronounceText(conversation.dialogue[currentLine].spanish, currentLine);
        currentLine++;
        setTimeout(playNextLine, 3000); // Wait 3 seconds between lines
      }
    };

    playNextLine();
  };

  const currentConversation = conversations[currentIndex];

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Basic Spanish Conversations
        </Typography>
        
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ mb: 4, height: 10, borderRadius: 5 }}
        />

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography variant="h5" component="div" gutterBottom>
                {currentConversation.title}
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {currentConversation.description}
              </Typography>
              <Button
                variant="contained"
                onClick={playFullConversation}
                disabled={isPlaying}
                sx={{ mb: 3 }}
                startIcon={<VolumeUpIcon />}
              >
                Play Full Conversation
              </Button>
              <Divider sx={{ my: 3 }} />
            </Box>

            <Box>
              {currentConversation.dialogue.map((line, index) => (
                <Paper 
                  key={index}
                  elevation={1}
                  sx={{ 
                    p: 2, 
                    mb: 2,
                    backgroundColor: line.speaker === 'A' ? 'primary.light' : 'secondary.light',
                    opacity: playingLine === index ? 0.8 : 1,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Speaker {line.speaker}
                    </Typography>
                    <Tooltip title="Listen">
                      <IconButton
                        onClick={() => pronounceText(line.spanish, index)}
                        disabled={isPlaying}
                        size="small"
                      >
                        <VolumeUpIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {line.spanish}
                  </Typography>
                  {showTranslation && (
                    <Typography color="text.secondary">
                      {line.english}
                    </Typography>
                  )}
                </Paper>
              ))}
            </Box>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="outlined"
                onClick={() => setShowTranslation(!showTranslation)}
                sx={{ mt: 2 }}
              >
                {showTranslation ? 'Hide Translations' : 'Show Translations'}
              </Button>
            </Box>
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
            color="primary"
            onClick={handleNext}
            disabled={lessonComplete}
          >
            {currentIndex < conversations.length - 1 ? 'Next' : 'Complete'}
          </Button>
        </Box>
      </Box>

      <Dialog open={lessonComplete} onClose={handleComplete}>
        <DialogTitle>¡Felicitaciones!</DialogTitle>
        <DialogContent>
          <Typography>
            You've completed the Basic Conversations lesson! You can now understand and follow simple Spanish conversations.
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

export default BasicConversations; 