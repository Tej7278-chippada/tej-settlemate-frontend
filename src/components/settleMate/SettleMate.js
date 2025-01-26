// components/settleMate/settleMate.js
import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, Avatar, useMediaQuery, Snackbar, Alert, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Layout from '../Layout';
import apiClient from '../../utils/axiosConfig'; // Use axiosConfig here
import { useTheme } from '@emotion/react';
import GroupDetails from './GroupDetails';
import CreateGroup from './CreateGroup';
import JoinGroup from './JoinGroup';
import SkeletonGroups from './SkeletonGroups';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import Diversity2RoundedIcon from '@mui/icons-material/Diversity2Rounded';


const SettleMate = () => {
  const tokenUsername = localStorage.getItem('tokenUsername');
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [openCreateGroup, setOpenCreateGroup] = useState(false);
  const [openJoinGroup, setOpenJoinGroup] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [groupDetailsId, setGroupDetailsId] = useState(null); // Store the selected group ID
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' }); // For notifications
  const [loading, setLoading] = useState(true); // Track loading state

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      navigate('/');
    } else {
      const fetchGroups = async () => {
        try {
          const response = await apiClient.get('/api/groups', {
            headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
          });
          setGroups(response.data.groups.reverse() || []);
        } catch (error) {
          if (error.response && error.response.status === 401) {
            console.error('Unauthorized user, redirecting to login');
            navigate('/');
          } else {
            console.error('Error fetching groups:', error);
          }
        } finally {
          setLoading(false); // Stop loading
        }
      };
      fetchGroups();
    }
  }, [navigate]);

  const handleGroupClick = (group) => {
    setGroupDetailsId(group._id);
    if (isMobile) {
      navigate(`/group/${group._id}`);
    }
  };

  const handleGroupCreated = (newGroup) => {
    setGroups([newGroup, ...groups]);
  };

  const handleGroupJoined = (newGroup) => {
    setGroups([newGroup, ...groups]);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Layout username={tokenUsername}>
      <Box  mt={isMobile ? '4px' : '8px'} mb={isMobile ? '4px' : '8px'}>  {/* m={isMobile ? '8px' : '1rem'} sx={{ marginTop: (isMobile ? '-2rem' : '-1rem')}} */}
        {/* <Box display="flex" justifyContent="space-between" mb={2}>
          <Button variant="contained" onClick={() => setOpenCreateGroup(true)}>
            Create Group
          </Button>
          <Button variant="outlined" onClick={() => setOpenJoinGroup(true)}>
            Join Group
          </Button>
        </Box> */}
        <CreateGroup
          open={openCreateGroup}
          onClose={() => setOpenCreateGroup(false)}
          onGroupCreated={handleGroupCreated}
        />
        <JoinGroup
          open={openJoinGroup}
          onClose={() => setOpenJoinGroup(false)}
          onGroupJoined={handleGroupJoined}
        />

        <Box
          display="flex"
          flexDirection={isMobile ? "column" : "row"}
          gap={1} p={isMobile ? '6px' : 1} sx={{ bgcolor: '#f5f5f5', borderRadius: '10px',  }} /* p={isMobile ? '6px' : 1} paddingBottom:(isMobile ? '4px' : '8px' ), paddingTop:(isMobile ? '0px' : '8px' ) */
        >
          <Card sx={{
            flex: 1.5,
            height: '80vh', // Fixed height relative to viewport
            overflowY: 'auto',
            bgcolor: 'white', // Card background color (customizable)
            borderRadius: 2, // Card border radius (customizable)
            // boxShadow: 3, // Shadow for a modern look
            scrollbarWidth: 'none'
          }}>
            
            <Box height={isMobile ? "77vh" : "auto"} sx={{ padding: '0px' }}>
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
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography position="relative" variant="h5">Groups</Typography>
                  <Box>
                    <IconButton
                      color="default"
                      onClick={() => setOpenCreateGroup(true)}
                      sx={{ mr: 1 }}
                    >
                      <Diversity2RoundedIcon />
                    </IconButton>
                    <IconButton
                      color="default"
                      onClick={() => setOpenJoinGroup(true)}
                    >
                      <PersonAddRoundedIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Box>

              {/* <Typography position="relative" variant="h6">Groups</Typography> */}

              {/* <Grid2 style={{ paddingTop: '1rem' }}> */}
              <Box
                // mt="64px" // Matches the approximate height of the fixed header
                height="calc(80vh - 64px)" // Adjust the height of the scrollable area
                sx={{
                  overflowY: 'auto',
                  padding: '8px', scrollbarWidth:'none'
                }}
              >
                <Box style={{ paddingTop: '8px', paddingBottom: '1rem' }}>
                  {loading ? (
                    <SkeletonGroups /> // Show SkeletonGroups while loading
                  ) : (
                    groups.map((group) => (
                      <Card
                        key={group._id}
                        sx={{
                          mb: 1,
                          display: 'flex',
                          alignItems: 'center',
                          cursor: 'pointer',
                          '&:hover': { backgroundColor: '#f5f5f5' },
                        }}
                        onClick={() => handleGroupClick(group)}
                      >
                        <Avatar
                          src={
                            group.groupPic
                              ? `data:image/jpeg;base64,${group.groupPic}`
                              : 'https://placehold.co/56x56?text=No+Image'
                          }
                          alt={group.groupName}
                          sx={{ width: 56, height: 56, mr: 2, m: 1 }}
                        />
                        <Typography variant="h6" m="1rem">
                          {group.groupName}
                        </Typography>
                      </Card>
                    ))
                  )}
                </Box>
              </Box>

              {/* </Grid2> */}

            </Box>
          </Card>

          {!isMobile && (<Card sx={{
            flex: 3, padding: '0rem',
            height: '80vh', // Fixed height relative to viewport
            overflowY: 'auto',
            bgcolor: 'white', // Card background color (customizable)
            borderRadius: 2, // Card border radius (customizable)
            // boxShadow: 3, // Shadow for a modern look
            scrollbarWidth: 'thin'
          }}>
            {groupDetailsId ? (
              <Box sx={{ margin: '0rem' }}>
                <GroupDetails groupId={groupDetailsId} /> {/* // Use GroupDetails component */}
              </Box>
            ) : (
              <Box sx={{ margin: '0rem', textAlign: 'center', marginTop:'1rem' }}>
                <Typography variant="h6" color="grey">Select a group to see details</Typography>
              </Box>
            )}
          </Card>)}

        </Box>

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
      </Box>
    </Layout>
  );
};

export default SettleMate;
