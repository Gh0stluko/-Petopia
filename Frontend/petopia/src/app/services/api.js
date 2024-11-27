import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: 'http://localhost:8000/api', // Ensure this is correct
  withCredentials: true,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
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
        const response = await apiClient.post('/token/refresh/', {
          refresh: refreshToken,
        });

        const { access: newAccessToken, refresh: newRefreshToken } = response.data;

        // Update both tokens
        Cookies.set('accessToken', newAccessToken, { secure: true, sameSite: 'strict' });
        Cookies.set('refreshToken', newRefreshToken, { secure: true, sameSite: 'strict' });

        apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        return apiClient(originalRequest);
      } catch (err) {
        console.error('Error refreshing token:', err);
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        Cookies.remove('username');
        // Redirect to home page
        redirect('/');
      }
    }
    return Promise.reject(error);
  }
);


export default api;