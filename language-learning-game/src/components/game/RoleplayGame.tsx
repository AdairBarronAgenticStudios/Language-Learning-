import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
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
  Paper,
  LinearProgress,
  Snackbar,
  Alert,
  Tooltip,
  useMediaQuery,
  useTheme
} from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { GameContext } from '../../contexts/GameContext';
// Import Layout or other necessary components if needed
// import Layout from '../Layout'; 

// Define interfaces for structure (optional but good practice)
interface UserOption {
  text: string;
  correct: boolean;
  feedback?: string;
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
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [inputMethod, setInputMethod] = useState<'tap' | 'speak'>('tap');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [speechApiSupported, setSpeechApiSupported] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showProgressBar, setShowProgressBar] = useState(false);
  const recognitionRef = useRef<any>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const gameContext = useContext(GameContext);

  const currentStep = conversationSteps[currentStepIndex];
  const totalSteps = conversationSteps.length;
  const progressPercentage = (currentStepIndex / totalSteps) * 100;

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechApiSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'es-ES';  // Spanish language

      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setTranscript(transcript);
        handleSpeechResult(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        if (event.error === 'no-speech') {
          setSnackbarMessage('No speech detected. Please try again.');
          setSnackbarOpen(true);
        } else {
          console.error('Speech recognition error', event.error);
          setSnackbarMessage(`Error: ${event.error}. Please try tapping instead.`);
          setSnackbarOpen(true);
        }
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Function to speak text using speech synthesis
  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.9;  // Slightly slower for language learning
    
    // Get Spanish voice if available
    const voices = window.speechSynthesis.getVoices();
    const spanishVoice = voices.find(voice => voice.lang.includes('es'));
    if (spanishVoice) {
      utterance.voice = spanishVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  }, []);

  // Speaking effect for NPC text when step changes
  useEffect(() => {
    if (currentStep && currentStep.npc) {
      // Small delay to ensure component is rendered
      const timer = setTimeout(() => {
        speak(currentStep.npc);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentStep, speak]);

  const startListening = () => {
    setIsListening(true);
    setTranscript('');
    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error("Recognition error:", error);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const toggleInput = () => {
    if (inputMethod === 'tap') {
      setInputMethod('speak');
      startListening();
    } else {
      setInputMethod('tap');
      stopListening();
    }
  };

  const handleSpeechResult = (transcript: string) => {
    const lowerTranscript = transcript.toLowerCase().trim();
    
    // Find the closest match among options
    let bestMatch: UserOption | null = null;
    let highestSimilarity = 0;
    
    for (const option of currentStep.userOptions) {
      const similarity = calculateStringSimilarity(lowerTranscript, option.text.toLowerCase());
      if (similarity > highestSimilarity && similarity > 0.6) { // Threshold of 60% similarity
        highestSimilarity = similarity;
        bestMatch = option;
      }
    }
    
    if (bestMatch) {
      handleUserResponse(bestMatch.correct, bestMatch.text, highestSimilarity);
    } else {
      setFeedback({ 
        type: 'incorrect', 
        text: "I didn't understand. Please try again or select an option." 
      });
      setShowHint(true);
    }
  };

  // Simple string similarity calculation (Levenshtein distance based)
  const calculateStringSimilarity = (str1: string, str2: string): number => {
    const len1 = str1.length;
    const len2 = str2.length;
    
    // If either string is empty, return 0
    if (len1 === 0 || len2 === 0) return 0;
    
    // Normalize the strings (remove accents, etc.)
    const normalizedStr1 = str1.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const normalizedStr2 = str2.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    // Check if one string contains the other
    if (normalizedStr1.includes(normalizedStr2) || normalizedStr2.includes(normalizedStr1)) {
      return 0.8; // High similarity if one is substring of the other
    }
    
    // Simple word matching (check if key words match)
    const words1 = normalizedStr1.split(/\s+/);
    const words2 = normalizedStr2.split(/\s+/);
    
    let matchingWords = 0;
    for (const word1 of words1) {
      if (word1.length > 2) { // Only consider words with more than 2 characters
        for (const word2 of words2) {
          if (word2.length > 2 && word1 === word2) {
            matchingWords++;
            break;
          }
        }
      }
    }
    
    // Calculate similarity based on matching words
    const totalUniqueWords = new Set([...words1, ...words2]).size;
    return matchingWords / totalUniqueWords;
  };

  const handleUserResponse = (correct: boolean, text: string, matchAccuracy?: number) => {
    // Find the selected option to get potential custom feedback
    const selectedOption = currentStep.userOptions.find(option => option.text === text);
    
    if (correct) {
      // Calculate score based on speech recognition accuracy if applicable
      const pointsEarned = matchAccuracy ? Math.round(10 * matchAccuracy) : 10;
      setScore(prevScore => prevScore + pointsEarned);
      
      setFeedback({ 
        type: 'correct', 
        text: selectedOption?.feedback || '¡Correcto! Muy bien.' 
      });
      
      // Speak the correct response if available
      if (currentStep.correctResponseSpeech) {
        speak(currentStep.correctResponseSpeech);
      }
      
      // Show progress animation before moving to next step
      setShowProgressBar(true);
      setTimeout(() => {
        setCurrentStepIndex(prevIndex => prevIndex + 1);
        setFeedback({ type: '', text: '' });
        setShowHint(false);
        setShowProgressBar(false);
      }, 1500);
    } else {
      setFeedback({ 
        type: 'incorrect', 
        text: selectedOption?.feedback || 'Incorrect. Try again.' 
      });
      setShowHint(true);
    }
    
    // Reset speech recognition if active
    if (isListening) {
      stopListening();
      if (inputMethod === 'speak') {
        // Restart listening after a short delay
        setTimeout(() => {
          startListening();
        }, 1500);
      }
    }
  };

  const handleHintRequest = () => {
    const correctOption = currentStep.userOptions.find(option => option.correct);
    if (correctOption) {
      setSnackbarMessage(`Hint: ${correctOption.text}`);
      setSnackbarOpen(true);
    }
  };

  const handleCompleteRoleplay = async () => {
    if (gameContext) {
      try {
        // Complete the roleplay level with the final score
        await gameContext.completeLevel('roleplay_restaurant', score);
        // Show success message
        setSnackbarMessage('Progress saved successfully!');
        setSnackbarOpen(true);
      } catch (error) {
        console.error('Error saving progress:', error);
      }
    }
    // Navigate back to home after a short delay
    setTimeout(() => {
      navigate('/');
    }, 1500);
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
            animation: 'fadeIn 0.5s ease-in-out',
            '@keyframes fadeIn': {
              '0%': { opacity: 0, transform: 'translateY(20px)' },
              '100%': { opacity: 1, transform: 'translateY(0)' },
            },
          }}
        >
             <EmojiEventsIcon sx={{ fontSize: 60, color: '#FFD700', mb: 2 }} />
             <Typography variant="h4" sx={{ color: '#2E7D32', mb: 2 }}>¡Felicidades!</Typography>
             <Typography variant="h5" sx={{ mb: 3 }}>Roleplay Complete!</Typography>
             <Typography variant="h6" sx={{ mb: 4 }}>Final Score: {score}/{conversationSteps.length * 10}</Typography>
             
             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 300, mx: 'auto' }}>
               <Button 
                 variant="contained" 
                 onClick={handleCompleteRoleplay} 
                 sx={{ 
                   px: 4,
                   py: 1.5,
                   borderRadius: '28px',
                   background: 'linear-gradient(45deg, #5E60CE 30%, #4ECDC4 90%)',
                   boxShadow: '0 3px 5px 2px rgba(94, 96, 206, .3)',
                   '&:hover': {
                     background: 'linear-gradient(45deg, #4244A0 30%, #3AAEA6 90%)',
                     transform: 'translateY(-2px)',
                   },
                   transition: 'all 0.2s ease',
                 }}
               >
                  Continue
               </Button>
               
               <Button 
                 variant="outlined" 
                 onClick={() => {
                   setCurrentStepIndex(0);
                   setScore(0);
                   setFeedback({ type: '', text: '' });
                 }}
                 sx={{ 
                   borderRadius: '28px',
                   borderWidth: 2,
                   borderColor: '#5E60CE',
                   color: '#5E60CE',
                   '&:hover': {
                     borderWidth: 2,
                     bgcolor: 'rgba(94, 96, 206, 0.05)',
                   }
                 }}
               >
                  Try Again
               </Button>
             </Box>
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
          {/* Progress bar showing conversation progress */}
          <LinearProgress 
            variant="determinate" 
            value={progressPercentage} 
            sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              height: 5,
              bgcolor: 'rgba(94, 96, 206, 0.1)',
              '& .MuiLinearProgress-bar': {
                bgcolor: showProgressBar ? '#4ECDC4' : '#5E60CE',
                transition: showProgressBar ? 'transform 1.2s ease-in-out' : 'none',
              }
            }} 
          />
          
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
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Step {currentStepIndex + 1} of {conversationSteps.length}
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
                      animation: 'fadeIn 0.3s ease-in-out',
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
                      <Tooltip title="Listen to pronunciation">
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
                          aria-label="Listen to pronunciation"
                        >
                            <VolumeUpIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
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
                                  maxWidth: isMobile ? '100%' : '85%',
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
                  
                  {/* Input Method Toggle Button */}
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
                  visibility: feedback.text ? 'visible' : 'hidden',
                  height: '2rem',
                  mt: 2.5, 
                  mb: 1.5,
                  fontWeight: 'bold', 
                  textAlign: 'center',
                  fontSize: '1.1rem',
                  color: feedback.type === 'correct' ? 'success.main' : (feedback.type === 'incorrect' ? 'error.main' : 'text.secondary'),
                  textShadow: feedback.type === 'correct' ? '0 1px 4px rgba(6, 214, 160, 0.2)' : (feedback.type === 'incorrect' ? '0 1px 4px rgba(239, 71, 111, 0.2)' : 'none'),
                  animation: feedback.text ? 'fadeIn 0.3s ease-in-out' : 'none',
              }}
          >
              {feedback.text}
          </Typography>

          {/* Hint button - appears after incorrect answers */}
          {showHint && (
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Button 
                variant="text" 
                size="small" 
                onClick={handleHintRequest}
                sx={{ 
                  color: 'text.secondary',
                  fontSize: '0.9rem',
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.05)',
                  }
                }}
              >
                Need a hint?
              </Button>
            </Box>
          )}

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
      
      {/* Snackbar for hints and notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="info" 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default RoleplayGame; 