// src/components/SkeletonGroups.js
import React from 'react';
import { Box, Skeleton, Card, } from '@mui/material';

function SkeletonGroups() {
  return (
    <Box sx={{ padding: '0px' }}>
      {/* <Grid container spacing={2}> */}
        {/* Groups List Skeleton */}
        {/* <Grid item xs={12} md={4}> */}
          <Box
            sx={{
            //   height: '65vh', // Matches the Groups section height
            //   borderRadius: 3,
            //   boxShadow: 3,
            //   padding: '1rem',
            //   overflowY: 'auto', scrollbarWidth:'none', backgroundColor:'gray'
            }}
          >
            
            {[...Array(8)].map((_, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                //   marginBottom: 2,
                  cursor: 'pointer', marginBottom:'4px',
                  '&:hover': { backgroundColor: '#f5f5f5' },
                //   padding: '4px',
                  borderRadius: 1,
                }}
              >
                <Card sx={{
              height: '100%', // Matches the Groups section height
              borderRadius: '8px',
            //   boxShadow: 3,
              padding: '8px',
              overflowY: 'auto', scrollbarWidth:'none', width:'100%'
            }}>
                <Skeleton variant="circular" width={50} height={50} sx={{ marginRight: 3 , float:'inline-start', display: 'inline-block'}} />
                <Skeleton variant="text" width="60%" height={35} sx={{float:'left',}} />
                </Card>
              </Box>
            ))}
          </Box>
        {/* </Grid> */}

      {/* </Grid> */}
    </Box>
  );
}

export default SkeletonGroups;
