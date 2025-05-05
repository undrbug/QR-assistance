import express from 'express';
import { login, checkAuth } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Ruta para iniciar sesión
router.post('/login', login);

// Ruta para verificar autenticación
router.get('/check', verifyToken, checkAuth);

export default router;