import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Galeria from './components/Galeria';
import Upload from './components/Upload';
import Login from './components/Login';
import Register from './components/Register';
import PrivateRoute from './components/PrivateRoute';
import Footer from './components/Footer';
import UploadCarImages from './components/UploadCarImages';
import CarImageGallery from './components/CarImageGallery';
import './App.css';

function App() {
  const isAuthenticated = !!localStorage.getItem('access_token');
  const userRole = localStorage.getItem('role'); // Obtenemos el rol del usuario desde el localStorage

  return (
    <Router>
      <div className="App">
        {/* Navbar visible siempre */}
        <Navbar />

        {/* Contenedor de Contenido Principal */}
        <div className="content">
          <Routes>
            {/* Ruta de Login */}
            <Route path="/login" element={<Login />} />

            {/* Ruta de Registro */}
            <Route path="/register" element={<Register />} />

            {/* Ruta Principal */}
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  userRole === "coches" ? (
                    <Navigate to="/upload_car_images" />
                  ) : (
                    <Navigate to="/upload" />
                  )
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            {/* Ruta de Galería */}
            <Route
              path="/galeria"
              element={
                <PrivateRoute roles={['Admin']}>
                  <Galeria />
                </PrivateRoute>
              }
            />

            {/* Ruta de Subir Imágenes */}
            <Route
              path="/upload"
              element={
                <PrivateRoute roles={['Admin', 'pisos']}>
                  <Upload />
                </PrivateRoute>
              }
            />

            {/* Ruta de Subir Imágenes de Coches */}
            <Route
              path="/upload_car_images"
              element={
                <PrivateRoute roles={['Admin', 'coches']}>
                  <UploadCarImages />
                </PrivateRoute>
              }
            />

            {/* Ruta de Galería de Autos */}
            <Route
              path="/car_image_gallery"
              element={
                <PrivateRoute roles={['Admin']}>
                  <CarImageGallery />
                </PrivateRoute>
              }
            />

            {/* Ruta por Defecto */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
