// GroupDetails.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Card, Avatar, Grid, useMediaQuery } from '@mui/material';
import apiClient from '../../utils/axiosConfig';
import Layout from '../Layout';
import { useTheme } from '@emotion/react';

const GroupDetails = ({groupId: propGroupId}) => {
  // const { groupId } = useParams();
  const { groupId: paramGroupId } = useParams(); // Get groupId from URL if available
  const groupId = propGroupId || paramGroupId; // Use propGroupId if provided, else use paramGroupId
  const [group, setGroup] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [isMediaReady, setIsMediaReady] = useState(false); // Track media query readiness


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
      <Typography>Loading...</Typography>
    );
  }

  const content = (
    <Box p={3}>
      <Card sx={{ p: 3, display: 'flex', justifyContent: 'space-between' }}>
        <div>
        <Typography variant="h5">{group.groupName}</Typography>
        <Typography sx={{ display: 'inline-block', float: 'right' }}>
          <small>{new Date(group.createdAt).toLocaleString()}</small>
        </Typography>
        </div>
        <div>
        <Typography variant="subtitle1">Code: {group.joinCode}</Typography>
        <Typography sx={{ display: 'inline-block', float: 'right' }}>
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
                <Avatar sx={{ mr: 2 }}>{member.user.username[0]}</Avatar>
                <Typography>{member.user.username}</Typography>
                <div style={{ display: 'inline-block', float: 'right', marginLeft:'1rem', }}>
                <Typography sx={{ color: member?.role === "Admin" ? "blue" : "grey"}}>{member.role}</Typography>
                <Typography sx={{ display: 'inline-block', float: 'right' }}>
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

  return isMobile ? <Layout>{content}</Layout> : content;
};

export default GroupDetails;
