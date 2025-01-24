// components/settleMate/JoinGroup.js
import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Dialog,
    Snackbar,
    Alert,
    DialogContent,
    IconButton,
    Typography,
    CircularProgress,
} from '@mui/material';
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

            onGroupJoined(response.data.group); // Notify parent component about the new group
            setLoading(false);
            onClose();
            showNotification('Group joined successfully!', 'success');
        } catch (error) {
            console.error('Error joining group:', error);
            showNotification('Failed to join group. Please try again.', 'error');
            setLoading(false);
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
                        {/* <Button variant="contained" onClick={handleJoinGroup}>
            Submit
          </Button> */}
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
