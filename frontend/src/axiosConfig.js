// frontend/src/axiosConfig.js
import axios from 'axios';

// Crear una instancia de Axios con la URL base de tu backend
const axiosInstance = axios.create({
  baseURL: 'http://10.236.203.221:5100', // Asegúrate de que esta URL sea correcta
});

// Interceptor para agregar el encabezado Authorization en cada solicitud
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
