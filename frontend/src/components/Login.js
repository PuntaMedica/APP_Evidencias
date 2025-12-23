// frontend/src/components/Login.js
import React, { useState } from 'react';
import axios from '../axiosConfig';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify'; // Importar ToastContainer y toast
import 'react-toastify/dist/ReactToastify.css';
import './Login.css'; // Asegúrate de tener este archivo para estilos

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Enviar solicitud POST al backend
      const response = await axios.post('/login', { username, password });
      
      // Verificar si el token está en la respuesta
      if (response.data.access_token) {
        // Almacenar el token en localStorage
        localStorage.setItem('access_token', response.data.access_token);
        toast.success('Inicio de sesión exitoso!'); // Notificación de éxito

        // Redirigir al usuario a la página de Subir Imágenes
        navigate('/upload');
      } else {
        toast.error('No se recibió el token JWT. Intenta nuevamente.'); // Notificación de error
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(`Error: ${error.response.data.error}`); // Notificación de error específica
      } else {
        toast.error('Error al iniciar sesión. Por favor, intenta de nuevo.'); // Notificación de error genérica
      }
    }
  };

  return (
    <div className="login-page">
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleLogin} className="login-form">
        <label htmlFor="username">Usuario:</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <label htmlFor="password">Contraseña:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit">Login</button>
      </form>
      <p>
        ¿No tienes una cuenta? <Link to="/register">Regístrate aquí</Link>
      </p>
      <ToastContainer /> {/* Contenedor para las notificaciones */}
    </div>
  );
};

export default Login;
