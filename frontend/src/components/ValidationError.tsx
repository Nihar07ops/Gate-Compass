import React from 'react';
import { Alert, AlertTitle, List, ListItem, ListItemText } from '@mui/material';

interface ValidationErrorProps {
    errors: string[] | string;
    title?: string;
}

const ValidationError: React.FC<ValidationErrorProps> = ({ errors, title = 'Validation Error' }) => {
    const errorArray = Array.isArray(errors) ? errors : [errors];

    if (errorArray.length === 0) {
        return null;
    }

    return (
        <Alert severity="error" sx={{ mb: 2 }}>
            <AlertTitle>{title}</AlertTitle>
            {errorArray.length === 1 ? (
                errorArray[0]
            ) : (
                <List dense>
                    {errorArray.map((error, index) => (
                        <ListItem key={index} sx={{ py: 0 }}>
                            <ListItemText primary={`• ${error}`} />
                        </ListItem>
                    ))}
                </List>
            )}
        </Alert>
    );
};

export default ValidationError;
