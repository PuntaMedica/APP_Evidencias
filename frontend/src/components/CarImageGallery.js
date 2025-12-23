import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import './CarImageGallery.css';

const CarImageGallery = () => {
  const [allImages, setAllImages] = useState([]);
  const [imagesByPlate, setImagesByPlate] = useState({});
  const [filters, setFilters] = useState({ plate: '', date: '' });
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchImages = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get('/get_car_images', {
        params: { date: filters.date },
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllImages(response.data); // Guarda todas las imágenes para filtrar en el frontend
      filterImages(response.data, filters.plate);
    } catch (error) {
      console.error('Error al obtener las imágenes:', error);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [filters.date]);

  const filterImages = (images, plateFilter) => {
    // Filtrar las imágenes según el texto ingresado en la placa
    const filteredImages = images.filter((image) =>
      plateFilter ? image.plate.toLowerCase().startsWith(plateFilter.toLowerCase()) : true
    );

    // Agrupar las imágenes filtradas por placa
    const groupedImages = filteredImages.reduce((acc, image) => {
      if (!acc[image.plate]) {
        acc[image.plate] = [];
      }
      acc[image.plate].push(image);
      return acc;
    }, {});

    setImagesByPlate(groupedImages);
  };

  const handlePlateFilterChange = (e) => {
    const plateFilter = e.target.value;
    setFilters((prev) => ({ ...prev, plate: plateFilter }));
    filterImages(allImages, plateFilter); // Actualiza los resultados al cambiar el filtro
  };

  const clearFilters = () => {
    setFilters({ plate: '', date: '' });
    filterImages(allImages, ''); // Restablece los resultados al eliminar los filtros
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  return (
    <div className="car-image-gallery">
      <h1>Galería de Imágenes de Coches</h1>

      {/* Filtros */}
      <div className="filters">
        <input
          type="text"
          placeholder="Buscar por placa"
          value={filters.plate}
          onChange={handlePlateFilterChange}
        />
        <input
          type="date"
          value={filters.date}
          onChange={(e) => setFilters((prev) => ({ ...prev, date: e.target.value }))}
        />
        <button onClick={clearFilters}>Eliminar Filtros</button>
      </div>

      {/* Lista de Imágenes por Placa */}
      <div className="image-list">
        {Object.keys(imagesByPlate).map((plate) => (
          <div key={plate} className="plate-section">
            <h2 className="plate-title">{plate}</h2>
            <div className="plate-images">
              {imagesByPlate[plate].map((image) => (
                <div
                  key={image.id}
                  className="image-card"
                  onClick={() => handleImageClick(image)}
                >
                  <img
                    src={`http://10.236.203.221:5100${image.image_path}`}
                    alt={image.section}
                  />
                  <p>{image.section}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal para Imagen Seleccionada */}
      {selectedImage && (
        <div className="image-modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={closeModal}>
              &times;
            </button>
            <img
              src={`http://10.236.203.221:5100${selectedImage.image_path}`}
              alt={selectedImage.section}
            />
            <p>
              <strong>Placa:</strong> {selectedImage.plate}
            </p>
            <p>
              <strong>Fecha de Subida:</strong>{' '}
              {new Date(selectedImage.upload_date).toLocaleString()}
            </p>
            <p>
              <strong>Zona:</strong> {selectedImage.section}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarImageGallery;
