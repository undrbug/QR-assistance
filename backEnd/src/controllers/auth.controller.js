import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { Docente } from '../models/index.js';

// Generar token JWT
const generateToken = (docente) => {
  return jwt.sign(
    { 
      id: docente.id_docente,
      usuario: docente.usuario
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// Iniciar sesión
export const login = async (req, res) => {
  try {
    const { usuario, contrasena } = req.body;
    
    // Validar datos de entrada
    if (!usuario || !contrasena) {
      return res.status(400).json({ message: 'Usuario y contraseña son requeridos' });
    }
    
    // Buscar docente por usuario
    const docente = await Docente.findOne({ where: { usuario } });
    
    // Verificar si el docente existe
    if (!docente) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    // Verificar la contraseña
    const validPassword = await argon2.verify(docente.contrasena, contrasena);
    
    if (!validPassword) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    
    // Generar token JWT
    const token = generateToken(docente);
    
    // Responder con datos del docente y token
    return res.status(200).json({
      message: 'Inicio de sesión exitoso',
      docente: {
        id: docente.id_docente,
        usuario: docente.usuario,
        nombre: docente.nombre,
        apellido: docente.apellido,
        email: docente.email
      },
      token
    });
    
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Verificar sesión actual
export const checkAuth = async (req, res) => {
  try {
    const docente = await Docente.findByPk(req.docente.id, {
      attributes: { exclude: ['contrasena'] }
    });
    
    if (!docente) {
      return res.status(404).json({ message: 'Docente no encontrado' });
    }
    
    return res.status(200).json({
      message: 'Sesión válida',
      docente: {
        id: docente.id_docente,
        usuario: docente.usuario,
        nombre: docente.nombre,
        apellido: docente.apellido,
        email: docente.email
      }
    });
    
  } catch (error) {
    console.error('Error en checkAuth:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};