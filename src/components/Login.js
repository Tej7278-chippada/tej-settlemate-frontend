// /components/Login.js
import React, { useContext, useEffect, useState } from 'react';
import { TextField, Button, Typography, Box, Alert, useMediaQuery, ThemeProvider, createTheme, Dialog, DialogContent, DialogActions, CircularProgress,
  //  IconButton
   } from '@mui/material';
import axios from 'axios';
import Layout from './Layout';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import ForgotPassword from './ForgotPassword';
import { UserContext } from './UserContext';
// import CloseIcon from '@mui/icons-material/Close';

const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
});

const Login = () => {
  // const [username, setUsername] = useState('');
  const [identifier, setIdentifier] = useState(''); // Can be email or username
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  // const [resetData, setResetData] = useState(''); // For email or phone number
  // const [resetMessage, setResetMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme => theme.breakpoints.down('sm')); // Media query for small screens
  const [loading, setLoading] = useState(false);
  const { setUserId } = useContext(UserContext); // Access setUserId from context
  

  // const isEmail = (input) => {
  //   // Regex to check if input is an email
  //   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //   return emailRegex.test(input);
  // };

  useEffect(() => {
    const extendSession = () => {
      const authToken = localStorage.getItem('authToken');
      if (authToken) {
        axios.post(
          `${process.env.REACT_APP_API_URL}/api/auth/refresh-token`,
          {},
          { headers: { Authorization: `Bearer ${authToken}` } }
        )
        .then((response) => {
          const newToken  = response.data.authToken;
          const tokenUsername = localStorage.getItem('tokenUsername');
          const tokens = JSON.parse(localStorage.getItem('authTokens')) || {};
          tokens[tokenUsername] = newToken ;
          localStorage.setItem('authTokens', JSON.stringify(tokens));
          localStorage.setItem('authToken', newToken );
          console.log('authToken refreshed..! :', newToken);
        })
        .catch((error) => console.error('Failed to extend session:', error));
        console.log('Refresh token failed. Token expired or invalid.');
      }
    };

    const activityEvents = ['mousemove', 'keydown', 'scroll', 'click'];
    activityEvents.forEach((event) =>
      window.addEventListener(event, extendSession)
    );

    return () => {
      activityEvents.forEach((event) =>
        window.removeEventListener(event, extendSession)
      );
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
                                        // `${process.env.REACT_APP_API_URL}/transfer`
    try {                              // 'http://localhost:5002/api/auth/login' 'https://tej-chat-app-8cd7e70052a5.herokuapp.com/api/auth/login'
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, { identifier, password });
      setSuccess(`You are logged in with ${identifier.includes('@') ? 'email' : 'username'}: ${identifier}`);
      setIdentifier('');
      setPassword('');

      const { authToken, tokenUsername, userId } = response.data;
      // if (authToken) {
      //   // Store the token in localStorage
      //   localStorage.setItem('authToken', authToken);
      //   localStorage.setItem('tokenUsername', tokenUsername);
      //   // Redirect to chat page
      //   navigate('/productList'); // navigate(`/chat-${username}`);
      // } else {
      //   setError('Token is missing in response');
      // }
      if (authToken && userId){

      // Store authToken uniquely for the user
      const tokens = JSON.parse(localStorage.getItem('authTokens')) || {};
      tokens[tokenUsername] = authToken;
      localStorage.setItem('authTokens', JSON.stringify(tokens));

      // Set authToken and active user in localStorage
      localStorage.setItem('authToken', authToken);
      localStorage.setItem('activeUser', tokenUsername);
      localStorage.setItem('tokenUsername', tokenUsername);
      // localStorage.setItem('userId', userId); // Store userId

      // Set userId in context
      setUserId(userId); // Update the context with the userId

      setSuccess('Login successful!');
      navigate('/settleMate', { replace: true });
    } else {
        setError('Token is missing in response');
      }
      
      // Redirect to chat page or dashboard here
      // if (response.status === 200) {
      //   window.location.href = '/chat';
      // }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setError(`${identifier.includes('@') ? 'Email' : 'Username'} ${identifier} doesn't match any existing account.`);
      } else if (error.response && error.response.status === 401) {
        setError(`Password doesn't match for ${identifier.includes('@') ? 'Email' : 'Username'} : ${identifier}`);
      } else {
        setError('An error occurred while logging in.');
      }
    } finally {
      setLoading(false);
    }
  };

  // const handleForgotPassword = () => {
  //   setForgotPasswordOpen(true);
  // };

  // const handleResetPassword = async () => {
  //   try {                     // 'http://localhost:5002/api/auth/forgot-password'
  //     const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/forgot-password`, { resetData });
  //     setResetMessage('Your password has been reset successfully');
  //     setResetData('');
  //     setForgotPasswordOpen(false);
  //   } catch (error) {
  //     setResetMessage('Error resetting password. Please try again.');
  //   }
  // };

  const handleForgotPassword = () => {
    // navigate('/forgot-password');
    setForgotPasswordOpen(true);
  };

  return (
    <ThemeProvider theme={theme}>
    <Layout>
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="70vh"
    padding={isMobile ? 2 : 4} // Adjust padding for mobile
    >
      <Typography variant={isMobile ? "h5" : "h4"} gutterBottom>
        Login
      </Typography>
      <form onSubmit={handleLogin} style={{ maxWidth: '400px', width: '100%' }}>
      {location.state?.message && <div>{location.state.message}</div>}
        <TextField
          label="Username or Email"
          variant="outlined"
          fullWidth
          margin="normal"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}
        <Button type="submit" variant="contained" color="primary" fullWidth style={{ marginTop: '1rem' }} disabled={loading}>
        {loading ? <CircularProgress size={24} /> : 'Login'}
        </Button>
        <Button variant="text" color="primary" fullWidth onClick={handleForgotPassword} style={{ marginTop: '10px' }}>
              Forgot Password?
            </Button>
        <Typography variant="body2" align="center" style={{ marginTop: '10px' }}>
          Don't have an account?{' '}
          {/* <Button href="/register" variant="text">
            Register  Can be used only site deployed on custom domain, cant use on static domain of netlify
          </Button> */}
          <Link to="/register" style={{ color: 'inherit', textDecoration: 'none', display: 'inline-block' }}>
            <Button variant="text">
              Register
            </Button>
          </Link>
        </Typography>
      </form>
      <Dialog open={forgotPasswordOpen} onClose={() => setForgotPasswordOpen(false)} maxWidth="sm" fullWidth>
            <DialogContent>
              {/* Close button */}
        {/* <IconButton
          onClick={() => setForgotPasswordOpen(false)}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            color: '#333'
          }}
        >
          <CloseIcon />
        </IconButton> */}
              <ForgotPassword />
            </DialogContent>
            <DialogActions>
            <Button onClick={() => setForgotPasswordOpen(false)} color="secondary">Close</Button>
          </DialogActions>
          </Dialog>
    </Box>

    {/* Forgot Password Dialog */}
    {/* <Dialog open={forgotPasswordOpen} onClose={() => setForgotPasswordOpen(false)}>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogContent>
            <TextField
              label="Email or Phone Number"
              variant="outlined"
              fullWidth
              margin="normal"
              value={resetData}
              onChange={(e) => setResetData(e.target.value)}
            />
            {resetMessage && <Alert severity="info" style={{ marginTop: '10px' }}>{resetMessage}</Alert>}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setForgotPasswordOpen(false)} color="secondary">Cancel</Button>
            <Button onClick={handleResetPassword} color="primary">Reset Password</Button>
          </DialogActions>
        </Dialog> */}
    </Layout>
    </ThemeProvider>
  );
};

export default Login;
