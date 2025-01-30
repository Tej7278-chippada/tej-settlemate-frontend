// src/utils/encryptionUtils.js
import CryptoJS from 'crypto-js';

// Secret key for encryption (keep this secure and don't hardcode in production)
// const SECRET_KEY = 'your-secret-key-123'; // Replace with a strong, unique key
// Read the secret key from environment variables
const SECRET_KEY = process.env.REACT_APP_SECRET_KEY;

if (!SECRET_KEY) {
    throw new Error('REACT_APP_SECRET_KEY is not defined in the environment variables.');
  }

// Encrypt data
export const encryptData = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

// Decrypt data
export const decryptData = (ciphertext) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};