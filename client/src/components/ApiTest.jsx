import { useState } from 'react';
import { Button, Box, Typography, Alert } from '@mui/material';
import api from '../utils/api';

const ApiTest = () => {
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);

    const testConnection = async () => {
        setLoading(true);
        setStatus('Testing connection...');

        try {
            // Test a simple endpoint
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: 'Test User',
                    email: `test${Date.now()}@example.com`,
                    password: 'password123'
                })
            });

            if (response.ok) {
                const data = await response.json();
                setStatus(`✅ Connection successful! User created with ID: ${data.user.id}`);
            } else {
                setStatus(`❌ Server responded with status: ${response.status}`);
            }
        } catch (error) {
            setStatus(`❌ Network error: ${error.message}`);
            console.error('Connection test error:', error);
        } finally {
            setLoading(false);
        }
    };

    const testWithAxios = async () => {
        setLoading(true);
        setStatus('Testing with Axios...');

        try {
            const response = await api.post('/api/auth/register', {
                name: 'Axios Test User',
                email: `axios${Date.now()}@example.com`,
                password: 'password123'
            });

            setStatus(`✅ Axios connection successful! User: ${response.data.user.name}`);
        } catch (error) {
            setStatus(`❌ Axios error: ${error.message}`);
            console.error('Axios test error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3, maxWidth: 500, mx: 'auto' }}>
            <Typography variant="h6" gutterBottom>
                API Connection Test
            </Typography>

            <Box sx={{ mb: 2 }}>
                <Button
                    variant="contained"
                    onClick={testConnection}
                    disabled={loading}
                    sx={{ mr: 2 }}
                >
                    Test Fetch API
                </Button>

                <Button
                    variant="outlined"
                    onClick={testWithAxios}
                    disabled={loading}
                >
                    Test Axios
                </Button>
            </Box>

            {status && (
                <Alert severity={status.includes('✅') ? 'success' : 'error'}>
                    {status}
                </Alert>
            )}
        </Box>
    );
};

export default ApiTest;