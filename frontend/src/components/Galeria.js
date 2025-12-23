// frontend/src/components/Galeria.js
import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig'; // Usar la instancia configurada
import './Galeria.css';
import { toast } from 'react-toastify'; // Añadido para mostrar errores

const Galeria = () => {
  const [images, setImages] = useState([]);
  const [previewImage, setPreviewImage] = useState({
    ruta_archivo: '/predeterminada.webp',
    piso: '',
    fecha_subida: '',
    fecha_modificacion: ''
  });
  const [selectedFloor, setSelectedFloor] = useState('All');
  const [selectedDate, setSelectedDate] = useState('');
  const [expandedFloors, setExpandedFloors] = useState({});

  useEffect(() => {
    fetchAllImages();
  }, []);

  const fetchAllImages = async () => {
    try {
      const response = await axios.get('/images'); // Ruta relativa
      setImages(response.data);
    } catch (error) {
      console.error("Error al obtener las imágenes:", error);
      toast.error('Error al obtener las imágenes.');
    }
  };

  const handleThumbnailClick = (image) => {
    setPreviewImage(image);
  };

  const groupImagesByFloor = (images) => {
    return images.reduce((acc, image) => {
      const piso = image.piso === 'Piso 0' ? 'Planta Baja' : image.piso;
      if (!acc[piso]) {
        acc[piso] = [];
      }
      acc[piso].push(image);
      return acc;
    }, {});
  };

  const sortFloors = (floors) => {
    return floors.sort((a, b) => {
      const numA = a === 'Planta Baja' ? 0 : parseInt(a.replace('Piso ', ''), 10);
      const numB = b === 'Planta Baja' ? 0 : parseInt(b.replace('Piso ', ''), 10);
      return numA - numB;
    });
  };

  const filteredImages = images.filter(image => {
    const imageDate = image.fecha_subida.split(' ')[0];
    const matchesFloor =
      selectedFloor === 'All' ||
      (selectedFloor === 'Planta Baja' && image.piso === 'Piso 0') ||
      image.piso === selectedFloor;
    const matchesDate = selectedDate === '' || imageDate === selectedDate;
    return matchesFloor && matchesDate;
  });

  const groupedImages = groupImagesByFloor(filteredImages);
  const sortedFloors = sortFloors(Object.keys(groupedImages));

  const floorOptions = sortFloors(
    [...new Set(images.map(image => (image.piso === 'Piso 0' ? 'Planta Baja' : image.piso)))]
  );

  const handleViewMore = (floor) => {
    setExpandedFloors(prevState => ({
      ...prevState,
      [floor]: true
    }));
  };

  const isAnyFloorExpanded = () => {
    return Object.values(expandedFloors).some(val => val);
  };

  const handleClearFilters = () => {
    setSelectedFloor('All');
    setSelectedDate('');
    setExpandedFloors({});
    setPreviewImage({
      ruta_archivo: '/predeterminada.webp',
      piso: '',
      fecha_subida: '',
      fecha_modificacion: ''
    });
  };

  return (
    <div className="galeria">
      <h1 className="galeria-title">Galería de Imágenes</h1>

      {/* Sección de Filtro */}
      <div className="filter-section">
        <select
          value={selectedFloor}
          onChange={(e) => {
            setSelectedFloor(e.target.value);
            setPreviewImage({
              ruta_archivo: '/predeterminada.webp',
              piso: '',
              fecha_subida: '',
              fecha_modificacion: ''
            });
          }}
          className="floor-select"
        >
          <option value="All">Todos los Pisos</option>
          {floorOptions.map((floor, index) => (
            <option key={index} value={floor}>{floor}</option>
          ))}
        </select>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => {
            setSelectedDate(e.target.value);
            setPreviewImage({
              ruta_archivo: '/predeterminada.webp',
              piso: '',
              fecha_subida: '',
              fecha_modificacion: ''
            });
          }}
          className="date-select"
        />

        {(selectedFloor !== 'All' || selectedDate !== '' || isAnyFloorExpanded()) && (
          <button
            onClick={handleClearFilters}
            className="clear-filter-button"
          >
            Quitar Filtros
          </button>
        )}
      </div>

      <div className="galeria-container">
        <div className="galeria-images">
          {sortedFloors.map((floor, index) => {
            const isExpanded = expandedFloors[floor];
            const imagesToShow = isExpanded ? groupedImages[floor] : groupedImages[floor].slice(0, 10);
            const hasMore = groupedImages[floor].length > 10 && !isExpanded;

            return (
              <div key={index} className="floor-section">
                <h2 className="floor-title">{floor}</h2>
                <div className="thumbnails">
                  {imagesToShow.map((image) => (
                    <img
                      key={image.id}
                      src={`http://10.236.203.221:5100${image.ruta_archivo}`} // Asegúrate que ruta_archivo empieza con '/'
                      alt={`Imagen ${image.id}`}
                      className="thumbnail"
                      onClick={() => handleThumbnailClick(image)}Ks
                    />
                  ))}
                </div>
                {hasMore && (
                  <button
                    onClick={() => handleViewMore(floor)}
                    className="view-more-button"
                  >
                    Ver más
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <div className="preview-section">
          <img
            src={previewImage.piso ? `http://10.236.203.221:5100${previewImage.ruta_archivo}` : previewImage.ruta_archivo}
            alt="Vista Previa"
            className="preview-image"
          />
          {previewImage.piso && previewImage.fecha_subida && previewImage.fecha_modificacion && (
            <div className="image-info">
              <p><strong>Piso:</strong> {previewImage.piso === 'Piso 0' ? 'Planta Baja' : previewImage.piso}</p>
              <p><strong>Fecha de subida:</strong> {previewImage.fecha_subida}</p>
              <p><strong>Origen:</strong> {previewImage.fecha_modificacion}</p>
              <p><strong>Subido por:</strong> {previewImage.usuario_nombre || 'Desconocido'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Galeria;
