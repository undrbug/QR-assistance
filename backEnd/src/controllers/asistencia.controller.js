import { Asistencia, Clase, Docente } from '../models/index.js';
import { getDistance } from 'geolib';
import { Op } from 'sequelize';
import ExcelJS from 'exceljs';

export const registrarAsistencia = async (req, res) => {
  try {
    const { classId } = req.body; // ID de la clase 
    const { legajo_alumno, nombre_alumno, apellido_alumno, dni_alumno, ubicacion_alumno_latitud, ubicacion_alumno_longitud } = req.body;

    // 1. Validación de entrada
    if (!classId ||
      !legajo_alumno ||
      !nombre_alumno ||
      !apellido_alumno ||
      !dni_alumno ||
      !ubicacion_alumno_latitud ||
      !ubicacion_alumno_longitud) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
    }

    // 2. Obtener datos de la clase
    const clase = await Clase.findByPk(classId);

    if (!clase) {
      return res.status(404).json({ message: 'Clase no encontrada.' });
    }

    // 3. Calcular distancia al aula
    const distanciaMetros = getDistance(
      { latitude: ubicacion_alumno_latitud, longitude: ubicacion_alumno_longitud },
      { latitude: clase.ubicacion_latitud, longitude: clase.ubicacion_longitud }
    );

    // 4. Definir el umbral de distancia permitido (puedes hacerlo configurable)
    const UMBRAL_DISTANCIA_METROS = process.env.DISTANCIA_METROS || 50; // 50 metros por defecto

    // 5. Validar distancia (simplificado)
    const estaDentroDelRadio = distanciaMetros <= UMBRAL_DISTANCIA_METROS;

    if (!estaDentroDelRadio) {
      return res.status(400).json({
        message: `Estás demasiado lejos del aula para registrar asistencia. Distancia: ${distanciaMetros.toFixed(2)} metros.`
      });
    }

    // 6. Crear registro de asistencia
    const nuevaAsistencia = await Asistencia.create({
      id_clase: classId,
      legajo_alumno,
      nombre_alumno,
      apellido_alumno,
      dni_alumno,
      ubicacion_alumno_latitud,
      ubicacion_alumno_longitud,
      distancia_al_aula: distanciaMetros, // Almacenar la distancia para análisis posterior
      fecha_hora_asistencia: new Date(),
      validacion_ubicacion: estaDentroDelRadio // Marcar si pasó la validación 
    });

    // 7. Responder con éxito
    res.status(201).json({
      message: 'Asistencia registrada correctamente.',
      asistencia: nuevaAsistencia
    });

  } catch (error) {
    console.error('Error al registrar asistencia:', error);
    res.status(500).json({ message: 'Error interno del servidor al registrar asistencia.' });
  }
};

export const getAsistenciasPorDocente = async (req, res) => {
  try {
    // El ID del docente autenticado viene del token, adjuntado por el middleware verifyToken
    const docenteId = req.docente.id; // Ajusta 'id' si el nombre de la propiedad en tu payload es diferente

    // Obtén los query parameters para filtrado (ej: ?claseId=X&fecha=Y)
    const { claseId, fecha } = req.query;

    // Construye las condiciones de la consulta
    const whereConditions = {};

    // 1. Filtrar por clases del docente actual
    // Primero, encuentra todos los IDs de clase que pertenecen a este docente
    const clasesDelDocente = await Clase.findAll({
      where: { id_docente: docenteId },
      attributes: ['id_clase'] // Solo necesitamos los IDs
    });

    const idsClasesDelDocente = clasesDelDocente.map(clase => clase.id_clase);

    if (idsClasesDelDocente.length === 0) {
      // Si el docente no tiene clases, no hay asistencias que mostrar
      return res.status(200).json({
        message: 'El docente no tiene clases registradas.',
        asistencias: [] // Devuelve un array vacío
      });
    }

    // Añade la condición para incluir solo asistencias de las clases de este docente
    whereConditions.id_clase = {
      [Op.in]: idsClasesDelDocente // Usa el operador IN de Sequelize
    };


    // 2. Aplicar filtros opcionales desde query params
    if (claseId) {
      // Asegúrate de que la claseId proporcionada en el filtro realmente pertenezca al docente
      if (!idsClasesDelDocente.includes(parseInt(claseId, 10))) {
        return res.status(403).json({ message: 'No tienes permiso para ver asistencias de esta clase.' });
      }
      whereConditions.id_clase = parseInt(claseId, 10); // Filtra por un ID de clase específico
    }

    if (fecha) {

      // Un filtro por fecha exacta podría ser:
      // const startOfDay = new Date(fecha);
      // startOfDay.setHours(0, 0, 0, 0);
      // const endOfDay = new Date(fecha);
      // endOfDay.setHours(23, 59, 59, 999);
      // whereConditions.fecha_hora_asistencia = {
      //   [Op.between]: [startOfDay, endOfDay]
      // };
      console.warn('Filtro por fecha no implementado completamente en el backend.');
    }

    // 3. Consultar la base de datos para obtener las asistencias
    const asistencias = await Asistencia.findAll({
      where: whereConditions,
      // Opcional: Incluir datos de la Clase a la que pertenece cada asistencia
      include: [{
        model: Clase, // Asegúrate de que la asociación Asistencia -> Clase esté configurada en Sequelize
        attributes: ['titulo'] // Solo trae el título de la clase
      }],
      // Opcional: Ordenar los resultados
      order: [['fecha_hora_asistencia', 'DESC']]
    });

    // 4. Responder con los datos de asistencia
    res.status(200).json({
      message: 'Asistencias obtenidas correctamente',
      asistencias: asistencias
    });

  } catch (error) {
    console.error('Error al obtener asistencias por docente:', error);
    res.status(500).json({ message: 'Error interno del servidor al obtener asistencias.' });
  }

};

