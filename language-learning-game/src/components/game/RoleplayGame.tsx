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
  nextStepId?: string; // Add path branching for RPG-style choices
  rewardPoints?: number; // Different options can give different rewards
}

interface Character {
  id: string;
  name: string;
  role: string;
  avatar: string;
  mood?: 'happy' | 'neutral' | 'sad' | 'angry'; // Character moods
}

interface SceneLocation {
  id: string;
  name: string;
  image: string;
  description: string;
}

interface ConversationStep {
  id: string; // Unique ID for this step
  type: 'dialogue' | 'choice' | 'narration' | 'challenge'; // Different types of steps
  npc: string;
  userOptions: UserOption[];
  correctResponseSpeech?: string;
  npcAvatar?: string;
  userAvatar?: string;
  sceneImage?: string;
  backgroundAudio?: string; // Optional background sounds
  mood?: 'happy' | 'neutral' | 'sad' | 'angry'; // NPC's mood
  requiredItems?: string[]; // Items needed to unlock this step
  rewards?: { xp: number, items?: string[] }; // Rewards for completing this step
}

// Character definitions
const characters: Character[] = [
  {
    id: 'waiter',
    name: 'Carlos',
    role: 'Waiter',
    avatar: 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80',
    mood: 'happy'
  },
  {
    id: 'player',
    name: 'You',
    role: 'Customer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80'
  }
];

// Scene locations
const locations: SceneLocation[] = [
  {
    id: 'restaurant-entrance',
    name: 'Restaurant Entrance',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    description: 'The entrance of a cozy Spanish restaurant'
  },
  {
    id: 'restaurant-table',
    name: 'Your Table',
    image: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    description: 'A nicely set table with menus'
  },
  {
    id: 'ordering-drinks',
    name: 'Ordering Drinks',
    image: 'https://images.unsplash.com/photo-1515669097368-22e68427d265?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    description: 'The waiter is ready to take your drink order'
  },
  {
    id: 'meal-served',
    name: 'Meal Service',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    description: 'Your delicious meal has arrived'
  }
];

