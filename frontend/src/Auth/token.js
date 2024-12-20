import api from './api';
import jwt_decode from 'jwt-decode';

export const refreshToken = async () => {
  try {
    const response = await api.post('/refresh-token', {}, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('sessionToken')}`
      }
    });

    if (response.data.success) {
      const { token } = response.data;
      localStorage.setItem('sessionToken', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return false;
  }
};

export const checkTokenExpiration = () => {
  const token = localStorage.getItem('token');
  if (!token) return true;

  try {
    const decodedToken = jwt_decode(token);
    const currentTime = Date.now() / 1000;
    
    if (decodedToken.exp < currentTime + 3600) {
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error decoding token:', error);
    return true;
  }
};
