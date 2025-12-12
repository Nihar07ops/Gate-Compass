import { Alert, Box, Chip, Typography, Button } from '@mui/material';
import { Info, GitHub, Launch } from '@mui/icons-material';
import { DEMO_MODE } from '../config/demo';

const DemoBanner = () => {
    if (!DEMO_MODE) return null;

    return (
        <Alert
            severity="info"
            sx={{
                mb: 2,
                '& .MuiAlert-message': { width: '100%' }
            }}
            icon={<Info />}
        >
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                <Box>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        🚀 Demo Mode - Gate Compass GATE CSE Prep Platform
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        You're viewing a live demo. All data is simulated. Login with any email/password to explore features.
                    </Typography>
                </Box>
                <Box display="flex" gap={1} alignItems="center">
                    <Chip
                        label="Live Demo"
                        color="primary"
                        size="small"
                        icon={<Launch />}
                    />
                    <Button
                        size="small"
                        startIcon={<GitHub />}
                        onClick={() => window.open('https://github.com/Nihar07ops/Gate-Compass', '_blank')}
                        sx={{ whiteSpace: 'nowrap' }}
                    >
                        View Source
                    </Button>
                </Box>
            </Box>
        </Alert>
    );
};

export default DemoBanner;