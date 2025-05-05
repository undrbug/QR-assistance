import express from 'express';
import {crearClase, getClasesPorDocente, getClasePorId } from '../controllers/clase.controller.js';
import verifyToken from '../middleware/auth.middleware.js';
import { getAsistenciasPorDocente, exportAsistenciasAExcel } from '../controllers/asistencia.controller.js';

const router = express.Router();

// Aplicamos el middleware de verificación de token a todas las rutas de esta clase
router.use(verifyToken);

// creamos una nueva clase
// router.post('/', crearClase);
router.post('/', crearClase);

// Obtenemos todas las clases para el docente autenticado
router.get('/mis-asistencias', getAsistenciasPorDocente);
router.get('/mis-asistencias/export', exportAsistenciasAExcel)
router.get('/mis-clases', getClasesPorDocente);

// Obtenemos una clase específica por ID
router.get('/:id', getClasePorId);

export default router;