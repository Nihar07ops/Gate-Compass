import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  MenuBook,
  Description,
  School,
  Code,
  Quiz,
  Computer,
  Functions,
  Storage,
  NetworkCheck,
  Security,
  Close,
  Search,
  PictureAsPdf,
  Visibility,
  Download,
  Archive,
} from '@mui/icons-material';
import { Paper } from '@mui/material';
import { motion } from 'framer-motion';
import PDFViewer from '../components/PDFViewer';

const Resources = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedBook, setSelectedBook] = useState(null);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleBookSelect = (book) => {
    setSelectedBook(book);
    setPdfViewerOpen(true);
  };

  // Helper function to get PDF URLs for a book
  const getBookPDFUrls = (book) => {
    if (book.fileId) {
      return createPDFUrls(book.fileId);
    }
    // Fallback - this shouldn't happen with direct file IDs
    return {
      viewUrl: 'https://drive.google.com/drive/folders/1bD86aqby1shKZxN3pIOJoJ0rGZxA8Zcr',
      downloadUrl: 'https://drive.google.com/drive/folders/1bD86aqby1shKZxN3pIOJoJ0rGZxA8Zcr'
    };
  };

  const handleClosePdfViewer = () => {
    setPdfViewerOpen(false);
    setSelectedBook(null);
  };

  // Direct PDF file IDs extracted from your Google Drive links
  const PDF_FILES = {
    // Algorithms
    clrs: '13L-z3ezfYkhA8zPUx3e4ZEefhcPCsUtq',
    algorithmDesignManual: '12Q5N64aFDk5zRQ8GawiPCBPiCjpgxTtm',

    // Aptitude
    quantitativeAptitude: '1JSru350fNINieolKuwxtIY2mhW1A_F9c',

    // C Programming
    cProgrammingLanguage: '1byX5akthJQBC_1vfUvGykHxgjamkvwe4',
    cCompleteReference: '17LBquFIwTxcS7-x8KoibbzMAdmVm-r_L',
    cProgrammingModernApproach: '1qrRP0v0n4nUmPfUCYS7t5Jd1BQyi1fXR',

    // Compiler Design
    dragonBook: '1rBdmmAX4I-aZjBUMpSY4l4QOn4_0NCTk',

    // Computer Networks
    tanenbaum: '1MKVm3bDZUbTyss6sVvwKXUIhRc43aNRz',
    kurose: '15571Ytw-z5Pr_x7rv7r2-TMugW5g3j5X',
    forouzan: '1pDf4t_ORtVvIZKuR2L-uxyiLG3_SqZMi',

    // Computer Architecture
    pattersonHennessy: '1Q725jWuW48dAcmNGyg-vG36SpiE3kGQK',
    computerArchitecture: '1YWGocRHsb3K6RiFD3uIY377TxtWRmZXz',
    computerOrganization: '1v_iMKBXxX8h9kOHsRZmt8tqImfGV08m1',

    // Data Structures
    dataStructuresMadeEasy: '1SV_WGYnVx7RTJjObAmivg8eD8mD-ZNBN',

    // Database Management Systems
    silberschatz: '1wBvDmv0Y5TnnL2_Rh6hJUBX5GhrVI2hZ',
    elmasri: '1zFjNwZxITXOs89HXJXDp0Cu6Y1WVjON1',
    raghuRamakrishnan: '1cSCvpom12shdAfliwlK9UazmQq4wNkPN',

    // Digital Logic
    manoMorris: '10vktp6GGkAu9PrYt6_9v13dTZcksoAI1',
    digitalDesign: '1fPnaY55LH3DbEas1dfpwfCn7Nhk9TFs8',

    // Discrete Mathematics
    rosen: '1Z7N_BSHwkPdo2TL7LtQ0vz4Z9hAVzqBv',
    discreteMathApplications: '10WNNdNELUGip8xrIQU0y2-wXbdHb41XU',

    // Engineering Mathematics
    grewal: '1iACwgNCovfiK12E94xAMkHuwY5MIa--8',

    // Operating Systems
    silberschatzOS: '1FJE0O1paTx5bcRmSfdMIyW5gehQibVmI',
    tanenbaumOS: '1fFDqfGaxV6zpEC-xQVh0tv76NUVb1kfY',

    // Theory of Computation
    sipser: '10VkGFqeSKBS8-Bp0n5u0PHUarfNnT15q',
    tocElements: '1sGIrDPIiqk0Vy7CEaIxaGia3OCxQo8hC'
  };

  // Helper function to create Google Drive URLs from file ID
  const createPDFUrls = (fileId) => ({
    viewUrl: `https://drive.google.com/file/d/${fileId}/view`,
    downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`
  });

  // Digital Archive - Standard Books organized by subject
  const digitalArchive = {
    algorithms: {
      title: 'Algorithms',
      icon: <Code />,
      color: '#667eea',
      books: [
        {
          title: 'Introduction to Algorithms (CLRS)',
          author: 'Cormen, Leiserson, Rivest, Stein',
          description: 'The most comprehensive algorithms textbook covering design and analysis',
          fileId: PDF_FILES.clrs,
          pages: 1312,
          year: '2009',
          difficulty: 'Advanced'
        },
        {
          title: 'Algorithm Design Manual',
          author: 'Steven S. Skiena',
          description: 'Practical guide to algorithm design with real-world applications',
          fileId: PDF_FILES.algorithmDesignManual,
          pages: 748,
          year: '2020',
          difficulty: 'Intermediate'
        }
      ]
    },
    dataStructures: {
      title: 'Data Structures',
      icon: <Storage />,
      color: '#764ba2',
      books: [
        {
          title: 'Data Structures and Algorithms Made Easy',
          author: 'Narasimha Karumanchi',
          description: 'Simplified approach to data structures with practical examples',
          fileId: PDF_FILES.dataStructuresMadeEasy,
          pages: 718,
          year: '2016',
          difficulty: 'Intermediate'
        }
      ]
    },
    operatingSystems: {
      title: 'Operating Systems',
      icon: <Computer />,
      color: '#f093fb',
      books: [
        {
          title: 'Operating System Concepts (Dinosaur Book)',
          author: 'Abraham Silberschatz, Peter Galvin, Greg Gagne',
          description: 'The definitive operating systems textbook with comprehensive coverage',
          fileId: PDF_FILES.silberschatzOS,
          pages: 976,
          year: '2018',
          difficulty: 'Advanced'
        },
        {
          title: 'Modern Operating Systems',
          author: 'Andrew S. Tanenbaum',
          description: 'Modern approach to operating system design and implementation',
          fileId: PDF_FILES.tanenbaumOS,
          pages: 1136,
          year: '2014',
          difficulty: 'Advanced'
        }
      ]
    },
    dbms: {
      title: 'Database Management Systems',
      icon: <Storage />,
      color: '#f5576c',
      books: [
        {
          title: 'Database System Concepts',
          author: 'Abraham Silberschatz, Henry F. Korth, S. Sudarshan',
          description: 'Comprehensive database systems textbook with theory and practice',
          fileId: PDF_FILES.silberschatz,
          pages: 1376,
          year: '2019',
          difficulty: 'Advanced'
        },
        {
          title: 'Fundamentals of Database Systems',
          author: 'Ramez Elmasri, Shamkant B. Navathe',
          description: 'Complete introduction to database design and implementation',
          fileId: PDF_FILES.elmasri,
          pages: 1272,
          year: '2016',
          difficulty: 'Intermediate'
        },
        {
          title: 'Database Management Systems',
          author: 'Raghu Ramakrishnan, Johannes Gehrke',
          description: 'Comprehensive database systems with practical examples',
          fileId: PDF_FILES.raghuRamakrishnan,
          pages: 1065,
          year: '2003',
          difficulty: 'Advanced'
        }
      ]
    },

    networks: {
      title: 'Computer Networks',
      icon: <NetworkCheck />,
      color: '#4facfe',
      books: [
        {
          title: 'Computer Networks',
          author: 'Andrew S. Tanenbaum, David J. Wetherall',
          description: 'Classic networking textbook covering protocols and architectures',
          fileId: PDF_FILES.tanenbaum,
          pages: 960,
          year: '2010',
          difficulty: 'Advanced'
        },
        {
          title: 'Computer Networking: A Top-Down Approach',
          author: 'James Kurose, Keith Ross',
          description: 'Internet-focused approach to computer networking',
          fileId: PDF_FILES.kurose,
          pages: 864,
          year: '2016',
          difficulty: 'Intermediate'
        },
        {
          title: 'Data Communications and Networking',
          author: 'Behrouz A. Forouzan',
          description: 'Comprehensive guide to data communications and networking',
          fileId: PDF_FILES.forouzan,
          pages: 1134,
          year: '2012',
          difficulty: 'Intermediate'
        }
      ]
    },
    toc: {
      title: 'Theory of Computation',
      icon: <Quiz />,
      color: '#43e97b',
      books: [
        {
          title: 'Introduction to the Theory of Computation',
          author: 'Michael Sipser',
          description: 'Comprehensive introduction to computational theory and complexity',
          fileId: PDF_FILES.sipser,
          pages: 504,
          year: '2012',
          difficulty: 'Advanced'
        },
        {
          title: 'Elements of the Theory of Computation',
          author: 'Harry Lewis, Christos Papadimitriou',
          description: 'Mathematical foundations of computer science theory',
          fileId: PDF_FILES.tocElements,
          pages: 361,
          year: '1997',
          difficulty: 'Advanced'
        }
      ]
    },
    compilerDesign: {
      title: 'Compiler Design',
      icon: <Code />,
      color: '#764ba2',
      books: [
        {
          title: 'Compilers: Principles, Techniques, and Tools (Dragon Book)',
          author: 'Alfred V. Aho, Monica S. Lam, Ravi Sethi, Jeffrey D. Ullman',
          description: 'The definitive compiler design textbook',
          fileId: PDF_FILES.dragonBook,
          pages: 1038,
          year: '2006',
          difficulty: 'Advanced'
        }
      ]
    },
    cProgramming: {
      title: 'C Programming',
      icon: <Code />,
      color: '#30cfd0',
      books: [
        {
          title: 'The C Programming Language',
          author: 'Brian W. Kernighan, Dennis M. Ritchie',
          description: 'The classic C programming book by the creators of C',
          fileId: PDF_FILES.cProgrammingLanguage,
          pages: 272,
          year: '1988',
          difficulty: 'Intermediate'
        },
        {
          title: 'C: The Complete Reference',
          author: 'Herbert Schildt',
          description: 'Comprehensive guide to C programming',
          fileId: PDF_FILES.cCompleteReference,
          pages: 805,
          year: '2017',
          difficulty: 'Intermediate'
        },
        {
          title: 'C Programming: A Modern Approach',
          author: 'K. N. King',
          description: 'Modern approach to C programming with practical examples',
          fileId: PDF_FILES.cProgrammingModernApproach,
          pages: 832,
          year: '2008',
          difficulty: 'Intermediate'
        }
      ]
    },
    computerArchitecture: {
      title: 'Computer Architecture',
      icon: <Computer />,
      color: '#ff6b6b',
      books: [
        {
          title: 'Computer Organization and Design',
          author: 'David A. Patterson, John L. Hennessy',
          description: 'Hardware/software interface and computer architecture fundamentals',
          fileId: PDF_FILES.pattersonHennessy,
          pages: 696,
          year: '2020',
          difficulty: 'Advanced'
        },
        {
          title: 'Computer Architecture: A Quantitative Approach',
          author: 'John L. Hennessy, David A. Patterson',
          description: 'Advanced computer architecture concepts and design',
          fileId: PDF_FILES.computerArchitecture,
          pages: 936,
          year: '2019',
          difficulty: 'Advanced'
        },
        {
          title: 'Computer Organization',
          author: 'Carl Hamacher, Zvonko Vranesic, Safwat Zaky',
          description: 'Comprehensive computer organization and architecture',
          fileId: PDF_FILES.computerOrganization,
          pages: 750,
          year: '2011',
          difficulty: 'Advanced'
        }
      ]
    },
    digitalLogic: {
      title: 'Digital Logic',
      icon: <Functions />,
      color: '#9c27b0',
      books: [
        {
          title: 'Digital Design',
          author: 'M. Morris Mano, Michael D. Ciletti',
          description: 'Comprehensive introduction to digital logic design',
          fileId: PDF_FILES.digitalDesign,
          pages: 592,
          year: '2018',
          difficulty: 'Intermediate'
        },
        {
          title: 'Digital Logic and Computer Design',
          author: 'M. Morris Mano',
          description: 'Classic textbook on digital logic fundamentals',
          fileId: PDF_FILES.manoMorris,
          pages: 516,
          year: '2016',
          difficulty: 'Intermediate'
        }
      ]
    },
    mathematics: {
      title: 'Mathematics for Computer Science',
      icon: <Functions />,
      color: '#ff6b6b',
      books: [
        {
          title: 'Discrete Mathematics and Its Applications',
          author: 'Kenneth H. Rosen',
          description: 'Essential discrete mathematics for computer science students',
          fileId: PDF_FILES.rosen,
          pages: 1072,
          year: '2018',
          difficulty: 'Intermediate'
        },
        {
          title: 'Discrete Mathematics with Applications',
          author: 'Susanna S. Epp',
          description: 'Practical approach to discrete mathematics',
          fileId: PDF_FILES.discreteMathApplications,
          pages: 988,
          year: '2017',
          difficulty: 'Advanced'
        }
      ]
    },
    engineeringMath: {
      title: 'Engineering Mathematics',
      icon: <Functions />,
      color: '#795548',
      books: [
        {
          title: 'Higher Engineering Mathematics',
          author: 'B.S. Grewal',
          description: 'Comprehensive engineering mathematics textbook',
          fileId: PDF_FILES.grewal,
          pages: 1232,
          year: '2018',
          difficulty: 'Intermediate'
        }
      ]
    },
    aptitude: {
      title: 'General Aptitude',
      icon: <School />,
      color: '#607d8b',
      books: [
        {
          title: 'Quantitative Aptitude for Competitive Examinations',
          author: 'R.S. Aggarwal',
          description: 'Comprehensive aptitude preparation book',
          fileId: PDF_FILES.quantitativeAptitude,
          pages: 1042,
          year: '2020',
          difficulty: 'Intermediate'
        }
      ]
    }
  };

  const subjects = Object.keys(digitalArchive);
  const filteredBooks = selectedTab === 0
    ? Object.values(digitalArchive).flatMap(subject => subject.books)
    : digitalArchive[subjects[selectedTab - 1]]?.books || [];

  const searchFilteredBooks = filteredBooks.filter(book =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                <Archive sx={{ fontSize: 36 }} />
              </Box>
              <Box>
                <Typography variant="h3" fontWeight={700}>
                  Digital Book Archive
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.95 }}>
                  Read standard GATE CSE textbooks online
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
                � AAccess complete standard textbooks for all GATE CSE subjects with built-in PDF reader
              </Typography>
            </Box>
          </Box>
        </Paper>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <TextField
              fullWidth
              placeholder="Search books by title, author, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card sx={{ mb: 3, background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)' }}>
          <CardContent>
            <Box display="flex" alignItems="center" gap={2} mb={1}>
              <PictureAsPdf sx={{ color: '#667eea' }} />
              <Typography variant="h6" fontWeight={600}>
                How to Read Books Online
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Click "Read Online" to directly open the PDF in Google Drive viewer. All books are accessible instantly without folder navigation.
            </Typography>
          </CardContent>
        </Card>
      </motion.div>

      {/* Subject Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card sx={{ mb: 3 }}>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="All Books" />
            {Object.entries(digitalArchive).map(([key, subject]) => (
              <Tab
                key={key}
                label={subject.title}
                icon={subject.icon}
                iconPosition="start"
              />
            ))}
          </Tabs>
        </Card>
      </motion.div>

      {/* Books Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Grid container spacing={3}>
          {searchFilteredBooks.map((book, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: 6,
                    },
                  }}
                  onClick={() => handleBookSelect(book)}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <PictureAsPdf sx={{ color: '#f5576c', fontSize: 28 }} />
                      <Chip
                        label={book.difficulty}
                        size="small"
                        color={
                          book.difficulty === 'Beginner' ? 'success' :
                            book.difficulty === 'Intermediate' ? 'warning' : 'error'
                        }
                      />
                    </Box>

                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {book.title}
                    </Typography>

                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      by {book.author}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {book.description}
                    </Typography>

                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="caption" color="text.secondary">
                        📄 {book.pages} pages
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        📅 {book.year}
                      </Typography>
                    </Box>

                    <Box display="flex" gap={1}>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<Visibility />}
                        onClick={(e) => {
                          e.stopPropagation();
                          const urls = getBookPDFUrls(book);
                          window.open(urls.viewUrl, '_blank');
                        }}
                        sx={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          flex: 1,
                        }}
                      >
                        Read Online
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Download />}
                        onClick={(e) => {
                          e.stopPropagation();
                          const urls = getBookPDFUrls(book);
                          window.open(urls.downloadUrl, '_blank');
                        }}
                      >
                        Download
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      {/* PDF Viewer Dialog */}
      <Dialog
        open={pdfViewerOpen}
        onClose={handleClosePdfViewer}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: { height: '90vh' }
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6" component="div">
                {selectedBook?.title}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                by {selectedBook?.author}
              </Typography>
            </Box>
            <IconButton onClick={handleClosePdfViewer}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: '100%' }}>
          {selectedBook && (
            <PDFViewer
              pdfUrl={getBookPDFUrls(selectedBook).viewUrl}
              title={selectedBook.title}
              onClose={handleClosePdfViewer}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button
            href={selectedBook ? getBookPDFUrls(selectedBook).downloadUrl : '#'}
            target="_blank"
            startIcon={<Download />}
          >
            Download PDF
          </Button>
          <Button onClick={handleClosePdfViewer}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Statistics Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card
          sx={{
            mt: 4,
            background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
            color: 'white',
          }}
        >
          <CardContent>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              📊 Archive Statistics
            </Typography>
            <Grid container spacing={3} mt={1}>
              <Grid item xs={12} md={3}>
                <Box textAlign="center">
                  <Typography variant="h3" fontWeight={700}>
                    {Object.values(digitalArchive).reduce((total, subject) => total + subject.books.length, 0)}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Books
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box textAlign="center">
                  <Typography variant="h3" fontWeight={700}>
                    {Object.keys(digitalArchive).length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Subjects Covered
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box textAlign="center">
                  <Typography variant="h3" fontWeight={700}>
                    {Object.values(digitalArchive)
                      .flatMap(subject => subject.books)
                      .reduce((total, book) => total + book.pages, 0)
                      .toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Total Pages
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box textAlign="center">
                  <Typography variant="h3" fontWeight={700}>
                    100%
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Free Access
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default Resources;
