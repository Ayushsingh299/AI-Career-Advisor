import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Grid,
  Paper,
} from '@mui/material';
import {
  PlayArrow,
  Assessment,
  Psychology,
  WorkOutline,
  School,
  CheckCircle,
  Star,
  TrendingUp,
  AttachMoney,
  LocationOn,
} from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

interface DemoStep {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const DEMO_STEPS: DemoStep[] = [
  {
    title: 'Skills Assessment',
    description: 'AI analyzes your responses',
    icon: <Assessment />,
  },
  {
    title: 'AI Processing',
    description: 'Gemini AI generates insights',
    icon: <Psychology />,
  },
  {
    title: 'Career Matching',
    description: 'Find your perfect roles',
    icon: <WorkOutline />,
  },
  {
    title: 'Learning Path',
    description: 'Personalized growth plan',
    icon: <School />,
  },
];

const SAMPLE_ASSESSMENT_DATA = [
  { questionId: 1, answer: 'JavaScript' },
  { questionId: 2, answer: 8 },
  { questionId: 3, answer: 'Small teams (2-4)' },
  { questionId: 4, answer: 'I want to become a senior developer and eventually lead a team' },
  { questionId: 5, answer: ['React', 'Node.js', 'TypeScript', 'Git'] },
];

const Demo: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [demoResults, setDemoResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const runDemo = async () => {
    setIsProcessing(true);
    setError(null);
    setCurrentStep(0);

    try {
      // Step 1: Skills Assessment
      setCurrentStep(1);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 2: AI Processing
      setCurrentStep(2);
      const response = await axios.post(`${API_BASE_URL}/api/v1/assessments`, {
        answers: SAMPLE_ASSESSMENT_DATA,
      });

      // Step 3: Career Matching
      setCurrentStep(3);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 4: Learning Path
      setCurrentStep(4);
      await new Promise(resolve => setTimeout(resolve, 800));

      setDemoResults(response.data.data);
    } catch (error) {
      console.error('Demo failed:', error);
      setError('Demo failed - running in offline mode with sample data');
      
      // Fallback demo data
      setDemoResults({
        skillLevels: [
          { skill: 'JavaScript', level: 85, category: 'Programming' },
          { skill: 'React', level: 75, category: 'Programming' },
          { skill: 'Problem Solving', level: 90, category: 'Soft Skills' },
          { skill: 'Teamwork', level: 80, category: 'Soft Skills' },
        ],
        recommendedCareers: [
          {
            title: 'Senior Frontend Developer',
            match: 92,
            description: 'Strong JavaScript and React skills align perfectly',
            salaryRange: '$90,000 - $130,000',
            missingSkills: ['TypeScript', 'Testing']
          },
          {
            title: 'Full Stack Developer',
            match: 85,
            description: 'Frontend skills are strong, backend complements well',
            salaryRange: '$95,000 - $140,000',
            missingSkills: ['Databases', 'API Design']
          },
        ],
        aiPowered: false
      });
      setCurrentStep(4);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetDemo = () => {
    setCurrentStep(0);
    setDemoResults(null);
    setError(null);
    setIsProcessing(false);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          🤖 AI Career Advisor Live Demo
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Experience the complete AI-powered career discovery process
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Watch as our Gemini AI analyzes skills, matches careers, and creates personalized learning paths
        </Typography>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Demo Progress
          </Typography>
          <Stepper activeStep={currentStep} alternativeLabel sx={{ mt: 2, mb: 3 }}>
            {DEMO_STEPS.map((step, index) => (
              <Step key={index}>
                <StepLabel
                  StepIconComponent={() => (
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        backgroundColor: 
                          index < currentStep 
                            ? 'success.main' 
                            : index === currentStep && isProcessing
                            ? 'primary.main'
                            : 'grey.300',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                      }}
                    >
                      {index < currentStep ? (
                        <CheckCircle />
                      ) : index === currentStep && isProcessing ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        step.icon
                      )}
                    </Box>
                  )}
                >
                  <Typography variant="subtitle2">{step.title}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {step.description}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box sx={{ textAlign: 'center' }}>
            {!isProcessing && !demoResults && (
              <Button
                variant="contained"
                size="large"
                startIcon={<PlayArrow />}
                onClick={runDemo}
                sx={{ px: 4, py: 1.5 }}
              >
                Start Live AI Demo
              </Button>
            )}

            {isProcessing && (
              <Box>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography variant="body1">
                  AI is processing your career profile...
                </Typography>
              </Box>
            )}

            {demoResults && !isProcessing && (
              <Button
                variant="outlined"
                onClick={resetDemo}
                sx={{ px: 3 }}
              >
                Run Demo Again
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {demoResults && (
        <>
          {/* Skills Analysis Results */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Assessment sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h5">
                  AI Skills Analysis
                  {demoResults.aiPowered && (
                    <Chip
                      label="Powered by Gemini AI"
                      size="small"
                      color="primary"
                      sx={{ ml: 2 }}
                    />
                  )}
                </Typography>
              </Box>

              <Grid container spacing={2}>
                {demoResults.skillLevels?.map((skill: any, index: number) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body1" fontWeight="medium">
                          {skill.skill}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {skill.level}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={skill.level}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {skill.category}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* Career Recommendations */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <WorkOutline sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h5">AI Career Matches</Typography>
              </Box>

              <Grid container spacing={2}>
                {demoResults.recommendedCareers?.map((career: any, index: number) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Star color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6">{career.title}</Typography>
                        <Chip
                          label={`${career.match}% match`}
                          size="small"
                          color="primary"
                          sx={{ ml: 'auto' }}
                        />
                      </Box>

                      <Typography variant="body2" color="text.secondary" paragraph>
                        {career.description}
                      </Typography>

                      {career.salaryRange && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <AttachMoney sx={{ fontSize: 16, mr: 0.5, color: 'success.main' }} />
                          <Typography variant="body2" color="success.main">
                            {career.salaryRange}
                          </Typography>
                        </Box>
                      )}

                      {career.missingSkills && career.missingSkills.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                            Skills to develop:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {career.missingSkills.map((skill: string, skillIndex: number) => (
                              <Chip
                                key={skillIndex}
                                label={skill}
                                size="small"
                                variant="outlined"
                                color="warning"
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* Learning Path */}
          {demoResults.learningPath && (
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <School sx={{ mr: 2, color: 'primary.main' }} />
                  <Typography variant="h5">Personalized Learning Path</Typography>
                </Box>

                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    <strong>Duration:</strong> {demoResults.learningPath.duration} • 
                    <strong> Estimated Cost:</strong> {demoResults.learningPath.estimatedCost}
                  </Typography>
                </Alert>

                {demoResults.learningPath.phases?.map((phase: any, index: number) => (
                  <Paper key={index} elevation={1} sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      {phase.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Duration: {phase.duration}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Skills: {phase.skills.join(', ')}
                    </Typography>
                    
                    {phase.resources && (
                      <List dense>
                        {phase.resources.map((resource: any, resIndex: number) => (
                          <ListItem key={resIndex}>
                            <ListItemIcon>
                              <TrendingUp fontSize="small" />
                            </ListItemIcon>
                            <ListItemText
                              primary={resource.title}
                              secondary={`${resource.provider} • ${resource.type} • ${resource.priority} priority`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Paper>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Demo Stats */}
          <Card sx={{ mt: 3, bgcolor: 'success.light' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🎉 Demo Complete!
              </Typography>
              <Typography variant="body1">
                This demonstrates the complete AI-powered career discovery process:
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                  <ListItemText primary="Skills analyzed with AI confidence scoring" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                  <ListItemText primary="Career matches generated with reasoning" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                  <ListItemText primary="Personalized learning path created" />
                </ListItem>
                <ListItem>
                  <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
                  <ListItemText primary="Real-time processing with fallback support" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </>
      )}
    </Container>
  );
};

export default Demo;