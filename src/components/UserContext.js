// /src/UserContext.js
import React, { createContext, useEffect, useState } from 'react';
import { decryptData, encryptData } from '../utils/encryptionUtils';

// Create a context for the user
export const UserContext = createContext();

// Create a provider component
export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);

  // Initialize userId from localStorage on app load
  useEffect(() => {
    const encryptedUserId = localStorage.getItem('encryptedUserId');
    if (encryptedUserId) {
      const decryptedUserId = decryptData(encryptedUserId); // Decrypt userId
      setUserId(decryptedUserId);
    }
  }, []);

  // Update localStorage whenever userId changes
  useEffect(() => {
    if (userId) {
      const encryptedUserId = encryptData(userId); // Encrypt userId
      localStorage.setItem('encryptedUserId', encryptedUserId);
    } else {
      localStorage.removeItem('encryptedUserId');
    }
  }, [userId]);

  return (
    <UserContext.Provider value={{ userId, setUserId }}>
      {children}
    </UserContext.Provider>
  );
};