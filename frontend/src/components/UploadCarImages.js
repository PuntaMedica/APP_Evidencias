// frontend/src/components/UploadCarImages.js
import React, { useState } from 'react';
import axios from '../axiosConfig';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './UploadCarImages.css';

const UploadCarImages = () => {
  const [plate, setPlate] = useState('');
  const [files, setFiles] = useState({
    Delantero: null,
    Trasero: null,
    LateralIzquierdo: null,
    LateralDerecho: null,
  });

  const handleFileChange = (e, section) => {
    const file = e.target.files[0];
    setFiles((prevFiles) => ({
      ...prevFiles,
      [section]: file,
    }));
  };

  const handleUpload = async () => {
    if (!plate || Object.values(files).some((file) => !file)) {
      toast.error('Por favor, completa todos los campos antes de subir.');
      return;
    }
  
    const formData = new FormData();
    formData.append('plate', plate);
    Object.entries(files).forEach(([section, file]) => {
      formData.append('images', file);
      formData.append('section', section);
    });
  
    const token = localStorage.getItem('access_token');
  
    try {
      const response = await axios.post('/upload_car_images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`, // Incluye el token aquí
        },
      });
      toast.success('¡Imágenes subidas exitosamente!');
      setPlate('');
      setFiles({
        Delantero: null,
        Trasero: null,
        LateralIzquierdo: null,
        LateralDerecho: null,
      });
    } catch (error) {
      console.error('Error al subir las imágenes:', error);
      toast.error('Hubo un problema al subir las imágenes.');
    }
  };
  

  return (
    <div className="upload-car-images">
      <h1>Subir Imágenes de Coches</h1>

      <div className="form-group">
        <label htmlFor="plate">Placas:</label>
        <input
          type="text"
          id="plate"
          value={plate}
          onChange={(e) => setPlate(e.target.value)}
          placeholder="Ingresa las placas del coche"
          required
        />
      </div>

      {['Delantero', 'Trasero', 'LateralIzquierdo', 'LateralDerecho'].map((section) => (
        <div key={section} className="form-group">
          <label htmlFor={section}>{`Imagen ${section.replace('Izquierdo', ' Izquierdo').replace('Derecho', ' Derecho')}:`}</label>
          <input
            type="file"
            id={section}
            onChange={(e) => handleFileChange(e, section)}
            accept="image/*"
          />
        </div>
      ))}

      <button onClick={handleUpload} className="upload-button">
        Subir Imágenes
      </button>

      <ToastContainer position="top-right" autoClose={5000} />
    </div>
  );
};

export default UploadCarImages;
