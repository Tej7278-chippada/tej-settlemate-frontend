// /components/settlemate/CreateGroup.js 
import React, { useState } from 'react';
import { Box, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Typography, Alert, CircularProgress, IconButton, Snackbar, } from '@mui/material';
import Cropper from 'react-easy-crop';
import apiClient from '../../utils/axiosConfig';
import CloseIcon from '@mui/icons-material/Close';

const CreateGroup = ({ open, onClose, onGroupCreated }) => {
  const [groupName, setGroupName] = useState('');
  const [groupPic, setGroupPic] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [cropDialog, setCropDialog] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [groupPicError, setGroupPicError] = useState('');

  const handleCropComplete = async (_, croppedAreaPixels) => {
    if (!groupPic) return; // Ensure profilePic is set before proceeding
    const canvas = document.createElement('canvas');
    const image = new Image();
    // Create an object URL for the image file
    const objectURL = URL.createObjectURL(groupPic);
    image.src = objectURL;
    image.onload = () => {
      const ctx = canvas.getContext('2d');
      const { width, height } = croppedAreaPixels;
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        width,
        height,
        0,
        0,
        width,
        height
      );
      canvas.toBlob((blob) => {
        // Check if the blob is a valid object before creating a URL
        if (blob) {
          setCroppedImage(URL.createObjectURL(blob));
        }
      });
    };
  };

  const handleReplaceImage = () => {
    setCroppedImage(null);
    setGroupPic(null);
  };

  const validateGroupName = () => {
    const regex = /^[A-Z][a-zA-Z0-9\s]{5,}$/; // Starts with a capital letter, allows numbers, and has at least 6 characters
    if (!groupName) {
      return 'Please enter the Group Name (e.g., Goa Tour).';
    }
    if (!regex.test(groupName)) {
      return 'Group Name should start with a capital letter, can include numbers, and be at least 6 characters long.';
    }
    return null;
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    const validationError = validateGroupName();
    if (validationError) {
      setNotification({ open: true, message: validationError, severity: 'warning' });
      return;
    }
    setLoading(true);
    setCroppedImage(null);

    try {
      const formData = new FormData();
      formData.append('groupName', groupName);
      // if (groupPic) formData.append('groupPic', groupPic);
      if (croppedImage) {
        const blob = await fetch(croppedImage).then(r => r.blob());
        formData.append('groupPic', blob, 'groupPic.jpg');
      }

      const response = await apiClient.post('/api/groups/create', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      const group = response.data.group;
      onGroupCreated(group); // Notify parent about the new group
      setLoading(false);
      setGroupName('');
      setGroupPic(null);
      onClose();
      setNotification({
        open: true,
        message: `Group "${group.groupName}" created successfully.`,
        severity: 'success',
      });
    } catch (error) {
      setLoading(false);
      setNotification({
        open: true,
        message: 'Error on creating new Group, please try again later.',
        severity: 'error',
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 2 * 1024 * 1024) {
      setGroupPicError('Group pic must be under 2MB size.');
      return;
    }
    setGroupPic(file);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
        sx={{
          '& .MuiPaper-root': { borderRadius: '16px', },
        }}
      >
        <Box p={3} display="flex" flexDirection="column" alignItems="center">
          <Box sx={{ textAlign: 'center', marginBottom:'1rem' }}>
            <Typography variant="h6">Create New Group</Typography>
            <IconButton
              onClick={onClose}
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                // color: '#fff', backgroundColor: 'rgba(0, 0, 0, 0.2)',
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Box textAlign="center" paddingTop={1} mb={2} >
            {croppedImage ? (
              <div>
                <img
                  src={croppedImage}
                  alt="Cropped Profile"
                  style={{ width: '120px', height: '120px', borderRadius: '50%', cursor: 'pointer' }}
                  onClick={() => setCropDialog(true)}
                />
                <Typography variant="body2">Your Group Pic</Typography>
              </div>
            ) : (
              <div>
                <img
                  src="https://placehold.co/400?text=Add+Photo"
                  alt="Dummy Profile"
                  style={{ width: '120px', height: '120px', borderRadius: '50%', cursor: 'pointer' }}
                  onClick={() => setCropDialog(true)}
                />
                <Typography variant="body2">Add Group Pic</Typography>
              </div>
            )}
          </Box>
          <Dialog open={cropDialog} onClose={() => setCropDialog(false)} fullWidth maxWidth="sm">
            <DialogTitle>Crop and Upload Picture</DialogTitle>
            <DialogContent sx={{ minHeight: '250px' }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ marginTop: 10 }}
              />
              {groupPic ? (
                <Cropper
                  image={URL.createObjectURL(groupPic)}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={handleCropComplete}
                />
              ) : (
                <Typography variant="body2" textAlign="center">
                  Please select an image to upload.
                  {groupPicError && <Alert severity="error">{groupPicError}</Alert>}
                </Typography>
              )}


            </DialogContent>
            <DialogActions>
              {croppedImage && (
                <Button color="secondary" onClick={handleReplaceImage}>
                  Delete
                </Button>
              )}
              <Button onClick={() => setCropDialog(false)}>Cancel</Button>
              <Button variant="contained"
                onClick={() => {
                  setCropDialog(false);
                }}
                disabled={!croppedImage}
              >
                Save
              </Button>
            </DialogActions>
          </Dialog>
          <TextField
            fullWidth
            margin="normal" style={{ maxWidth: '300px' }}
            label="Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
          <Button type="submit" variant="contained" color="primary" style={{ marginTop: '1rem', margin: '1rem', maxWidth: '300px' }} onClick={handleCreateGroup} fullWidth disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Submit'}
          </Button>
        </Box>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%', borderRadius:'1rem' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CreateGroup;
