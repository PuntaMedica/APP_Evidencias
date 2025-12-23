// frontend/src/components/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Importación corregida

const PrivateRoute = ({ children, roles }) => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    console.log('No token encontrado. Redirigiendo a /login');
    return <Navigate to="/login" />;
  }

  try {
    const decoded = jwtDecode(token); // Uso de jwtDecode
    const userRole = decoded.role; // Acceder directamente a 'role'

    console.log('Token decodificado. Rol del usuario:', userRole);

    if (roles && !roles.includes(userRole)) {
      console.log('Rol no autorizado. Redirigiendo a /login');
      return <Navigate to="/login" />;
    }

    return children;
  } catch (error) {
    console.error('Token inválido:', error);
    return <Navigate to="/login" />;
  }
};

export default PrivateRoute;
