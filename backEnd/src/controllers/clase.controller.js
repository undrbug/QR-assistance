import {Clase, Docente} from '../models/index.js';

export const crearClase = async (req, res) => {
  try {
    const { 
      titulo, 
      descripcion, 
      ubicacion_latitud, 
      ubicacion_longitud 
    } = req.body;
    
    // Get the docente ID from the authenticated token
    const id_docente = req.docente.id;

    // Validate input
    if (!titulo || !ubicacion_latitud || !ubicacion_longitud) {
      return res.status(400).json({ 
        message: 'El título y la ubicación son obligatorios' 
      });
    }

    // Create new class
    const nuevaClase = await Clase.create({
      id_docente,
      titulo,
      descripcion,
      ubicacion_latitud,
      ubicacion_longitud,
      fecha_creacion: new Date()
    });

    res.status(201).json({
      message: 'Clase creada correctamente',
      clase: nuevaClase
    });
  } catch (error) {
    console.error('Error al crear clase:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

//No se usa actualmente
export const getClasesPorDocente = async (req, res) => {
  try {
    const id_docente = req.docente.id;

    const clases = await Clase.findAll({
      where: { 
        id_docente,
        estado: true 
      },
      order: [['fecha_creacion', 'DESC']]
    });

    res.json({
      message: 'Clases obtenidas correctamente',
      clases: clases
    });
  } catch (error) {
    console.error('Error al obtener clases:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const getClasePorId = async (req, res) => {
  try {
    const { id } = req.params;
    const id_docente = req.docenteId;

    const clase = await Clase.findOne({
      where: { 
        id_clase: id,
        id_docente, // Ensure the class belongs to the authenticated teacher
        estado: true
      }
    });

    if (!clase) {
      return res.status(404).json({ message: 'Clase no encontrada' });
    }

    res.json({
      message: 'Clase obtenida correctamente',
      data: clase
    });
  } catch (error) {
    console.error('Error al obtener clase:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const crearClase2 = async (req, res) => {
  const { titulo, descripcion, ubicacion_latitud, ubicacion_longitud } = req.body;
  const docenteId = req.user.id; // Asume que tu middleware adjunta el ID del docente autenticado a req.user

  // Validación básica de entrada
  if (!titulo || ubicacion_latitud === undefined || ubicacion_longitud === undefined) {
    return res.status(400).json({ message: 'Título y ubicación son obligatorios' });
  }

  try {
    // Crea la nueva clase en la base de datos
    const nuevaClase = await Clase.create({
      id_docente: docenteId,
      titulo: titulo,
      descripcion: descripcion,
      ubicacion_latitud: ubicacion_latitud,
      ubicacion_longitud: ubicacion_longitud,
      fecha_creacion: new Date(), // O usa el default de la DB si está configurado
      estado: true // Por defecto activa
    });

    // Responde con los datos de la clase creada
    res.status(201).json({
      message: 'Clase creada exitosamente',
      clase: nuevaClase
    });

  } catch (error) {
    console.error('Error al crear la clase:', error);
    res.status(500).json({ message: 'Error interno del servidor al crear la clase' });
  }
}