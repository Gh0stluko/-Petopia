import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: 'http://localhost:8000/api', // Ensure this is correct
  withCredentials: true,
  // Remove default Content-Type to allow axios to set it automatically
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Set Content-Type based on the request data
    if (!config.headers['Content-Type']) {
      if (config.data instanceof FormData) {
        config.headers['Content-Type'] = 'multipart/form-data';
      } else {
        config.headers['Content-Type'] = 'application/json';
      }
    }
    
    const token = Cookies.get('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      Cookies.get('refreshToken')
    ) {
      originalRequest._retry = true;
      try {
        const refreshToken = Cookies.get('refreshToken');
        const response = await api.post('/token/refresh/', {
          refresh: refreshToken,
        });

        const { access: newAccessToken, refresh: newRefreshToken } = response.data;

        // Update both tokens
        Cookies.set('accessToken', newAccessToken, { secure: true, sameSite: 'strict' });
        Cookies.set('refreshToken', newRefreshToken, { secure: true, sameSite: 'strict' });

        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (err) {
        console.error('Error refreshing token:', err);
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        // Optionally redirect to login page
      }
    }
    return Promise.reject(error);
  }
);

// Utility function to transform image URLs for Next.js
export const getImageUrl = (url) => {
  if (!url) return '';
  
  // If it's already a relative URL, return as is
  if (url.startsWith('/')) {
    // In production, keep the original URL for direct access
    // In development with Docker, we need to use the full URL
    if (process.env.NODE_ENV === 'development') {
      return `http://localhost:8000${url}`;
    }
    return url;
  }
  
  // If it's already a full URL, return as is
  if (url.startsWith('http')) {
    return url;
  }
  
  // Otherwise, prepend the backend URL
  return `http://localhost:8000/${url}`;
};

export default api;