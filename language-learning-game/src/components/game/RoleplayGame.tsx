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
  CircularProgress
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
    npcAvatar: 'https://via.placeholder.com/80?text=Waiter',
    sceneImage: 'https://via.placeholder.com/600x200?text=Restaurant+Background'
  },
  {
    npc: 'Perfecto. Síganme, por favor. Aquí tienen el menú.',
    userOptions: [
      { text: 'Gracias. ¿Qué recomienda?', correct: true },
      { text: 'No tengo hambre.', correct: false },
      { text: 'El menú es grande.', correct: false },
    ],
    correctResponseSpeech: 'gracias qué recomienda',
  },
  {
    npc: 'Nuestra paella es muy popular hoy. ¿Quieren pedir bebidas primero?',
    userOptions: [
      { text: 'Sí, dos aguas, por favor.', correct: true },
      { text: 'Quiero la paella.', correct: false },
      { text: 'No, gracias.', correct: false },
    ],
    correctResponseSpeech: 'sí dos aguas por favor',
  },
  {
    npc: '¡Excelente! La conversación termina aquí por ahora.',
    userOptions: [],
    correctResponseSpeech: '',
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
     // Could show a summary screen here
     return (
        <Box sx={{p: 3, textAlign: 'center'}}>
             <Typography variant="h5">Roleplay Complete!</Typography>
             <Typography>Final Score: {score}</Typography>
             <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: 2 }}>
                Back to Home
             </Button>
        </Box>
     )
  }

  return (
    <Box sx={{
        p: { xs: 2, sm: 3 }, 
        maxWidth: 700, 
        mx: 'auto',
        bgcolor: '#ffffff', 
        borderRadius: 2, 
        boxShadow: 3,
        my: 4,
        position: 'relative'
    }}>
        <Button 
            variant="outlined"
            onClick={() => navigate('/')}
            sx={{ 
                position: 'absolute', 
                top: 16, 
                left: 16, 
                zIndex: 10
            }}
        >
             Back to Home
        </Button>

        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ borderBottom: 1, borderColor: 'divider', pb: 1, mb: 2, mt: 4 }}>
            Ordering at a Restaurant
        </Typography>

        {currentStep.sceneImage && (
            <Box component="img"
                src={currentStep.sceneImage}
                alt="Restaurant Background"
                sx={{ width: '100%', height: 'auto', borderRadius: 1, mb: 2 }}
            />
        )}

        {/* Conversation Area */}
        <Box sx={{ mb: 3, p: 2, border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: '#fafafa' }}>
            {/* NPC Dialogue */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
                <Avatar src={currentStep.npcAvatar || 'https://via.placeholder.com/80?text=NPC'} sx={{ width: 50, height: 50 }} />
                <Box sx={{ 
                    bgcolor: '#e9e9eb', 
                    p: '10px 15px', 
                    borderRadius: '15px', 
                    borderTopLeftRadius: 0,
                    maxWidth: '75%'
                }}>
                    <Typography variant="body1">{currentStep.npc}</Typography>
                     <IconButton onClick={() => speak(currentStep.npc)} size="small" sx={{ p: 0, ml: 1 }}>
                        <VolumeUpIcon fontSize="inherit" />
                    </IconButton>
                </Box>
            </Box>

            {/* User Interaction Area */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1.5, mt: 2 }}>
                 {/* User Avatar Placeholder - aligned right */}
                <Avatar src={currentStep.userAvatar || 'https://via.placeholder.com/80?text=User'} sx={{ width: 50, height: 50, alignSelf: 'flex-end' }} />

                {/* Dialogue Options (Buttons) */}
                {renderDialogueOptions()}

                {/* Speech Input Feedback */}
                {inputMethod === 'speak' && isListening && (
                     <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                        <CircularProgress size={20} sx={{ mr: 1 }}/>
                        <Typography>Listening...</Typography>
                        <IconButton onClick={stopListening} color="error" size="small">
                            <StopIcon />
                        </IconButton>
                    </Box>
                )}
                
                {/* Input Toggle Button - only if speech is supported */} 
                {speechApiSupported && currentStep.userOptions.length > 0 && (
                     <Button 
                        variant="outlined"
                        size="small" 
                        onClick={toggleInput} 
                        disabled={isListening} 
                        startIcon={inputMethod === 'tap' ? <MicIcon /> : <KeyboardIcon />}
                        sx={{ mt: 1, borderRadius: '20px' }}
                    >
                        {inputMethod === 'tap' ? 'Speak' : 'Tap'}
                    </Button>
                )}
            </Box>
        </Box>

        {/* Feedback Area */}
        <Typography 
            sx={{
                mt: 2, 
                fontWeight: 'bold', 
                color: feedback.type === 'correct' ? 'success.main' : (feedback.type === 'incorrect' ? 'error.main' : 'text.secondary')
            }}
        >
            {feedback.text}
        </Typography>

        {/* Progress Area */}
        <Typography sx={{ mt: 2, color: 'text.secondary' }}>
            Score: {score}
        </Typography>

    </Box>
  );
};

export default RoleplayGame; 