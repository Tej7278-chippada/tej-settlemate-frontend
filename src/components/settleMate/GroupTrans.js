// components/settleMate/GroupTrans.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, Card, Avatar, Grid, useMediaQuery, IconButton,  Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, } from '@mui/material';
import apiClient from '../../utils/axiosConfig';
import Layout from '../Layout';
import { useTheme } from '@emotion/react';
import WidgetsRoundedIcon from '@mui/icons-material/WidgetsRounded';
import GroupDetails from './GroupDetails';
import CloseIcon from '@mui/icons-material/Close';
import PlaylistAddRoundedIcon from '@mui/icons-material/PlaylistAddRounded';

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

  const handleGroupClick = (group) => {
    setGroupDetailsId(group._id);
    if (isMobile) {
      navigate(`/group-details/${group._id}`);
    }
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
          padding: '8px 16px', // Padding for a clean look
          scrollbarWidth:'none'
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{scrollbarWidth:'none'}}>
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
      <Box height={isMobile ? 'calc(80vh - 64px)' : 'calc(75vh - 64px)'}
        sx={{
        overflowY: 'auto',
        padding: '8px', scrollbarWidth:'thin'
      }}>
      

      <Box mt={0} height={ isMobile ? 'calc(71vh)' : 'calc(66vh)'} bgcolor="#f5f5f5" sx={{scrollbarWidth:'none'}}>
        <Typography variant="h6">Members:</Typography>
        <Grid container spacing={1}>
        </Grid>
        <IconButton
          // onClick={(event) => {
            // event.stopPropagation(); // Prevent triggering the parent onClick
            // handleRemove(product._id);
          // }}
          // onMouseEnter={() => setHoveredId(product._id)} // Set hoveredId to the current button's ID
          // onMouseLeave={() => setHoveredId(null)} // Reset hoveredId when mouse leaves
          style={{
            position: 'absolute',
            bottom: '15px',
            right: '25px',
            // backgroundColor: hoveredId === product._id ? '#ffe6e6' : 'rgba(255, 255, 255, 0.2)',
            // borderRadius: hoveredId === product._id ? '6px' : '50%',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            //  color: 'red'
            // transition: 'all 0.2s ease',
          }}
        >
          {/* {hoveredId === product._id && (
            <span
              style={{
                fontSize: '14px',
                color: '#ff0000',
                marginRight: '8px',
                whiteSpace: 'nowrap',
                opacity: hoveredId === product._id ? 1 : 0,
                transform: hoveredId === product._id ? 'translateX(0)' : 'translateX(10px)',
                transition: 'opacity 0.3s, transform 0.3s',
              }}
            >
              Remove from Wishlist
            </span>
          )} */}
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
      <Dialog open={!!groupDetailsId} onClose={() => setGroupDetailsId(null)} /* onClose={handleCloseConfirmation1} */ maxWidth="md" fullWidth>
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
          {!isMobile && (<Card sx={{
            flex: 3, marginInline: '-1rem',
            height: '80vh', // Fixed height relative to viewport
            overflowY: 'auto',
            bgcolor: 'white', // Card background color (customizable)
            borderRadius: 2, // Card border radius (customizable)
            // boxShadow: 3, // Shadow for a modern look
            scrollbarWidth: 'thin'
          }}>
              <Box sx={{ margin: '-1rem' }}>
                <GroupDetails groupId={groupDetailsId} /> {/* // Use GroupDetails component */}
              </Box>
          </Card>)}
        </DialogContent>
        <DialogActions>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default GroupTrans;