// Enhanced conversation steps with branching paths
const conversationSteps: ConversationStep[] = [
  {
    id: 'greeting',
    type: 'dialogue',
    npc: '¡Hola! Bienvenidos a "La Mesa Española". ¿Mesa para cuántos?',
    userOptions: [
      { 
        text: 'Mesa para dos, por favor.', 
        correct: true, 
        feedback: '¡Excelente pronunciación!',
        nextStepId: 'seating',
        rewardPoints: 10
      },
      { 
        text: 'Quiero comer algo.', 
        correct: false,
        feedback: 'That\'s not quite right for this situation. Try asking for a table.'
      },
      { 
        text: 'Buenas noches.', 
        correct: false,
        feedback: 'That\'s a greeting, but not an answer to the waiter\'s question.'
      },
    ],
    correctResponseSpeech: 'mesa para dos por favor',
    npcAvatar: 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80',
    sceneImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    mood: 'happy',
    rewards: { xp: 5 }
  },
  {
    id: 'seating',
    type: 'narration',
    npc: 'El camarero les lleva a una mesa cerca de la ventana. "Perfecto. Síganme, por favor. Aquí tienen el menú."',
    userOptions: [
      { 
        text: 'Gracias. ¿Qué recomienda?', 
        correct: true,
        feedback: '¡Muy bien! Asking for recommendations is a great way to start.',
        nextStepId: 'recommendations',
        rewardPoints: 10
      },
      { 
        text: 'No tengo hambre.', 
        correct: false,
        feedback: 'That\'s a bit odd after asking for a table at a restaurant!'
      },
      { 
        text: 'El menú es grande.', 
        correct: false,
        feedback: 'True, but that doesn\'t continue the conversation naturally.'
      },
    ],
    correctResponseSpeech: 'gracias qué recomienda',
    npcAvatar: 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80',
    sceneImage: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    mood: 'happy',
    rewards: { xp: 5 }
  },
  {
    id: 'recommendations',
    type: 'dialogue',
    npc: 'Nuestra paella es muy popular hoy. ¿Quieren pedir bebidas primero?',
    userOptions: [
      { 
        text: 'Sí, dos aguas, por favor.', 
        correct: true,
        feedback: '¡Perfecto! Ordering drinks is usually first.',
        nextStepId: 'drinks-ordered',
        rewardPoints: 10
      },
      { 
        text: 'Una botella de vino tinto, por favor.', 
        correct: true,
        feedback: '¡Excelente elección! Wine is a great choice with Spanish food.',
        nextStepId: 'wine-choice',
        rewardPoints: 10 
      },
      { 
        text: 'No, gracias. Queremos ordenar ya.', 
        correct: true,
        feedback: 'You\'ve decided to skip drinks and order food directly.',
        nextStepId: 'food-order',
        rewardPoints: 5
      },
    ],
    correctResponseSpeech: 'sí dos aguas por favor',
    npcAvatar: 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80',
    sceneImage: 'https://images.unsplash.com/photo-1515669097368-22e68427d265?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    mood: 'neutral',
    rewards: { xp: 10 }
  },
  {
    id: 'drinks-ordered',
    type: 'dialogue',
    npc: '¡Perfecto! Dos aguas. ¿Están listos para ordenar o necesitan más tiempo?',
    userOptions: [
      { 
        text: 'Estamos listos. Yo quiero la paella, por favor.', 
        correct: true,
        feedback: 'Great ordering! You\'re getting the hang of this.',
        nextStepId: 'food-ordered',
        rewardPoints: 15
      },
      { 
        text: 'Necesitamos más tiempo, por favor.', 
        correct: true,
        feedback: 'It\'s always fine to ask for more time.',
        nextStepId: 'more-time',
        rewardPoints: 10
      }
    ],
    correctResponseSpeech: 'estamos listos yo quiero la paella por favor',
    npcAvatar: 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80',
    sceneImage: 'https://images.unsplash.com/photo-1515669097368-22e68427d265?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    mood: 'happy',
    rewards: { xp: 10 }
  },
  {
    id: 'wine-choice',
    type: 'dialogue',
    npc: 'Tenemos un Rioja excelente. ¿Les gustaría probarlo?',
    userOptions: [
      { 
        text: 'Sí, por favor. Suena bien.', 
        correct: true,
        feedback: 'Good choice! Rioja is a famous Spanish wine region.',
        nextStepId: 'food-order',
        rewardPoints: 10
      },
      { 
        text: 'No, prefiero un vino blanco.', 
        correct: true,
        feedback: 'Expressing your preference is good practice!',
        nextStepId: 'white-wine',
        rewardPoints: 10
      }
    ],
    correctResponseSpeech: 'sí por favor suena bien',
    npcAvatar: 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80',
    sceneImage: 'https://images.unsplash.com/photo-1515669097368-22e68427d265?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    mood: 'happy',
    rewards: { xp: 15 }
  },
  {
    id: 'food-order',
    type: 'dialogue',
    npc: '¿Qué les gustaría comer hoy?',
    userOptions: [
      { 
        text: 'Yo quiero la paella, por favor.', 
        correct: true,
        feedback: '¡Buena elección! Paella is a classic Spanish dish.',
        nextStepId: 'food-ordered',
        rewardPoints: 10
      },
      { 
        text: 'Me gustaría probar las tapas variadas.', 
        correct: true,
        feedback: '¡Excelente! Tapas are perfect for trying different Spanish flavors.',
        nextStepId: 'tapas-ordered',
        rewardPoints: 10
      }
    ],
    correctResponseSpeech: 'yo quiero la paella por favor',
    npcAvatar: 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80',
    sceneImage: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    mood: 'neutral',
    rewards: { xp: 10 }
  },
  {
    id: 'food-ordered',
    type: 'dialogue',
    npc: '¡Excelente elección! Su paella estará lista en unos 20 minutos. ¿Desean algo más mientras esperan?',
    userOptions: [
      { 
        text: 'No, gracias. Está bien así.', 
        correct: true,
        feedback: 'Good response. Now you\'ll wait for your food.',
        nextStepId: 'food-arrives',
        rewardPoints: 5
      },
      { 
        text: '¿Tiene pan con aceite de oliva?', 
        correct: true,
        feedback: 'Great! Asking for bread with olive oil is very Spanish.',
        nextStepId: 'bread-ordered',
        rewardPoints: 15
      }
    ],
    correctResponseSpeech: 'no gracias está bien así',
    npcAvatar: 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80',
    sceneImage: 'https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    mood: 'happy',
    rewards: { xp: 10 }
  },
  {
    id: 'food-arrives',
    type: 'narration',
    npc: 'Después de un tiempo, el camarero regresa con su comida. "¡Aquí tienen! Una paella recién hecha. ¡Buen provecho!"',
    userOptions: [
      { 
        text: 'Muchas gracias. Se ve delicioso.', 
        correct: true,
        feedback: 'Perfect! Thanking the server and complimenting the food is always good.',
        nextStepId: 'eating',
        rewardPoints: 10
      },
      { 
        text: '¿Puede traer más servilletas, por favor?', 
        correct: true,
        feedback: 'Good job asking for napkins - very practical!',
        nextStepId: 'napkins',
        rewardPoints: 10
      }
    ],
    correctResponseSpeech: 'muchas gracias se ve delicioso',
    npcAvatar: 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80',
    sceneImage: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    mood: 'happy',
    rewards: { xp: 15 }
  },
  {
    id: 'eating',
    type: 'dialogue',
    npc: '¿Cómo está la comida? ¿Todo bien?',
    userOptions: [
      { 
        text: 'Está delicioso, gracias.', 
        correct: true,
        feedback: 'Excellent! You\'ve completed a successful restaurant interaction!',
        nextStepId: 'completion',
        rewardPoints: 15
      },
      { 
        text: 'Está un poco salado.', 
        correct: true,
        feedback: 'Good vocabulary! You\'re expressing that it\'s a bit salty.',
        nextStepId: 'complaint',
        rewardPoints: 10
      }
    ],
    correctResponseSpeech: 'está delicioso gracias',
    npcAvatar: 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80',
    sceneImage: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    mood: 'happy',
    rewards: { xp: 15 }
  },
  {
    id: 'completion',
    type: 'narration',
    npc: '¡Excelente! Has completado el escenario del restaurante. Tu español está mejorando mucho!',
    userOptions: [],
    correctResponseSpeech: '',
    npcAvatar: 'https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80',
    sceneImage: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    mood: 'happy',
    rewards: { xp: 25 }
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
  const [currentStepId, setCurrentStepId] = useState('greeting');
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

  // Find current step based on ID
  const currentStep = conversationSteps.find(step => step.id === currentStepId) || conversationSteps[0];
  const currentStepIndex = conversationSteps.findIndex(step => step.id === currentStepId);
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
      const pointsEarned = selectedOption?.rewardPoints || 
                          (matchAccuracy ? Math.round(10 * matchAccuracy) : 10);
      
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
        // Follow the conversation path if specified, otherwise go to next step
        if (selectedOption?.nextStepId) {
          setCurrentStepId(selectedOption.nextStepId);
        } else {
          // Default linear progression (legacy behavior)
          setCurrentStepIndex(prevIndex => prevIndex + 1);
        }
        
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

  // Check if we've reached the end of the conversation
  const isGameComplete = currentStep.userOptions.length === 0 || currentStep.id === 'completion';
  
  if (isGameComplete) {
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
                   setCurrentStepId('greeting');
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
          maxWidth: 800, 
          mx: 'auto',
          bgcolor: '#ffffff', 
          borderRadius: 2, 
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
          mt: 4,
          position: 'relative',
          overflow: 'hidden',
          background: `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url(${currentStep.sceneImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backdropFilter: 'blur(5px)',
          transition: 'all 0.5s ease-in-out',
        }}
      >
          {/* RPG-style player stats bar */}
          <Box sx={{
            position: 'absolute',
            top: 5,
            right: 5,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            bgcolor: 'rgba(0,0,0,0.6)',
            color: 'white',
            px: 2,
            py: 1,
            borderRadius: 16,
            fontSize: '0.9rem',
            zIndex: 5,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <EmojiEventsIcon sx={{ fontSize: 18, mr: 0.5, color: '#FFD700' }} />
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{score}</Typography>
            </Box>
          </Box>
          
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
          
          {/* Scene title with location information */}
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
            
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              alignItems: 'center',
              gap: 1,
            }}>
              <Typography variant="body2" color="text.secondary">
                {currentStep.type === 'narration' ? 'Narration' : 'Dialogue'} {currentStepIndex + 1} of {conversationSteps.length}
              </Typography>
              {currentStep.type === 'narration' && (
                <Tooltip title="Narration describes the scene">
                  <Box sx={{ 
                    bgcolor: 'secondary.main', 
                    color: 'white', 
                    px: 1, 
                    borderRadius: 1,
                    fontSize: '0.7rem'
                  }}>
                    SCENE
                  </Box>
                </Tooltip>
              )}
            </Box>
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
                transition: 'all 0.3s ease-in-out',
                transform: currentStep.type === 'narration' ? 'scale(1.05)' : 'scale(1)',
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
                  transition: 'transform 0.5s ease',
                  filter: currentStep.type === 'narration' ? 'brightness(0.7)' : 'brightness(1)',
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
              
              {/* Show location name on the image */}
              <Typography 
                variant="body2" 
                sx={{
                  position: 'absolute',
                  bottom: 10,
                  left: 10,
                  color: 'white',
                  textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: 'rgba(0,0,0,0.5)',
                  backdropFilter: 'blur(4px)',
                }}
              >
                {currentStep.type === 'narration' ? '📜' : '🗣️'} {
                  locations.find(loc => loc.image === currentStep.sceneImage)?.name || 'Restaurant'
                }
              </Typography>
            </Box>
          )}

          {/* Conversation Area - enhanced with paper effect and better shadows */}
          <Paper 
            elevation={3}
            sx={{ 
              mb: 3, 
              p: 3, 
              borderRadius: 2, 
              bgcolor: currentStep.type === 'narration' ? 'rgba(253, 245, 230, 0.9)' : '#F8F9FA',
              position: 'relative',
              transition: 'all 0.3s ease-in-out',
              backgroundImage: currentStep.type === 'narration' 
                ? 'linear-gradient(to right, rgba(0,0,0,0.03) 0px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.03) 0px, transparent 1px)'
                : 'none',
              backgroundSize: '20px 20px',
              border: currentStep.type === 'narration' ? '1px solid rgba(139, 69, 19, 0.2)' : 'none',
            }}
          >
              {/* NPC Dialogue - enhanced with better avatars and speech bubbles */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
                  <Avatar 
                    src={currentStep.npcAvatar || characters.find(c => c.id === 'waiter')?.avatar} 
                    sx={{ 
                      width: 56, 
                      height: 56,
                      border: '2px solid #fff',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    }} 
                  />
                  <Box sx={{ 
                      bgcolor: currentStep.type === 'narration' ? 'rgba(222, 184, 135, 0.3)' : '#e9e9eb', 
                      p: '12px 18px', 
                      borderRadius: '18px', 
                      borderTopLeftRadius: 0,
                      maxWidth: '85%',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      position: 'relative',
                      animation: 'fadeIn 0.3s ease-in-out',
                      borderLeft: currentStep.type === 'narration' ? '3px solid rgba(139, 69, 19, 0.3)' : 'none',
                      fontStyle: currentStep.type === 'narration' ? 'italic' : 'normal',
                  }}>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontWeight: currentStep.type === 'narration' ? 400 : 500,
                          lineHeight: 1.6,
                          color: currentStep.type === 'narration' ? 'text.secondary' : 'text.primary',
                        }}
                      >
                        {currentStep.npc}
                      </Typography>
                      {currentStep.type !== 'narration' && (
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
                      )}
                  </Box>
              </Box>

              {/* User Interaction Area - with enhanced visuals */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, mt: 3 }}>
                   {/* User Avatar - enhanced with better styling */}
                  <Avatar 
                    src={currentStep.userAvatar || characters.find(c => c.id === 'player')?.avatar} 
                    sx={{ 
                      width: 56, 
                      height: 56, 
                      alignSelf: 'flex-end',
                      border: '2px solid #fff',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      opacity: currentStep.type === 'narration' ? 0.7 : 1,
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
                                  bgcolor: option.correct ? '#5E60CE' : '#7678ED',
                                  boxShadow: '0 3px 8px rgba(94, 96, 206, 0.3)',
                                  '&:hover': {
                                    bgcolor: option.correct ? '#4244A0' : '#5658CD',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 5px 12px rgba(94, 96, 206, 0.4)',
                                  },
                                  transition: 'all 0.2s ease',
                                  position: 'relative',
                                  pl: option.rewardPoints ? 4.5 : 2.5, // Extra padding for reward indicator
                                }}
                            >
                                {option.rewardPoints && option.rewardPoints > 5 && (
                                  <Box sx={{
                                    position: 'absolute',
                                    left: 8,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#FFD700', 
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold'
                                  }}>
                                    +{option.rewardPoints}
                                  </Box>
                                )}
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

          {/* XP Progress Bar */}
          <Box 
            sx={{ 
              display: 'flex',
              flexDirection: 'column',
              mt: 3,
              py: 1.5,
              borderTop: '1px solid rgba(0,0,0,0.1)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">XP Level</Typography>
              <Typography variant="caption" color="primary" fontWeight="bold">{score}/100</Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={(score % 100)} 
              sx={{ 
                height: 8, 
                borderRadius: 4,
                bgcolor: 'rgba(94, 96, 206, 0.1)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #5E60CE 0%, #4ECDC4 100%)',
                  borderRadius: 4,
                }
              }} 
            />
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