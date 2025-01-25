// components/settleMate/settleMate.js
import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  // Dialog,
  // TextField,
  Button,
  Avatar,
  useMediaQuery,
  Grid2,
  Snackbar,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Layout from '../Layout';
import apiClient from '../../utils/axiosConfig'; // Use axiosConfig here
import { useTheme } from '@emotion/react';
import GroupDetails from './GroupDetails';
import CreateGroup from './CreateGroup';
import JoinGroup from './JoinGroup';

const SettleMate = () => {
  const tokenUsername = localStorage.getItem('tokenUsername');
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [openCreateGroup, setOpenCreateGroup] = useState(false);
  const [openJoinGroup, setOpenJoinGroup] = useState(false);
  // const [joinCode, setJoinCode] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [groupDetailsId, setGroupDetailsId] = useState(null); // Store the selected group ID
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' }); // For notifications


  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      navigate('/');
    } else {
      fetchGroups();
    }
  }, [navigate]);

  const fetchGroups = async () => {
    try {
      const response = await apiClient.get('/api/groups/user-groups', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      });
      setGroups(response.data.groups.reverse() || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  // const handleJoinGroup = async () => {
  //   try {
  //     const response = await apiClient.post(
  //       '/api/groups/join',
  //       { joinCode },
  //       { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
  //     );

  //     setGroups([response.data.group, ...groups]);
  //     setOpenJoinGroup(false);
  //   } catch (error) {
  //     console.error('Error joining group:', error);
  //   }
  // };

  const handleGroupClick = (group) => {
    setGroupDetailsId(group._id);
    if (isMobile) {
      navigate(`/group/${group._id}`);
    }
  };

  const handleGroupCreated = (newGroup) => {
    setGroups([newGroup, ...groups]);
    // showNotification(`Group created successfully.`, "success");
  };

  const handleGroupJoined = (newGroup) => {
    setGroups([newGroup, ...groups]);
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const showNotification = (message, severity) => {
    setNotification({ open: true, message, severity });
  };

  return (
    <Layout username={tokenUsername}>
      <Box p={2}>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Button variant="contained" onClick={() => setOpenCreateGroup(true)}>
            Create Group
          </Button>
          <Button variant="outlined" onClick={() => setOpenJoinGroup(true)}>
            Join Group
          </Button>
        </Box>
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

        {/* <UserGroups /> */}

        <Box
          display="flex"
          flexDirection={isMobile ? "column" : "row"}
          gap={1} p={1} sx={{ bgcolor: '#f5f5f5', borderRadius: '10px', margin: '-10px' }}
        >
          <Card sx={{
            flex: 1.5,
            height: '77vh', // Fixed height relative to viewport
            overflowY: 'auto',
            bgcolor: 'white', // Card background color (customizable)
            borderRadius: 3, // Card border radius (customizable)
            boxShadow: 3, // Shadow for a modern look
            scrollbarWidth: 'thin'
          }}>
            <Box sx={{ padding: '1rem' }}>
              <Typography position="relative" variant="h6">Groups</Typography>
              <Grid2 style={{ paddingTop: '1rem' }}>
                {groups.map((group) => (
                  <Card
                    key={group._id}
                    sx={{ mb: 1, display: 'flex', alignItems: 'center', cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' }, }}
                    onClick={() => handleGroupClick(group)}
                  >
                    {/* <Avatar src={group.groupPicture} alt={group.groupName} sx={{ width: 56, height: 56, m: 2 }} /> */}
                    {/* <Avatar
                  alt={group.groupName[0]}
                  src={
                    group.groupPic
                      ? `data:image/jpeg;base64,${group.groupPic}`
                      : undefined
                  }
                  sx={{ width: 56, height: 56, m: 2 }}
                >{group.groupName[0]}</Avatar> */}
                    <Avatar
                      src={
                        group.groupPic
                          ? `data:image/jpeg;base64,${group.groupPic}`
                          : 'https://placehold.co/56x56?text=No+Image'
                      }
                      alt={group.groupName}
                      sx={{ width: 56, height: 56, mr: 2, m: 1 }}
                    />
                    <Typography variant="h6">{group.groupName}</Typography>
                  </Card>
                ))}
              </Grid2>
            </Box>
          </Card>

          {!isMobile && (<Card sx={{
            flex: 3, padding: '1rem',
            height: '73vh', // Fixed height relative to viewport
            overflowY: 'auto',
            bgcolor: 'white', // Card background color (customizable)
            borderRadius: 3, // Card border radius (customizable)
            boxShadow: 3, // Shadow for a modern look
            scrollbarWidth: 'thin'
          }}>
            {groupDetailsId ? (
              <Box sx={{ margin: '-2rem' }}>
                <GroupDetails groupId={groupDetailsId} /> {/* // Use GroupDetails component */}
              </Box>
            ) : (
              <Box sx={{margin:'2rem', textAlign: 'center' }}>
              <Typography variant="h6">Select a group to see details</Typography>
              </Box>
            )}
          </Card>)}

        </Box>



        {/* <Dialog open={openJoinGroup} onClose={() => setOpenJoinGroup(false)}>
          <Box p={3} display="flex" flexDirection="column">
            <TextField
              fullWidth
              margin="normal"
              label="Group Code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
            />
            <Button variant="contained" onClick={handleJoinGroup}>
              Submit
            </Button>
          </Box>
        </Dialog> */}
        
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
