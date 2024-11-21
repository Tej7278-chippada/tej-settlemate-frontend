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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Layout from '../Layout';
import apiClient from '../../utils/axiosConfig'; // Use axiosConfig here
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import UserGroups from './UserGroups';

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
      const response = await apiClient.get('/api/groups', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
      });
      setGroups(response.data.groups || []);
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
        <UserGroups />

        <Box>
          {groups.map((group, index) => (
            <Card
              key={index}
              sx={{ mb: 2, display: 'flex', alignItems: 'center', cursor: 'pointer' }}
              onClick={() => setGroupDetails(group)}
            >
              <Avatar src={group.groupPicture} alt={group.groupName} sx={{ width: 56, height: 56, m: 2 }} />
              <Typography variant="h6">{group.groupName}</Typography>
            </Card>
          ))}
        </Box>

        {groupDetails && (
          <Card sx={{ p: 2, mt: 2 }}>
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
