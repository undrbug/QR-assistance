import express from 'express';
import { 
  getAllDocentes, 
  getDocenteById, 
  createDocente, 
  updateDocente, 
  deleteDocente, 
  // getAsistenciasByDocente 
} from '../controllers/docentes.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Rutas protegidas con autenticación
router.get('/', getAllDocentes);
router.get('/:id', verifyToken, getDocenteById);
//Tengo dudas si van en clases o en docentes
// router.get('/mis-asistencias', verifyToken, getAsistenciasByDocente);
router.post('/', verifyToken, createDocente);
// router.put('/:id', verifyToken, updateDocente);
// router.delete('/:id', verifyToken, deleteDocente);

export default router;