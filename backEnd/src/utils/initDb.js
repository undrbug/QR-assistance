import dotenv from 'dotenv';
import { syncDatabase } from '../models/index.js';
import Docente from '../models/Docente.js';
import argon2 from 'argon2';

dotenv.config();

// Función para crear docente admin
const createAdminDocente = async () => {
  try {
    const existingAdmin = await Docente.findOne({ where: { usuario: 'admin' } });
    
    if (!existingAdmin) {
      const hashedPassword = await argon2.hash('admin123');
      
      await Docente.create({
        usuario: 'admin',
        contrasena: hashedPassword,
        nombre: 'Administrador',
        apellido: 'Sistema',
        email: 'admin@example.com'
      });
      
      console.log('Usuario administrador creado exitosamente');
    } else {
      console.log('El usuario administrador ya existe');
    }
  } catch (error) {
    console.error('Error al crear usuario admin:', error);
  }
};

// Inicializar la base de datos
const init = async () => {
  try {
    // Sincronizar modelos con la base de datos (pasar true para forzar recreación)
    await syncDatabase(false);
    
    // Crear usuario admin
    await createAdminDocente();
    
    console.log('Base de datos inicializada correctamente');
    process.exit(0);
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    process.exit(1);
  }
};

// Ejecutar inicialización
init();