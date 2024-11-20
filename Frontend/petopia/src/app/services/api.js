import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: 'http://localhost:8000/api', // Ensure this is correct
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
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

export default api;