// frontend/src/components/Upload.js
import React, { useState, useEffect, useRef } from 'react';
import axios from '../axiosConfig'; // Importar la instancia configurada
import './Upload.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Upload = () => {
  const [selectedFloor, setSelectedFloor] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]); // Array de objetos { file, preview }
  const [uploadStatus, setUploadStatus] = useState('');
  const [previewImage, setPreviewImage] = useState(null); // Imagen seleccionada para agrandar

  // Pisos del edificio
  const floors = [
    'Piso -6',
    'Piso -5',
    'Piso -4',
    'Piso -3',
    'Piso -2',
    'Piso -1',
    'Planta Baja',
    'Piso 1',
    'Piso 2',
    'Piso 3',
    'Piso 4',
    'Piso 5',
    'Piso 6',
    'Piso 7'
  ];

  // Referencia al input de archivos
  const fileInputRef = useRef(null);

  // Manejar cambio de archivos
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!selectedFloor) {
      toast.error('Por favor, seleccione un piso antes de agregar imágenes.');
      return;
    }
    const filesWithPreview = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setSelectedFiles(prevFiles => [...prevFiles, ...filesWithPreview]); // Agregar a los existentes
  };

  // Manejar la subida de archivos
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Por favor, agrega al menos una imagen para subir.');
      return;
    }

    setUploadStatus('Subiendo...');

    try {
      const formData = new FormData();
      selectedFiles.forEach(fileObj => {
        formData.append('file', fileObj.file);
        formData.append('last_modified', fileObj.file.lastModified); // Agregar la fecha de modificación
      });
      // Reemplazar "Planta Baja" por "Piso 0" para el backend
      const floorToSend = selectedFloor === 'Planta Baja' ? 'Piso 0' : selectedFloor;
      formData.append('piso', floorToSend);

      const response = await axios.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadStatus('Subido exitosamente');
      toast.success('Imágenes subidas correctamente.');
      handleCancel();
      setTimeout(() => setUploadStatus(''), 3000);
    } catch (error) {
      console.error('Error al subir las imágenes:', error);
      setUploadStatus('Error al subir');
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(`Error: ${error.response.data.error}`);
      } else {
        toast.error('Hubo un problema al subir las imágenes.');
      }
    }
  };

  // Manejar el clic en una miniatura para agrandarla
  const handleThumbnailClick = (fileObj) => {
    setPreviewImage(fileObj.preview);
  };

  // Manejar el clic en "Cancelar"
  const handleCancel = () => {
    setSelectedFiles([]);
    setPreviewImage(null);
    setUploadStatus('');
    setSelectedFloor('');
    if (fileInputRef.current) {
      fileInputRef.current.value = null; // Limpiar el input
    }
  };

  // Liberar recursos de las vistas previas al desmontar el componente o al cambiar las imágenes
  useEffect(() => {
    return () => {
      selectedFiles.forEach(fileObj => URL.revokeObjectURL(fileObj.preview));
    };
  }, [selectedFiles]);

  return (
    <div className="upload-page">
      <h1 className="upload-title">Subir Imágenes</h1>

      <div className="upload-container">
        <div className="upload-form">
          {/* Selección de Piso */}
          <label htmlFor="floor-select" className="floor-label">
            Seleccionar Piso:
          </label>
          <select
            id="floor-select"
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(e.target.value)}
            className="floor-select"
          >
            <option value="" disabled>
              Seleccione un piso
            </option>
            {floors.map((floor, index) => (
              <option key={index} value={floor}>
                {floor}
              </option>
            ))}
          </select>

          {/* Botón Personalizado para Seleccionar Archivos */}
          <button
            className="add-images-button"
            onClick={() => {
              if (!selectedFloor) {
                toast.error('Por favor, seleccione un piso antes de agregar imágenes.');
                return;
              }
              fileInputRef.current.click();
            }}
            aria-label="Agregar más imágenes"
          >
            Agregar más imágenes
          </button>

          {/* Input de Archivos Oculto */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            multiple
            className="file-input"
            style={{ display: 'none' }}
          />

          {/* Botones de Subida y Cancelar */}
          <div className="action-buttons">
            <button onClick={handleUpload} className="upload-button">
              Subir
            </button>
            <button onClick={handleCancel} className="cancel-button">
              Cancelar
            </button>
          </div>

          {/* Estado de Subida */}
          {uploadStatus && <p className="upload-status">{uploadStatus}</p>}
        </div>

        {/* Sección de Previsualización de Miniaturas */}
        {selectedFiles.length > 0 && (
          <div className="thumbnails-container">
            {selectedFiles.map((fileObj, index) => (
              <img
                key={index}
                src={fileObj.preview}
                alt={`Seleccionada ${index}`}
                className="thumbnail"
                onClick={() => handleThumbnailClick(fileObj)}
              />
            ))}
          </div>
        )}

        {/* Sección de Imagen Agrandada */}
        {previewImage && (
          <div className="enlarged-image-container">
            <img src={previewImage} alt="Vista Agrandada" className="enlarged-image" />
          </div>
        )}
      </div>

      {/* Contenedor de Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default Upload;
