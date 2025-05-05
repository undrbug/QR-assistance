import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRef } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Tu contexto de autenticación
import QRCode from "react-qr-code";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const FRONTEND_URL_BASE = import.meta.env.VITE_FRONTEND_URL_BASE;

// Esquema de validación para la clase
const classSchema = yup.object().shape({
  titulo: yup.string().required('El título es obligatorio'),
  descripcion: yup.string(), // Descripción es opcional
  ubicacion_latitud: yup.number().required('La latitud es obligatoria').typeError('Debe ser un número'),
  ubicacion_longitud: yup.number().required('La longitud es obligatoria').typeError('Debe ser un número'),
});

const CreateClass = () => {
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [createdClass, setCreatedClass] = useState(null); // Para almacenar la clase creada y mostrar el QR
  const navigate = useNavigate();
  const { token } = useAuth(); // Obtenemos el token del contexto
  const qrCodeRef = useRef();
  const { user, logout } = useAuth();

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(classSchema),
    defaultValues: {
      titulo: '',
      descripcion: '',
      ubicacion_latitud: '',
      ubicacion_longitud: '',
    }
  });

  // Función para obtener la ubicación actual del navegador
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización.');
      return;
    }

    // const handleLogout = () => {
    //   logout(); // Llama a la función logout del contexto
    //   navigate('/login'); // Redirige al login después de cerrar sesión
    // };

    setError(null); // Limpiar errores previos
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setValue('ubicacion_latitud', position.coords.latitude);
        setValue('ubicacion_longitud', position.coords.longitude);
        setSuccessMessage('Ubicación capturada exitosamente.');
      },
      (err) => {
        console.error('Error getting location:', err);
        setError('No se pudo obtener la ubicación. Por favor, ingresa las coordenadas manualmente.');
      }
    );
  };

  const handleLogout = () => {
    logout(); // Llama a la función logout del contexto
    navigate('/login'); // Redirige al login después de cerrar sesión
  };

  // Función para manejar el envío del formulario y crear la clase en el backend
  const onSubmit = async (data) => {
    setError(null);
    setSuccessMessage(null);
    setCreatedClass(null);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${API_BASE_URL}/clases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || 'Error al crear la clase.');
        console.error('Create class failed:', result);
        return;
      }

      console.log('Class created successfully:', result);
      setCreatedClass(result.clase); // Guarda los datos de la clase creada
      // setSuccessMessage('Clase creada exitosamente. Aquí tienes el código QR.');

      // Opcional: Redirigir después de un tiempo o mostrar un mensaje
      // navigate('/dashboard');

    } catch (err) {
      console.error('Network error or unexpected issue:', err);
      setError('Error de conexión o del servidor al crear la clase.');
    }
  };

  // Función para descargar el QR como imagen
  const downloadQR = () => {
    // Usamos la ref para encontrar el elemento SVG dentro del contenedor
    const svgElement = qrCodeRef.current?.querySelector('svg');
    if (!svgElement) {
      console.error("Elemento SVG del QR no encontrado para descargar.");
      return;
    }

    // Convertir SVG a Data URL
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    // Crear un canvas para dibujar el SVG y obtener un PNG
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Obtener Data URL del Canvas (PNG)
      const pngUrl = canvas.toDataURL('image/png');

      // Crear enlace de descarga
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `qr_clase_${createdClass?.id_clase || 'nueva'}.png`; // Nombre del archivo

      // Simular clic para descargar
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      // Liberar la URL del objeto Blob
      URL.revokeObjectURL(svgUrl);
    };

    // Cargar el SVG en la imagen para dibujarlo en el canvas
    img.src = svgUrl;
  };


  // Armamos la URL que irá en el QR una vez que la clase sea creada
  const qrCodeUrl = createdClass
    ? `${import.meta.env.VITE_FRONTEND_URL_BASE}/asistencias/${createdClass.id_clase}`
    : null;

  return (
    <div className="container mt-5">
      <h1 className='text-center'>Asistencia para alumnos</h1>

      {error && <div className="alert alert-danger">{error}</div>}
      {successMessage && !createdClass && <div className="alert alert-success">{successMessage}</div>}
      {successMessage && createdClass && <div className="alert alert-success">{successMessage}</div>}

      {!createdClass && ( // Muestra el formulario si la clase aún no ha sido creada
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <label htmlFor="titulo" className="form-label">Título de la Clase:</label>
            <input
              type="text"
              className={`form-control ${errors.titulo ? 'is-invalid' : ''}`}
              id="titulo"
              {...register('titulo')}
            />
            {errors.titulo && <div className="invalid-feedback">{errors.titulo.message}</div>}
          </div>

          <div className="mb-3">
            <label htmlFor="descripcion" className="form-label">Descripción (Opcional):</label>
            <textarea
              className={`form-control ${errors.descripcion ? 'is-invalid' : ''}`}
              id="descripcion"
              rows="3"
              {...register('descripcion')}
            ></textarea>
            {errors.descripcion && <div className="invalid-feedback">{errors.descripcion.message}</div>}
          </div>

          <div className="row mb-3">
            <div className="col">
              <label htmlFor="ubicacion_latitud" className="form-label">Latitud:</label>
              <input
                type="number"
                step="any" // Permite decimales
                className={`form-control ${errors.ubicacion_latitud ? 'is-invalid' : ''}`}
                id="ubicacion_latitud"
                {...register('ubicacion_latitud')}
              />
              {errors.ubicacion_latitud && <div className="invalid-feedback">{errors.ubicacion_latitud.message}</div>}
            </div>
            <div className="col">
              <label htmlFor="ubicacion_longitud" className="form-label">Longitud:</label>
              <input
                type="number"
                step="any" // Permite decimales
                className={`form-control ${errors.ubicacion_longitud ? 'is-invalid' : ''}`}
                id="ubicacion_longitud"
                {...register('ubicacion_longitud')}
              />
              {errors.ubicacion_longitud && <div className="invalid-feedback">{errors.ubicacion_longitud.message}</div>}
            </div>
          </div>

          <div className="mb-auto gap-3 d-flex justify-content-center">
            <button type="button" className="btn btn-secondary mb-2 " onClick={handleGetLocation}>
              Usar Mi Ubicación Actual (GPS)
            </button>

            <button type="submit" className="btn btn-primary mb-2" disabled={isSubmitting}>
              {isSubmitting ? 'Creando...' : 'Crear Clase y Generar QR'}
            </button>
          </div>

        </form>
      )}

      {createdClass && qrCodeUrl && ( // Muestra el QR si la clase ya fue creada
        <div className="mt-4 text-center">
          <h2>QR de la clase: "{createdClass.titulo}"</h2>
          <p>(Este QR redirige a: {qrCodeUrl})</p>
          {/* *** Contenedor con la ref para el QR *** */}
          {/* Estilos básicos para centrar y tamaño */}
          <div ref={qrCodeRef} style={{ height: "auto", margin: "0 auto", maxWidth: 300, width: "100%" }}>
            {/* Renderiza el componente QRCode */}
            {/* Propiedades básicas: value y size */}
            <QRCode
              value={qrCodeUrl}
              size={290}
              // react-qr-code puede no tener level o includeMargin, usa estilos si es necesario
              style={{ height: "auto", maxWidth: "100%", width: "100%" }} // Estilo para hacerlo responsive dentro del contenedor
            />
          </div>
          <div className="">
            <button className="btn btn-success mt-3 me-2" onClick={downloadQR}>Descargar QR (PNG)</button>
            <button className="btn btn-secondary mt-3 me-2" onClick={() => setCreatedClass(null)}>Crear Otra Clase</button>
            <button className="btn btn-danger mt-3 me-2" onClick={handleLogout}>
              Cerrar Sesión
            </button>

          </div>
        </div>
      )}
    </div>
  );
};

export default CreateClass;