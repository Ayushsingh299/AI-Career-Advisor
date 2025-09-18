import React from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Assessment,
  TrendingUp,
  School,
  WorkOutline,
} from '@mui/icons-material';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Assessment fontSize="large" />,
      title: 'Skills Assessment',
      description: 'AI-driven evaluation of your current competencies',
      action: () => navigate('/assessment'),
    },
    {
      icon: <TrendingUp fontSize="large" />,
      title: 'Market Trends',
      description: 'Real-time job market insights and predictions',
      action: () => navigate('/dashboard'),
    },
    {
      icon: <School fontSize="large" />,
      title: 'Learning Resources',
      description: 'Curated content for skill development',
      action: () => navigate('/dashboard'),
    },
    {
      icon: <WorkOutline fontSize="large" />,
      title: 'Career Paths',
      description: 'Personalized career roadmaps',
      action: () => navigate('/dashboard'),
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box textAlign="center" sx={{ py: 8 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          AI-Powered Career Guidance
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Get personalized career recommendations and skill development paths
          powered by advanced AI technology.
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            size="large"
            sx={{ mr: 2 }}
            onClick={() => navigate('/assessment')}
          >
            Start Assessment
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/login')}
          >
            Sign In
          </Button>
        </Box>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          Core Features
        </Typography>
        <Grid container spacing={4} sx={{ mt: 4 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography gutterBottom variant="h5" component="h3">
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                  <Button size="small" onClick={feature.action}>
                    Learn More
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: 8, textAlign: 'center', bgcolor: 'grey.50', borderRadius: 2 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Trusted by Professionals Worldwide
        </Typography>
        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h3" color="primary" fontWeight="bold">
              10K+
            </Typography>
            <Typography variant="h6">
              Career Assessments Completed
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h3" color="primary" fontWeight="bold">
              95%
            </Typography>
            <Typography variant="h6">
              User Satisfaction Rate
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h3" color="primary" fontWeight="bold">
              500+
            </Typography>
            <Typography variant="h6">
              Career Paths Available
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Home;