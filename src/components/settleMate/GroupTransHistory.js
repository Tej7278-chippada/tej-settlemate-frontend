// components/settleMate/GroupTransHistory.js
import React from 'react';
import { Box, Typography, Card, Avatar, Grid, useMediaQuery } from '@mui/material';
import { useTheme } from '@emotion/react';

const GroupTransHistory = ({ transactions, loggedInUserId }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        height: '96%',
        overflowY: 'auto',
        padding: '8px', scrollbarWidth:'thin'
      }}
    >
      <Grid container spacing={0} direction="row-reverse">
        {transactions.map((trans) => (
          <Grid
            item
            key={trans._id}
            xs={12}
            sx={{
              display: 'flex',
              justifyContent: trans.transPerson === loggedInUserId ? 'flex-end' : 'flex-start',
            }}
          >
            <Card
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                p: 1, mb: 1,
                maxWidth: isMobile ? '100%' : '60%',
                backgroundColor: trans.transPerson === loggedInUserId ? '#e3f2fd' : '#ffffff',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Avatar
                alt={trans.transPerson.username}
                src={
                  trans.transPerson.profilePic
                    ? `data:image/jpeg;base64,${trans.transPerson.profilePic}`
                    : undefined
                }
                sx={{ width: 48, height: 48, mr: 2 }}
              >
                {trans.transPerson.username}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  {trans.transPerson.username}
                </Typography>
                <Typography variant="body2">Amount: ₹{trans.amount}</Typography>
                <Typography variant="body2" noWrap sx={{ maxWidth: '150px' }}>
                  Description: {trans.description}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Added on: {new Date(trans.createdAt).toLocaleString()}
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default GroupTransHistory;
