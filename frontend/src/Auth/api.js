import axios from 'axios';

const api = axios.create({
  baseURL: 'http://172.16.50.12:8081',
  // baseURL: 'http://localhost:8081',

});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;