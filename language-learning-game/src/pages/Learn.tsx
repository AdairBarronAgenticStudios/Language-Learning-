import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Dialog,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import Layout from '../components/Layout';
import { LessonType, LanguageLevel } from '../types';
import FamilyVocabulary from '../components/lessons/vocabulary/FamilyVocabulary';
import Professions from '../components/lessons/vocabulary/Professions';
import BasicVerbs from '../components/lessons/grammar/BasicVerbs';
import PastTense from '../components/lessons/grammar/PastTense';
import BasicPronunciation from '../components/lessons/speaking/BasicPronunciation';
import SentencePronunciation from '../components/lessons/speaking/SentencePronunciation';
import BasicConversations from '../components/lessons/listening/BasicConversations';
import DailyConversations from '../components/lessons/listening/DailyConversations';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import { useGame } from '../contexts/GameContext';

interface Lesson {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType;
  level: LanguageLevel;
  prerequisite?: string;
}

const vocabularyLessons: Lesson[] = [
  {
    id: 'vocabulary_1',
    title: 'Family Members',
    description: 'Learn essential vocabulary for family relationships',
    component: FamilyVocabulary,
    level: 'beginner',
  },
  {
    id: 'vocabulary_professions',
    title: 'Professions',
    description: 'Learn vocabulary related to different jobs and careers',
    component: Professions,
    level: 'intermediate',
    prerequisite: 'vocabulary_1',
  },
];

const grammarLessons: Lesson[] = [
  {
    id: 'grammar_1',
    title: 'Basic Verbs',
    description: 'Learn essential Spanish verbs and their conjugations',
    component: BasicVerbs,
    level: 'beginner',
  },
  {
    id: 'grammar_past_tense',
    title: 'Past Tense',
    description: 'Master the Spanish past tense (Pretérito)',
    component: PastTense,
    level: 'intermediate',
    prerequisite: 'grammar_1',
  },
];

const speakingLessons: Lesson[] = [
  {
    id: 'speaking_1',
    title: 'Basic Pronunciation',
    description: 'Learn essential Spanish pronunciation rules and sounds',
    component: BasicPronunciation,
    level: 'beginner',
  },
  {
    id: 'speaking_sentences',
    title: 'Sentence Pronunciation',
    description: 'Practice pronouncing complete Spanish sentences',
    component: SentencePronunciation,
    level: 'intermediate',
    prerequisite: 'speaking_1',
  },
];

const listeningLessons: Lesson[] = [
  {
    id: 'listening_1',
    title: 'Basic Conversations',
    description: 'Practice listening to and understanding simple Spanish conversations',
    component: BasicConversations,
    level: 'beginner',
  },
  {
    id: 'listening_daily',
    title: 'Daily Conversations',
    description: 'Listen and respond to everyday Spanish conversations',
    component: DailyConversations,
    level: 'intermediate',
    prerequisite: 'listening_1',
  },
];

const lessonTypes: { type: LessonType; label: string; description: string }[] = [
  {
    type: 'vocabulary',
    label: 'Vocabulary',
    description: 'Learn new words and phrases with interactive exercises',
  },
  {
    type: 'grammar',
    label: 'Grammar',
    description: 'Master grammar rules and sentence structures',
  },
  {
    type: 'speaking',
    label: 'Speaking',
    description: 'Practice pronunciation and conversation skills',
  },
  {
    type: 'listening',
    label: 'Listening',
    description: 'Improve your listening comprehension',
  },
];

