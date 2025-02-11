// /components/SettleMate/GroupTransAdd.js
import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, IconButton, Box, Typography, Card, List, ListItem, ListItemText, ListItemSecondaryAction, Checkbox, Snackbar, Alert, Avatar, FormControl, InputLabel, Select, MenuItem, CircularProgress, InputAdornment } from '@mui/material';
import apiClient from '../../utils/axiosConfig';
import CloseIcon from '@mui/icons-material/Close';

const GroupTransAdd = ({ open, onClose, group, onTransactionAdded, isMobile, transactionToEdit, }) => {
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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (transactionToEdit) {
      // Pre-fill the form with the transaction details
      setAmount(transactionToEdit.amount);
      setDescription(transactionToEdit.description);
      setPaidWay(transactionToEdit.paidWay);
      setSplitsWay(transactionToEdit.splitsWay);

      // Calculate percentage values if paidWay or splitsWay is ByPercentage
      const paidAmountsState = {};
      const splitAmountsState = {};

      if (transactionToEdit.paidWay === 'ByPercentage') {
        Object.keys(transactionToEdit.paidAmounts).forEach((memberId) => {
          paidAmountsState[memberId] = ((transactionToEdit.paidAmounts[memberId] / transactionToEdit.amount) * 100).toFixed(2);
        });
      } else {
        Object.assign(paidAmountsState, transactionToEdit.paidAmounts);
      }

      if (transactionToEdit.splitsWay === 'ByPercentage') {
        Object.keys(transactionToEdit.splitAmounts).forEach((memberId) => {
          splitAmountsState[memberId] = ((transactionToEdit.splitAmounts[memberId] / transactionToEdit.amount) * 100).toFixed(2);
        });
      } else {
        Object.assign(splitAmountsState, transactionToEdit.splitAmounts);
      }

      setPaidAmounts(paidAmountsState);
      setSplitAmounts(splitAmountsState);

      const paidByState = {};
      const splitsToState = {};
  
      if (transactionToEdit.paidBy) {
        transactionToEdit.paidBy.forEach((member) => {
          if (member && member._id) {
            paidByState[member._id] = true;
          }
        });
      }
  
      if (transactionToEdit.splitsTo) {
        transactionToEdit.splitsTo.forEach((member) => {
          if (member && member._id) {
            splitsToState[member._id] = true;
          }
        });
      }

      // Initialize all members with false if not already set
      group.members.forEach((member) => {
        if (member && member.user && member.user._id) {
          if (!paidByState[member.user._id]) {
            paidByState[member.user._id] = false;
          }
          if (!splitsToState[member.user._id]) {
            splitsToState[member.user._id] = false;
          }
        }
      });

      setPaidBy(paidByState);
      setSplitsTo(splitsToState);
      
      // setPaidAmounts(transactionToEdit.paidAmounts );
      // setPaidAmounts(Object.fromEntries(transactionToEdit.paidAmounts.entries()));
      // setSplitAmounts(Object.fromEntries(transactionToEdit.splitAmounts.entries()));
      // Pre-fill paidAmounts and splitAmounts if they exist
      // if (transactionToEdit.paidAmounts) {
      //   setPaidAmounts(transactionToEdit.paidAmounts);
      // }

      // if (transactionToEdit.splitAmounts) {
      //   setSplitAmounts(transactionToEdit.splitAmounts);
      // }
      
  
      
      // const paidByState = group.members.reduce((acc, member) => {
      //   acc[member.user._id] = transactionToEdit.paidBy.includes(member.user._id);
      //   return acc;
      // }, {});
      // setPaidBy(paidByState);

      // const splitsToState = group.members.reduce((acc, member) => {
      //   acc[member.user._id] = transactionToEdit.splitsTo.includes(member.user._id);
      //   return acc;
      // }, {});
      // setSplitsTo(splitsToState);

      // Update isNextDisabled based on pre-selected members
      const isSelected = Object.values(paidByState).some((val) => val === true);
      setIsNextDisabled(!isSelected); // Enable Next button if at least one member is selected

    } else if (group && group.members) {
      // Initialize "paidBy" and "splitTo" with group members
      const initialState = group.members.reduce((acc, member) => {
        if (member && member.user && member.user._id) {
          acc[member.user._id] = false;
        }
        return acc;
      }, {});
      setPaidBy(initialState);
      setSplitsTo(initialState);
    }
  }, [group, transactionToEdit]);

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

  const toggleSelectAll = (stateSetter, currentState) => {
    const allSelected = Object.values(currentState).every((val) => val === true);
    const newState = Object.keys(currentState).reduce((acc, key) => {
      acc[key] = !allSelected;
      return acc;
    }, {});
    stateSetter(newState);
    if (stateSetter === setPaidBy) setIsNextDisabled(allSelected);
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

  const validatePaidAmounts = () => {
    const { paidAmountsCalculated } = calculateAmounts();
    const totalPaid = Object.values(paidAmountsCalculated).reduce((sum, amount) => sum + amount, 0);
    return totalPaid.toFixed(2) === parseFloat(amount).toFixed(2);
  };

  const validateSplitAmounts = () => {
    const { splitAmountsCalculated } = calculateAmounts();
    const totalSplit = Object.values(splitAmountsCalculated).reduce((sum, amount) => sum + amount, 0);
    return totalSplit.toFixed(2) === parseFloat(amount).toFixed(2);
  };

  const handleNext = () => {
    if (paidWay === 'UnEqual' || paidWay === 'ByPercentage') {
      if (!validatePaidAmounts()) {
        setSnackbar({
          open: true,
          message: `Entered paidAmounts total should equal to the Amount ${amount}.`,
          severity: 'warning',
        });
        return;
      }
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    if (splitsWay === 'UnEqual' || splitsWay === 'ByPercentage') {
      if (!validateSplitAmounts()) {
        setSnackbar({
          open: true,
          message: `Entered splitsAmount total should equal to the Amount ${amount}.`,
          severity: 'warning',
        });
        return;
      }
    }

    const selectedPaidBy = Object.keys(paidBy).filter((key) => paidBy[key]);
    const selectedSplitsTo = Object.keys(splitsTo).filter((key) => splitsTo[key]);

    if (!amount || !description || selectedPaidBy.length === 0 || selectedSplitsTo.length === 0) {
      setSnackbar({ open: true, message: 'Please complete all required fields.', severity: 'warning' });
      return;
    }

    setIsLoading(true); // Set loading to true

    const { paidAmountsCalculated, splitAmountsCalculated } = calculateAmounts();
    const updatedMembers = updateBalances(paidAmountsCalculated, splitAmountsCalculated);

    try {
      const endpoint = transactionToEdit
        ? `/api/groups/${group._id}/transactions/${transactionToEdit._id}`
        : `/api/groups/${group._id}/transactions`;

      const method = transactionToEdit ? 'put' : 'post';

      const response = await apiClient[method](
        endpoint,
        {
          amount,
          description,
          paidBy: selectedPaidBy,
          splitsTo: selectedSplitsTo,
          transPerson: localStorage.getItem('userId'),
          paidAmounts: paidAmountsCalculated,
          splitAmounts: splitAmountsCalculated,
          paidWay,
          splitsWay,
          updatedMembers, // Send updated members with new balances
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
      );
      onTransactionAdded(response.data); // Notify parent component about the updated/added transaction
      setSnackbar({ open: true, message: transactionToEdit ? 'Transaction updated successfully!' : 'Transaction added successfully!', severity: 'success' });
      resetForm(); // Clear input fields
      onClose(); // Close the dialog
    } catch (error) {
      console.error('Error updating/adding transaction:', error);
      setSnackbar({ open: true, message: 'Failed to update/add transaction. Please try again.', severity: 'error' });
    } finally {
      setIsLoading(false); // Set loading to false regardless of success or failure
    }
  };

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setPaidBy(group.members.reduce((acc, member) => ({ ...acc, [member.user._id]: false }), {}));
    setSplitsTo(group.members.reduce((acc, member) => ({ ...acc, [member.user._id]: false }), {}));
    setPaidWay('Equal'); // Reset PaidWay to default
    setSplitsWay('Equal'); // Reset SplitsWay to default
    setPaidAmounts({}); // Clear paidAmounts
    setSplitAmounts({}); // Clear splitAmounts
    setStep(1);
    setIsNextDisabled(true);
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const renderAmount = (memberId, type) => {
    const { paidAmountsCalculated, splitAmountsCalculated } = calculateAmounts();
    if (type === 'paid') {
      return paidAmountsCalculated[memberId] ? `₹${paidAmountsCalculated[memberId].toFixed(2)}` : '₹0.00';
    } else if (type === 'split') {
      return splitAmountsCalculated[memberId] ? `₹${splitAmountsCalculated[memberId].toFixed(2)}` : '₹0.00';
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth fullScreen={isMobile ? true : false}
      sx={{padding: isMobile ? '1rem' : '0rem',
        '& .MuiPaper-root': { borderRadius: '16px', },
    }}>
        <DialogTitle>{transactionToEdit ? 'Edit Transaction' : 'Add Transaction'}
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
          <Button onClick={resetForm} color="warning" style={{ marginRight: '1rem', position: 'absolute',
              right: 35,
              top: 10, }}>Reset</Button>
        </DialogTitle>
        <DialogContent sx={{scrollbarWidth:'thin'}}>
          <Box>
            <Typography variant="h6" mb={0}>
              Transaction Details
            </Typography>
            <TextField
              label="Amount"
              type="number" // Use "text" instead of "number" for better input control
              fullWidth
              margin="normal" required placeholder='Ex: 500.50'
              value={amount}
              // onChange={(e) => setAmount(e.target.value)}
              onChange={(e) => { let value = e.target.value;
                if (/^\d*\.?\d{0,2}$/.test(value)) { // Allow only numbers with up to two decimal places
                  const num = Number(value);
                  if (num >= 0 && num <= 10000000) {
                    setAmount(value);
                  }
                }}
              }
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
              <Box mt={3} mb={2}>
                <Box mt={1} sx={{float:'inline-end'}}>
                  <FormControl size="small" sx={{ minWidth: 120 , margin:'-1rem', marginTop: isMobile ? '-24px' : '-26px'}}>
                    <InputLabel sx={{margin:'1rem'}} id="paid-way-label">Paid Way</InputLabel>
                    <Select sx={{margin:'1rem'}} labelId="paid-way-label" label="Paid Way" value={paidWay} onChange={handlePaidWayChange}>
                      <MenuItem value="Equal">Equal</MenuItem>
                      <MenuItem value="UnEqual">UnEqual</MenuItem>
                      <MenuItem value="ByPercentage">By Per %</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Typography variant="h6" mb={0} mt={0}> Amount Paid By </Typography>
              </Box>
              <Card sx={{ padding: 1, mt: 0 }}>
                <Box style={{ display: 'flex', justifyContent: 'flex-end', }}>
                  <Button size="small" onClick={() => toggleSelectAll(setPaidBy, paidBy)}>
                    {Object.values(paidBy).every((val) => val === true) ? 'Deselect All' : 'Select All'}
                  </Button>
                </Box>
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
                    <ListItemText primary={member.user.username}
                      secondary={renderAmount(member.user._id, 'paid')}
                    />
                    <ListItemSecondaryAction>
                      <Box mr={-1}>
                        <Checkbox
                          checked={paidBy[member.user._id]}
                          onChange={() => handleCheckboxChange(setPaidBy, member.user._id)}
                        />
                        <Box sx={{float: isMobile ? 'none' : 'inline-start', marginTop: isMobile ? '-20px' : '-10px'}}>
                          {paidWay === 'UnEqual' && paidBy[member.user._id] && (
                            <Box key={member.user._id} width={isMobile ? "100px" : "150px"}>
                              <TextField
                                label={`Amount for ${member.user.username}`}
                                type="number" // Use "text" instead of "number" for better input control
                                size="small"
                                margin="normal"
                                value={paidAmounts[member.user._id] || ''}
                                // onChange={(e) => handlePaidAmountChange(member.user._id, e.target.value)}
                                onChange={(e) => { let value = e.target.value; 
                                  if (/^\d*\.?\d{0,2}$/.test(value)) { // Allow only numbers with up to two decimal places
                                    const num = Number(value);
                                    if (num >= 0 && num <= 10000000) {
                                      handlePaidAmountChange(member.user._id, value);
                                    }
                                  }
                                }}
                              />
                            </Box>
                          )}
                          {paidWay === 'ByPercentage' && paidBy[member.user._id] && (
                            <Box key={member.user._id} width={isMobile ? "100px" : "150px"}>
                              <TextField
                                label={`Percentage for ${member.user.username}`}
                                type="number" size="small"
                                margin="normal"
                                value={paidAmounts[member.user._id] || ''}
                                // onChange={(e) => handlePaidAmountChange(member.user._id, e.target.value)}
                                onChange={(e) => { let value = e.target.value;
                                  if (/^\d*\.?\d{0,2}$/.test(value)) { // Allow only numbers and up to two decimal places
                                    const num = Number(value);
                                    if (num >= 0 && num <= 100) {
                                      handlePaidAmountChange(member.user._id, value);
                                    }
                                  }
                                }}
                                InputProps={{
                                  endAdornment: <InputAdornment position="end">%</InputAdornment>, // Add percentage symbol
                                }}
                              />
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Card>
              {/* <Box mt={2}>
                <Typography variant="h6" mb={0}> Paid Way </Typography>
                <select value={paidWay} onChange={handlePaidWayChange}>
                  <option value="Equal">Equal</option>
                  <option value="UnEqual">UnEqual</option>
                  <option value="ByPercentage">By Percentage</option>
                </select>
              </Box> */}
              {/* {paidWay === 'UnEqual' && (
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
              )} */}
              {/* {paidWay === 'ByPercentage' && (
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
              )} */}
            </Box>
          )}
          {step === 2 && (
            <Box mb={2}>
              <Box mt={3} mb={2}>
                <Box mt={1} sx={{float:'inline-end'}}>
                  <FormControl size="small" sx={{ minWidth: 120 ,  margin:'-1rem', marginTop: isMobile ? '-24px' : '-26px'}}>
                    <InputLabel sx={{margin:'1rem'}} id="splits-way-label">Splits Way</InputLabel>
                      <Select sx={{margin:'1rem'}} labelId="splits-way-label" label="Splits Way" value={splitsWay} onChange={handleSplitsWayChange}>
                        <MenuItem value="Equal">Equal</MenuItem>
                        <MenuItem value="UnEqual">UnEqual</MenuItem>
                        <MenuItem value="ByPercentage">By Per %</MenuItem>
                      </Select>
                  </FormControl>
                </Box>
                <Typography variant="h6" mb={0} mt={2}> Amount Splits To </Typography>
              </Box>
              <Card sx={{ padding: 1, mt: 0 }}>
                <Box style={{ display: 'flex', justifyContent: 'flex-end', }}>
                  <Button size="small" onClick={() => toggleSelectAll(setSplitsTo, splitsTo)}>
                    {Object.values(splitsTo).every((val) => val === true) ? 'Deselect All' : 'Select All'}
                  </Button>
                </Box>
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
                      <ListItemText primary={member.user.username} 
                        secondary={renderAmount(member.user._id, 'split')}
                      />
                      <ListItemSecondaryAction>
                        <Box mr={-1}>
                          <Checkbox
                            checked={splitsTo[member.user._id]}
                            onChange={() => handleCheckboxChange(setSplitsTo, member.user._id)}
                          />
                          <Box sx={{float: isMobile ? 'none' : 'inline-start', marginTop: isMobile ? '-20px' : '-10px'}}>
                            {splitsWay === 'UnEqual' && splitsTo[member.user._id] && (
                              <Box key={member.user._id} width={isMobile ? "100px" : "150px"}>
                                <TextField
                                  label={`Amount for ${member.user.username}`}
                                  type="number" size="small"
                                  margin="normal"
                                  value={splitAmounts[member.user._id] || ''}
                                  // onChange={(e) => handleSplitAmountChange(member.user._id, e.target.value)}
                                  onChange={(e) => { let value = e.target.value; 
                                    if (/^\d*\.?\d{0,2}$/.test(value)) { // Allow only numbers with up to two decimal places
                                      const num = Number(value);
                                      if (num >= 0 && num <= 10000000) {
                                        handleSplitAmountChange(member.user._id, value);
                                      }
                                    }
                                  }}
                                />
                              </Box>
                            )}
                            {splitsWay === 'ByPercentage' && splitsTo[member.user._id] && (
                              <Box key={member.user._id} width={isMobile ? "100px" : "150px"}>
                                <TextField
                                  label={`Percentage for ${member.user.username}`}
                                  type="number" size="small"
                                  margin="normal"
                                  value={splitAmounts[member.user._id] || ''}
                                  // onChange={(e) => handleSplitAmountChange(member.user._id, e.target.value)}
                                  onChange={(e) => { let value = e.target.value; 
                                    if (/^\d*\.?\d{0,2}$/.test(value)) { // Allow only numbers and up to two decimal places
                                      const num = Number(value);
                                      if (num >= 0 && num <= 100) {
                                        handleSplitAmountChange(member.user._id, value);
                                      }
                                    }
                                  }}
                                  InputProps={{
                                    endAdornment: <InputAdornment position="end">%</InputAdornment>, // Add percentage symbol
                                  }}
                                />
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Card>
              {/* <Box mt={2}>
                <Typography variant="h6" mb={0}> Splits Way </Typography>
                <select value={splitsWay} onChange={handleSplitsWayChange}>
                  <option value="Equal">Equal</option>
                  <option value="UnEqual">UnEqual</option>
                  <option value="ByPercentage">By Percentage</option>
                </select>
              </Box> */}
              {/* {splitsWay === 'UnEqual' && (
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
              )} */}
              {/* {splitsWay === 'ByPercentage' && (
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
              )} */}
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
                  disabled={!Object.values(splitsTo).some((val) => val) || isLoading}
                  variant="contained"
                  startIcon={isLoading ? <CircularProgress size={20} /> : null}
                >
                  {isLoading ? (transactionToEdit ? 'Updating...' : 'Submitting...') : (transactionToEdit ? 'Update Trans' : 'Submit Trans')}
                </Button>
              </>
            )}
          </Box>
        </DialogActions>
        {transactionToEdit && (
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
        )}
      </Dialog>
      {!transactionToEdit && (
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
      )}
    </>
  );
};

export default GroupTransAdd;
