import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link,
} from '@mui/material';
import {
  ExpandMore,
  MenuBook,
  VideoLibrary,
  Description,
  School,
  Code,
  Quiz,
  Lightbulb,
  CalendarMonth,
  Edit,
  Refresh,
} from '@mui/icons-material';
import { Paper } from '@mui/material';
import { motion } from 'framer-motion';

const Resources = () => {
  const [expanded, setExpanded] = useState('algorithms');

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const resources = {
    algorithms: {
      title: 'Algorithms',
      icon: <Code />,
      color: '#667eea',
      materials: [
        {
          type: 'Notes',
          title: 'Algorithm Design Techniques',
          link: 'https://www.pw.live/exams/gate/gate-cse-notes/',
          description: 'Comprehensive notes on algorithm design and analysis'
        },
        {
          type: 'Video',
          title: 'GATE Algorithms Playlist',
          link: 'https://www.youtube.com/results?search_query=gate+algorithms',
          description: 'Video lectures covering all algorithm topics'
        },
        {
          type: 'Practice',
          title: 'Algorithm Problems',
          link: 'https://www.geeksforgeeks.org/fundamentals-of-algorithms/',
          description: 'Practice problems with solutions'
        }
      ]
    },
    dataStructures: {
      title: 'Data Structures',
      icon: <MenuBook />,
      color: '#764ba2',
      materials: [
        {
          type: 'Notes',
          title: 'Data Structures Notes',
          link: 'https://www.pw.live/exams/gate/gate-cse-notes/',
          description: 'Complete DS notes with examples'
        },
        {
          type: 'Video',
          title: 'DS Video Lectures',
          link: 'https://www.youtube.com/results?search_query=gate+data+structures',
          description: 'Detailed video explanations'
        }
      ]
    },
    operatingSystems: {
      title: 'Operating Systems',
      icon: <School />,
      color: '#f093fb',
      materials: [
        {
          type: 'Notes',
          title: 'OS Concepts',
          link: 'https://www.pw.live/exams/gate/gate-cse-notes/',
          description: 'Process, memory, file systems'
        },
        {
          type: 'Video',
          title: 'OS Lectures',
          link: 'https://www.youtube.com/results?search_query=gate+operating+systems',
          description: 'Complete OS course'
        }
      ]
    },
    dbms: {
      title: 'Database Management',
      icon: <Description />,
      color: '#f5576c',
      materials: [
        {
          type: 'Notes',
          title: 'DBMS Notes',
          link: 'https://www.pw.live/exams/gate/gate-cse-notes/',
          description: 'SQL, normalization, transactions'
        },
        {
          type: 'Practice',
          title: 'SQL Practice',
          link: 'https://www.geeksforgeeks.org/dbms/',
          description: 'Practice SQL queries'
        }
      ]
    },
    networks: {
      title: 'Computer Networks',
      icon: <VideoLibrary />,
      color: '#4facfe',
      materials: [
        {
          type: 'Notes',
          title: 'Networks Notes',
          link: 'https://www.pw.live/exams/gate/gate-cse-notes/',
          description: 'OSI model, protocols, routing'
        },
        {
          type: 'Video',
          title: 'Networks Course',
          link: 'https://www.youtube.com/results?search_query=gate+computer+networks',
          description: 'Complete networks course'
        }
      ]
    },
    toc: {
      title: 'Theory of Computation',
      icon: <Quiz />,
      color: '#43e97b',
      materials: [
        {
          type: 'Notes',
          title: 'TOC Notes',
          link: 'https://www.pw.live/exams/gate/gate-cse-notes/',
          description: 'Automata, grammars, Turing machines'
        },
        {
          type: 'Video',
          title: 'TOC Lectures',
          link: 'https://www.youtube.com/results?search_query=gate+theory+of+computation',
          description: 'Detailed TOC explanations'
        }
      ]
    }
  };

  const generalResources = [
    {
      title: 'GATE Official Website',
      link: 'https://gate.iitk.ac.in/',
      description: 'Official GATE exam information and updates'
    },
    {
      title: 'Previous Year Papers',
      link: 'https://byjus.com/gate/gate-exam/',
      description: 'Access all previous GATE papers'
    },
    {
      title: 'PhysicsWallah GATE Notes',
      link: 'https://www.pw.live/exams/gate/gate-cse-notes/',
      description: 'Free comprehensive study notes'
    },
    {
      title: 'GeeksforGeeks GATE',
      link: 'https://www.geeksforgeeks.org/gate-cs-notes-gq/',
      description: 'Topic-wise notes and practice'
    },
    {
      title: 'GATE CSE Resources',
      link: 'https://gatecse.in/gate-cse-resources/',
      description: 'Curated list of study materials'
    }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Paper
          elevation={0}
          sx={{
            mb: 4,
            p: 4,
            background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
            color: 'white',
            borderRadius: 4,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
            }}
          />
          <Box position="relative" zIndex={1}>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: 3,
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MenuBook sx={{ fontSize: 36 }} />
              </Box>
              <Box>
                <Typography variant="h3" fontWeight={700}>
                  Study Resources
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.95 }}>
                  Curated materials to help you ace GATE CSE
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                mt: 3,
                p: 2,
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                borderRadius: 2,
              }}
            >
              <Typography variant="body1" sx={{ opacity: 0.95 }}>
                📚 Access top-quality study materials from PhysicsWallah, GeeksforGeeks, and more
              </Typography>
            </Box>
          </Box>
        </Paper>
      </motion.div>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  General Resources
                </Typography>
                <Grid container spacing={2} mt={1}>
                  {generalResources.map((resource, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card
                          sx={{
                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                            border: '1px solid rgba(102, 126, 234, 0.2)',
                          }}
                        >
                          <CardContent>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                              {resource.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mb={2}>
                              {resource.description}
                            </Typography>
                            <Button
                              variant="contained"
                              size="small"
                              href={resource.link}
                              target="_blank"
                              sx={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              }}
                            >
                              Visit Resource
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h5" fontWeight={600} gutterBottom mb={2}>
                  Subject-wise Resources
                </Typography>
                {Object.entries(resources).map(([key, subject], index) => (
                  <Accordion
                    key={key}
                    expanded={expanded === key}
                    onChange={handleChange(key)}
                    sx={{
                      mb: 1,
                      '&:before': { display: 'none' },
                      boxShadow: 2,
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMore />}
                      sx={{
                        background: expanded === key
                          ? `linear-gradient(135deg, ${subject.color}22 0%, ${subject.color}11 100%)`
                          : 'transparent',
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={2}>
                        <Box sx={{ color: subject.color }}>{subject.icon}</Box>
                        <Typography variant="h6" fontWeight={600}>
                          {subject.title}
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        {subject.materials.map((material, idx) => (
                          <Grid item xs={12} md={6} key={idx}>
                            <Card variant="outlined">
                              <CardContent>
                                <Box display="flex" alignItems="center" gap={1} mb={1}>
                                  <Chip
                                    label={material.type}
                                    size="small"
                                    sx={{
                                      background: subject.color,
                                      color: 'white',
                                    }}
                                  />
                                  <Typography variant="subtitle1" fontWeight={600}>
                                    {material.title}
                                  </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary" mb={2}>
                                  {material.description}
                                </Typography>
                                <Link
                                  href={material.link}
                                  target="_blank"
                                  underline="none"
                                >
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    sx={{
                                      borderColor: subject.color,
                                      color: subject.color,
                                      '&:hover': {
                                        borderColor: subject.color,
                                        background: `${subject.color}11`,
                                      },
                                    }}
                                  >
                                    Access Material
                                  </Button>
                                </Link>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          }}
        >
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Lightbulb sx={{ fontSize: 32 }} />
              <Typography variant="h5" fontWeight={600}>
                Study Tips
              </Typography>
            </Box>
            <Grid container spacing={2} mt={1}>
              <Grid item xs={12} md={4}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <CalendarMonth sx={{ fontSize: 24 }} />
                  <Typography variant="body1" fontWeight={600}>
                    Create a Schedule
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Dedicate specific hours to each subject daily
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Edit sx={{ fontSize: 24 }} />
                  <Typography variant="body1" fontWeight={600}>
                    Practice Regularly
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Solve previous year papers and mock tests
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Refresh sx={{ fontSize: 24 }} />
                  <Typography variant="body1" fontWeight={600}>
                    Revise Consistently
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Regular revision is key to retention
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default Resources;
