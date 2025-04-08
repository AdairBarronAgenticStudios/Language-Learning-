import React from 'react';
import {
  Container,
  Typography,
  Box,
} from '@mui/material';
import { useGame } from '../contexts/GameContext';
import Layout from '../components/Layout';

const GameHub: React.FC = () => {
  return (
    <Layout>
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Game Mode
        </Typography>
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Coming Soon!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            New interactive games are being developed. Check back soon for exciting language learning games!
          </Typography>
        </Box>
      </Container>
    </Layout>
  );
};

export default GameHub; 