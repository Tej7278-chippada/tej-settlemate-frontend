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
              justifyContent: trans.transPerson._id === loggedInUserId ? 'flex-end' : 'flex-start',
            }}
          >
            <Card
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                p: 1, mb: '8px',
                maxWidth: isMobile ? '100%' : '60%',
                backgroundColor: trans.transPerson._id === loggedInUserId ? '#dcf8c6' : '#e3f2fd',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', borderRadius:'14px'
              }}
            >
              {/* {!(trans.transPerson._id === loggedInUserId) && ( */}
              <Avatar
                alt={trans.transPerson.username}
                src={
                  trans.transPerson.profilePic
                    ? `data:image/jpeg;base64,${trans.transPerson.profilePic}`
                    : undefined
                }
                sx={{ width: 38, height: 38, mr: 2 }}
              >
                {trans.transPerson.username[0]}
              </Avatar>
              {/* )} */}
              <Box>
              <Typography variant="body1" sx={{float:'inline-end'}}>₹{trans.amount}</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {trans.transPerson.username}
                </Typography>
                <Typography variant="body2" noWrap sx={{  color: 'GrayText' }}>
                  {trans.description.length > 50
                      ? `${trans.description.substring(0, 50)}...`
                      : trans.description}
                </Typography>
                <Typography variant="caption" sx={{ color: 'GrayText', display: 'block', textAlign: 'right'}}>
                  {new Date(trans.createdAt).toLocaleString()}
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
