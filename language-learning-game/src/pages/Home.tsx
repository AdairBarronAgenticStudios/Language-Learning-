import React from 'react';
import { 
  Typography, 
  Button, 
  Box, 
  Paper,
  Grid,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import SchoolIcon from '@mui/icons-material/School';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <Box sx={{ 
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 200px)',
      }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h2" component="h1" gutterBottom>
            Welcome to Language Learning Game
          </Typography>
          <Typography variant="h5" color="text.secondary" paragraph>
            Master a new language through interactive exercises, games, and fun challenges
          </Typography>
          
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ 
                p: 3, 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}>
                <Box sx={{ flex: 1 }}>
                  <SportsEsportsIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Game Mode
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Learn through fun interactive games and earn rewards
                  </Typography>
                </Box>
                <Button 
                  variant="contained" 
                  size="large"
                  fullWidth
                  onClick={() => navigate('/practice')}
                >
                  Play Now
                </Button>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ 
                p: 3, 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}>
                <Box sx={{ flex: 1 }}>
                  <SchoolIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Learning Mode
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Structured lessons and interactive exercises
                  </Typography>
                </Box>
                <Button 
                  variant="contained" 
                  size="large"
                  fullWidth
                  onClick={() => navigate('/learn')}
                >
                  Start Learning
                </Button>
              </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ 
                p: 3, 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}>
                <Box sx={{ flex: 1 }}>
                  <FitnessCenterIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Practice Mode
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Test your skills with various exercises
                  </Typography>
                </Box>
                <Button 
                  variant="contained" 
                  size="large"
                  fullWidth
                  onClick={() => navigate('/practice')}
                >
                  Practice Now
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Layout>
  );
};

export default Home; 