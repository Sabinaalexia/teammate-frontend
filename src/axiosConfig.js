import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor: Adaugă token-ul automat la FIECARE request (DOAR dacă există)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    
    // NU trimite token pentru login/register
    const isAuthEndpoint = config.url.includes('/auth/login') || config.url.includes('/auth/register');
    
    if (token && !isAuthEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor: Dacă primim 401 Unauthorized, șterge token-ul
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;