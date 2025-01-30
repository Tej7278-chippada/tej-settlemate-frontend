// src/App.js
import React from 'react';
import './App.css';
import Login from './components/Login';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './components/Register';
import PrivateRoute from './components/PriviteRoute';
import { ThemeProvider, createTheme } from '@mui/material';
import ForgotPassword from './components/ForgotPassword';
import SettleMate from './components/settleMate/SettleMate';
import UserProfile from './components/UserProfile';
import GroupDetails from './components/settleMate/GroupDetails';
import GroupTrans from './components/settleMate/GroupTrans';

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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/settleMate" element={
            <PrivateRoute>
              <SettleMate />
            </PrivateRoute>
          } />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/user/:id" element={
            <PrivateRoute>
              <UserProfile />
            </PrivateRoute>}
          />
          <Route path="/group-details/:groupId" element={
            <PrivateRoute>
              <GroupDetails />
            </PrivateRoute>
          } />
          <Route path="/group/:groupId" element={
            <PrivateRoute>
              <GroupTrans />
            </PrivateRoute>
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
