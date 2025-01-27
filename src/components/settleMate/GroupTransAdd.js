// components/settleMate/GroupTransAdd.js
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Checkbox,
  Typography,
  Box,
  Card,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import apiClient from '../../utils/axiosConfig';
import CloseIcon from '@mui/icons-material/Close';

const GroupTransAdd = ({ open, onClose, group, onTransactionAdded }) => {
  const [step, setStep] = useState(1); // Step 1: Transaction Details, Step 2: Amount Split
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paidBy, setPaidBy] = useState({});
  const [splitsTo, setSplitsTo] = useState({});
  const [isNextDisabled, setIsNextDisabled] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });

  useEffect(() => {
    // Initialize "paidBy" and "splitTo" with group members
    const initialState = group.members.reduce((acc, member) => {
      acc[member.user._id] = false;
      return acc;
    }, {});
    setPaidBy(initialState);
    setSplitsTo(initialState);
  }, [group]);

  const handleCheckboxChange = (stateSetter, memberId) => {
    stateSetter((prev) => {
      const updated = { ...prev, [memberId]: !prev[memberId] };
      const isSelected = Object.values(updated).some((val) => val === true);
      if (stateSetter === setPaidBy) setIsNextDisabled(!isSelected);
      return updated;
    });
  };

  const handleNext = () => {
    setStep(2);
  };

  const handleSubmit = async () => {
    const selectedPaidBy = Object.keys(paidBy).filter((key) => paidBy[key]);
    const selectedSplitsTo = Object.keys(splitsTo).filter((key) => splitsTo[key]);

    if (!amount || !description || selectedPaidBy.length === 0 || selectedSplitsTo.length === 0) {
      setSnackbar({ open: true, message: 'Please complete all required fields.', severity: 'warning' });
      return;
    }

    try {
      const response = await apiClient.post(
        `/api/groups/${group._id}/transactions`,
        {
          amount,
          description,
          paidBy: selectedPaidBy,
          splitsTo: selectedSplitsTo,
          transPerson: localStorage.getItem('userId'),
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
      );
      onTransactionAdded(response.data); // Notify parent component about the new transaction
      setSnackbar({ open: true, message: 'Transaction added successfully!', severity: 'success' });
      resetForm(); // Clear input fields
      onClose(); // Close the dialog
    } catch (error) {
      console.error('Error adding transaction:', error);
      setSnackbar({ open: true, message: 'Failed to add transaction. Please try again.', severity: 'error' });

    }
  };

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setPaidBy(group.members.reduce((acc, member) => ({ ...acc, [member.user._id]: false }), {}));
    setSplitsTo(group.members.reduce((acc, member) => ({ ...acc, [member.user._id]: false }), {}));
    setStep(1);
    setIsNextDisabled(true);
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  return (
    <>
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Transaction
        <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box>
        <Typography variant="h6" mb={0}>
            Transaction Details
          </Typography>
            <TextField
                label="Amount"
                type="number"
                fullWidth
                margin="normal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
            />
            <TextField
                label="Description"
                fullWidth
                margin="normal"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />
        </Box>
        {step === 1 && (
        <Box mb={2}>
            <Typography variant="h6" mb={0} mt={2}> Amount Paid By </Typography>
            <Card sx={{ padding: 1, mt: 0 }}>
                <List>
                {group.members.map((member) => (
                    <ListItem key={member.user._id}>
                    <ListItemText primary={member.user.username} />
                    <ListItemSecondaryAction>
                        <Checkbox
                        checked={paidBy[member.user._id]}
                        onChange={() => handleCheckboxChange(setPaidBy, member.user._id)}
                        />
                    </ListItemSecondaryAction>
                    </ListItem>
                ))}
                </List>
            </Card>
        </Box>
        )}
        {step === 2 && (
            <Box mb={2}>
                <Typography variant="h6" mb={0} mt={2}> Amount Splits To </Typography>
                <Card sx={{ padding: 1, mt: 0 }}>
                    <List>
                    {group.members.map((member) => (
                        <ListItem key={member.user._id}>
                        <ListItemText primary={member.user.username} />
                        <ListItemSecondaryAction>
                            <Checkbox
                            checked={splitsTo[member.user._id]}
                            onChange={() => handleCheckboxChange(setSplitsTo, member.user._id)}
                            />
                        </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                    </List>
                </Card>
            </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Box paddingBottom={2} paddingRight={2}>
            {step === 1 && (
            <Button onClick={onClose} style={{marginRight:'1rem'}}>Cancel</Button>
            )}
            {step === 1 && (
            <Button
                onClick={handleNext}
                disabled={isNextDisabled}
                variant="contained"
            >
                Next
            </Button>
            )}
            {step === 2 && (
            <>
                <Button onClick={() => setStep(1)} style={{marginRight:'1rem'}}>Back</Button>
                <Button
                onClick={handleSubmit}
                disabled={!Object.values(splitsTo).some((val) => val)}
                variant="contained"
                >
                Submit Trans
                </Button>
            </>
            )}
        </Box>
      </DialogActions>
    </Dialog>
    <Snackbar
      open={snackbar.open}
      autoHideDuration={6000}
      onClose={handleCloseSnackbar}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
        {snackbar.message}
      </Alert>
    </Snackbar>
    </>
  );
};

export default GroupTransAdd;
