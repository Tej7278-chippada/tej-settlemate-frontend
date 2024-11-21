import React, { useEffect, useState } from 'react';
// import axios from '../utils/axiosConfig';
import { Box, Typography, Card, CardContent, CircularProgress, Alert } from '@mui/material';
import apiClient from '../../utils/axiosConfig';

const UserGroups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const authToken = JSON.parse(localStorage.getItem('authToken'));
        if (!authToken) {
          setError('No authentication token found.');
          setLoading(false);
          return;
        }

        const tokenUsername = localStorage.getItem('tokenUsername');
        const token = authToken[tokenUsername];

        const response = await apiClient.get('/api/groups', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setGroups(response.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch groups.');
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Your Groups
      </Typography>
      {groups.length === 0 ? (
        <Typography variant="body1">You are not a member of any groups.</Typography>
      ) : (
        groups.map((group) => (
          <Card key={group._id} style={{ margin: '10px 0' }}>
            <CardContent>
              <Typography variant="h6">{group.groupName}</Typography>
              <Typography variant="body2">Created by: {group.createdBy.username}</Typography>
              <Typography variant="body2">
                Members: {group.members.length}
              </Typography>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
};

export default UserGroups;
