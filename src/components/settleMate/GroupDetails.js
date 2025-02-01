// components/settleMate/GroupDetails.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, Card, Avatar, Grid, useMediaQuery, IconButton, CircularProgress, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import apiClient from '../../utils/axiosConfig';
import Layout from '../Layout';
import { useTheme } from '@emotion/react';
import { Delete, Refresh } from '@mui/icons-material';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';

const GroupDetails = ({ groupId: propGroupId }) => {
  const { groupId: paramGroupId } = useParams(); // Get groupId from URL if available
  const groupId = propGroupId || paramGroupId; // Use propGroupId if provided, else use paramGroupId
  const [group, setGroup] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [isMediaReady, setIsMediaReady] = useState(false); // Track media query readiness
  const [loadingJoinCode, setLoadingJoinCode] = useState(false); // Track loading state for join code
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' }); // Snackbar state
  const [confirmationDialog, setConfirmationDialog] = useState({ open: false, action: null });
  const [groupError, setGroupError] = useState(false); // Track if the group doesn't exist
  const [confirmationDialog1, setConfirmationDialog1] = useState({ open: false, action: null, data: null });
  const navigate = useNavigate(); // Initialize navigation

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
        const userId = localStorage.getItem('userId');
        const isMember = response.data.members.some(
          (member) => member.user._id === userId
        );

        if (!isMember) {
          navigate('/settleMate'); // Redirect if user is not a member or admin
        } else {
          setGroup(response.data); // Set group data if user is authorized
        }
      } catch (error) {
        if (error.response?.status === 404) {
          setGroupError(true);
        } else {
          console.error('Error fetching group details:', error);
        }
        navigate('/settleMate'); // Redirect if there's an error (e.g., unauthorized)
      }
    };

    fetchGroupDetails();
  }, [groupId, navigate]);
  
  const calculatePayments = (members) => {
    let debtors = [];
    let creditors = [];
    
    // Categorize members based on balance
    members.forEach((member) => {
      if (member.balance < 0) {
        debtors.push({ ...member, balance: Math.abs(member.balance) }); // Convert debt to positive for easier calculation
      } else if (member.balance > 0) {
        creditors.push({ ...member });
      }
    });
  
    let transactions = [];
  
    // Match debtors to creditors
    while (debtors.length > 0 && creditors.length > 0) {
      let debtor = debtors[0];
      let creditor = creditors[0];
  
      let amount = Math.min(debtor.balance, creditor.balance);
      transactions.push({
        from: debtor.user.username,
        to: creditor.user.username,
        amount: amount.toFixed(2),
      });
  
      // Adjust balances after payment
      debtor.balance -= amount;
      creditor.balance -= amount;
  
      // Remove settled members
      if (debtor.balance === 0) debtors.shift();
      if (creditor.balance === 0) creditors.shift();
    }
  
    return transactions;
  };

  const payments = group && group.members ? calculatePayments(group.members) : [];


  

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

  if (groupError) {
    return (
      <Box sx={{ margin: '2rem', textAlign: 'center' }}>
        <Typography variant="h6" color="error">
          Group doesn't exist, it may have been deleted by Admin.
        </Typography>
      </Box>
    );
  }

  if (!group) {
    return isMobile ? (
      <Layout>
        <Box sx={{ margin: '2rem', textAlign: 'center' }}>
          <Typography>Loading...</Typography>
        </Box>
      </Layout>
    ) : (
      <Box sx={{ margin: '2rem', textAlign: 'center' }}>
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
      setSnackbar({ open: true, message: `Group ${group.groupName} deleted successfully.`, severity: 'success' });
      setConfirmationDialog({ open: false, action: null });
      // Refresh the page
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to delete the group.', severity: 'error' });
    }
  };

  const handleRemoveMember = async () => {
    const { memberId, memberUsername } = confirmationDialog1.data;
    try {
      await apiClient.post(
        `/api/groups/${groupId}/remove-member`,
        { memberId },
        { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
      );
      setSnackbar({ open: true, message: `Member ${memberUsername} removed successfully.`, severity: 'success' });
      // Update the group state to reflect the removal
      setGroup((prevGroup) => ({
        ...prevGroup,
        members: prevGroup.members.filter((member) => member.user._id !== memberId),
      }));
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to remove member.', severity: 'error' });
    } finally {
      setConfirmationDialog1({ open: false, action: null, data: null });
    }
  };

  const handleOpenConfirmation1 = (action, data) => {
    setConfirmationDialog1({ open: true, action, data });
  };

  const handleCloseConfirmation1 = () => {
    setConfirmationDialog1({ open: false, action: null, data: null });
  };


  const handleExitGroup = async () => {
    try {
      await apiClient.post(`/api/groups/${groupId}/exit`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      });
      setSnackbar({ open: true, message: `You have left the group ${group.groupName} .`, severity: 'success' });
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
    <Box p={isMobile ? '6px' : '6px'}>
      {/* <Card sx={{ p: (isMobile ? '6px' : 3), display: 'flex', justifyContent: 'space-between' }}>

        <Box display="flex" alignItems="center">
          <Avatar
            alt={group.groupName[0]}
            src={
              group.groupPic
                ? `data:image/jpeg;base64,${group.groupPic}`
                : undefined
            }
            sx={{ width: 100, height: 100, mr: 2 }}
          >{group.groupName[0]}</Avatar>
          <div>
            <Typography variant="h5">{group.groupName}
              <IconButton
                color="error"
                onClick={() => handleOpenConfirmation(isAdmin ? 'delete' : 'exit')}
                sx={{ ml: 1 }}
              >
                {(isAdmin ? <Delete /> : <LogoutRoundedIcon />)}
              </IconButton>
            </Typography>
            <Typography variant='body2' sx={{  color: 'GrayText', display: 'inline-block', float: 'right' }}>
              Group created on : <small>{new Date(group.createdAt).toLocaleString()}</small>
            </Typography>
          </div>
        </Box>
        <div>
          <Box display="flex" alignItems="center">
            <Typography variant="subtitle1">Join Code: {group.joinCode}</Typography>
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
          <Typography variant='body2' sx={{  color: 'GrayText', display: 'inline-block', float: 'right' }}>
            Valid till : <small>{new Date(group.joinCodeExpiry).toLocaleString()}</small>
          </Typography>
        </div>
      </Card> */}
      <Card sx={{ p: (isMobile ? '6px' : 3), borderRadius:2 }}>

        <Box
          display="flex"
          flexDirection={isMobile ? 'column' : 'row'}
          justifyContent={isMobile ? 'flex-end' : 'space-between'}
          alignItems={isMobile ? 'flex-start' : 'center'}
          gap={isMobile ? 2 : 0} // Add spacing between sections on mobile
        >
          {/* Group Name Section */}
          <Box display="flex" alignItems="center">
            <Avatar
              alt={group.groupName[0]}
              src={
                group.groupPic
                  ? `data:image/jpeg;base64,${group.groupPic}`
                  : undefined
              }
              sx={{ width: 100, height: 100, mr: 2 }}
            >
              {group.groupName[0]}
            </Avatar>
            <Box>
              <Typography variant="h5">
                {group.groupName}
                <IconButton
                  color="error"
                  onClick={() => handleOpenConfirmation(isAdmin ? 'delete' : 'exit')}
                  sx={{ ml: 1 }}
                >
                  {isAdmin ? <Delete /> : <LogoutRoundedIcon />}
                </IconButton>
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'GrayText',
                  display: isMobile ? 'block' : 'inline-block',
                }}
              >
                Group created on: <small>{new Date(group.createdAt).toLocaleString()}</small>
              </Typography>
            </Box>
          </Box>

          {/* Join Code Section */}
          <Box display="flex" flexDirection={isMobile ? 'column' : 'column'} alignItems="center" ml={isMobile ? '8rem' : '0rem'}>
            <Box display="flex" alignItems="center">
              <Typography variant="subtitle1">
                Join Code: {group.joinCode}
              </Typography>
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
            <Typography
              variant="body2"
              sx={{
                color: 'GrayText',
                display: isMobile ? 'block' : 'inline-block',
                mt: isMobile ? 1 : 0, // Add margin on mobile for spacing
                ml: isMobile ? 0 : 2, // Add margin on desktop for spacing
              }}
            >
              Valid till: <small>{new Date(group.joinCodeExpiry).toLocaleString()}</small>
            </Typography>
          </Box>
        </Box>
      </Card>

      <Box mt={2}>
        <Typography variant="h6">Members:</Typography>
        <Grid container spacing={1}>
          {group.members.map((member) => (
            <Grid sx={{display: 'flex' }} item key={member.user._id} xs={12} sm={6} md={6}>
              <Card sx={{ display: 'flex', width:'100%', p: (isMobile ? '8px' : 2),   gap: 0, borderRadius:2 }}>
                <Avatar
                   alt={member.user.username[0]}
                   src={
                     member.user.profilePic
                       ? `data:image/jpeg;base64,${member.user.profilePic}`
                       : undefined
                   }
                   sx={{ width: 56, height: 56, mr: 2 }}
                >{member.user.username[0]}</Avatar>
                <Box sx={{flexDirection: 'column',  alignItems: 'center', justifyContent: 'space-between', flex: 1}}>
                  <Box sx={{  alignItems: 'center', gap: 0, }}>
                    
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{display: 'inline-block', float: 'right', color: member.balance >= 0 ? 'green' : 'red', fontWeight: 'bold',}}>{member.balance.toFixed(2)}</Typography>
                      <Typography >{member.user.username}</Typography>
                      <Typography variant='body2' sx={{ color: member?.role === "Admin" ? "blue" : "grey" }}>{member.role}</Typography>
                      <Box sx={{marginTop:'8px', marginBottom:'8px'}}>
                        {payments
                        .filter(payment => payment.from === member.user.username || payment.to === member.user.username)
                        .map((payment, index) => (
                          <Typography key={index} variant="body2" sx={{ color: payment.from === member.user.username ? 'red' : 'green' }}>
                            {payment.from === member.user.username
                              ? `You have to pay ₹${payment.amount} to ${payment.to}`
                              : `You get ₹${payment.amount} from ${payment.from}`}
                          </Typography>
                        ))}
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'gray' }}>
                      Joined on: {new Date(member.joined_at).toLocaleString()}
                    </Typography>
                    {isAdmin && member.role === "Member" && (
                      <IconButton
                        color="error"
                        onClick={() =>
                          handleOpenConfirmation1('removeMember', {
                            memberId: member.user._id,
                            memberUsername: member.user.username,
                          })
                        }
                        aria-label="Delete Member"
                      >
                        <LogoutRoundedIcon />
                      </IconButton>
                    )}
                  </Box>
                </Box>
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
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%', borderRadius:'1rem' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Dialog open={confirmationDialog.open} onClose={handleCloseConfirmation} 
        sx={{
          '& .MuiPaper-root': { borderRadius: '16px', },
        }}
      >
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
      <Dialog open={confirmationDialog1.open} onClose={handleCloseConfirmation1}
        sx={{
          '& .MuiPaper-root': { borderRadius: '16px', },
        }}
      >
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmationDialog1.action === 'removeMember'
              ? `Are you sure you want to remove ${confirmationDialog1.data?.memberUsername} from the group?`
              : ''}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmation1}>Cancel</Button>
          <Button
            onClick={handleRemoveMember}
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
