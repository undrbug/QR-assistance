import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // Para obtener el token
// Asegúrate de que la ruta a tu API base esté correcta
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AttendanceMonitorPage = () => {
  const [asistencias, setAsistencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth(); // Obtenemos el token del contexto

  // Estado para filtros (ej: por clase)
  const [filterClassId, setFilterClassId] = useState('');
  // Necesitarás obtener la lista de clases del docente para el dropdown de filtro
  const [docenteClasses, setDocenteClasses] = useState([]);
  const [isExporting, setIsExporting] = useState(false);


  // *** Efecto para cargar las asistencias al montar el componente o cambiar filtros ***
  useEffect(() => {
    const fetchAsistencias = async () => {
      setLoading(true);
      setError(null);

      try {
        let url = `${API_BASE_URL}/clases/mis-asistencias`;
        const queryParams = new URLSearchParams();
        if (filterClassId) {
          queryParams.append('claseId', filterClassId);
        }
        // Si implementas filtro por fecha:
        // if (filterDate) { queryParams.append('fecha', filterDate); }

        if (queryParams.toString()) {
          url += `?${queryParams.toString()}`;
        }

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        const result = await response.json();

        if (!response.ok) {
          setError(result.message || 'Error al cargar las asistencias.');
          setAsistencias([]); // Limpia las asistencias si hay error
        } else {
          setAsistencias(result.asistencias);
        }

      } catch (err) {
        console.error('Error fetching asistencias:', err);
        setError('Error de conexión al cargar las asistencias.');
        setAsistencias([]);
      } finally {
        setLoading(false);
      }
    };

    // *** Efecto secundario para cargar la lista de clases del docente para el filtro ***
    const fetchDocenteClasses = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/clases/mis-clases`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const result = await response.json();
        if (response.ok) {
          setDocenteClasses(result.clases);
        } else {
          console.error('Error fetching docente classes:', result.message);
        }
      } catch (err) {
        console.error('Network error fetching docente classes:', err);
      }
    };

    if (token) { // Solo carga si hay token (el PrivateRoute ya lo maneja, pero es buena práctica)
      fetchDocenteClasses(); // Carga la lista de clases para el filtro
      fetchAsistencias(); // Carga las asistencias en la tabla
    }

  }, [token, filterClassId]);

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);

    try {
      let url = `${API_BASE_URL}/clases/mis-asistencias/export`;
      const queryParams = new URLSearchParams();
      if (filterClassId) {
        queryParams.append('claseId', filterClassId);
      }
      
      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        try {
          const errorResult = await response.json();
          setError(errorResult.message || 'Error al exportar a Excel.');
        } catch (jsonError) {
          setError(`Error al exportar a Excel: ${response.statusText || 'Error desconocido'}`);
        }
        console.error('Export failed:', response.status, response.statusText);
        return;
      }

      // La respuesta es el archivo, obténlo como Blob
      const blob = await response.blob();

      // Crea una URL temporal para el Blob
      const urlBlob = window.URL.createObjectURL(blob);

      // Crea un enlace oculto para descargar el archivo
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = urlBlob;
      // Usa el nombre de archivo especificado en el header Content-Disposition del backend,
      // o define uno por defecto si no lo obtienes fácilmente.
      // Intentar obtener el nombre del header Content-Disposition es más robusto:
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'asistencias.xlsx'; // Nombre por defecto
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?$/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
      a.download = filename;

      // Añade el enlace al DOM, simula un clic y elimínalo
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(urlBlob); // Limpia la URL temporal
      a.remove(); // Elimina el enlace

    } catch (err) {
      console.error('Error during export process:', err);
      setError('Error de conexión o durante la descarga del archivo.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="container mt-5">
      <h1>Asistencias a tus clases</h1>

      {/* Controles de filtro */}
      <div className="mb-3 d-flex align-items-end"> {/* Usa flexbox para alinear */}
        <div className="me-2 flex-grow-1">
          <label htmlFor="classFilter" className="form-label">Filtrar por Clase:</label>
          <select
            id="classFilter"
            className="form-select"
            value={filterClassId}
            onChange={(e) => setFilterClassId(e.target.value)}
            disabled={loading}
          >
            <option value="">Todas las Clases</option>
            {docenteClasses.map(clase => (
              <option key={clase.id_clase} value={clase.id_clase}>{clase.titulo}</option>
            ))}
          </select>
        </div>

        <button
          className="btn btn-success"
          onClick={handleExport}
          disabled={loading || isExporting || asistencias.length === 0}
        >
          {isExporting ? 'Exportando...' : 'Exportar a Excel'}
        </button>
      </div>


      {loading && <div className="alert alert-info">Cargando asistencias...</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {!loading && !error && asistencias.length === 0 && (
        <div className="alert alert-warning">No hay registros de asistencia encontrados para los filtros seleccionados.</div>
      )}

      {!loading && !error && asistencias.length > 0 && (
        <div className="table-responsive">
          <table className="table table-striped table-bordered">
            <thead>
              <tr>
                <th>Clase</th> 
                <th>Legajo</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>DNI</th>
                <th>Fecha/Hora</th>
                <th>Distancia al Aula (m)</th>
              </tr>
            </thead>
            <tbody>
              {asistencias.map(asistencia => (
                <tr key={asistencia.id_asistencia}>
                  <td>{asistencia.Clase ? asistencia.Clase.titulo : 'N/A'}</td>
                  <td>{asistencia.legajo_alumno}</td>
                  <td>{asistencia.nombre_alumno}</td>
                  <td>{asistencia.apellido_alumno}</td>
                  <td>{asistencia.dni_alumno}</td>
                  <td>{new Date(asistencia.fecha_hora_asistencia).toLocaleString()}</td>
                  <td>{asistencia.distancia_al_aula ? asistencia.distancia_al_aula : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Puedes añadir el botón de Cerrar Sesión aquí o mantenerlo en el Dashboard */}
      {/* <button className="btn btn-danger mt-3" onClick={handleLogout}>Cerrar Sesión</button> */}
    </div>
  );
};

export default AttendanceMonitorPage;