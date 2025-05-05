import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// validación para los datos del alumno
const studentSchema = yup.object().shape({
  legajo_alumno: yup.string().required('El legajo es obligatorio'),
  nombre_alumno: yup.string().required('El nombre es obligatorio'),
  apellido_alumno: yup.string().required('El apellido es obligatorio'),
  dni_alumno: yup.string().required('El DNI es obligatorio'),
});

const AttendancePage = () => {
  const { classId } = useParams(); // Obtiene el ID de la clase de la URL
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Controla el estado de envío

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(studentSchema),
  });

  // onSubmit captura la ubicación y el envío al backend
  const onSubmit = async (formData) => {
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true); // Indica que el envío ha comenzado

    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización. No se puede registrar la asistencia.');
      setIsSubmitting(false);
      return;
    }

    // obtenemos la ubicación del alumno
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log("Ubicación capturada:", { latitude, longitude });

        // construimos el objeto de datos de asistencia para enviar al backend
        const attendanceData = {
          classId: classId, // ID de la clase de la URL
          legajo_alumno: formData.legajo_alumno,
          nombre_alumno: formData.nombre_alumno,
          apellido_alumno: formData.apellido_alumno,
          dni_alumno: formData.dni_alumno,
          ubicacion_alumno_latitud: latitude,
          ubicacion_alumno_longitud: longitude,
        };

        try {
          const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
          const response = await fetch(`${API_BASE_URL}/asistencias`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(attendanceData),
          });
          const result = await response.json();

          if (!response.ok) {
            setError(result.message || 'Error al registrar asistencia.');
          } else {
            setSuccessMessage(result.message);
            setTimeout(() => {
              setSuccessMessage(null);
            }, 5000);
          }
        } catch (apiError) {
          console.error('Error al enviar datos de asistencia:', apiError);
          setError('Error de conexión o del servidor al registrar asistencia.');
        } finally {
          setIsSubmitting(false); // Finaliza el estado de envío después de la API call
        }

      },
      (geoError) => {
        console.error('Error al obtener ubicación:', geoError);
        setIsSubmitting(false); // Finaliza el estado de envío
        let geoErrorMessage = 'No se pudo obtener tu ubicación.';
        switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            geoErrorMessage = 'Permiso de geolocalización denegado. Por favor, permite el acceso a tu ubicación para registrar asistencia.';
            break;
          case geoError.POSITION_UNAVAILABLE:
            geoErrorMessage = 'Ubicación no disponible. Inténtalo de nuevo en un lugar con mejor señal.';
            break;
          case geoError.TIMEOUT:
            geoErrorMessage = 'Tiempo de espera agotado al intentar obtener la ubicación.';
            break;
          default:
            geoErrorMessage = 'Error desconocido al obtener la ubicación.';
            break;
        }
        setError(geoErrorMessage);
      },
      { // Opciones para getCurrentPosition
        enableHighAccuracy: true, // Intenta obtener la mejor precisión posible
        timeout: 10000, // Tiempo máximo para intentar obtener la ubicación (10 segundos)
        maximumAge: 0 // No usar una posición cacheada
      }
    );
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header text-center">
              Registrar Asistencia
            </div>
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}
              {successMessage && <div className="alert alert-success">{successMessage}</div>}

              {/* Muestra el formulario solo si no hay mensaje de éxito y no está enviando */}
              {!successMessage && !isSubmitting && (
                <form onSubmit={handleSubmit(onSubmit)}>
                  {/* ... Campos del formulario del alumno (legajo, nombre, apellido, dni) ... */}
                  <div className="mb-3">
                    <label htmlFor="legajo_alumno" className="form-label">Legajo:</label>
                    <input
                      type="text"
                      className={`form-control ${errors.legajo_alumno ? 'is-invalid' : ''}`}
                      id="legajo_alumno"
                      {...register('legajo_alumno')}
                    />
                    {errors.legajo_alumno && <div className="invalid-feedback">{errors.legajo_alumno.message}</div>}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="nombre_alumno" className="form-label">Nombre:</label>
                    <input
                      type="text"
                      className={`form-control ${errors.nombre_alumno ? 'is-invalid' : ''}`}
                      id="nombre_alumno"
                      {...register('nombre_alumno')}
                    />
                    {errors.nombre_alumno && <div className="invalid-feedback">{errors.nombre_alumno.message}</div>}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="apellido_alumno" className="form-label">Apellido:</label>
                    <input
                      type="text"
                      className={`form-control ${errors.apellido_alumno ? 'is-invalid' : ''}`}
                      id="apellido_alumno"
                      {...register('apellido_alumno')}
                    />
                    {errors.apellido_alumno && <div className="invalid-feedback">{errors.apellido_alumno.message}</div>}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="dni_alumno" className="form-label">DNI:</label>
                    <input
                      type="text"
                      className={`form-control ${errors.dni_alumno ? 'is-invalid' : ''}`}
                      id="dni_alumno"
                      {...register('dni_alumno')}
                    />
                    {errors.dni_alumno && <div className="invalid-feedback">{errors.dni_alumno.message}</div>}
                  </div>


                  {/* El botón de envío también activará la captura de geolocalización */}
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    Registrar Asistencia
                  </button>
                </form>
              )}

              {/* Muestra mensaje de envío si está enviando */}
              {isSubmitting && !successMessage && !error && (
                <div className="text-center mt-4">
                  <p>Obteniendo ubicación y registrando asistencia...</p>
                  {/* Puedes añadir un spinner aquí si usas alguno */}
                </div>
              )}

              {/* Muestra mensaje de éxito si successMessage está presente */}
              {successMessage && (
                <div className="text-center mt-4">
                  <p>{successMessage}</p>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;