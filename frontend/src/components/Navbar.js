import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Asegúrate de que esta importación sea válida
import './Navbar.css';

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('access_token');
  let userRole = '';
  if (token) {
    try {
      const decoded = jwtDecode(token);
      userRole = decoded.role;
    } catch (error) {
      console.error('Error al decodificar el token:', error);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo">
          <Link to="/">
            <img src="/logo.png" alt="Logo" className="logo-image" />
          </Link>
        </div>

        {/* Enlaces de Navegación */}
        <ul className="nav-links">
          {/* Enlaces para Admin */}
          {userRole === 'Admin' && (
            <>
              <li className="nav-item">
                <Link to="/galeria" className="nav-link">
                  Galería
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/upload" className="nav-link">
                  Subir Imágenes
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/upload_car_images" className="nav-link">
                  Subir Imágenes de Coches
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/car_image_gallery" className="nav-link">
                  Galería de Autos
                </Link>
              </li>
            </>
          )}

          {/* Enlace para el rol "pisos" */}
          {userRole === 'pisos' && (
            <li className="nav-item">
              <Link to="/upload" className="nav-link">
                Subir Imágenes
              </Link>
            </li>
          )}

          {/* Enlace para el rol "coches" */}
          {userRole === 'coches' && (
            <li className="nav-item">
              <Link to="/upload_car_images" className="nav-link">
                Subir Imágenes de Coches
              </Link>
            </li>
          )}

          {/* Botón de Logout */}
          <li className="nav-item">
            <button onClick={handleLogout} className="nav-link logout-button">
              Logout
            </button>
          </li>
        </ul>

        {/* Menú Hamburguesa para Pantallas Pequeñas */}
        <div className="dropdown">
          <button
            className="dropdown-button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-label="Menu de navegación"
          >
            ☰
          </button>
          {isDropdownOpen && (
            <ul className="dropdown-menu">
              {/* Enlaces para Admin */}
              {userRole === 'Admin' && (
                <>
                  <li className="dropdown-item">
                    <Link to="/galeria" onClick={() => setIsDropdownOpen(false)}>
                      Galería
                    </Link>
                  </li>
                  <li className="dropdown-item">
                    <Link to="/upload" onClick={() => setIsDropdownOpen(false)}>
                      Subir Imágenes
                    </Link>
                  </li>
                  <li className="dropdown-item">
                    <Link to="/upload_car_images" onClick={() => setIsDropdownOpen(false)}>
                      Subir Imágenes de Coches
                    </Link>
                  </li>
                  <li className="dropdown-item">
                    <Link to="/car_image_gallery" onClick={() => setIsDropdownOpen(false)}>
                      Galería de Autos
                    </Link>
                  </li>
                </>
              )}

              {/* Enlace para el rol "pisos" */}
              {userRole === 'pisos' && (
                <li className="dropdown-item">
                  <Link to="/upload" onClick={() => setIsDropdownOpen(false)}>
                    Subir Imágenes
                  </Link>
                </li>
              )}

              {/* Enlace para el rol "coches" */}
              {userRole === 'coches' && (
                <li className="dropdown-item">
                  <Link to="/upload_car_images" onClick={() => setIsDropdownOpen(false)}>
                    Subir Imágenes de Coches
                  </Link>
                </li>
              )}

              {/* Botón de Logout */}
              <li className="dropdown-item">
                <button onClick={handleLogout} className="logout-button">
                  Logout
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;