const Learn: React.FC = () => {
  const context = useGame();
  const [selectedLevel, setSelectedLevel] = useState<LanguageLevel>('beginner');
  const [selectedType, setSelectedType] = useState<LessonType | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showLessons, setShowLessons] = useState(false);

  const handleStartLesson = (type: LessonType) => {
    setSelectedType(type);
    setShowLessons(true);
  };

  const handleSelectLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setShowLessons(false);
  };

  const handleBackToLessons = () => {
    setSelectedLesson(null);
    setSelectedType(null);
  };

  const isLessonCompleted = (lessonId: string) => {
    return context?.gameProgress.completedLevels.includes(lessonId) || false;
  };

  const isLessonUnlocked = (lesson: Lesson) => {
    return true;
  };

  if (selectedLesson) {
    const LessonComponent = selectedLesson.component;
    return (
      <Layout>
        <Box sx={{ py: 4 }}>
          <Box sx={{ mb: 2 }}>
            <Button onClick={handleBackToLessons} variant="outlined">
              Back to Lessons
            </Button>
          </Box>
          <LessonComponent />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title="Learning Mode">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Choose Your Learning Path
        </Typography>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Select your level:
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {(['beginner', 'intermediate', 'advanced'] as LanguageLevel[]).map((level) => (
              <Chip
                key={level}
                label={level.charAt(0).toUpperCase() + level.slice(1)}
                onClick={() => setSelectedLevel(level)}
                color={selectedLevel === level ? 'primary' : 'default'}
                variant={selectedLevel === level ? 'filled' : 'outlined'}
              />
            ))}
          </Box>
        </Box>

        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          gap: 3 
        }}>
          {lessonTypes.map(({ type, label, description }) => (
            <Card 
              key={type}
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  boxShadow: 6,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="h2" gutterBottom>
                  {label}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {description}
                </Typography>
              </CardContent>
              <Box sx={{ p: 2, pt: 0 }}>
                <Button 
                  variant="contained" 
                  fullWidth
                  onClick={() => handleStartLesson(type)}
                >
                  Start Lesson
                </Button>
              </Box>
            </Card>
          ))}
        </Box>

        <Dialog 
          open={showLessons} 
          onClose={() => setShowLessons(false)}
          maxWidth="sm"
          fullWidth
        >
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Available Lessons
            </Typography>
            <List>
              {((selectedType === 'vocabulary' ? vocabularyLessons : 
                 selectedType === 'grammar' ? grammarLessons :
                 selectedType === 'speaking' ? speakingLessons :
                 selectedType === 'listening' ? listeningLessons : []))
                .filter(lesson => lesson.level === selectedLevel)
                .map(lesson => {
                  const completed = isLessonCompleted(lesson.id);
                  const unlocked = isLessonUnlocked(lesson);
                  
                  return (
                    <ListItem 
                      key={lesson.id}
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        mb: 1,
                        opacity: unlocked ? 1 : 0.7,
                      }}
                    >
                      <ListItemText
                        primary={lesson.title}
                        secondary={lesson.description}
                      />
                      <ListItemIcon>
                        {completed ? (
                          <CheckCircleIcon color="success" />
                        ) : unlocked ? null : (
                          <LockIcon color="disabled" />
                        )}
                      </ListItemIcon>
                      <Button
                        variant="contained"
                        onClick={() => handleSelectLesson(lesson)}
                        disabled={!unlocked}
                      >
                        {completed ? 'Review' : 'Start'}
                      </Button>
                    </ListItem>
                  );
                })}
                {!['vocabulary', 'grammar', 'speaking', 'listening'].includes(selectedType || '') && (
                  <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 3 }}>
                    Lessons for {selectedType} will be coming soon!
                  </Typography>
                )}
                {['vocabulary', 'grammar', 'speaking', 'listening'].includes(selectedType || '') && 
                 (selectedType === 'vocabulary' ? vocabularyLessons :
                  selectedType === 'grammar' ? grammarLessons :
                  selectedType === 'speaking' ? speakingLessons :
                  listeningLessons)
                   .filter(lesson => lesson.level === selectedLevel).length === 0 && (
                  <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 3 }}>
                    No {selectedType} lessons available for this level yet. More coming soon!
                  </Typography>
                )}
            </List>
          </Box>
        </Dialog>
      </Box>
    </Layout>
  );
};

export default Learn; 