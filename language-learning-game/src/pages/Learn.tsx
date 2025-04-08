import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
} from '@mui/material';
import Layout from '../components/Layout';
import { LessonType, LanguageLevel } from '../types';

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
  const [selectedLevel, setSelectedLevel] = useState<LanguageLevel>('beginner');

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
                  onClick={() => console.log(`Start ${type} lesson`)}
                >
                  Start Lesson
                </Button>
              </Box>
            </Card>
          ))}
        </Box>
      </Box>
    </Layout>
  );
};

export default Learn; 