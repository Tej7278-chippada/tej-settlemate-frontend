// /utils/axiosConfig.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // Base API URL from .env
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
