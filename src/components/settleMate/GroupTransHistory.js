// components/settleMate/GroupTransHistory.js
import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Card, Avatar, Grid, useMediaQuery, IconButton, Snackbar, Alert } from '@mui/material';
import { useTheme } from '@emotion/react';
import KeyboardDoubleArrowDownRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowDownRounded';
import TransDetails from './TransDetails';

const GroupTransHistory = ({ transactions: initialTransactions, loggedInUserId, socket, groupId, group, isSearchOpen }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [transactions, setTransactions] = useState(initialTransactions);
  const bottomRef = useRef(null); // Reference to the last transaction
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' }); // Snackbar state

  // Debugging: Log transactions when they change
  // useEffect(() => {
  //   console.log('Transactions in GroupTransHistory:', transactions);
  // }, [transactions]);

  useEffect(() => {
    // console.log("Received Transactions:", initialTransactions); // Debugging
    setTransactions(initialTransactions);
  }, [initialTransactions]);
  
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

  // Listen for deleted transactions via WebSocket
  useEffect(() => {
    if (socket) {
      socket.on('transactionDeleted', (data) => {
        // Update the UI to show that the transaction was deleted
        setTransactions((prevTransactions) =>
          // prevTransactions.filter((t) => t._id !== data.transactionId)
          prevTransactions.map((t) =>
            t._id === data.transactionId ? { ...t, deleted: true, deletedBy: data.deletedBy } : t
          )
        );
        // Show a notification
        // alert(`Transaction deleted by ${data.deletedBy}`);
        // setSnackbar({ open: true, message: `Transaction deleted by ${data.deletedBy}`, severity: 'success' });
      });

      // Cleanup listener on unmount
      return () => {
        socket.off('transactionDeleted');
      };
    }
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.on('transactionUpdated', (updatedTransaction) => {
        setTransactions((prevTransactions) =>
          prevTransactions.map((t) =>
            t._id === updatedTransaction._id ? updatedTransaction : t
          )
        );
      });
  
      return () => {
        socket.off('transactionUpdated');
      };
    }
  }, [socket]);

  const scrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  useEffect(() => {
    // Instantly scroll to the latest transaction without animation
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [transactions.length]); // Runs every time transactions update
  
  const handleTransactionClick = (transaction) => {
    // if (!transaction.deleted) {
      setSelectedTransaction(transaction);
      setDialogOpen(true);
    // }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedTransaction(null);
  };

  const handleTransactionDeleted = (transactionId) => {
    // Update the state or refetch the transactions to reflect the deletion
    // setTransactions(transactions.filter(t => t._id !== transactionId));
    setTransactions((prevTransactions) =>
      prevTransactions.map((t) =>
        t._id === transactionId ? { ...t, deleted: true, deletedBy: loggedInUserId } : t
      )
    );
    setSnackbar({ open: true, message: 'Transaction deleted by you successfully', severity: 'success' });
  };

  const handleTransactionUpdated = (updatedTransaction) => {
    setTransactions((prevTransactions) =>
      prevTransactions.map((t) =>
        t._id === updatedTransaction._id ? updatedTransaction : t
      )
    );
    setSnackbar({ open: true, message: 'Transaction updated successfully!', severity: 'success' });
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  if (transactions.length === 0) {
    return (
      <Box sx={{ margin: '2rem', textAlign: 'center' }}>
        {isSearchOpen ? (
          <Typography variant="h6" color="grey">Search query doesn't matched...</Typography>
        ) : (
          <Typography variant="h6" color="grey">Don't have Transactions on this group...</Typography>
        )}
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
                // backgroundColor: trans.transPerson._id === loggedInUserId ? '#dcf8c6' : '#e3f2fd',
                backgroundColor: trans.deleted ? '#ffebee' : trans.updateCount > 0
                  ? '#fde3f2' : trans.transPerson._id === loggedInUserId ? '#dcf8c6' : '#e3f2fd',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                borderRadius: '14px', 
                opacity: trans.deleted ? 0.7 : 1,
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                WebkitTapHighlightColor: 'transparent', // Removes the default tap highlight
              }}
              onClick={() => handleTransactionClick(trans)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)'; // Slight zoom on hover
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)'; // Enhance shadow
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'; // Revert zoom
                e.currentTarget.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.1)'; // Revert shadow
              }}
              onTouchStart={(e) => {
                if (e.currentTarget) {
                  e.currentTarget.style.transform = 'scale(1.03)';
                  e.currentTarget.style.boxShadow = '0 6px 14px rgba(0, 0, 0, 0.2)'; // More subtle effect
                  e.currentTarget.style.borderRadius = '14px'; // Ensure smooth edges
                }
              }}
              onTouchEnd={(e) => {
                if (e.currentTarget) {
                  setTimeout(() => {
                    if (e.currentTarget) {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                    }
                  }, 150);
                }
              }}
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
              {trans.deleted ? (
                <Box>
                  <Typography variant="body1" sx={{ display: 'block', float: 'inline-end', marginLeft:'4px' }}>₹{trans.amount}</Typography>
                  <Typography variant="body2" color="error">
                    This transaction was deleted by {trans.deletedBy}
                  </Typography>
                  </Box>
                ) : (
                  <>
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
                  {/* {trans.updateCount > 0 && (
                    <Typography variant="caption" color="textSecondary">
                      Updated {trans.updateCount} time(s) by {trans.updatedBy}
                    </Typography>
                  )} */}
                  {trans.updateCount > 0 && (
                    <Typography variant="caption" color="textSecondary">
                      Updated {trans.updateCount} time(s)...
                    </Typography>
                  )}
                  </>
                )}
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
      <IconButton
          style={{
            position: 'absolute',
            bottom: isMobile ? '50px' : '55px',
            right: isMobile ? '4px' : '12px',
            // padding: '6px 4px',
            borderRadius: '24px',
            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            padding: '4px', // Reduce padding to shrink button size
            width:isMobile ? '30px' : '25px', // Set smaller width
            height: isMobile ? '35px' : '30px', // Set smaller height
            color: '#1a73e8', // Google Blue style
          }}
          // onClick={handleAddTransaction}
          onClick={scrollToBottom}
        >
          <KeyboardDoubleArrowDownRoundedIcon style={{ fontSize: '14px' }}/>
        </IconButton>

      <TransDetails
        groupId={groupId}
        transaction={selectedTransaction}
        open={isDialogOpen} 
        isMobile={isMobile}
        onClose={handleCloseDialog}
        onTransactionDeleted={handleTransactionDeleted}
        onTransactionUpdated={handleTransactionUpdated}
        group={group}
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%', borderRadius:'1rem' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GroupTransHistory;
