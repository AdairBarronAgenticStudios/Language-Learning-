import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Avatar,
  IconButton,
  CircularProgress,
  Paper,
  LinearProgress,
  Snackbar,
  Alert,
  Tooltip
} from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useGame } from '../../contexts/GameContext';
import { playSound, pronounceSpanish } from '../../utils/spanishPronunciation';
// Import Layout or other necessary components if needed
// import Layout from '../Layout'; 

// Define interfaces for structure (optional but good practice)
interface UserOption {
  text: string;
  correct: boolean;
  feedback?: string;
  nextStepId?: string; // Add path branching for RPG-style choices
  rewardPoints?: number; // Different options can give different rewards
  correctResponseSpeech?: string; // Add this optional property
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
        nextStepId: 'food-ordered',
        rewardPoints: 10
      },
      { 
        text: 'No, prefiero un vino blanco.', 
        correct: true,
        feedback: 'Expressing your preference is good practice!',
        nextStepId: 'food-ordered',
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

// Replace the Firebase URLs with local paths
// Commented out as it's unused
// const pronunciationAudio: { [key: string]: string } = {
//   '¡Hola! Bienvenidos a "La Mesa Española". ¿Mesa para cuántos?': '/sounds/greeting.mp3',
//   'Mesa para dos, por favor.': '/sounds/mesa_para_dos.mp3',
//   'El camarero les lleva a una mesa cerca de la ventana. "Perfecto. Síganme, por favor. Aquí tienen el menú."': '/sounds/seating.mp3',
//   'Gracias. ¿Qué recomienda?': '/sounds/gracias_recomienda.mp3',
//   'Nuestra paella es muy popular hoy. ¿Quieren pedir bebidas primero?': '/sounds/recommendations.mp3',
//   'Sí, dos aguas, por favor.': '/sounds/aguas_por_favor.mp3',
//   '¡Perfecto! Dos aguas. ¿Están listos para ordenar o necesitan más tiempo?': '/sounds/drinks_ordered.mp3'
// };

const RoleplayGame: React.FC = () => {
  const navigate = useNavigate();
  const context = useGame();
  const [currentStepId, setCurrentStepId] = useState<string>('greeting');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState({ type: '', text: '' });
  const [inputMethod, setInputMethod] = useState<'tap' | 'speak'>('tap');
  const [isListening, setIsListening] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isPronouncing, setIsPronouncing] = useState(false);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const recognitionRef = useRef<any>(null);
  const isMounted = useRef(true);

  const currentStep = conversationSteps.find(step => step.id === currentStepId) || conversationSteps[0];
  const currentStepIndex = conversationSteps.length - 1;
  const totalSteps = conversationSteps.length;
  const progressPercentage = (currentStepIndex / totalSteps) * 100;

  // Commented out as these are unused
  // const currentCharacter = characters.find(c => c.role === 'Waiter');
  // const playerCharacter = characters.find(c => c.id === 'player');

  // --- Function Definitions --- 

  // Needs to be defined early as it's used by handleSpeechResult
  const calculateStringSimilarity = useCallback((str1: string, str2: string): number => {
    const len1 = str1.length;
    const len2 = str2.length;
    if (len1 === 0) return len2 === 0 ? 1 : 0;
    if (len2 === 0) return 0;

    const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(null));

    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;

    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost
            );
        }
    }

    const distance = matrix[len1][len2];
    return 1 - (distance / Math.max(len1, len2));
  }, []);

  // handleCompleteRoleplay needed by handleUserResponse
  const handleCompleteRoleplay = useCallback(async () => {
    if (!isMounted.current) return;
    setFeedback({ type: 'success', text: 'Roleplay completed! Well done!' });
    if (context) {
       context.updateScore(score);
       context.completeLevel('roleplay-restaurant', score);
    } else {
      console.warn('GameContext not available to save progress.');
    }
    playSound.levelComplete();
    setTimeout(() => {
      if (isMounted.current) {
         navigate('/');
      }
    }, 3000);
  }, [navigate, score, context, isMounted]);

  // handleUserResponse needed by handleSpeechResult
  const handleUserResponse = useCallback((correct: boolean, text: string, matchAccuracy?: number) => {
    if (!isMounted.current) return;
    const selectedOption = currentStep?.userOptions.find(option => option.text === text);

    if (correct) {
      playSound.correct();
      setFeedback({ type: 'success', text: selectedOption?.feedback || 'Correct!' });
      if (selectedOption?.rewardPoints && context) {
        context.updateScore(selectedOption.rewardPoints);
        setScore(prev => prev + (selectedOption?.rewardPoints || 0));
      }
      setShowProgressBar(true);
      const nextStepTimer = setTimeout(() => {
        if (!isMounted.current) return;
        const nextId = selectedOption?.nextStepId;
        if (nextId) {
            setCurrentStepId(nextId);
        } else {
            const currentIndex = conversationSteps.findIndex(step => step.id === currentStepId);
            if (currentIndex !== -1 && currentIndex < conversationSteps.length - 1) {
                setCurrentStepId(conversationSteps[currentIndex + 1].id);
            } else {
                handleCompleteRoleplay();
            }
        }
        setFeedback({ type: '', text: '' });
        setShowInput(false);
        setShowProgressBar(false);
      }, 1500);
      return () => clearTimeout(nextStepTimer);

    } else {
        playSound.incorrect();
        setFeedback({ type: 'error', text: selectedOption?.feedback || 'Incorrect. Try again.' });
        setShowInput(true);
    }
  }, [isMounted, currentStep, setCurrentStepId, setFeedback, setScore, context, setShowInput, setShowProgressBar, handleCompleteRoleplay, currentStepId]);

  // handleSpeechResult needed by speech recognition useEffect
  const handleSpeechResult = useCallback((transcript: string) => {
    if (!isMounted.current) return;
    console.log('Speech recognized:', transcript);

    let bestMatch: UserOption | null = null;
    let highestSimilarity = 0;

    if (currentStep) {
        currentStep.userOptions.forEach(option => {
            const targetSpeech = option.correctResponseSpeech || option.text;
            const similarity = calculateStringSimilarity(transcript.toLowerCase(), targetSpeech.toLowerCase());
            console.log(`Comparing "${transcript}" with "${targetSpeech}" -> Similarity: ${similarity}`);
            if (similarity > highestSimilarity) {
                highestSimilarity = similarity;
                bestMatch = option;
            }
        });
    }

    const similarityThreshold = 0.7;
    if (bestMatch && highestSimilarity >= similarityThreshold) {
        const confirmedMatch = bestMatch as UserOption;
        console.log('Match found:', confirmedMatch.text, 'Accuracy:', highestSimilarity);
        handleUserResponse(confirmedMatch.correct, confirmedMatch.text, highestSimilarity);
    } else {
        console.log('No close match found. Highest similarity:', highestSimilarity);
        setFeedback({ type: 'error', text: "I didn't understand clearly. Please try speaking again or tap an option." });
    }
  }, [currentStep, isMounted, setFeedback, handleUserResponse, calculateStringSimilarity]);

  // handlePronunciation needed by auto-pronunciation useEffect
  const handlePronunciation = useCallback((text: string) => {
    if (!isMounted.current) return;
    pronounceSpanish(
      text,
      () => { if (isMounted.current) setIsPronouncing(true); },
      () => { if (isMounted.current) setIsPronouncing(false); }
    ).catch(() => {
      if (isMounted.current) {
        setSnackbarMessage('Failed to pronounce text. Please try again.');
        setSnackbarOpen(true);
        setIsPronouncing(false);
      }
    });
  }, [setSnackbarMessage, setSnackbarOpen, setIsPronouncing]);

  // --- useEffect Hooks ---

  useEffect(() => { // Mount/Unmount cleanup
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => { // Speech recognition setup
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSnackbarMessage('Speech recognition is not supported in this browser.');
      setSnackbarOpen(true);
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;
    recognition.lang = 'es-ES';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (isMounted.current) {
        handleSpeechResult(transcript);
      }
    };

    recognition.onerror = (event: any) => {
       if (isMounted.current) {
          console.error('Speech recognition error:', event.error);
          setSnackbarMessage(`Speech recognition error: ${event.error}`);
          setSnackbarOpen(true);
          setIsListening(false);
       }
    };

    recognition.onend = () => {
      if (isMounted.current) {
        setIsListening(false);
      }
    };

    return () => {
      if (recognitionRef.current) {
          recognitionRef.current.abort();
      }
    };
  }, [handleSpeechResult, setSnackbarMessage, setSnackbarOpen, setIsListening]);

  useEffect(() => { // Auto-pronunciation on step change
    if (currentStep && currentStep.npc && isMounted.current) {
      const timer = setTimeout(() => {
        if (isMounted.current) {
           handlePronunciation(currentStep.npc);
        }
      }, 150);

      return () => clearTimeout(timer);
    }

    // Optional: Clean up synthesis if the step changes before speech finishes
    return () => {
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentStep, handlePronunciation]);

  // This function is used by the mic button component
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const startListening = () => {
    if (!recognitionRef.current) {
      console.error("Speech recognition not initialized.");
      setSnackbarMessage("Speech recognition setup failed. Please refresh.");
      setSnackbarOpen(true);
      return;
    }
    setIsListening(true);
    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error("Error starting speech recognition:", error);
      setSnackbarMessage("Could not start listening. Please try again.");
      setSnackbarOpen(true);
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
    setInputMethod(prev => prev === 'speak' ? 'tap' : 'speak');
    if (isListening) {
      stopListening();
    }
  };

  const handleHintRequest = () => {
    if (!currentStep || !currentStep.correctResponseSpeech) return;
    const correctOption = currentStep.userOptions.find(option => 
        option.correct || 
        option.text === currentStep.correctResponseSpeech || 
        option.correctResponseSpeech === currentStep.correctResponseSpeech
    );

    if (correctOption) {
        setSnackbarMessage(`Hint: Try saying something like "${correctOption.text}"`);
    } else {
        setSnackbarMessage(`Hint: Check the options carefully.`); 
    }
    setSnackbarOpen(true);
  };

  if (currentStep.userOptions.length === 0 || currentStep.id === 'completion') {
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

  const renderUserOptions = () => {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 2 }}>
        {currentStep.userOptions.map((option, index) => (
          <Button
            key={index}
            variant="contained"
            onClick={() => handleUserResponse(option.correct, option.text)}
            sx={{
              bgcolor: '#6C63FF',
              borderRadius: '50px',
              textTransform: 'none',
              fontSize: '1rem',
              py: 1.5,
              px: 3,
              boxShadow: '0 4px 10px rgba(108, 99, 255, 0.2)',
              alignSelf: 'flex-end',
              maxWidth: '80%',
              textAlign: 'left',
              '&:hover': {
                bgcolor: '#5A52E0',
                transform: 'translateY(-2px)',
                transition: 'all 0.2s',
              },
            }}
          >
            {option.text}
          </Button>
        ))}
      </Box>
    );
  };

  const renderFeedback = () => {
    if (!feedback.text) return null;
    
    // Determine colors explicitly
    const isCorrect = feedback.type === 'success';
    const bgColor = isCorrect ? '#e8f5e9' : '#ffebee'; // Light green for correct, light red for incorrect
    const borderColor = isCorrect ? '#4CAF50' : '#f44336'; // Green for correct, red for incorrect
    const textColor = isCorrect ? '#2e7d32' : '#c62828'; // Darker green/red text

    return (
      <Box 
        sx={{ 
          my: 2, 
          p: 2, 
          borderRadius: 2, 
          bgcolor: bgColor, // Use explicit background color
          border: `1px solid ${borderColor}`, // Use explicit border color
          animation: 'fadeIn 0.5s ease-in-out',
          '@keyframes fadeIn': {
            '0%': { opacity: 0, transform: 'translateY(10px)' },
            '100%': { opacity: 1, transform: 'translateY(0)' },
          },
        }}
      >
        <Typography 
          variant="subtitle1" 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            color: textColor, // Use explicit text color
            fontWeight: 'bold',
          }}
        >
          {/* Optionally add icon based on correctness */} 
          {isCorrect ? 
            <EmojiEventsIcon sx={{ fontSize: 20, mr: 1, color: '#FFD700'}} /> :
            <span style={{ width: 20, height: 20, marginRight: '8px' }}></span> // Placeholder space if no icon for incorrect
          }
          {/* Show +10 only if correct? Removed for now to simplify */} 
          {/* {isCorrect && <span style={{ marginRight: '8px' }}>+10</span>} */} 
          {feedback.text}
        </Typography>
      </Box>
    );
  };

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

          {currentStep.sceneImage && (
            <Box
              sx={{
                position: 'relative',
                mb: 3,
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                transition: 'all 0.3s ease-in-out',
                transform: currentStep.type === 'narration' ? 'scale(1.02)' : 'scale(1)',
                height: '280px',
              }}
            >
              <Box 
                component="img"
                src={currentStep.sceneImage}
                alt="Restaurant Scene"
                sx={{ 
                  width: '100%', 
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  display: 'block',
                  borderRadius: 2,
                  transition: 'transform 1s ease',
                  filter: currentStep.type === 'narration' ? 'brightness(0.8)' : 'brightness(1)',
                  '&:hover': {
                    transform: 'scale(1.03)',
                  }
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '100px',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
                  borderRadius: '0 0 8px 8px',
                }}
              />
              
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  left: 16,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  bgcolor: 'rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <Typography 
                  variant="body1" 
                  sx={{
                    color: 'white',
                    textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                    fontWeight: 'bold',
                  }}
                >
                  {currentStep.type === 'narration' ? '📜 ' : '🗣️ '}
                  {locations.find(loc => loc.image === currentStep.sceneImage)?.name || 'Restaurant'}
                </Typography>
              </Box>
              
              <Tooltip 
                title={locations.find(loc => loc.image === currentStep.sceneImage)?.description || 'Restaurant scene'} 
                placement="top"
              >
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    bgcolor: 'rgba(255,255,255,0.3)',
                    backdropFilter: 'blur(4px)',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.5)',
                    }
                  }}
                  size="small"
                >
                  <Box component="span" sx={{ fontSize: '16px' }}>ℹ️</Box>
                </IconButton>
              </Tooltip>
            </Box>
          )}

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
                        <Button
                          onClick={() => handlePronunciation(currentStep.npc)}
                          disabled={isPronouncing}
                          variant="text"
                          size="small"
                          startIcon={isPronouncing ? <CircularProgress size={16} /> : <VolumeUpIcon fontSize="small" />}
                          sx={{
                            mt: 1,
                            borderRadius: '16px',
                            color: '#5E60CE',
                            bgcolor: 'rgba(94, 96, 206, 0.08)',
                            '&:hover': {
                              bgcolor: 'rgba(94, 96, 206, 0.15)',
                            },
                            textTransform: 'none',
                          }}
                        >
                          Listen to pronunciation
                        </Button>
                      )}
                  </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, mt: 3 }}>
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

                  {inputMethod === 'tap' && currentStep.userOptions.length > 0 && (
                    renderUserOptions()
                  )}

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
                  
                  {inputMethod === 'tap' && currentStep.userOptions.length > 0 && (
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

          {renderFeedback()}

          {showInput && (
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