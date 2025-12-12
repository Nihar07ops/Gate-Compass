import { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Alert,
    Chip,
    Divider,
} from '@mui/material';
import {
    Download,
    PictureAsPdf,
    OpenInNew,
    Launch,
    Visibility,
    MenuBook,
    CloudDownload,
} from '@mui/icons-material';

const PDFViewer = ({ pdfUrl, title }) => {
    const handleOpenGoogleDriveViewer = () => {
        // Open the specific PDF in Google Drive viewer
        window.open(pdfUrl, '_blank');
    };

    const handleDownloadFromGoogleDrive = () => {
        // Download the specific PDF from Google Drive
        const downloadUrl = pdfUrl.replace('/view', '').replace('/file/d/', '/uc?export=download&id=').replace(/\/.*/, '');
        window.open(downloadUrl, '_blank');
    };

    const handleOpenGoogleDriveFolder = () => {
        // Open the Google Drive folder where all books are stored
        window.open('https://drive.google.com/drive/folders/1bD86aqby1shKZxN3pIOJoJ0rGZxA8Zcr', '_blank');
    };

    const handleSearchInstructions = () => {
        // Show instructions for finding the specific book
        alert(`To find "${title}":\n\n1. The Google Drive folder will open\n2. Look for the book titled "${title}"\n3. Click on it to view or download\n4. Use Ctrl+F (or Cmd+F on Mac) to search for the book name`);
    };

    return (
        <Box
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                p: 3,
            }}
        >
            {/* Header */}
            <Box sx={{ mb: 4, textAlign: 'center' }}>
                <PictureAsPdf sx={{ fontSize: 64, color: '#667eea', mb: 2 }} />
                <Typography variant="h4" fontWeight={700} gutterBottom>
                    {title}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                    Choose your preferred method to read this textbook. Each option provides a different viewing experience.
                </Typography>
            </Box>

            {/* Viewing Options */}
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 800, mx: 'auto', width: '100%' }}>

                {/* Method 1: Direct Google Drive Viewer */}
                <Card
                    sx={{
                        border: '2px solid #4285f4',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: 4,
                        }
                    }}
                    onClick={handleOpenGoogleDriveViewer}
                >
                    <CardContent sx={{ p: 3 }}>
                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                            <Visibility sx={{ color: '#4285f4', fontSize: 32 }} />
                            <Box>
                                <Typography variant="h5" fontWeight={600}>
                                    View in Google Drive
                                </Typography>
                                <Chip label="Recommended" color="primary" size="small" />
                            </Box>
                        </Box>
                        <Typography variant="body1" color="text.secondary" mb={3}>
                            Open "{title}" directly in Google Drive's PDF viewer.
                            Provides excellent reading experience with zoom, navigation, and works perfectly on all devices.
                        </Typography>
                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                            <Chip icon={<Visibility />} label="Direct Access" size="small" variant="outlined" />
                            <Chip icon={<MenuBook />} label="Full Features" size="small" variant="outlined" />
                            <Chip icon={<CloudDownload />} label="Google Drive" size="small" variant="outlined" />
                        </Box>
                        <Button
                            variant="contained"
                            size="large"
                            fullWidth
                            onClick={(e) => {
                                e.stopPropagation();
                                handleOpenGoogleDriveViewer();
                            }}
                            sx={{
                                background: 'linear-gradient(135deg, #4285f4 0%, #34a853 100%)',
                                py: 1.5,
                            }}
                        >
                            View PDF in Google Drive
                        </Button>
                    </CardContent>
                </Card>

                {/* Method 2: Download Option */}
                <Card
                    sx={{
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: 4,
                        }
                    }}
                    onClick={handleDownloadFromGoogleDrive}
                >
                    <CardContent sx={{ p: 3 }}>
                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                            <CloudDownload sx={{ color: '#43e97b', fontSize: 32 }} />
                            <Typography variant="h5" fontWeight={600}>
                                Download PDF
                            </Typography>
                        </Box>
                        <Typography variant="body1" color="text.secondary" mb={3}>
                            Download "{title}" directly to your device for offline reading.
                            Perfect for studying without internet connection or using your preferred PDF reader.
                        </Typography>
                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                            <Chip icon={<CloudDownload />} label="Offline Access" size="small" variant="outlined" />
                            <Chip icon={<MenuBook />} label="Any PDF Reader" size="small" variant="outlined" />
                        </Box>
                        <Button
                            variant="outlined"
                            size="large"
                            fullWidth
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadFromGoogleDrive();
                            }}
                            sx={{
                                borderColor: '#43e97b',
                                color: '#43e97b',
                                py: 1.5,
                                '&:hover': {
                                    borderColor: '#43e97b',
                                    background: 'rgba(67, 233, 123, 0.1)',
                                },
                            }}
                        >
                            Download PDF File
                        </Button>
                    </CardContent>
                </Card>

                {/* Method 3: Browse All Books */}
                <Card
                    sx={{
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: 4,
                        }
                    }}
                    onClick={handleOpenGoogleDriveFolder}
                >
                    <CardContent sx={{ p: 3 }}>
                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                            <OpenInNew sx={{ color: '#667eea', fontSize: 32 }} />
                            <Typography variant="h5" fontWeight={600}>
                                Browse All Books
                            </Typography>
                        </Box>
                        <Typography variant="body1" color="text.secondary" mb={3}>
                            Access the complete Google Drive library with all 25+ standard GATE textbooks.
                            Browse, search, and access any book in the collection.
                        </Typography>
                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                            <Chip icon={<MenuBook />} label="25+ Books" size="small" variant="outlined" />
                            <Chip icon={<Visibility />} label="Full Library" size="small" variant="outlined" />
                        </Box>
                        <Button
                            variant="outlined"
                            size="large"
                            fullWidth
                            onClick={(e) => {
                                e.stopPropagation();
                                handleOpenGoogleDriveFolder();
                            }}
                            sx={{
                                borderColor: '#667eea',
                                color: '#667eea',
                                py: 1.5,
                                '&:hover': {
                                    borderColor: '#667eea',
                                    background: 'rgba(102, 126, 234, 0.1)',
                                },
                            }}
                        >
                            Open Complete Library
                        </Button>
                    </CardContent>
                </Card>

                {/* Info Alert */}
                <Alert severity="success" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                        <strong>🎯 Direct Access:</strong> Click "View in Google Drive" to open this specific book immediately.
                        No searching required - takes you straight to "{title}" in Google's excellent PDF viewer.
                    </Typography>
                </Alert>
            </Box>
        </Box>
    );
};

export default PDFViewer;