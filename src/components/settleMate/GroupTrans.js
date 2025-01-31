// components/settleMate/GroupTrans.js
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, Avatar, useMediaQuery, IconButton,  Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, } from '@mui/material';
import apiClient from '../../utils/axiosConfig';
import Layout from '../Layout';
import { useTheme } from '@emotion/react';
import WidgetsRoundedIcon from '@mui/icons-material/WidgetsRounded';
import GroupDetails from './GroupDetails';
import CloseIcon from '@mui/icons-material/Close';
import PlaylistAddRoundedIcon from '@mui/icons-material/PlaylistAddRounded';
import GroupTransAdd from './GroupTransAdd';
import GroupTransHistory from './GroupTransHistory';

const GroupTrans = ({ groupId: propGroupId }) => {
  const { groupId: paramGroupId } = useParams(); // Get groupId from URL if available
  const groupId = propGroupId || paramGroupId; // Use propGroupId if provided, else use paramGroupId
  const [group, setGroup] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [isMediaReady, setIsMediaReady] = useState(false); // Track media query readiness
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' }); // Snackbar state
  const [groupError, setGroupError] = useState(false); // Track if the group doesn't exist
  const navigate = useNavigate(); // Initialize navigation
  const [groupDetailsId, setGroupDetailsId] = useState(null); // Store the selected group ID
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const loggedInUserId = localStorage.getItem('userId'); // Get logged-in user's ID
  const [hoveredId, setHoveredId] = useState(null);

  // Fetch group details
  const fetchGroupDetails = useCallback(async () => {
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
  }, [groupId, navigate]);
  
  useEffect(() => {
    setIsMediaReady(true); // Set media query readiness after first render
  }, [isMobile]);

  useEffect(() => {
    fetchGroupDetails(); // Fetch group details on component mount or groupId change
  }, [fetchGroupDetails]);

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  if (!isMediaReady) {
    return null; // Prevent rendering until media query result is ready
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

  const handleGroupClick = (group) => {
    setGroupDetailsId(group._id);
    if (isMobile) {
      navigate(`/group-details/${group._id}`);
    }
  };

  const handleAddTransaction = () => setAddDialogOpen(true);
  const handleCloseAddDialog = () => setAddDialogOpen(false);

  const handleTransactionAdded = (newTransaction) => {
    fetchGroupDetails(); // Refetch group details to update the UI with the new transaction
    console.log('New Transaction:', newTransaction);
  };

  const content = (
    <Box p={isMobile ? '0px' : 0} position="relative" sx={{scrollbarWidth:'none'}}>
      <Box
        position="sticky" //fixed
        top={0}
        left={0}
        right={0}
        zIndex={10}
        sx={{
          bgcolor: 'white', // Background color to ensure visibility
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)', // Optional shadow for separation
          padding: '18px 16px', // Padding for a clean look
          scrollbarWidth:'none'
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{scrollbarWidth:'none', margin: -1}}>
          <Box display="flex" alignItems="center">
            <Avatar
              alt={group.groupName[0]}
              src={
                group.groupPic
                  ? `data:image/jpeg;base64,${group.groupPic}`
                  : undefined
              }
              sx={{ width: 56, height: 56, mr: 2 }}
            >
              {group.groupName[0]}
            </Avatar>
            <Box>
              <Typography variant="h5">
                {group.groupName}
              </Typography>
            </Box>
          </Box>
          <Box display="flex" flexDirection={isMobile ? 'column' : 'column'} alignItems="center" ml={isMobile ? '0rem' : '0rem'}>
            <Box display="flex" alignItems="center">
              <IconButton
                  onClick={() => handleGroupClick(group)}
                  sx={{ ml: 0 }}
                >
                <WidgetsRoundedIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box height={isMobile ? 'calc(80vh - 64px)' : 'calc(77vh - 64px)'} bgcolor="#f5f5f5"
        sx={{
        overflowY: 'auto',
        padding: '0px', scrollbarWidth:'thin'
      }}>
        <Box mt={0} sx={{ scrollbarWidth: 'thin' }}>
        {/* <Typography variant="h6">Group Transactions:</Typography> */}
         <GroupTransHistory transactions={group.transactions} loggedInUserId={loggedInUserId} />
        </Box>

      {/* <Box mt={0}  sx={{scrollbarWidth:'none'}}> */}
      {/* <Box sx={{ height: '70vh', overflowY: 'auto', padding: '8px', scrollbarWidth:'thin' }}> */}
            
          {/* </Box> */}
        {/* <Grid container spacing={1}>
          {group.transactions.map((trans) => (
            <Grid item key={trans.transPerson._id} xs={12} sm={12} md={12}>
              <Card sx={{ display: 'flex', alignItems: 'center', p: (isMobile ? '6px' : 1), justifyContent: 'space-between', marginInline:'0px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar
                    alt={trans.transPerson.username}
                    src={
                      trans.transPerson.profilePic
                        ? `data:image/jpeg;base64,${trans.transPerson.profilePic}`
                        : undefined
                    }
                    sx={{ width: 56, height: 56, mr: 2 }}
                  >{trans.transPerson.username}</Avatar>
                  <Box>
                    <Typography>Added by : {trans.transPerson.username}</Typography>
                    <Typography>Amount : {trans.amount}</Typography>
                    <Typography>Description: {trans.description}</Typography>
                    <Typography variant='body1' sx={{ color: member?.role === "Admin" ? "blue" : "grey" }}>{member.role}</Typography>
                    <Typography variant='body2' sx={{ color: 'GrayText', display: 'inline-block', float: 'right' }}>
                      Added on : <small>{new Date(trans.createdAt).toLocaleString()}</small>
                    </Typography>
                  </Box>
                </Box>
                
              </Card>
            </Grid>
          ))}
        </Grid> */}
        <IconButton
          // onClick={(event) => {
            // event.stopPropagation(); // Prevent triggering the parent onClick
            // handleRemove(product._id);
          // }}
          onMouseEnter={() => setHoveredId(group._id)} // Set hoveredId to the current button's ID
          onMouseLeave={() => setHoveredId(null)} // Reset hoveredId when mouse leaves
          style={{
            position: 'absolute',
            bottom: '15px',
            right: '25px',
            backgroundColor: hoveredId === group._id ? '#ffe6e6' : 'rgba(255, 255, 255, 0.2)',
            borderRadius: hoveredId === group._id ? '6px' : '50%',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            color: 'blue',
            transition: 'all 0.2s ease',
          }}
          onClick={handleAddTransaction}
        >
          {hoveredId === group._id && (
            <span
              style={{
                fontSize: '14px',
                color: '#ff0000',
                marginRight: '8px',
                whiteSpace: 'nowrap',
                opacity: hoveredId === group._id ? 1 : 0,
                transform: hoveredId === group._id ? 'translateX(0)' : 'translateX(10px)',
                transition: 'opacity 0.3s, transform 0.3s',
              }}
            >
              Add Transaction
            </span>
          )}
          <PlaylistAddRoundedIcon />
        </IconButton>
      </Box>
      {/* <Toolbar sx={{
        position:'static',
        bottom: 0,
        left: 0,
        right: 0,
        // bgcolor: 'white', borderRadius:'16px',
        // boxShadow: '0 -2px 5px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '0rem',
      }}>
        <Box style={{ display: 'flex', flexGrow: 1, }}>
          <Button
            variant="contained" size="small"
            // onClick={() => setIsDeliveryAddressBoxOpen((prev) => !prev)}
          >Close
            {isDeliveryAddressBoxOpen ? 'Close Delivery Addresses' : 'Show Delivery Addresses'}
          </Button>
        </Box>
        <Box >
          <IconButton
            // onClick={handleOpenDeleteDialog}
            // onMouseEnter={() => setHoveredId(userData._id)} // Set hoveredId to the current button's ID
            // onMouseLeave={() => setHoveredId(null)} // Reset hoveredId when mouse leaves
            style={{

              // backgroundColor: hoveredId === userData._id ? '#ffe6e6' : 'rgba(255, 255, 255, 0.2)',
              // borderRadius: hoveredId === userData._id ? '6px' : '50%',
              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              alignItems: 'center', color: 'red'
              // transition: 'all 0.2s ease',
            }}
          >
            {hoveredId && (
              <span
                style={{
                  fontSize: '14px',
                  color: '#ff0000',
                  marginRight: '8px',
                  whiteSpace: 'nowrap',
                  opacity: hoveredId === userData._id ? 1 : 0,
                  transform: hoveredId === userData._id ? 'translateX(0)' : 'translateX(10px)',
                  transition: 'opacity 0.3s, transform 0.3s',
                }}
              >
                Delete User Account
              </span>
            )}
            <CloseIcon />
          </IconButton>
        </Box>
      </Toolbar> */}
      {/* </Box> */}
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
      <Dialog open={!!groupDetailsId} onClose={() => setGroupDetailsId(null)} /* onClose={handleCloseConfirmation1} */ maxWidth="md" fullWidth
        sx={{padding: isMobile ? '1rem' : '0rem',
          '& .MuiPaper-root': { borderRadius: '16px', },
        }}
        >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} >
          Group details
          <IconButton
            aria-label="close"
            onClick={() => setGroupDetailsId(null)} // Close the dialog
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {!isMobile && (<Box sx={{
            flex: 3, marginInline: '0rem',
            height: '70vh', // Fixed height relative to viewport
            overflowY: 'auto',
            bgcolor: 'white', // Card background color (customizable)
            borderRadius: 2, // Card border radius (customizable)
            // boxShadow: 3, // Shadow for a modern look
            scrollbarWidth: 'thin'
          }}>
              <Box sx={{ margin: '0rem' }}>
                <GroupDetails groupId={groupDetailsId} /> {/* // Use GroupDetails component */}
              </Box>
          </Box>)}
        </DialogContent>
        <DialogActions>
        </DialogActions>
      </Dialog>
      {/* Dialog for Adding Group Transaction */}
      <GroupTransAdd
        open={isAddDialogOpen}
        onClose={handleCloseAddDialog}
        group={group} isMobile={isMobile}
        onTransactionAdded={handleTransactionAdded}
      />
    </>
  );
};

export default GroupTrans;
