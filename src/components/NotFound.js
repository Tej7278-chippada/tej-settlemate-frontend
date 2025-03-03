import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Box, Typography } from '@mui/material';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Box 
      sx={{ 
        height: '80vh', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        textAlign: 'center', 
        p: 3 
      }}
    >
      <Typography variant="h5" gutterBottom>
        Invalid url, please check the url...
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        Or click on the button below to navigate to the Home page.
      </Typography>
      <Button variant="contained" color="primary" onClick={() => navigate('/helper')}>
        Home
      </Button>
    </Box>
  );
};

export default NotFound;
