import React, { useState } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  Snackbar,
} from '@mui/material';
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
  // const [error, setError] = useState('');
  // const [success, setSuccess] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

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
    const regex = /^[A-Z][a-zA-Z\s]{5,}$/; // Starts with a capital letter and has at least 6 characters
    if (!groupName) {
      return 'Please enter the Group Name (e.g., Goa Tour).';
    }
    if (!regex.test(groupName)) {
      return 'Group Name should start with a capital letter and be at least 6 characters long.';
    }
    return null;
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    // setError('');
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
      if (groupPic) formData.append('groupPic', groupPic);

      const response = await apiClient.post('/api/groups/create', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      const group = response.data.group;
      // setSuccess(`Group "${groupName}" created successfully.`);
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
      // console.error('Error creating group:', error);
      // setError('Failed to create group. Try again.');
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

// const showNotification = (message, severity) => {
//     setNotification({ open: true, message, severity });
// };

  return (
    <>
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Box p={3} display="flex" flexDirection="column" alignItems="center">
        {/* <IconButton component="label">
              <AddPhotoAlternateIcon sx={{ fontSize: 48 }} />
              <input type="file" hidden accept="image/*" onChange={(e) => setGroupImage(e.target.files[0])} />
            </IconButton> */}
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
        <Box textAlign="center" paddingTop={1} mb={2} >
          {croppedImage ? (
            <div>
              <img
                src={croppedImage}
                alt="Cropped Profile"
                style={{ width: '180px', height: '180px', borderRadius: '50%', cursor: 'pointer' }}
                onClick={() => setCropDialog(true)}
              />
              <Typography variant="body2">Your Profile Pic</Typography>
            </div>
          ) : (
            <div>
              <img
                src="https://placehold.co/400?text=Add+Photo"
                alt="Dummy Profile"
                style={{ width: '180px', height: '180px', borderRadius: '50%', cursor: 'pointer' }}
                onClick={() => setCropDialog(true)}
              />
              <Typography variant="body2">Add Profile Pic</Typography>
            </div>
          )}
          {/* <Typography variant="body2">Profile Pic</Typography> */}
        </Box>
        <Dialog open={cropDialog} onClose={() => setCropDialog(false)} fullWidth maxWidth="sm">
          <DialogTitle>Crop and Upload Picture</DialogTitle>
          <DialogContent sx={{ minHeight: '250px' }}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setGroupPic(e.target.files[0])}
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
        {/* {error && <Alert severity="error">{error}</Alert>} */}
        {/* {success && <Alert severity="success">{success}</Alert>} */}
        <Button type="submit" variant="contained" color="primary" style={{ marginTop: '1rem', margin: '1rem', maxWidth: '300px' }} onClick={handleCreateGroup} fullWidth disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Submit'}
        </Button>
        {/* <Button variant="contained" onClick={handleCreateGroup}>
              Submit
            </Button> */}
      </Box>
    </Dialog>

    <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
            {notification.message}
        </Alert>
    </Snackbar>
    </>
  );
};

export default CreateGroup;
