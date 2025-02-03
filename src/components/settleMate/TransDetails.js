// /components/SettleMate/TransDetails.js
import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Avatar, Card, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import apiClient from '../../utils/axiosConfig';

const TransDetails = ({ open, onClose, transaction, isMobile, onTransactionDeleted, groupId}) => {
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!transaction) return null;

  const handleDelete = async () => {
    try {
      const response = await apiClient.delete(`/api/groups/${groupId}/transactions/${transaction._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });

      if (response.status === 200) {
        onTransactionDeleted(transaction._id);
        onClose();
        setConfirmDelete(false);
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth fullScreen={isMobile ? true : false} 
        sx={{padding: isMobile ? '1rem' : '0rem',
            '& .MuiPaper-root': { borderRadius: '16px', },
        }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>Transaction Details
      <Box>
          <IconButton
            aria-label="delete"
            onClick={() => setConfirmDelete(true)}
            sx={{
              color: (theme) => theme.palette.error.main,
            }}
          >
            <DeleteIcon />
          </IconButton>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
      </Box>
      </DialogTitle>
      <DialogContent sx={{scrollbarWidth:'thin'}}>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar
            alt={transaction.transPerson.username}
            src={transaction.transPerson.profilePic ? `data:image/jpeg;base64,${transaction.transPerson.profilePic}` : undefined}
            sx={{ width: 48, height: 48, mr: 2 }}
          >
            {transaction.transPerson?.username?.charAt(0) || 'U'}
          </Avatar>
          <Box>
          <Typography variant="h6">{transaction.transPerson.username || 'Unknown'}</Typography>
          <Typography variant="body2" color="textSecondary">
            Added on: {new Date(transaction.createdAt).toLocaleString()}
          </Typography>
          </Box>
        </Box>
        <Typography variant="body1">Amount: ₹{transaction.amount}</Typography>
        {/* <Typography variant="body1">Description: {transaction.description}</Typography> */}
        <Typography variant="body2" color="textSecondary" style={{ paddingLeft: '0px', marginTop:'8px' , fontWeight: 500 }}>
            Transaction Description:
        </Typography>
        <Typography variant="body1" color="textSecondary" style={{
              marginTop: '0.5rem',
              lineHeight: '1.5',
              textAlign: 'justify', whiteSpace: "pre-wrap", // Retain line breaks and tabs
              wordWrap: "break-word", // Handle long words gracefully
              backgroundColor: "#f5f5f5",
              padding: "1rem",
              borderRadius: "8px",
              border: "1px solid #ddd",
            }}>
              {transaction.description}
            </Typography>
        

        <Box sx={{display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap:'1rem', padding:'2px', overflowY: 'auto', marginTop:'1rem' }}>
        {/* <Typography variant="body1" mt={2}>Paid By:</Typography> */}
        <Card sx={{padding:1, borderRadius:'8px', minWidth:'245px' }}>
            <Typography variant="body2" sx={{float:'inline-end'}}>
              ({transaction.paidWay})
            </Typography>
            <Typography variant="body1" mb={1}>Paid By: </Typography>
            {transaction.paidBy.map(user => (
                <Box key={user._id} display="flex" alignItems="center" mb={1} ml={1} gap={0} >
                    <Avatar
                        alt={user.username}
                        src={user.profilePic ? `data:image/jpeg;base64,${user.profilePic}` : undefined}
                        sx={{ width: 40, height: 40, mr: 2 }}
                    >
                      {user?.username?.charAt(0) || 'U'}
                    </Avatar>
                    <Box>
                      <Typography variant="body2">{user.username || 'Unknown'}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Paid: ₹{(transaction.paidAmounts[user._id.toString()] || 0).toFixed(2)}
                      </Typography>
                    </Box>
                </Box>
            ))}
        </Card>
        {/* <Typography variant="body1" mt={2}>Split Among:</Typography> */}
        <Card sx={{padding:1, borderRadius:'8px', minWidth:'245px'  }}>
            <Typography variant="body2" sx={{float:'inline-end'}} >
              ({transaction.splitsWay})
            </Typography>
            <Typography variant="body1" mb={1}>Split Among: </Typography>
            {transaction.splitsTo.map(user => (
                <Box key={user._id} display="flex" alignItems="center" mb={1} ml={1} >
                    <Avatar
                        alt={user.username}
                        src={user.profilePic ? `data:image/jpeg;base64,${user.profilePic}` : undefined}
                        sx={{ width: 40, height: 40, mr: 2 }}
                    >
                      {user?.username?.charAt(0) || 'U'} 
                    </Avatar>
                    <Box>
                      <Typography variant="body2">{user.username || 'Unknown'}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Split: ₹{(transaction.splitAmounts[user._id.toString()] || 0).toFixed(2)}
                      </Typography>
                    </Box>
                </Box>
            ))}
        </Card>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">Close</Button>
      </DialogActions>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this transaction?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

    </Dialog>
  );
};

export default TransDetails;