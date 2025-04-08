import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import Layout from '../components/Layout';
import BasicGreetingsGame from '../components/game/BasicGreetingsGame';
import ColorsGame from '../components/game/ColorsGame';

interface PracticeSection {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType;
}

const practiceSections: PracticeSection[] = [
  {
    id: 'greetings',
    title: 'Basic Greetings',
    description: 'Practice common Spanish greetings and introductions',
    component: BasicGreetingsGame
  },
  {
    id: 'colors',
    title: 'Colors',
    description: 'Practice Spanish colors with visual aids',
    component: ColorsGame
  }
];

const Practice: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const handleBackToSections = () => {
    setSelectedSection(null);
  };

  if (selectedSection) {
    const currentSection = practiceSections.find(section => section.id === selectedSection);
    if (currentSection) {
      const SectionComponent = currentSection.component;
      return (
        <Layout>
          <Box sx={{ py: 4 }}>
            <Box sx={{ mb: 2 }}>
              <Button onClick={handleBackToSections} variant="outlined">
                Back to Practice Sections
              </Button>
            </Box>
            <SectionComponent />
          </Box>
        </Layout>
      );
    }
  }

  return (
    <Layout title="Practice Mode">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Practice Sections
        </Typography>

        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          },
          gap: 3,
          maxWidth: '1200px',
          mx: 'auto',
          mt: 4
        }}>
          {practiceSections.map(({ id, title, description }) => (
            <Card 
              key={id}
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
                  {title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {description}
                </Typography>
              </CardContent>
              <Box sx={{ p: 2, pt: 0 }}>
                <Button 
                  variant="contained" 
                  fullWidth
                  onClick={() => setSelectedSection(id)}
                >
                  Start Practice
                </Button>
              </Box>
            </Card>
          ))}
        </Box>
      </Box>
    </Layout>
  );
};

export default Practice; 