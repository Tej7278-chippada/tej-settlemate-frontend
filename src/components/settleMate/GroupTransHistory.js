// components/settleMate/GroupTransHistory.js
import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Card, Avatar, Grid, useMediaQuery, IconButton } from '@mui/material';
import { useTheme } from '@emotion/react';
import KeyboardDoubleArrowDownRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowDownRounded';
import TransDetails from './TransDetails';

const GroupTransHistory = ({ transactions: initialTransactions, loggedInUserId, socket, groupId }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [transactions, setTransactions] = useState(initialTransactions);
  const bottomRef = useRef(null); // Reference to the last transaction

  // Debugging: Log transactions when they change
  // useEffect(() => {
  //   console.log('Transactions in GroupTransHistory:', transactions);
  // }, [transactions]);
  
  // Listen for new transactions via WebSocket
  useEffect(() => {
    if (socket) {
      socket.on('newTransaction', (newTransaction) => {
        // console.log('New transaction received:', newTransaction); // Debugging

        // Check if profilePic is valid
      // console.log('transPerson.profilePic:', newTransaction.transPerson?.profilePic);
      // newTransaction.paidBy.forEach((user, index) => console.log(`paidBy[${index}].profilePic:`, user.profilePic));
      // newTransaction.splitsTo.forEach((user, index) => console.log(`splitsTo[${index}].profilePic:`, user.profilePic));

        setTransactions((prevTransactions) => [...prevTransactions, newTransaction]);
      });

      // Cleanup listener on unmount
      return () => {
        socket.off('newTransaction');
      };
    }
  }, [socket]);
  
  useEffect(() => {
    // Instantly scroll to the latest transaction without animation
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [transactions.length]); // Runs every time transactions update

  const handleTransactionClick = (transaction) => {
    setSelectedTransaction(transaction);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedTransaction(null);
  };

  if (transactions.length === 0) {
    return (
      <Box sx={{ margin: '2rem', textAlign: 'center' }}>
        <Typography variant="h6" color="grey">Don't have Transactions on this group...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        height: '96%',
        overflowY: 'auto',
        padding: '8px', scrollbarWidth: 'thin'
      }}
    >
      <Grid container spacing={0} direction="row-reverse">
        {transactions.map((trans, index) => (
          <Grid
            item
            key={trans._id}
            xs={12}
            sx={{
              display: 'flex',
              justifyContent: trans.transPerson._id === loggedInUserId ? 'flex-end' : 'flex-start',
            }}
            ref={index === transactions.length - 1 ? bottomRef : null} // Attach ref to last transaction
          >
            <Card
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center', cursor: 'pointer',
                p: 1, mb: '8px',
                maxWidth: isMobile ? '80%' : '60%',
                backgroundColor: trans.transPerson._id === loggedInUserId ? '#dcf8c6' : '#e3f2fd',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', borderRadius: '14px'
              }}
              onClick={() => handleTransactionClick(trans)}
            >
              {/* {!(trans.transPerson._id === loggedInUserId) && ( */}
              <Avatar
                alt={trans.transPerson.username || 'Unknown'}
                src={
                  trans.transPerson.profilePic
                    ? `data:image/jpeg;base64,${trans.transPerson.profilePic}`
                    : undefined
                }
                sx={{ width: 38, height: 38, mr: 2 }}
              >
                {trans.transPerson?.username?.charAt(0) || 'U'}
              </Avatar>
              {/* )} */}
              <Box>
                <Typography variant="body1" sx={{ display: 'block', float: 'inline-end' }}>₹{trans.amount}</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {trans.transPerson.username || 'Unknown'}
                </Typography>
                <Typography variant="body2" noWrap sx={{ color: 'GrayText',
                  whiteSpace: "pre-wrap", // Retain line breaks and tabs
                  wordWrap: "break-word",
                 }}>
                  {trans.description.length > 50
                    ? `${trans.description.substring(0, 50)}...`
                    : trans.description}
                </Typography>
                {/* <Typography
                          variant="body2"
                          color="textSecondary"
                          style={{
                            marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis',
                            maxHeight: '4.5rem',  // This keeps the text within three lines based on the line height.
                            lineHeight: '1.5rem'  // Adjust to control exact line spacing.
                          }}>
                          {trans.description}
                        </Typography> */}
                <Typography variant="caption" sx={{ color: 'GrayText', display: 'block', textAlign: 'right' }}>
                  {new Date(trans.createdAt).toLocaleString()}
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
      <IconButton
          style={{
            position: 'absolute',
            bottom: '45px',
            right: '5px',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            // padding: '4px', // Reduce padding to shrink button size
            // width: '30px', // Set smaller width
            // height: '30px', // Set smaller height
          }}
          // onClick={handleAddTransaction}
        >
          <KeyboardDoubleArrowDownRoundedIcon style={{ fontSize: '14px' }}/>
        </IconButton>

        <TransDetails
        transaction={selectedTransaction}
        open={isDialogOpen} isMobile={isMobile}
        onClose={handleCloseDialog}
      />
    </Box>
  );
};

export default GroupTransHistory;
