import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    Grid,
    Alert,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import axios from 'axios';

interface Concept {
    id: string;
    name: string;
    category: string;
    description: string;
    created_at: string;
}

interface ConceptFormData {
    name: string;
    category: string;
    description: string;
}

const initialFormData: ConceptFormData = {
    name: '',
    category: '',
    description: '',
};

const ConceptMapper: React.FC = () => {
    const [concepts, setConcepts] = useState<Concept[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingConcept, setEditingConcept] = useState<Concept | null>(null);
    const [formData, setFormData] = useState<ConceptFormData>(initialFormData);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [questionCounts, setQuestionCounts] = useState<Record<string, number>>({});

    useEffect(() => {
        fetchConcepts();
    }, []);

    const fetchConcepts = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/admin/concepts');
            const fetchedConcepts = response.data.concepts;
            setConcepts(fetchedConcepts);

            // Fetch question counts for each concept
            const counts: Record<string, number> = {};
            await Promise.all(
                fetchedConcepts.map(async (concept: Concept) => {
                    try {
                        const countResponse = await axios.get(`/api/admin/questions/concept/${concept.id}/count`);
                        counts[concept.id] = countResponse.data.count;
                    } catch (err) {
                        counts[concept.id] = 0;
                    }
                })
            );
            setQuestionCounts(counts);
        } catch (err: any) {
            setError('Failed to load concepts');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.name.trim()) {
            errors.name = 'Name is required';
        }

        if (!formData.category.trim()) {
            errors.category = 'Category is required';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleOpenDialog = (concept?: Concept) => {
        if (concept) {
            setEditingConcept(concept);
            setFormData({
                name: concept.name,
                category: concept.category,
                description: concept.description,
            });
        } else {
            setEditingConcept(null);
            setFormData(initialFormData);
        }
        setValidationErrors({});
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingConcept(null);
        setFormData(initialFormData);
        setValidationErrors({});
    };

    const handleSubmit = async () => {
        setError('');
        setSuccess('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const payload = {
                name: formData.name.trim(),
                category: formData.category.trim(),
                description: formData.description.trim(),
            };

            if (editingConcept) {
                await axios.put(`/api/admin/concepts/${editingConcept.id}`, payload);
                setSuccess('Concept updated successfully!');
            } else {
                await axios.post('/api/admin/concepts', payload);
                setSuccess('Concept created successfully!');
            }

            handleCloseDialog();
            fetchConcepts();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to save concept');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (concept: Concept) => {
        if (!window.confirm(`Are you sure you want to delete "${concept.name}"?`)) {
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await axios.delete(`/api/admin/concepts/${concept.id}`);
            setSuccess('Concept deleted successfully!');
            fetchConcepts();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to delete concept');
        } finally {
            setLoading(false);
        }
    };

    // Group concepts by category
    const conceptsByCategory = concepts.reduce((acc, concept) => {
        if (!acc[concept.category]) {
            acc[concept.category] = [];
        }
        acc[concept.category].push(concept);
        return acc;
    }, {} as Record<string, Concept[]>);

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5">
                    Concept Management
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Add Concept
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {success && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
                    {success}
                </Alert>
            )}

            {loading && concepts.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <>
                    {Object.keys(conceptsByCategory).length === 0 ? (
                        <Paper sx={{ p: 4, textAlign: 'center' }}>
                            <Typography color="text.secondary">
                                No concepts found. Click "Add Concept" to create one.
                            </Typography>
                        </Paper>
                    ) : (
                        Object.entries(conceptsByCategory).map(([category, categoryConcepts]) => (
                            <Paper key={category} sx={{ mb: 3 }}>
                                <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
                                    <Typography variant="h6">
                                        {category} ({categoryConcepts.length})
                                    </Typography>
                                </Box>
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Name</TableCell>
                                                <TableCell>Description</TableCell>
                                                <TableCell align="center">Questions</TableCell>
                                                <TableCell align="right">Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {categoryConcepts.map((concept) => (
                                                <TableRow key={concept.id}>
                                                    <TableCell>
                                                        <Typography variant="body1" fontWeight="medium">
                                                            {concept.name}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" color="text.secondary">
                                                            {concept.description || '-'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Chip
                                                            label={questionCounts[concept.id] || 0}
                                                            size="small"
                                                            color={questionCounts[concept.id] > 0 ? 'primary' : 'default'}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <IconButton
                                                            size="small"
                                                            color="primary"
                                                            onClick={() => handleOpenDialog(concept)}
                                                        >
                                                            <EditIcon />
                                                        </IconButton>
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() => handleDelete(concept)}
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Paper>
                        ))
                    )}
                </>
            )}

            {/* Add/Edit Dialog */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingConcept ? 'Edit Concept' : 'Add New Concept'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                error={!!validationErrors.name}
                                helperText={validationErrors.name}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Category"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                error={!!validationErrors.category}
                                helperText={validationErrors.category}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Description (Optional)"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        color="primary"
                        startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ConceptMapper;