export const exportAsistenciasAExcel = async (req, res) => {
  console.log("Exportando asistencias a Excel...");
  try {
    const docenteId = req.docente.id; 
    const { claseId } = req.query;

    // *** Lógica para obtener las asistencias (reutiliza o adapta de getAsistenciasPorDocente) ***
    // Debes obtener los mismos datos, aplicando los mismos filtros.
    // Puedes refactorizar la lógica de consulta de getAsistenciasPorDocente en una función separada
    // que retorne solo los datos, y llamarla tanto desde getAsistenciasPorDocente como desde aquí.

    // Ejemplo de consulta similar a getAsistenciasPorDocente:
    const clasesDelDocente = await Clase.findAll({
      where: { id_docente: docenteId },
      attributes: ['id_clase']
    });
    const idsClasesDelDocente = clasesDelDocente.map(clase => clase.id_clase);

     if (idsClasesDelDocente.length === 0) {
        return res.status(404).json({ message: 'El docente no tiene clases registradas.' });
     }

    const whereConditions = {
         id_clase: { [Op.in]: idsClasesDelDocente }
    };

    if (claseId) {
         if (!idsClasesDelDocente.includes(parseInt(claseId, 10))) {
            return res.status(403).json({ message: 'No tienes permiso para exportar asistencias de esta clase.' });
        }
       whereConditions.id_clase = parseInt(claseId, 10);
    }

     // TODO: Implementar filtro por fecha si es necesario

    const asistencias = await Asistencia.findAll({
      where: whereConditions,
      include: [{
        model: Clase,
        attributes: ['titulo']
      }],
      order: [['fecha_hora_asistencia', 'DESC']]
    });
    // *** Fin lógica para obtener asistencias ***


    // *** Generar el archivo Excel con ExcelJS ***
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Asistencias');

    // Definir las columnas
    worksheet.columns = [
      { header: 'Clase', key: 'claseTitulo', width: 30 },
      { header: 'Legajo', key: 'legajo_alumno', width: 15 },
      { header: 'Nombre', key: 'nombre_alumno', width: 20 },
      { header: 'Apellido', key: 'apellido_alumno', width: 20 },
      { header: 'DNI', key: 'dni_alumno', width: 15 },
      { header: 'Fecha/Hora Asistencia', key: 'fecha_hora_asistencia', width: 25 },
      { header: 'Latitud Alumno', key: 'ubicacion_alumno_latitud', width: 20 },
      { header: 'Longitud Alumno', key: 'ubicacion_alumno_longitud', width: 20 },
      { header: 'Distancia al Aula (m)', key: 'distancia_al_aula', width: 20 },
      { header: 'Validación Ubicación', key: 'validacion_ubicacion', width: 20 }
    ];

    // Añadir filas con los datos de asistencia
    asistencias.forEach(asistencia => {
      worksheet.addRow({
        claseTitulo: asistencia.Clase ? asistencia.Clase.titulo : 'N/A',
        legajo_alumno: asistencia.legajo_alumno,
        nombre_alumno: asistencia.nombre_alumno,
        apellido_alumno: asistencia.apellido_alumno,
        dni_alumno: asistencia.dni_alumno,
        fecha_hora_asistencia: new Date(asistencia.fecha_hora_asistencia).toLocaleString(), // Formatear fecha
        ubicacion_alumno_latitud: asistencia.ubicacion_alumno_latitud,
        ubicacion_alumno_longitud: asistencia.ubicacion_alumno_longitud,
        distancia_al_aula: asistencia.distancia_al_aula ? asistencia.distancia_al_aula : 'N/A',
        validacion_ubicacion: asistencia.validacion_ubicacion ? 'Sí' : 'No'
      });
    });

    // Configurar las cabeceras de la respuesta para la descarga
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=' + 'asistencias.xlsx');

    // Escribir el workbook en el stream de respuesta
    await workbook.xlsx.write(res);

    // Finalizar la respuesta
    res.end();

  } catch (error) {
    console.error('Error al exportar asistencias a Excel:', error);
    res.status(500).json({ message: 'Error interno del servidor al exportar asistencias.' });
  }
}