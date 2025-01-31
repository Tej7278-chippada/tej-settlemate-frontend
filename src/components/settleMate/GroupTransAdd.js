import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, IconButton, Box, Typography, Card, List, ListItem, ListItemText, ListItemSecondaryAction, Checkbox, Snackbar, Alert, Avatar } from '@mui/material';
import apiClient from '../../utils/axiosConfig';
import CloseIcon from '@mui/icons-material/Close';

const GroupTransAdd = ({ open, onClose, group, onTransactionAdded, isMobile }) => {
  const [step, setStep] = useState(1); // Step 1: Transaction Details, Step 2: Amount Split
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paidBy, setPaidBy] = useState({});
  const [splitsTo, setSplitsTo] = useState({});
  const [isNextDisabled, setIsNextDisabled] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });
  const [paidWay, setPaidWay] = useState('Equal');
  const [splitsWay, setSplitsWay] = useState('Equal');
  const [paidAmounts, setPaidAmounts] = useState({});
  const [splitAmounts, setSplitAmounts] = useState({});

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

  const handlePaidWayChange = (event) => {
    setPaidWay(event.target.value);
  };

  const handleSplitsWayChange = (event) => {
    setSplitsWay(event.target.value);
  };

  const handlePaidAmountChange = (memberId, value) => {
    setPaidAmounts((prev) => ({ ...prev, [memberId]: parseFloat(value) }));
  };

  const handleSplitAmountChange = (memberId, value) => {
    setSplitAmounts((prev) => ({ ...prev, [memberId]: parseFloat(value) }));
  };

  const calculateAmounts = () => {
    const selectedPaidBy = Object.keys(paidBy).filter((key) => paidBy[key]);
    const selectedSplitsTo = Object.keys(splitsTo).filter((key) => splitsTo[key]);

    let paidAmountsCalculated = {};
    let splitAmountsCalculated = {};

    if (paidWay === 'Equal') {
      const equalAmount = amount / selectedPaidBy.length;
      selectedPaidBy.forEach((memberId) => {
        paidAmountsCalculated[memberId] = equalAmount;
      });
    } else if (paidWay === 'UnEqual') {
      selectedPaidBy.forEach((memberId) => {
        paidAmountsCalculated[memberId] = paidAmounts[memberId] || 0;
      });
    } else if (paidWay === 'ByPercentage') {
      selectedPaidBy.forEach((memberId) => {
        paidAmountsCalculated[memberId] = (amount * (paidAmounts[memberId] || 0)) / 100;
      });
    }

    if (splitsWay === 'Equal') {
      const equalAmount = amount / selectedSplitsTo.length;
      selectedSplitsTo.forEach((memberId) => {
        splitAmountsCalculated[memberId] = equalAmount;
      });
    } else if (splitsWay === 'UnEqual') {
      selectedSplitsTo.forEach((memberId) => {
        splitAmountsCalculated[memberId] = splitAmounts[memberId] || 0;
      });
    } else if (splitsWay === 'ByPercentage') {
      selectedSplitsTo.forEach((memberId) => {
        splitAmountsCalculated[memberId] = (amount * (splitAmounts[memberId] || 0)) / 100;
      });
    }

    return { paidAmountsCalculated, splitAmountsCalculated };
  };

  const updateBalances = (paidAmountsCalculated, splitAmountsCalculated) => {
    const updatedMembers = group.members.map((member) => {
      const paidAmount = paidAmountsCalculated[member.user._id] || 0; // Amount paid by the member
      const splitAmount = splitAmountsCalculated[member.user._id] || 0; // Amount split to the member
      const previousBalance = member.balance || 0; // Get the previous balance
      const newBalance = previousBalance + paidAmount - splitAmount; // Add to the previous balance
      return { ...member, balance: newBalance };
    });
    return updatedMembers;
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

    const { paidAmountsCalculated, splitAmountsCalculated } = calculateAmounts();
    const updatedMembers = updateBalances(paidAmountsCalculated, splitAmountsCalculated);

    try {
      const response = await apiClient.post(
        `/api/groups/${group._id}/transactions`,
        {
          amount,
          description,
          paidBy: selectedPaidBy,
          splitsTo: selectedSplitsTo,
          transPerson: localStorage.getItem('userId'),
          paidAmounts: paidAmountsCalculated,
          splitAmounts: splitAmountsCalculated,
          updatedMembers, // Send updated members with new balances
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
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth fullScreen={isMobile ? true : false}
      sx={{padding: isMobile ? '1rem' : '0rem',
        '& .MuiPaper-root': { borderRadius: '16px', },
    }}>
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
        <DialogContent sx={{scrollbarWidth:'thin'}}>
          <Box>
            <Typography variant="h6" mb={0}>
              Transaction Details
            </Typography>
            <TextField
              label="Amount"
              type="number"
              fullWidth
              margin="normal" required placeholder='Ex: 500'
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <TextField
              label="Transaction Description"
              fullWidth multiline rows={3} margin="normal" sx={{ scrollbarWidth: 'thin' }}
              value={description} required placeholder='Ex: Goa trip expenses'
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
                    <Avatar
                      alt={member.user.username}
                      src={
                        member.user.profilePic
                          ? `data:image/jpeg;base64,${member.user.profilePic}`
                          : undefined
                      }
                      sx={{ marginRight: 2 }}
                    >
                      {member.user.username[0]}
                    </Avatar>
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
              <Box mt={2}>
                <Typography variant="h6" mb={0}> Paid Way </Typography>
                <select value={paidWay} onChange={handlePaidWayChange}>
                  <option value="Equal">Equal</option>
                  <option value="UnEqual">UnEqual</option>
                  <option value="ByPercentage">By Percentage</option>
                </select>
              </Box>
              {paidWay === 'UnEqual' && (
                <Box mt={2}>
                  <Typography variant="h6" mb={0}> Paid Amounts </Typography>
                  {group.members.map((member) => (
                    paidBy[member.user._id] && (
                      <Box key={member.user._id}>
                        <TextField
                          label={`Amount for ${member.user.username}`}
                          type="number"
                          fullWidth
                          margin="normal"
                          value={paidAmounts[member.user._id] || ''}
                          onChange={(e) => handlePaidAmountChange(member.user._id, e.target.value)}
                        />
                      </Box>
                    )
                  ))}
                </Box>
              )}
              {paidWay === 'ByPercentage' && (
                <Box mt={2}>
                  <Typography variant="h6" mb={0}> Paid Percentages </Typography>
                  {group.members.map((member) => (
                    paidBy[member.user._id] && (
                      <Box key={member.user._id}>
                        <TextField
                          label={`Percentage for ${member.user.username}`}
                          type="number"
                          fullWidth
                          margin="normal"
                          value={paidAmounts[member.user._id] || ''}
                          onChange={(e) => handlePaidAmountChange(member.user._id, e.target.value)}
                        />
                      </Box>
                    )
                  ))}
                </Box>
              )}
            </Box>
          )}
          {step === 2 && (
            <Box mb={2}>
              <Typography variant="h6" mb={0} mt={2}> Amount Splits To </Typography>
              <Card sx={{ padding: 1, mt: 0 }}>
                <List>
                  {group.members.map((member) => (
                    <ListItem key={member.user._id}>
                      <Avatar
                      alt={member.user.username}
                      src={
                        member.user.profilePic
                          ? `data:image/jpeg;base64,${member.user.profilePic}`
                          : undefined
                      }
                      sx={{ marginRight: 2 }}
                    >
                      {member.user.username[0]}
                    </Avatar>
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
              <Box mt={2}>
                <Typography variant="h6" mb={0}> Splits Way </Typography>
                <select value={splitsWay} onChange={handleSplitsWayChange}>
                  <option value="Equal">Equal</option>
                  <option value="UnEqual">UnEqual</option>
                  <option value="ByPercentage">By Percentage</option>
                </select>
              </Box>
              {splitsWay === 'UnEqual' && (
                <Box mt={2}>
                  <Typography variant="h6" mb={0}> Split Amounts </Typography>
                  {group.members.map((member) => (
                    splitsTo[member.user._id] && (
                      <Box key={member.user._id}>
                        <TextField
                          label={`Amount for ${member.user.username}`}
                          type="number"
                          fullWidth
                          margin="normal"
                          value={splitAmounts[member.user._id] || ''}
                          onChange={(e) => handleSplitAmountChange(member.user._id, e.target.value)}
                        />
                      </Box>
                    )
                  ))}
                </Box>
              )}
              {splitsWay === 'ByPercentage' && (
                <Box mt={2}>
                  <Typography variant="h6" mb={0}> Split Percentages </Typography>
                  {group.members.map((member) => (
                    splitsTo[member.user._id] && (
                      <Box key={member.user._id}>
                        <TextField
                          label={`Percentage for ${member.user.username}`}
                          type="number"
                          fullWidth
                          margin="normal"
                          value={splitAmounts[member.user._id] || ''}
                          onChange={(e) => handleSplitAmountChange(member.user._id, e.target.value)}
                        />
                      </Box>
                    )
                  ))}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Box paddingBottom={2} paddingRight={2}>
            {step === 1 && (
              <Button onClick={onClose} style={{ marginRight: '1rem' }}>Cancel</Button>
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
                <Button onClick={() => setStep(1)} style={{ marginRight: '1rem' }}>Back</Button>
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
