import api from './api';
import Cookies from 'js-cookie';



// ... (register function)

export const login = async (email, password) => {
  try {
    const response = await api.post('/login/', {
      email,
      password,
    });

    // Store tokens in cookies
    Cookies.set('accessToken', response.data.access);
    Cookies.set('refreshToken', response.data.refresh);
    Cookies.set('username', response.data.username);
    console.log(response.data.refresh)
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const logout = () => {
  Cookies.remove('accessToken');
  Cookies.remove('refreshToken');
  Cookies.remove('username');
  window.location.href = '/';
};

export const register = async (username, email, password) => {
  const response = await api.post('/register/', {
    username,
    email,
    password,
  });
  return response.data;
};

