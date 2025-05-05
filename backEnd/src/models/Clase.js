import { DataTypes } from 'sequelize';
import secualize from '../config/database.js';
import Docente from './Docente.js';

const Clase = secualize.define('Clase', {
  id_clase: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_docente: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Docente,
      key: 'id_docente'
    }
  },
  ubicacion_latitud: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false
  },
  ubicacion_longitud: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  titulo: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  estado: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'clases',
  timestamps: true
});

// Establecer relación con Docente
Clase.belongsTo(Docente, { foreignKey: 'id_docente' });
Docente.hasMany(Clase, { foreignKey: 'id_docente' });

export default Clase;