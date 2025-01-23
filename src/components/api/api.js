// src/api/api.js
import axios from 'axios';

const API = axios.create({ baseURL: process.env.REACT_APP_API_URL });

// Function to check and refresh the token
const refreshAuthToken = async () => {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
        try {
            const { data } = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/auth/refresh-token`,
                {},
                { headers: { Authorization: `Bearer ${authToken}` } }
            );
            const newToken = data.authToken;

            // Update tokens in localStorage
            const tokens = JSON.parse(localStorage.getItem('authTokens')) || {};
            const tokenUsername = localStorage.getItem('tokenUsername');
            tokens[tokenUsername] = newToken;
            localStorage.setItem('authTokens', JSON.stringify(tokens));
            localStorage.setItem('authToken', newToken);
        } catch (error) {
            console.error('Error refreshing token:', error);
            // If token refresh fails, log the user out
            localStorage.removeItem('authToken');
            localStorage.removeItem('authTokens');
            localStorage.removeItem('tokenUsername');
            localStorage.removeItem('userId');
            localStorage.removeItem('currentPage');
            window.location.reload();
        }
    }
};

// Add interceptors to refresh token if expired
API.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            await refreshAuthToken();
            const newAuthToken = localStorage.getItem('authToken');
            if (newAuthToken) {
                originalRequest.headers['Authorization'] = `Bearer ${newAuthToken}`;
                return API(originalRequest);
            }
        }
        return Promise.reject(error);
    }
);

// Add activity listener to refresh tokens proactively
let activityTimeout;
const extendSession = () => {
    clearTimeout(activityTimeout);
    activityTimeout = setTimeout(refreshAuthToken, 10 * 60 * 1000); // 10 minutes
};
['mousemove', 'keydown', 'scroll', 'click'].forEach((event) =>
    window.addEventListener(event, extendSession)
);

export default API;


