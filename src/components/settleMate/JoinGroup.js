// components/settleMate/JoinGroup.js
import React, { useState } from 'react';
import { Box, TextField, Button, Dialog, Snackbar, Alert, DialogContent, IconButton, Typography, CircularProgress, } from '@mui/material';
import apiClient from '../../utils/axiosConfig';
import CloseIcon from '@mui/icons-material/Close';

const JoinGroup = ({ open, onClose, onGroupJoined }) => {
    const [joinCode, setJoinCode] = useState('');
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
    const [loading, setLoading] = useState(false);


    const handleJoinGroup = async () => {
        setLoading(true);
        try {
            const response = await apiClient.post(
                '/api/groups/join',
                { joinCode },
                { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
            );
            const group = response.data.group;
            onGroupJoined(group); // Notify parent component about the new group
            setLoading(false);
            setJoinCode('');
            onClose();
            showNotification(`You are joined the group of ${group.groupName}`, 'success');
        } catch (error) {
            setLoading(false);
            if (error.response) {
                const errorMessage = error.response.data.message;
                if (errorMessage === 'You are already a member of this group') {
                    showNotification('You are already a member of entered code of Group', 'warning');
                } else if (errorMessage === 'Invalid join code') {
                    showNotification('Entered code is wrong, please check the entered code.', 'error');
                } else if (errorMessage === 'Join code has expired') {
                    showNotification('Entered code has expired, ask group admin to refresh the group join code.', 'warning');
                } else {
                    showNotification('Failed to join group. Please try again.', 'error');
                }
            } else {
                showNotification('An unexpected error occurred. Please try again later.', 'error');
            }

        }
    };

    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };

    const showNotification = (message, severity) => {
        setNotification({ open: true, message, severity });
    };

    return (
        <>
            <Dialog open={open} onClose={onClose}   >
                <IconButton
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        // color: '#fff', backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <DialogContent style={{ minHeight: '200px', }}>

                    <Box p={3} display="flex" flexDirection="column">
                        <Typography variant="body1" >Enter 6 Digit Group Code</Typography>
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Group Code"
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value)}
                        />
                        <Button type="submit" variant="contained" color="primary" style={{ marginTop: '1rem', }} onClick={handleJoinGroup} fullWidth disabled={loading}>
                            {loading ? <CircularProgress size={24} /> : 'Submit'}
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>

            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
                    {notification.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default JoinGroup;
