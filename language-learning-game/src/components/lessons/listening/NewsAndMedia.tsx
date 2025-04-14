import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useGame } from '../../../contexts/GameContext';

const newsSegments = [
  {
    title: 'Reportaje sobre el Cambio Climático',
    transcript: [
      { speaker: 'Reportera', text: 'El cambio climático sigue siendo una preocupación global.' },
      { speaker: 'Científica', text: 'Las temperaturas han aumentado significativamente en la última década.' },
      { speaker: 'Reportera', text: '¿Qué medidas podemos tomar para reducir nuestro impacto?' },
      { speaker: 'Científica', text: 'Es fundamental reducir las emisiones de carbono y usar energías renovables.' },
    ],
    questions: [
      {
        text: '¿Cuál es el tema principal del reportaje?',
        options: [
          'La contaminación del aire',
          'El cambio climático',
          'Las energías renovables',
          'La temperatura global',
        ],
        correctAnswer: 1,
      },
      {
        text: '¿Qué solución propone la científica?',
        options: [
          'Plantar más árboles',
          'Usar menos plástico',
          'Reducir emisiones y usar energías renovables',
          'Reciclar más',
        ],
        correctAnswer: 2,
      },
    ],
  },
  {
    title: 'Entrevista sobre Tecnología',
    transcript: [
      { speaker: 'Entrevistador', text: '¿Cómo ha evolucionado la inteligencia artificial?' },
      { speaker: 'Experto', text: 'La IA está transformando todos los sectores de la industria.' },
      { speaker: 'Entrevistador', text: '¿Qué impacto tendrá en el empleo?' },
      { speaker: 'Experto', text: 'Creará nuevos trabajos mientras automatiza otros.' },
    ],
    questions: [
      {
        text: '¿Qué tema se discute en la entrevista?',
        options: [
          'El futuro del internet',
          'La inteligencia artificial',
          'Los robots industriales',
          'La automatización',
        ],
        correctAnswer: 1,
      },
      {
        text: '¿Qué dice el experto sobre el empleo?',
        options: [
          'Todos perderán sus trabajos',
          'No habrá cambios',
          'Se crearán nuevos trabajos y otros se automatizarán',
          'Aumentará el desempleo',
        ],
        correctAnswer: 2,
      },
    ],
  },
  {
    title: 'Noticias Culturales',
    transcript: [
      { speaker: 'Presentadora', text: 'El festival de cine latino celebra su vigésimo aniversario.' },
      { speaker: 'Director', text: 'Este año presentamos más de cien películas de toda América Latina.' },
      { speaker: 'Presentadora', text: '¿Cuál es el tema central del festival?' },
      { speaker: 'Director', text: 'La diversidad cultural y las historias indígenas contemporáneas.' },
    ],
    questions: [
      {
        text: '¿Qué celebra el festival?',
        options: [
          'Su primer año',
          'Su décimo aniversario',
          'Su vigésimo aniversario',
          'Su trigésimo aniversario',
        ],
        correctAnswer: 2,
      },
      {
        text: '¿Cuál es el enfoque del festival este año?',
        options: [
          'Comedias románticas',
          'Películas de acción',
          'Diversidad cultural e historias indígenas',
          'Documentales históricos',
        ],
        correctAnswer: 2,
      },
    ],
  },
];

const NewsAndMedia: React.FC = () => {
  const context = useGame();
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showTranscript, setShowTranscript] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [showComplete, setShowComplete] = useState(false);

  useEffect(() => {
    if (currentSegmentIndex >= newsSegments.length) {
      setShowComplete(true);
      if (context) {
        context.completeLevel('listening_news', score);
      }
    }
  }, [currentSegmentIndex, score, context]);

  const handleShowTranscript = () => {
    setShowTranscript(true);
  };

  const handleCheck = () => {
    if (selectedAnswer === currentSegment.questions[currentQuestionIndex].correctAnswer) {
      setScore(prev => prev + 1);
    }
    setShowAnswer(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < currentSegment.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setCurrentSegmentIndex(prev => prev + 1);
      setCurrentQuestionIndex(0);
    }
    setSelectedAnswer(null);
    setShowAnswer(false);
    setShowTranscript(false);
  };

  const handleContinue = async () => {
    try {
      setShowComplete(false);
      window.location.href = '/learn';
    } catch (error) {
      console.error('Error completing level:', error);
    }
  };

  if (currentSegmentIndex >= newsSegments.length) {
    return null;
  }

  const currentSegment = newsSegments[currentSegmentIndex];
  const currentQuestion = currentSegment.questions[currentQuestionIndex];

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Spanish News and Media
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {currentSegment.title}
          </Typography>

          {showTranscript ? (
            <Box sx={{ mb: 3 }}>
              {currentSegment.transcript.map((line, index) => (
                <Typography key={index} variant="body1" gutterBottom>
                  <strong>{line.speaker}:</strong> {line.text}
                </Typography>
              ))}
            </Box>
          ) : (
            <Button
              variant="outlined"
              color="primary"
              onClick={handleShowTranscript}
              sx={{ mb: 3 }}
            >
              Show Transcript
            </Button>
          )}

          <Typography variant="h6" gutterBottom>
            Question {currentQuestionIndex + 1}:
          </Typography>
          <Typography variant="body1" gutterBottom>
            {currentQuestion.text}
          </Typography>

          <FormControl component="fieldset">
            <RadioGroup
              value={selectedAnswer}
              onChange={(e) => setSelectedAnswer(Number(e.target.value))}
            >
              {currentQuestion.options.map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={index}
                  control={<Radio />}
                  label={option}
                  disabled={showAnswer}
                />
              ))}
            </RadioGroup>
          </FormControl>

          {showAnswer && (
            <Box sx={{ mt: 2 }}>
              <Typography
                color={selectedAnswer === currentQuestion.correctAnswer ? 'success.main' : 'error.main'}
              >
                {selectedAnswer === currentQuestion.correctAnswer
                  ? '¡Correcto!'
                  : `Incorrect. The correct answer is: ${currentQuestion.options[currentQuestion.correctAnswer]}`}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        {!showAnswer ? (
          <Button
            variant="contained"
            color="primary"
            onClick={handleCheck}
            disabled={selectedAnswer === null}
          >
            Check Answer
          </Button>
        ) : (
          <Button variant="contained" color="primary" onClick={handleNext}>
            Next
          </Button>
        )}
      </Box>

      <Dialog open={showComplete} onClose={() => {}}>
        <DialogTitle>Lesson Complete!</DialogTitle>
        <DialogContent>
          <Typography>
            Congratulations! You've completed the News and Media lesson.
            Score: {score}/{newsSegments.length * 2}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleContinue} color="primary">
            Continue
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NewsAndMedia; 