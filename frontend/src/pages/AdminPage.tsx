import React, { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    Paper,
    AppBar,
    Toolbar,
    Tabs,
    Tab,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import QuestionManager from '../components/admin/QuestionManager';
import DataImporter from '../components/admin/DataImporter';
import ConceptMapper from '../components/admin/ConceptMapper';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`admin-tabpanel-${index}`}
            aria-labelledby={`admin-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
}

const AdminPage: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [currentTab, setCurrentTab] = useState(0);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setCurrentTab(newValue);
    };

    return (
        <Box>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        GATE COMPASS - Admin Panel
                    </Typography>
                    <Typography variant="body1" sx={{ mr: 2 }}>
                        {user?.email}
                    </Typography>
                    <Button
                        color="inherit"
                        startIcon={<LogoutIcon />}
                        onClick={handleLogout}
                    >
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>

            <Container maxWidth="xl" sx={{ mt: 4 }}>
                <Paper sx={{ width: '100%' }}>
                    <Tabs
                        value={currentTab}
                        onChange={handleTabChange}
                        aria-label="admin tabs"
                        sx={{ borderBottom: 1, borderColor: 'divider' }}
                    >
                        <Tab label="Question Manager" />
                        <Tab label="Bulk Import" />
                        <Tab label="Concept Mapper" />
                    </Tabs>

                    <TabPanel value={currentTab} index={0}>
                        <QuestionManager />
                    </TabPanel>
                    <TabPanel value={currentTab} index={1}>
                        <DataImporter />
                    </TabPanel>
                    <TabPanel value={currentTab} index={2}>
                        <ConceptMapper />
                    </TabPanel>
                </Paper>
            </Container>
        </Box>
    );
};

export default AdminPage;
