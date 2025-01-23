import React, { useEffect, useState } from 'react';
import {
  Box,
  List,
  Typography,
  Card,
  CardContent,
  Dialog,
  TextField,
  Button,
  IconButton,
  MenuItem,
  Menu,
  Avatar,
  useMediaQuery,
  Grid2,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Layout from '../Layout';
import apiClient from '../../utils/axiosConfig'; // Use axiosConfig here
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import UserGroups from './UserGroups';
import { useTheme } from '@emotion/react';
import GroupDetails from './GroupDetails';

const SettleMate = () => {
  const tokenUsername = localStorage.getItem('tokenUsername');
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [openCreateGroup, setOpenCreateGroup] = useState(false);
  const [openJoinGroup, setOpenJoinGroup] = useState(false);
  const [groupDetails, setGroupDetails] = useState(null);
  const [groupName, setGroupName] = useState('');
  const [groupImage, setGroupImage] = useState(null);
  const [joinCode, setJoinCode] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [groupDetailsId, setGroupDetailsId] = useState(null); // Store the selected group ID

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

  const handleCreateGroup = async () => {
    try {
      const formData = new FormData();
      formData.append('groupName', groupName);
      formData.append('groupPicture', groupImage);

      const response = await apiClient.post('/api/groups/create', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      });

      setGroups([response.data.group, ...groups]);
      setOpenCreateGroup(false);
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const handleJoinGroup = async () => {
    try {
      const response = await apiClient.post(
        '/api/groups/join',
        { joinCode },
        { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
      );

      setGroups([response.data.group, ...groups]);
      setOpenJoinGroup(false);
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  const handleGroupClick = (group) => {
    setGroupDetails(group);
    setGroupDetailsId(group._id);
    if (isMobile) {
      navigate(`/group/${group._id}`);
    }
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
        {/* <UserGroups /> */}

        <Box
          display="flex"
          flexDirection={isMobile ? "column" : "row"}
          gap={1} p={1} sx={{bgcolor: '#f5f5f5', borderRadius:'10px', margin: '-10px'}}
        >
          <Card sx={{
            flex: 1.5, 
            height: '73vh', // Fixed height relative to viewport
            overflowY: 'auto',
            bgcolor: 'white', // Card background color (customizable)
            borderRadius: 3, // Card border radius (customizable)
            boxShadow: 3, // Shadow for a modern look
            scrollbarWidth: 'thin'
        }}>
          <Box sx={{padding: '1rem'}}>
          <Typography position="relative" variant="h6">Groups</Typography>
          <Grid2 style={{paddingTop:'1rem'}}>
            {groups.map((group) => (
              <Card
                key={group._id}
                sx={{  mb: 1, display: 'flex', alignItems: 'center', cursor: 'pointer',  '&:hover': { backgroundColor: '#f5f5f5' }, }}
                onClick={() => handleGroupClick(group)}
              >
                <Avatar src={group.groupPicture} alt={group.groupName} sx={{ width: 56, height: 56, m: 2 }} />
                <Typography variant="h6">{group.groupName}</Typography>
              </Card>
            ))}
            </Grid2>
          </Box>
          </Card>

          {!isMobile && ( <Card sx={{
              flex: 3, padding: '1rem',
              height: '73vh', // Fixed height relative to viewport
              overflowY: 'auto',
              bgcolor: 'white', // Card background color (customizable)
              borderRadius: 3, // Card border radius (customizable)
              boxShadow: 3, // Shadow for a modern look
              scrollbarWidth: 'thin'
          }}>
            {/* <Typography variant="h6">{groupDetails.groupName}</Typography> */}
            { groupDetails && (
              <Card sx={{ p: 1, mt: 1, borderRadius: '8px', backgroundColor: 'transparent' }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center">
                    <Avatar src={groupDetails.groupPicture} alt={groupDetails.groupName} sx={{ width: 56, height: 56, mr: 2 }} />
                    <Typography variant="h6">{groupDetails.groupName}</Typography>
                  </Box>
                  <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                    <MoreVertIcon />
                  </IconButton>
                </Box>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                  PaperProps={{ style: { width: '200px' } }}
                >
                  <MenuItem onClick={() => console.log('Generate Code')}>Generate Group Code</MenuItem>
                </Menu>
              </Card>
            )}
            {groupDetailsId ? (
                <GroupDetails groupId={groupDetailsId} /> // Use GroupDetails component
              ) : (
                <Typography variant="h6">Select a group to see details</Typography>
              )}
          </Card> )}

        </Box>

        <Dialog open={openCreateGroup} onClose={() => setOpenCreateGroup(false)}>
          <Box p={3} display="flex" flexDirection="column" alignItems="center">
            <IconButton component="label">
              <AddPhotoAlternateIcon sx={{ fontSize: 48 }} />
              <input type="file" hidden accept="image/*" onChange={(e) => setGroupImage(e.target.files[0])} />
            </IconButton>
            <TextField
              fullWidth
              margin="normal"
              label="Group Name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
            <Button variant="contained" onClick={handleCreateGroup}>
              Submit
            </Button>
          </Box>
        </Dialog>

        <Dialog open={openJoinGroup} onClose={() => setOpenJoinGroup(false)}>
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
        </Dialog>
      </Box>
    </Layout>
  );
};

export default SettleMate;
