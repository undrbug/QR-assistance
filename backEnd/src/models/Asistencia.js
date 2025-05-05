import { DataTypes } from 'sequelize';
import secuelize from '../config/database.js';
import Clase from './Clase.js';

const Asistencia = secuelize.define('Asistencia', {
  id_asistencia: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_clase: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Clase,
      key: 'id_clase'
    }
  },
  legajo_alumno: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  nombre_alumno: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  apellido_alumno: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  dni_alumno: {
    type: DataTypes.STRING(15),
    allowNull: false
  },
  fecha_hora_asistencia: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  ubicacion_alumno_latitud: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false
  },
  ubicacion_alumno_longitud: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false
  },
  distancia_al_aula: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Distancia en metros'
  },
  validacion_ubicacion: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
}, {
  tableName: 'asistencias',
  timestamps: true
});

// Establecer relación con Clase
Asistencia.belongsTo(Clase, { foreignKey: 'id_clase' });
Clase.hasMany(Asistencia, { foreignKey: 'id_clase' });

export default Asistencia;