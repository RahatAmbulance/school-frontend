import React, {useState} from 'react';
import {Box, Button, IconButton, Modal, TextField, Typography} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close'; // Import CloseIcon for the close button
import {resetPassword} from './api'; // Import your API service

const ForgetPassword = ({onClose}) => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await resetPassword(email);
            setMessage('Password reset link has been sent to your email.');
        } catch (error) {
            setMessage('Failed to send reset link. Please try again.');
        }
    };

    return (
        <Modal
            open={true} // Always open the modal when this component is rendered
            onClose={onClose}
            aria-labelledby="forget-password-title"
            aria-describedby="forget-password-description"
            sx={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}
        >
            <Box
                sx={{
                    width: 400,
                    bgcolor: 'background.paper',
                    p: 3,
                    borderRadius: 2,
                    boxShadow: 3,
                    position: 'relative', // Add relative position to contain the absolute positioning of the close button
                }}
            >
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        color: 'text.secondary',
                    }}
                >
                    <CloseIcon/>
                </IconButton>
                <Typography id="forget-password-title" variant="h6" component="h2" mb={2}>
                    Forgot Password
                </Typography>
                <Box component="form" onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{mt: 2}}
                    >
                        Reset Password
                    </Button>
                    {message && (
                        <Typography variant="body2" color={message.includes('Failed') ? 'error' : 'success'} mt={2}>
                            {message}
                        </Typography>
                    )}
                </Box>
            </Box>
        </Modal>
    );
};

export default ForgetPassword;
