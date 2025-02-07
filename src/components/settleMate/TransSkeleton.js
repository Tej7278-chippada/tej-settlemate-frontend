import React from 'react';
import { Box, Grid, Card, Avatar, Skeleton } from '@mui/material';
// import KeyboardDoubleArrowDownRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowDownRounded';

const TransSkeleton = ({ isMobile }) => {
  // Number of skeleton items to display
  const skeletonCount = 12;

  return (
    <Box sx={{ position:'relative'}}>
        <Box position="sticky" top={0}
        left={0}
        right={0}
        zIndex={10}>
            <Box
                sx={{ bgcolor:'white',
                display: 'flex', position:'sticky',
                flexDirection: 'row',
                alignItems: 'center', scrollbarWidth:'thin',
                cursor: 'pointer',
                p: 1,
                mb: '8px', width:'100%', height:'60px',
                // maxWidth: isMobile ? '80%' : '60%',
                // backgroundColor: '#e0e0e0', // Light gray background for skeleton
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                // borderRadius: '14px',
                opacity: 1,
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                WebkitTapHighlightColor: 'transparent',
                }}
            >
                {/* Skeleton Avatar */}
                <Skeleton variant="circular" sx={{ width: 60, height: 40, mr: 2 }}>
                <Avatar />
                </Skeleton>

                {/* Skeleton Content */}
                <Box sx={{ flexGrow: 1, alignItems: 'center', }}>
                <Skeleton variant="rounded" width="30px" height="30px" sx={{ float: 'right', marginRight:'1rem', alignItems: 'center', }} />
                <Skeleton variant="text" width="30%" height={40} sx={{marginRight:'10px'}} />
                {/* <Skeleton variant="text" width="80%" height={16} /> */}
                {/* <Skeleton variant="text" width="50%" height={14} /> */}
                </Box>
            </Box>
        </Box>
        <Box
            sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-end',
            height: '96%',
            overflowY: 'auto',
            padding: '8px',
            scrollbarWidth: 'thin',
            }}
        >
            <Grid container spacing={0} direction="row-reverse">
            {Array.from({ length: skeletonCount }).map((_, index) => (
                <Grid
                item
                key={index}
                xs={12}
                sx={{
                    display: 'flex',
                    justifyContent: index % 4 === 0 ? 'flex-end' : 'flex-start', // Alternate alignment
                }}
                >
                <Card
                    sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    cursor: 'pointer',
                    p: 1,
                    mb: '8px', width:'300px',
                    maxWidth: isMobile ? '80%' : '60%',
                    backgroundColor: '#e0e0e0', // Light gray background for skeleton
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    borderRadius: '14px',
                    opacity: 0.7,
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    WebkitTapHighlightColor: 'transparent',
                    }}
                >
                    {/* Skeleton Avatar */}
                    <Skeleton variant="circular" sx={{ width: 38, height: 38, mr: 2 }}>
                    <Avatar />
                    </Skeleton>

                    {/* Skeleton Content */}
                    <Box sx={{ flexGrow: 1 }}>
                    {/* <Skeleton variant="text" width="40%" height={24} sx={{ float: 'right', marginLeft:'10px' }} /> */}
                    <Skeleton variant="text" width="60%" height={20} sx={{marginRight:'10px'}} />
                    <Skeleton variant="text" width="80%" height={16} />
                    <Skeleton variant="text" width="50%" height={14} />
                    </Box>
                </Card>
                </Grid>
            ))}
            </Grid>

            {/* Skeleton Scroll-to-Bottom Button */}
            {/* <IconButton
            style={{
                position: 'absolute',
                bottom: isMobile ? '50px' : '55px',
                right: isMobile ? '4px' : '12px',
                borderRadius: '24px',
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                padding: '4px',
                width: isMobile ? '30px' : '25px',
                height: isMobile ? '35px' : '30px',
                backgroundColor: '#e0e0e0', // Light gray background for skeleton
            }}
            >
            <KeyboardDoubleArrowDownRoundedIcon style={{ fontSize: '14px' }} />
            </IconButton> */}
        </Box>
    </Box>
  );
};

export default TransSkeleton;