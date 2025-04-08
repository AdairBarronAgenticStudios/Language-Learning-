import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  date?: Date;
}

export interface GameProgress {
  currentLevel: number;
  totalScore: number;
  lives: number;
  achievements: Achievement[];
  unlockedLevels: string[];
  streak: number;
  lastPlayed: Date;
  completedLevels: string[];
}

interface GameContextType {
  gameProgress: GameProgress;
  updateScore: (points: number) => void;
  updateLives: (change: number) => void;
  unlockLevel: (levelId: string) => void;
  completeLevel: (levelId: string, score: number) => void;
  resetProgress: () => void;
}

const defaultGameProgress: GameProgress = {
  currentLevel: 1,
  totalScore: 0,
  lives: 3,
  achievements: [],
  unlockedLevels: ['level1'],
  streak: 0,
  lastPlayed: new Date(),
  completedLevels: [],
};

const GameContext = createContext<GameContextType | null>(null);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [gameProgress, setGameProgress] = useState<GameProgress>(defaultGameProgress);
  const { currentUser } = useAuth();

  // Load user's game progress from Firestore
  useEffect(() => {
    const loadGameProgress = async () => {
      if (!currentUser) return;

      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.gameProgress) {
            setGameProgress(data.gameProgress);
          } else {
            // Initialize gameProgress if it doesn't exist
            await setDoc(userDocRef, { gameProgress: defaultGameProgress }, { merge: true });
            setGameProgress(defaultGameProgress);
          }
        } else {
          // Create new user document with default game progress
          await setDoc(userDocRef, {
            email: currentUser.email,
            createdAt: new Date(),
            gameProgress: defaultGameProgress
          });
          setGameProgress(defaultGameProgress);
        }
      } catch (error) {
        console.error('Error loading game progress:', error);
      }
    };

    loadGameProgress();
  }, [currentUser]);

  // Save progress to Firestore whenever it changes
  useEffect(() => {
    const saveProgress = async () => {
      if (!currentUser) return;

      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await setDoc(userDocRef, { gameProgress }, { merge: true });
      } catch (error) {
        console.error('Error saving game progress:', error);
      }
    };

    saveProgress();
  }, [gameProgress, currentUser]);

  const updateScore = (points: number) => {
    setGameProgress(prev => ({
      ...prev,
      totalScore: prev.totalScore + points
    }));
  };

  const updateLives = (change: number) => {
    setGameProgress(prev => ({
      ...prev,
      lives: Math.max(0, Math.min(3, prev.lives + change))
    }));
  };

  const unlockLevel = (levelId: string) => {
    setGameProgress(prev => ({
      ...prev,
      unlockedLevels: [...prev.unlockedLevels, levelId]
    }));
  };

  const completeLevel = async (levelId: string, score: number) => {
    const nextLevelId = `level${parseInt(levelId.replace('level', '')) + 1}`;
    const newProgress = {
      ...gameProgress,
      totalScore: gameProgress.totalScore + score,
      unlockedLevels: gameProgress.unlockedLevels.includes(nextLevelId) 
        ? gameProgress.unlockedLevels 
        : [...gameProgress.unlockedLevels, nextLevelId],
      completedLevels: gameProgress.completedLevels.includes(levelId)
        ? gameProgress.completedLevels
        : [...gameProgress.completedLevels, levelId],
    };
    
    setGameProgress(newProgress);

    // If user is logged in, save to Firestore
    if (currentUser) {
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, { gameProgress: newProgress });
      } catch (error) {
        console.error('Error saving game progress:', error);
      }
    }
  };

  const resetProgress = () => {
    setGameProgress(defaultGameProgress);
  };

  const value = {
    gameProgress,
    updateScore,
    updateLives,
    unlockLevel,
    completeLevel,
    resetProgress
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export default GameContext; 