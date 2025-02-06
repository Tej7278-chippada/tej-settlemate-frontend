// components/settleMate/settleMate.js
import React, { useCallback, useEffect, useState } from 'react';
import { Box, Typography, Card, Avatar, useMediaQuery, IconButton, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Layout from '../Layout';
import apiClient from '../../utils/axiosConfig'; // Use axiosConfig here
import { useTheme } from '@emotion/react';
import CreateGroup from './CreateGroup';
import JoinGroup from './JoinGroup';
import SkeletonGroups from './SkeletonGroups';
import PersonAddRoundedIcon from '@mui/icons-material/PersonAddRounded';
import Diversity2RoundedIcon from '@mui/icons-material/Diversity2Rounded';
import GroupTrans from './GroupTrans';


const SettleMate = () => {
  const tokenUsername = localStorage.getItem('tokenUsername');
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [openCreateGroup, setOpenCreateGroup] = useState(false);
  const [openJoinGroup, setOpenJoinGroup] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [groupDetailsId, setGroupDetailsId] = useState(null); // Store the selected group ID
  // const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' }); // For notifications
  const [loading, setLoading] = useState(true); // Track loading state

  const fetchGroups = useCallback(async () => {
    setLoading(true);
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
      setLoading(false);
    }
  }, [navigate]); // ✅ Add 'navigate' as dependency

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      navigate('/');
    } else {
      fetchGroups(); // ✅ Fetch groups on component mount
    }
  }, [fetchGroups, navigate]); // ✅ Add 'fetchGroups' and 'navigate' in dependencies

  const handleGroupClick = (group) => {
    setGroupDetailsId(group._id);
    if (isMobile) {
      navigate(`/group/${group._id}`);
    }
  };

  // Refetch groups on successful creation
  const handleGroupCreated = async () => {
    // setNotification({ open: true, message: 'Group created successfully!', severity: 'success' });
    await fetchGroups(); // Refetch groups
  };

  // Refetch groups on successful join
  const handleGroupJoined = async () => {
    // setNotification({ open: true, message: 'Joined group successfully!', severity: 'success' });
    await fetchGroups(); // Refetch groups
  };

  // const handleCloseNotification = () => {
  //   setNotification({ ...notification, open: false });
  // };

  return (
    <Layout username={tokenUsername}>
      <Box mt={isMobile ? '2px' : '4px'} mb={isMobile ? '4px' : '8px'}>
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
          gap={1} p={isMobile ? '4px' : 1} sx={{ bgcolor: '#f5f5f5', borderRadius: '10px', }} /* p={isMobile ? '6px' : 1} paddingBottom:(isMobile ? '4px' : '8px' ), paddingTop:(isMobile ? '0px' : '8px' ) */
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
              <Box bgcolor="#f5f5f5"
                // mt="64px" // Matches the approximate height of the fixed header
                height="calc(80vh - 64px)" // Adjust the height of the scrollable area
                sx={{
                  overflowY: 'auto',
                  paddingInline: isMobile ? '4px' : '6px', scrollbarWidth: 'none'
                }}
              >
                <Box style={{ paddingTop: '8px', paddingBottom: '1rem' }}>
                  {loading ? (
                    <SkeletonGroups /> // Show SkeletonGroups while loading
                  ) : groups.length === 0 ? (
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        textAlign: 'center',
                        padding: '16px',
                      }}
                    >
                      <Typography variant="h6" color="textSecondary" gutterBottom>
                        You don't have any groups.
                      </Typography>
                      <Typography variant="body1" color="textSecondary" gutterBottom>
                        Create a new group or join an existing one to get started.
                      </Typography>
                      <Box mt={2}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => setOpenCreateGroup(true)}
                          sx={{ mr: 2 }}
                        >
                          Create Group
                        </Button>
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={() => setOpenJoinGroup(true)}
                        >
                          Join Group
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    groups.map((group) => (
                      <Box
                        key={group._id}
                        sx={{
                          mb: '4px',
                          display: 'flex',
                          alignItems: 'center', boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)', backgroundColor: 'white',
                          cursor: 'pointer', borderRadius: '8px',
                          // '&:hover': { backgroundColor: '#f5f5f5' },
                          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                          WebkitTapHighlightColor: 'transparent', // Removes the default tap highlight
                        }}
                        onClick={() => handleGroupClick(group)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.02)'; // Slight zoom on hover
                          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)'; // Enhance shadow
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)'; // Revert zoom
                          e.currentTarget.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)'; // Revert shadow
                        }}
                        onTouchStart={(e) => {
                          if (e.currentTarget) {
                            e.currentTarget.style.transform = 'scale(1.03)';
                            e.currentTarget.style.boxShadow = '0 6px 14px rgba(0, 0, 0, 0.2)'; // More subtle effect
                            e.currentTarget.style.borderRadius = '14px'; // Ensure smooth edges
                          }
                        }}
                        onTouchEnd={(e) => {
                          if (e.currentTarget) {
                            setTimeout(() => {
                              if (e.currentTarget) {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                              }
                            }, 150);
                          }
                        }}
                      >
                        <Avatar
                          src={
                            group.groupPic
                              ? `data:image/jpeg;base64,${group.groupPic}`
                              : 'https://placehold.co/56x56?text=No+Image'
                          }
                          alt={group.groupName}
                          sx={{ width: 50, height: 50, marginInline: 1 }}
                        />
                        <Typography variant="h6" m="1rem">
                          {group.groupName}
                        </Typography>
                      </Box>
                    ))
                  )}
                </Box>
              </Box>
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
                <GroupTrans groupId={groupDetailsId} /> {/* // Use GroupDetails component */}
              </Box>
            ) : (
              <Box sx={{ margin: '0rem', textAlign: 'center', marginTop: '1rem' }}>
                <Typography variant="h6" color="grey">Select a group to see details</Typography>
              </Box>
            )}
          </Card>)}

        </Box>

        {/* <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
            {notification.message}
          </Alert>
        </Snackbar> */}
      </Box>
    </Layout>
  );
};

export default SettleMate;
