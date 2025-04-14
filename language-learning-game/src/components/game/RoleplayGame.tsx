import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Avatar,
  IconButton,
  CircularProgress,
  Paper
} from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import KeyboardIcon from '@mui/icons-material/Keyboard';
// Import Layout or other necessary components if needed
// import Layout from '../Layout'; 

// Define interfaces for structure (optional but good practice)
interface UserOption {
  text: string;
  correct: boolean;
}

interface ConversationStep {
  npc: string;
  userOptions: UserOption[];
  correctResponseSpeech: string;
  npcAvatar?: string; // Optional: specific avatar per step
  userAvatar?: string;
  sceneImage?: string;
}

const conversationSteps: ConversationStep[] = [
  {
    npc: '¡Hola! Bienvenidos. ¿Mesa para cuántos?',
    userOptions: [
      { text: 'Mesa para dos, por favor.', correct: true },
      { text: 'Quiero comer algo.', correct: false },
      { text: 'Buenas noches.', correct: false },
    ],
    correctResponseSpeech: 'mesa para dos por favor',
    npcAvatar: 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80',
    sceneImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'
  },
  {
    npc: 'Perfecto. Síganme, por favor. Aquí tienen el menú.',
    userOptions: [
      { text: 'Gracias. ¿Qué recomienda?', correct: true },
      { text: 'No tengo hambre.', correct: false },
      { text: 'El menú es grande.', correct: false },
    ],
    correctResponseSpeech: 'gracias qué recomienda',
    npcAvatar: 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80',
    sceneImage: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'
  },
  {
    npc: 'Nuestra paella es muy popular hoy. ¿Quieren pedir bebidas primero?',
    userOptions: [
      { text: 'Sí, dos aguas, por favor.', correct: true },
      { text: 'Quiero la paella.', correct: false },
      { text: 'No, gracias.', correct: false },
    ],
    correctResponseSpeech: 'sí dos aguas por favor',
    npcAvatar: 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80',
    sceneImage: 'https://images.unsplash.com/photo-1515669097368-22e68427d265?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'
  },
  {
    npc: '¡Excelente! La conversación termina aquí por ahora.',
    userOptions: [],
    correctResponseSpeech: '',
    npcAvatar: 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80',
    sceneImage: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'
  }
];

