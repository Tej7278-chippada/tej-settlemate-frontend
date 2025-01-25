// GroupDetails.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Card, Avatar, Grid, useMediaQuery, IconButton, CircularProgress, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button  } from '@mui/material';
import apiClient from '../../utils/axiosConfig';
import Layout from '../Layout';
import { useTheme } from '@emotion/react';
import { Delete, Refresh } from '@mui/icons-material';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';

const GroupDetails = ({groupId: propGroupId}) => {
  // const { groupId } = useParams();
  const { groupId: paramGroupId } = useParams(); // Get groupId from URL if available
  const groupId = propGroupId || paramGroupId; // Use propGroupId if provided, else use paramGroupId
  const [group, setGroup] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [isMediaReady, setIsMediaReady] = useState(false); // Track media query readiness
  const [loadingJoinCode, setLoadingJoinCode] = useState(false); // Track loading state for join code
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' }); // Snackbar state
  const [confirmationDialog, setConfirmationDialog] = useState({ open: false, action: null });


  useEffect(() => {
    // Set media query readiness after first render
    setIsMediaReady(true);
  }, [isMobile]);

  useEffect(() => {
    const fetchGroupDetails = async () => {
      if (!groupId) return; // Exit early if groupId is undefined
      try {
        const response = await apiClient.get(`/api/groups/${groupId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        });
        setGroup(response.data);
      } catch (error) {
        console.error('Error fetching group details:', error);
      }
    };

    fetchGroupDetails();
  }, [groupId]);

  const handleGenerateJoinCode = async () => {
    setLoadingJoinCode(true);
    try {
      const response = await apiClient.post(
        `/api/groups/${groupId}/generate-code`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
      );
      setGroup((prevGroup) => ({
        ...prevGroup,
        joinCode: response.data.joinCode,
        joinCodeExpiry: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1-hour expiry
      }));
      // Show success message
      setSnackbar({
        open: true,
        message: 'New Join code generated successfully, & valid till an hour.',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error generating new join code:', error);
      // Show error message
      setSnackbar({
        open: true,
        message: 'Unable to generate new Join code, please try again later.',
        severity: 'error',
      });
    } finally {
      setLoadingJoinCode(false);
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  if (!isMediaReady) {
    // Prevent rendering until media query result is ready
    return null;
  }

  if (!group) {
    return isMobile ? (
      <Layout>
        <Typography>Loading...</Typography>
      </Layout>
    ) : (
      <Box sx={{margin:'2rem'}}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  const isAdmin = group.members.some(
    (member) => member.user._id === localStorage.getItem('userId') && member.role === 'Admin'
  );

  const handleDeleteGroup = async () => {
    try {
      await apiClient.delete(`/api/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      });
      setSnackbar({ open: true, message: 'Group deleted successfully.', severity: 'success' });
      setConfirmationDialog({ open: false, action: null });
      // Refresh the page
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to delete the group.', severity: 'error' });
    }
  };

  const handleExitGroup = async () => {
    try {
      await apiClient.post(`/api/groups/${groupId}/exit`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      });
      setSnackbar({ open: true, message: 'You have left the group.', severity: 'success' });
      setConfirmationDialog({ open: false, action: null });
       // Refresh the page
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to leave the group.', severity: 'error' });
    }
  };

  const handleOpenConfirmation = (action) => {
    setConfirmationDialog({ open: true, action });
  };

  const handleCloseConfirmation = () => {
    setConfirmationDialog({ open: false, action: null });
  };

  const content = (
    <Box p={3}>
      <Card sx={{ p: 3, display: 'flex', justifyContent: 'space-between' }}>
        
          <Box display="flex" alignItems="center">
            {/* <Avatar src={group.groupPicture} alt={group.groupName} sx={{ width: 56, height: 56, mr: 2 }} /> */}
            <Avatar
                  alt={group.groupName[0]}
                  src={
                    group.groupPic
                      ? `data:image/jpeg;base64,${group.groupPic}`
                      : undefined
                  }
                  sx={{ width: 56, height: 56, mr: 2 }}
                  >{group.groupName[0]}</Avatar>
            <div>
            <Typography variant="h5">{group.groupName}
              <IconButton
                color="error"
                onClick={() => handleOpenConfirmation(isAdmin ? 'delete' : 'exit')}
                sx={{ ml: 1 }}
              >
                {(isAdmin ? <Delete /> : <LogoutRoundedIcon />) }
              </IconButton>
            </Typography>
            <Typography variant='body2' sx={{ display: 'inline-block', float: 'right' }}>
              <small>{new Date(group.createdAt).toLocaleString()}</small>
            </Typography>
            </div>
          </Box>
        <div>
        <Box display="flex" alignItems="center">
            <Typography variant="subtitle1">Code: {group.joinCode}</Typography>
            {isAdmin && (
              <IconButton
                onClick={handleGenerateJoinCode}
                disabled={loadingJoinCode}
                sx={{ ml: 1 }}
              >
                {loadingJoinCode ? <CircularProgress size={20} /> : <Refresh />}
              </IconButton>
            )}
          </Box>
        {/* <Typography variant="subtitle1">Code: {group.joinCode}</Typography> */}
        <Typography variant='body2' sx={{ display: 'inline-block', float: 'right' }}>
          <small>{new Date(group.joinCodeExpiry).toLocaleString()}</small>
        </Typography>
        </div>
      </Card>

      <Box mt={2}>
        <Typography variant="h6">Members:</Typography>
        <Grid container spacing={2}>
          {group.members.map((member) => (
            <Grid item key={member.user._id} xs={12} sm={6} md={4}>
              <Card sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                {/* <Avatar sx={{ mr: 2 }}>{member.user.username[0]}</Avatar> */}
                <Avatar
                  alt={member.user.username[0]}
                  src={
                    member.user.profilePic
                      ? `data:image/jpeg;base64,${member.user.profilePic}`
                      : undefined
                  }
                  sx={{ width: 56, height: 56, mr: 2 }}
                >{member.user.username[0]}</Avatar>
                <Typography>{member.user.username}</Typography>
                {/* <Typography>{member.user.phone}</Typography> */}
                <div style={{ display: 'inline-block', float: 'right', marginLeft:'1rem', }}>
                <Typography sx={{ color: member?.role === "Admin" ? "blue" : "grey"}}>{member.role}</Typography>
                <Typography variant='body2' sx={{ display: 'inline-block', float: 'right' }}>
                  <small>{new Date(member.joined_at).toLocaleString()}</small>
                </Typography>
                </div>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );

  return (
    <>
      {isMobile ? <Layout>{content}</Layout> : content}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Dialog open={confirmationDialog.open} onClose={handleCloseConfirmation}>
        <DialogTitle>
          {confirmationDialog.action === 'delete' ? 'Delete Group' : 'Leave Group'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to {confirmationDialog.action === 'delete' ? 'delete this group permanently' : 'leave this group'}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmation}>Cancel</Button>
          <Button
            onClick={
              confirmationDialog.action === 'delete' ? handleDeleteGroup : handleExitGroup
            }
            color="error"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default GroupDetails;
