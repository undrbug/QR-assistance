import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Importar rutas
import docentesRoutes from './routes/docentes.routes.js';
import authRoutes from './routes/auth.routes.js';
import claseRoutes from './routes/clase.routes.js';
import asistenciaRoutes from './routes/asistencia.routes.js';

// Importar configuración de la base de datos
import sequelize from './config/database.js';

// Configurar variables de entorno
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Inicializar express
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.static(join(__dirname, 'public')));


app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Probar conexión a la base de datos
try {
  await sequelize.authenticate();
  console.log('Conexión a la base de datos establecida correctamente.');
} catch (error) {
  console.error('No se pudo conectar a la base de datos:', error);
}

// Rutas de autenticación
app.use('/api/auth', authRoutes);
// Rutas
app.use('/api/docentes', docentesRoutes);
app.use('/api/clases', claseRoutes);
// app.use('/api/estudiantes', docentesRoutes); // Cambiar a estudiantes.routes.js cuando esté listo
app.use('/api/asistencias', asistenciaRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: 'API del sistema de asistencia con QR' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto http://localhost:${PORT}/`);
});