// Speech Recognition instance type definition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const RoleplayGame: React.FC = () => {
  const navigate = useNavigate();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState({ text: '', type: '' }); // type: 'correct' | 'incorrect'
  const [inputMethod, setInputMethod] = useState<'tap' | 'speak'>('tap');
  const [isListening, setIsListening] = useState(false);
  const [speechApiSupported, setSpeechApiSupported] = useState(true);
  const recognitionRef = useRef<any>(null); // To hold the SpeechRecognition instance
  const synthesis = window.speechSynthesis;

  const currentStep = conversationSteps[currentStepIndex];

  // --- Text-to-Speech Hook ---
  const speak = useCallback((text: string) => {
    if (!synthesis) {
        console.warn('Speech Synthesis not supported');
        return;
    }
    synthesis.cancel(); // Cancel previous speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.9;
    const voices = synthesis.getVoices();
    const spanishVoice = voices.find(voice => voice.lang.startsWith('es'));
    if (spanishVoice) {
        utterance.voice = spanishVoice;
    }
    synthesis.speak(utterance);
  }, [synthesis]);

  // --- Initialize Step --- 
  useEffect(() => {
    if (currentStepIndex < conversationSteps.length) {
      speak(currentStep.npc);
      setFeedback({ text: '', type: '' }); // Clear feedback on new step
    }
  }, [currentStepIndex, currentStep.npc, speak]);

  // --- Speech Recognition Setup ---
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech Recognition not supported');
      setSpeechApiSupported(false);
      setInputMethod('tap'); // Force tap if not supported
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;
    recognition.lang = 'es-ES';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const speechResult = event.results[0][0].transcript.toLowerCase().trim();
      console.log('Speech recognized:', speechResult);
      handleUserResponse(null, speechResult);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setFeedback({ text: `Speech error: ${event.error}`, type: 'incorrect' });
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      console.log('Speech recognition ended.');
    };
    
    // Preload voices for synthesis
    synthesis?.getVoices();

    // Cleanup function
    return () => {
      recognition?.abort();
      synthesis?.cancel();
    };
  }, [synthesis]); // Run only once on mount

  // --- Handlers ---
  const handleUserResponse = useCallback((isCorrectOption: boolean | null, responseText: string) => {
    const correctSpeech = currentStep.correctResponseSpeech;
    let isCorrect = false;

    if (inputMethod === 'speak') {
        const normalizedResponse = responseText.toLowerCase().replace(/[.,¡!¿?]/g, '').trim();
        isCorrect = normalizedResponse === correctSpeech;
        console.log(`Comparing speech: '${normalizedResponse}' vs '${correctSpeech}' -> ${isCorrect}`);
    } else {
        isCorrect = isCorrectOption ?? false;
    }

    if (isCorrect) {
        setFeedback({ text: '¡Correcto!', type: 'correct' });
        setScore(prev => prev + 10);
        // Delay moving to next step
        setTimeout(() => {
            if (currentStepIndex < conversationSteps.length - 1) {
                setCurrentStepIndex(prev => prev + 1);
            } else {
                // Handle roleplay completion
                 setFeedback({ text: 'Roleplay Complete! ¡Buen trabajo!', type: 'correct' });
            }
        }, 1200);
    } else {
        setFeedback({ text: 'Inténtalo de nuevo.', type: 'incorrect' });
    }
  }, [currentStepIndex, currentStep.correctResponseSpeech, inputMethod]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        setFeedback({ text: 'Listening...', type: '' });
        console.log('Speech recognition started.');
      } catch (e) {
        console.error('Error starting recognition:', e);
        setIsListening(false);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      console.log('Speech recognition stopped.');
    }
  }, [isListening]);

  const toggleInput = () => {
    if (inputMethod === 'tap') {
        setInputMethod('speak');
        startListening();
    } else {
        setInputMethod('tap');
        stopListening();
    }
  };

  // --- Render Logic ---
  const renderDialogueOptions = () => {
    if (inputMethod === 'speak' || currentStep.userOptions.length === 0) {
        return null; // Don't show buttons if speaking or no options
    }
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end', width: '100%' }}>
            {currentStep.userOptions.map((option, index) => (
                <Button
                    key={index}
                    variant="contained"
                    onClick={() => handleUserResponse(option.correct, option.text)}
                    sx={{ borderRadius: '20px', textTransform: 'none', maxWidth: '80%' }}
                >
                    {option.text}
                </Button>
            ))}
        </Box>
    );
  };

  if (currentStepIndex >= conversationSteps.length) {
     return (
        <Box 
          sx={{
            p: 4, 
            textAlign: 'center',
            maxWidth: 700,
            mx: 'auto',
            borderRadius: 2,
            boxShadow: 3,
            mt: 4,
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url(https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
             <Typography variant="h4" sx={{ color: '#2E7D32', mb: 2 }}>¡Felicidades!</Typography>
             <Typography variant="h5" sx={{ mb: 3 }}>Roleplay Complete!</Typography>
             <Typography variant="h6" sx={{ mb: 4 }}>Final Score: {score}</Typography>
             <Button 
               variant="contained" 
               onClick={() => navigate('/')} 
               sx={{ 
                 mt: 2,
                 px: 4,
                 py: 1.5,
                 borderRadius: '28px',
                 background: 'linear-gradient(45deg, #5E60CE 30%, #4ECDC4 90%)',
                 boxShadow: '0 3px 5px 2px rgba(94, 96, 206, .3)',
                 '&:hover': {
                   background: 'linear-gradient(45deg, #4244A0 30%, #3AAEA6 90%)',
                 }
               }}
             >
                Back to Home
             </Button>
        </Box>
     )
  }

  return (
    <>
      <Box 
        sx={{
          p: { xs: 2, sm: 4 }, 
          maxWidth: 700, 
          mx: 'auto',
          bgcolor: '#ffffff', 
          borderRadius: 2, 
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
          mt: 4,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
          {/* Title with gradient background */}
          <Box 
            sx={{ 
              borderRadius: '12px 12px 0 0',
              mb: 3,
              pb: 2,
              textAlign: 'center',
              position: 'relative',
              borderBottom: '1px solid rgba(0,0,0,0.1)',
            }}
          >
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom 
              sx={{ 
                fontWeight: 700,
                color: '#333',
                textShadow: '0 1px 2px rgba(0,0,0,0.1)',
              }}
            >
              Ordering at a Restaurant
            </Typography>
          </Box>

          {/* Scene image with overlay and fade effect */}
          {currentStep.sceneImage && (
            <Box
              sx={{
                position: 'relative',
                mb: 3,
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              }}
            >
              <Box 
                component="img"
                src={currentStep.sceneImage}
                alt="Restaurant Scene"
                sx={{ 
                  width: '100%', 
                  height: '200px',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  display: 'block',
                  borderRadius: 2,
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.02)',
                  }
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '80px',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
                  borderRadius: '0 0 8px 8px',
                }}
              />
            </Box>
          )}

          {/* Conversation Area - enhanced with paper effect and better shadows */}
          <Paper 
            elevation={3}
            sx={{ 
              mb: 3, 
              p: 3, 
              borderRadius: 2, 
              bgcolor: '#F8F9FA',
              position: 'relative'
            }}
          >
              {/* NPC Dialogue - enhanced with better avatars and speech bubbles */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
                  <Avatar 
                    src={currentStep.npcAvatar || 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80'} 
                    sx={{ 
                      width: 56, 
                      height: 56,
                      border: '2px solid #fff',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    }} 
                  />
                  <Box sx={{ 
                      bgcolor: '#e9e9eb', 
                      p: '12px 18px', 
                      borderRadius: '18px', 
                      borderTopLeftRadius: 0,
                      maxWidth: '75%',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      position: 'relative',
                  }}>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: 500,
                          lineHeight: 1.5,
                        }}
                      >
                        {currentStep.npc}
                      </Typography>
                      <IconButton 
                        onClick={() => speak(currentStep.npc)} 
                        size="small" 
                        sx={{ 
                          p: 1, 
                          ml: 1,
                          bgcolor: 'rgba(0,0,0,0.05)',
                          '&:hover': {
                            bgcolor: 'rgba(0,0,0,0.1)',
                          }
                        }}
                      >
                          <VolumeUpIcon fontSize="small" />
                      </IconButton>
                  </Box>
              </Box>

              {/* User Interaction Area - with enhanced visuals */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, mt: 3 }}>
                   {/* User Avatar - enhanced with better styling */}
                  <Avatar 
                    src={currentStep.userAvatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80'} 
                    sx={{ 
                      width: 56, 
                      height: 56, 
                      alignSelf: 'flex-end',
                      border: '2px solid #fff',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    }} 
                  />

                  {/* Dialogue Options - with enhanced button styling */}
                  {inputMethod === 'tap' && currentStep.userOptions.length > 0 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, alignItems: 'flex-end', width: '100%' }}>
                        {currentStep.userOptions.map((option, index) => (
                            <Button
                                key={index}
                                variant="contained"
                                onClick={() => handleUserResponse(option.correct, option.text)}
                                sx={{ 
                                  borderRadius: '24px', 
                                  textTransform: 'none', 
                                  maxWidth: '85%',
                                  py: 1.2,
                                  px: 2.5,
                                  bgcolor: '#5E60CE',
                                  boxShadow: '0 3px 8px rgba(94, 96, 206, 0.3)',
                                  '&:hover': {
                                    bgcolor: '#4244A0',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 5px 12px rgba(94, 96, 206, 0.4)',
                                  },
                                  transition: 'all 0.2s ease',
                                }}
                            >
                                {option.text}
                            </Button>
                        ))}
                    </Box>
                  )}

                  {/* Speech Input Feedback - with enhanced styling */}
                  {inputMethod === 'speak' && isListening && (
                       <Box sx={{ 
                         display: 'flex', 
                         alignItems: 'center', 
                         color: 'text.secondary',
                         bgcolor: 'rgba(0,0,0,0.05)',
                         px: 2,
                         py: 1,
                         borderRadius: 4,
                         boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                       }}>
                          <CircularProgress size={24} sx={{ mr: 2, color: '#5E60CE' }}/>
                          <Typography sx={{ fontWeight: 500 }}>Listening...</Typography>
                          <IconButton onClick={stopListening} color="error" size="small" sx={{ ml: 1 }}>
                              <StopIcon />
                          </IconButton>
                      </Box>
                  )}
                  
                  {/* Input Toggle Button - with enhanced styling */} 
                  {speechApiSupported && currentStep.userOptions.length > 0 && (
                       <Button 
                          variant="outlined"
                          size="medium" 
                          onClick={toggleInput} 
                          disabled={isListening} 
                          startIcon={inputMethod === 'tap' ? <MicIcon /> : <KeyboardIcon />}
                          sx={{ 
                            mt: 1.5, 
                            borderRadius: '24px',
                            borderWidth: 2,
                            px: 2.5,
                            py: 1,
                            borderColor: '#5E60CE',
                            color: '#5E60CE',
                            '&:hover': {
                              borderWidth: 2,
                              bgcolor: 'rgba(94, 96, 206, 0.05)',
                              transform: 'translateY(-2px)',
                            },
                            transition: 'all 0.2s ease',
                          }}
                      >
                          {inputMethod === 'tap' ? 'Speak' : 'Tap'}
                      </Button>
                  )}
              </Box>
          </Paper>

          {/* Feedback Area - with enhanced styling */}
          <Typography 
              sx={{
                  mt: 2.5, 
                  mb: 1.5,
                  fontWeight: 'bold', 
                  textAlign: 'center',
                  fontSize: '1.1rem',
                  color: feedback.type === 'correct' ? 'success.main' : (feedback.type === 'incorrect' ? 'error.main' : 'text.secondary'),
                  textShadow: feedback.type === 'correct' ? '0 1px 4px rgba(6, 214, 160, 0.2)' : (feedback.type === 'incorrect' ? '0 1px 4px rgba(239, 71, 111, 0.2)' : 'none'),
              }}
          >
              {feedback.text}
          </Typography>

          {/* Progress Area - with enhanced styling */}
          <Box 
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mt: 3,
              py: 1.5,
              borderTop: '1px solid rgba(0,0,0,0.1)',
            }}
          >
            <Typography 
              sx={{ 
                color: '#5E60CE',
                fontWeight: 700,
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              Score: <Box component="span" sx={{ ml: 1, fontSize: '1.3rem' }}>{score}</Box>
            </Typography>
          </Box>

      </Box>

      {/* Back button - enhanced with better styling */}
      <Box sx={{ textAlign: 'center', mt: 3, mb: 5 }}>
        <Button 
            variant="outlined"
            onClick={() => navigate('/')}
            sx={{
              borderRadius: '24px',
              borderWidth: 2,
              px: 4,
              py: 1.2,
              borderColor: '#5E60CE',
              color: '#5E60CE',
              fontSize: '1rem',
              '&:hover': {
                borderWidth: 2,
                bgcolor: 'rgba(94, 96, 206, 0.05)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.2s ease',
            }}
        >
             Back to Home
        </Button>
      </Box>
    </>
  );
};

export default RoleplayGame; 