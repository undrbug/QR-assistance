import Docente from './Docente.js';
import Clase from './Clase.js';
import Asistencia from './Asistencia.js';

// Exportar los modelos
export {
  Docente,
  Clase,
  Asistencia
};

// Función para sincronizar la base de datos
export const syncDatabase = async (force = false) => {
  try {
    await Docente.sync({ alter: force });
    await Clase.sync({ alter: force });
    await Asistencia.sync({ alter: force });
    console.log('Base de datos sincronizada correctamente');
  } catch (error) {
    console.error('Error al sincronizar la base de datos:', error);
  }
};

