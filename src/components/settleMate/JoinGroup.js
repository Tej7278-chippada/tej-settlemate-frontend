// components/settleMate/JoinGroup.js
import React, { useState } from 'react';
import { Box, TextField, Button, Dialog, Snackbar, Alert, DialogContent, IconButton, Typography, CircularProgress, DialogActions, DialogTitle } from '@mui/material';
import apiClient from '../../utils/axiosConfig';
import CloseIcon from '@mui/icons-material/Close';

const JoinGroup = ({ open, onClose, onGroupJoined }) => {
  const [joinCode, setJoinCode] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);
  const [balanceOptions, setBalanceOptions] = useState(null);
  const [confirmationDialog, setConfirmationDialog] = useState({ open: false, group: null });

  const handleJoinGroup = async () => {
    setLoading(true);
    try {
      const response = await apiClient.post(
        '/api/groups/check-past-member',
        { joinCode },
        { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
      );
      if (response.data.isPastMember) {
        setBalanceOptions(response.data.balance); // User is a past member, show balance options
        setConfirmationDialog({ open: true, group: response.data.group });
      } else {
        confirmJoinGroup(false); // User is not a past member, join directly
      }
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

  const confirmJoinGroup = async (usePreviousBalance) => {
    try {
      const response = await apiClient.post(
        '/api/groups/join',
        { joinCode, usePreviousBalance },
        { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
      );
      const group = response.data.group;
      onGroupJoined(group); // Notify parent component
      setLoading(false);
      setJoinCode('');
      setConfirmationDialog({ open: false, group: null }); // Close the confirmation dialog
      onClose();
      showNotification(`You have joined the group ${group.groupName}`, 'success');
    } catch (error) {
      setLoading(false);
      if (error.response) {
        const errorMessage = error.response.data.message;
        if (errorMessage === 'You are already a member of this group') {
          showNotification('You are already a member of this entered code of Group', 'warning');
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

  const handleCloseOptions = () => {
    // setNotification({ ...notification, open: false });
    setConfirmationDialog({ open: false, group: null });
    setLoading(false);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} 
        sx={{
          '& .MuiPaper-root': { borderRadius: '16px', },
           }}
      >
        <Box sx={{ marginTop: '1rem', textAlign: 'center' }}>
          <Typography variant="h6">Join into group</Typography>
          <IconButton onClick={onClose}
            style={{ position: 'absolute', top: 10, right: 10.
              // color: '#fff', backgroundColor: 'rgba(0, 0, 0, 0.2)',
             }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <DialogContent style={{ minHeight: '200px' }}>
          <Box p={3} display="flex" flexDirection="column">
            <Typography variant="body1">Enter 6 Digit Group Code</Typography>
            <TextField
              fullWidth
              margin="normal"
              label="Group Code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              style={{ marginTop: '1rem' }}
              onClick={handleJoinGroup}
              fullWidth
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Submit'}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog
        open={confirmationDialog.open}
        onClose={handleCloseOptions}
        sx={{ '& .MuiPaper-root': { borderRadius: '16px' } }}
      >
        <DialogTitle>Rejoin Group</DialogTitle>
        <Box sx={{ textAlign: 'center' }}>
          {/* <Typography variant="h6">Join into group</Typography> */}
          <IconButton onClick={handleCloseOptions}
            style={{ position: 'absolute', top: 10, right: 10.
              // color: '#fff', backgroundColor: 'rgba(0, 0, 0, 0.2)',
             }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <DialogContent>
          <Typography>You have previously been a member of this group with a balance of ₹
            <span
              style={{
                color: balanceOptions >= 0 ? 'green' : 'red',
              }}
            >
              ({balanceOptions ?? "N/A"})
            </span>.</Typography>
          <Typography mt={1} color="warning">Would you like to rejoin with this balance or start fresh with a balance of ₹0 ?</Typography>
          {/* <DialogContentText>
            You have previously been a member of this group with a balance of (₹{balanceOptions}). 
            Would you like to rejoin with this balance or start fresh with a balance of ₹0?
          </DialogContentText> */}
        </DialogContent>
        <DialogActions sx={{padding:'1rem'}}>
          {/* <Button onClick={handleCloseOptions} color="error">Cancel</Button> */}
          <Button onClick={() => confirmJoinGroup(false)} color="secondary" variant="outlined">
            Start Fresh
          </Button>
          <Button onClick={() => confirmJoinGroup(true)} color="primary" variant="contained">
            Rejoin with Previous Balance
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%', borderRadius: '1rem' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default JoinGroup;