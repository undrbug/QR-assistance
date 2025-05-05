# 📋 Documento de Requisitos - Sistema de Registro de Asistencia por QR

## 🎯 Alcance del Proyecto

El proyecto consiste en desarrollar una aplicación web que permita a docentes generar códigos QR para registrar la asistencia de alumnos. La asistencia será validada mediante la geolocalización del alumno al momento del escaneo, garantizando que se encuentra dentro del área permitida del aula.

## 🧩 Funcionalidades Principales

### 👨‍🏫 Vista Docente
- Login con usuario y contraseña.
- Configurar aula (coordenadas GPS o ingreso manual).
- Generar código QR para la clase actual.
- Descargar código QR.
- Exportar a Excel los registros de asistencia.

### 👨‍🎓 Vista Alumno
- Escaneo de QR que redirige al alumno a la página con el formulario de asistencia.
- Formulario de registro: nombre, apellido, DNI, legajo.
- Registro de geolocalización al momento del envío del formulario.
- Validación de distancia máxima (50 metros del aula).
- Confirmación del registro exitoso o error.

## 🔐 Requisitos de Seguridad

- Encriptación de contraseñas (argon2).
- Validación de ubicación geográfica del alumno (máximo 50m).
- Validación del lado del servidor de todos los datos recibidos.
- Prevención de múltiples asistencias desde el mismo dispositivo/usuario.

## 🧠 Experiencia de Usuario (UX)

- Interfaces limpias y modernas.
- Indicaciones claras en cada paso.
- Formularios responsivos.
- Mensajes de error y confirmación amigables.

## 🚀 Escalabilidad

- Backend desacoplado utilizando Node.js y Express.
- Base de datos relacional escalable (MySQL o PostgreSQL).
- Posibilidad de extender a múltiples docentes y clases concurrentes.
- Organización modular del frontend (React).

## 🧰 Tecnologías y Librerías

### Backend
- Node.js
- Express
- Sequelize (ORM)
- argon2
- jsonwebtoken
- dotenv
- `xlsx` (para exportación a Excel)
- `qrcode` (para generar QR)

### Frontend
- React
- Bootstrap o Tailwind CSS
- fetch
- Geolocation API
- react-router-dom
- react-qrcode

## 📌 Restricciones Técnicas

- El sistema debe ejecutarse correctamente en dispositivos móviles (alumnos).
- El QR debe contener un identificador único y no predecible de la clase.
- No se requiere autenticación para los alumnos.
