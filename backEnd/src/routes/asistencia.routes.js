import express from 'express';
import {
  registrarAsistencia,
} from '../controllers/asistencia.controller.js';

// import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// router.use(verifyToken); 

router.post('/', registrarAsistencia);

export default router;