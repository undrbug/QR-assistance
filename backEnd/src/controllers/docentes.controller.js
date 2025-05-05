import argon2 from 'argon2';
import { Docente } from '../models/index.js';

// Obtener todos los docentes
export const getAllDocentes = async (req, res) => {
  try {
    const docentes = await Docente.findAll({
      attributes: { exclude: ['contrasena'] }
    });
    
    return res.status(200).json({
      message: 'Docentes obtenidos correctamente',
      data: docentes
    });
    
  } catch (error) {
    console.error('Error al obtener docentes:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Obtener docente por ID
export const getDocenteById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const docente = await Docente.findByPk(id, {
      attributes: { exclude: ['contrasena'] }
    });
    
    if (!docente) {
      return res.status(404).json({ message: 'Docente no encontrado' });
    }
    
    return res.status(200).json({
      message: 'Docente obtenido correctamente',
      data: docente
    });
    
  } catch (error) {
    console.error('Error al obtener docente:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// export const getAsistenciasByDocente = async (req, res) => {
  
// }

// Crear un nuevo docente
export const createDocente = async (req, res) => {
  try {
    const { usuario, contrasena, nombre, apellido, email } = req.body;
    
    // Validar datos de entrada
    if (!usuario || !contrasena || !nombre || !apellido || !email) {
      return res.status(400).json({ 
        message: 'Todos los campos son requeridos: usuario, contrasena, nombre, apellido, email' 
      });
    }
    
    // Verificar si el usuario ya existe
    const existingUser = await Docente.findOne({ where: { usuario } });
    if (existingUser) {
      return res.status(400).json({ message: 'El nombre de usuario ya está en uso' });
    }
    
    // Verificar si el email ya existe
    const existingEmail = await Docente.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ message: 'El correo electrónico ya está en uso' });
    }
    
    // Encriptar contraseña
    const hashedPassword = await argon2.hash(contrasena);
    
    // Crear nuevo docente
    const newDocente = await Docente.create({
      usuario,
      contrasena: hashedPassword,
      nombre,
      apellido,
      email
    });
    
    // Excluir contraseña de la respuesta
    const { contrasena: _, ...docenteData } = newDocente.toJSON();
    
    return res.status(201).json({
      message: 'Docente creado correctamente',
      data: docenteData
    });
    
  } catch (error) {
    console.error('Error al crear docente:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Actualizar docente
export const updateDocente = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, email, contrasena } = req.body;
    
    // Buscar docente
    const docente = await Docente.findByPk(id);
    
    if (!docente) {
      return res.status(404).json({ message: 'Docente no encontrado' });
    }
    
    // Actualizar datos
    if (nombre) docente.nombre = nombre;
    if (apellido) docente.apellido = apellido;
    if (email) docente.email = email;
    
    // Si se proporciona una nueva contraseña, encriptarla
    if (contrasena) {
      docente.contrasena = await argon2.hash(contrasena);
    }
    
    // Guardar cambios
    await docente.save();
    
    // Excluir contraseña de la respuesta
    const { contrasena: _, ...docenteData } = docente.toJSON();
    
    return res.status(200).json({
      message: 'Docente actualizado correctamente',
      data: docenteData
    });
    
  } catch (error) {
    console.error('Error al actualizar docente:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Eliminar docente (desactivar)
export const deleteDocente = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar docente
    const docente = await Docente.findByPk(id);
    
    if (!docente) {
      return res.status(404).json({ message: 'Docente no encontrado' });
    }
    
    // Desactivar en lugar de eliminar (soft delete)
    docente.estado = false;
    await docente.save();
    
    return res.status(200).json({
      message: 'Docente desactivado correctamente'
    });
    
  } catch (error) {
    console.error('Error al eliminar docente:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};