// frontend/src/components/Register.js
import React, { useState } from 'react';
import axios from '../axiosConfig';
import { useNavigate, Link } from 'react-router-dom';
import './Register.css'; // Crea este archivo para estilos

const Register = () => {
  const [nombre, setNombre] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/register', { nombre, departamento, username, password });
      alert('Usuario registrado exitosamente. Ahora puedes iniciar sesión.');
      navigate('/login');
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      alert('Error al registrar usuario. Por favor, verifica los datos e inténtalo de nuevo.');
    }
  };

  return (
    <div className="register-page">
      <h2>Registro de Usuario</h2>
      <form onSubmit={handleRegister} className="register-form">
        <label htmlFor="nombre">Nombre:</label>
        <input
          type="text"
          id="nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />

        <label htmlFor="departamento">Departamento:</label>
        <input
          type="text"
          id="departamento"
          value={departamento}
          onChange={(e) => setDepartamento(e.target.value)}
          required
        />

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

        <button type="submit">Registrar</button>
      </form>
      <p>
        ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión aquí</Link>
      </p>
    </div>
  );
};

export default Register;
