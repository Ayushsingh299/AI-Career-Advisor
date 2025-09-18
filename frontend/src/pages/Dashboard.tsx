import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  LinearProgress,
} from '@mui/material';
import { useLocation } from 'react-router-dom';
import {
  TrendingUp,
  School,
  WorkOutline,
  Assessment,
  Star,
  CheckCircle,
} from '@mui/icons-material';

const Dashboard: React.FC = () => {
  const location = useLocation();
  const assessmentCompleted = location.state?.assessmentCompleted || false;

  const mockSkills = [
    { name: 'JavaScript', level: 85, category: 'Programming' },
    { name: 'React', level: 75, category: 'Frontend' },
    { name: 'Node.js', level: 65, category: 'Backend' },
    { name: 'TypeScript', level: 70, category: 'Programming' },
    { name: 'Problem Solving', level: 90, category: 'Soft Skills' },
  ];

  const mockCareerPaths = [
    {
      title: 'Frontend Developer',
      match: 92,
      description: 'Build user interfaces and web applications',
      skills: ['React', 'JavaScript', 'CSS', 'HTML'],
    },
    {
      title: 'Full Stack Developer',
      match: 85,
      description: 'Work on both frontend and backend development',
      skills: ['React', 'Node.js', 'JavaScript', 'Databases'],
    },
    {
      title: 'Software Engineer',
      match: 88,
      description: 'Design and develop software solutions',
      skills: ['Programming', 'Problem Solving', 'System Design'],
    },
  ];

  const mockLearningResources = [
    'Advanced React Patterns',
    'Node.js Best Practices',
    'TypeScript Deep Dive',
    'System Design Fundamentals',
    'Leadership Skills for Developers',
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Your Career Dashboard
      </Typography>

      {assessmentCompleted && (
        <Box sx={{ mb: 4 }}>
          <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircle sx={{ mr: 2 }} />
                <Typography variant="h6">
                  Assessment completed! Your personalized recommendations are ready.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      <Grid container spacing={4}>
        {/* Skills Overview */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Assessment sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h5">Your Skills</Typography>
              </Box>
              <Box>
                {mockSkills.map((skill, index) => (
                  <Box key={index} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1" fontWeight="medium">
                        {skill.name}
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
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Career Recommendations */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <WorkOutline sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h5">Recommended Career Paths</Typography>
              </Box>
              <List>
                {mockCareerPaths.map((career, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <Star color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="h6">{career.title}</Typography>
                          <Chip 
                            label={`${career.match}% match`} 
                            size="small" 
                            color="primary"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {career.description}
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {career.skills.map((skill, skillIndex) => (
                              <Chip 
                                key={skillIndex}
                                label={skill} 
                                size="small" 
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Learning Resources */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <School sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h5">Recommended Learning</Typography>
              </Box>
              <List>
                {mockLearningResources.map((resource, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <School color="secondary" />
                    </ListItemIcon>
                    <ListItemText primary={resource} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Market Trends */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TrendingUp sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h5">Market Trends</Typography>
              </Box>
              <List>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="React Developer Demand"
                    secondary="Up 25% this quarter"
                  />
                  <TrendingUp color="success" />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="TypeScript Adoption"
                    secondary="Growing rapidly in enterprise"
                  />
                  <TrendingUp color="success" />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Remote Work Opportunities"
                    secondary="85% of tech roles now remote-friendly"
                  />
                  <TrendingUp color="primary" />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="AI/ML Skills"
                    secondary="High demand across all sectors"
                  />
                  <TrendingUp color="success" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;