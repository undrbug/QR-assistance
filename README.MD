# 🧾 Sistema de Registro de Asistencia con Código QR

## 🔍 Descripción

Este sistema permite a docentes generar códigos QR para registrar la asistencia de sus alumnos de forma geolocalizada. Está desarrollado en Node.js (backend) y React (frontend), y utiliza una base de datos relacional para el almacenamiento.

## 📦 Estructura del Proyecto

FALTA LA ESTRUCTURA DEL PROYECTO


## 🚀 Instalación y Ejecución

### Backend
```bash
cd backend
npm install
npm run dev
### Frontend
```bash
cd frontend
npm install
npm run start

📋 Funcionalidades

Login docente

Generación de clases y códigos QR

Registro de asistencia por escaneo

Validación por geolocalización

Exportación a Excel

👥 Roles

Docente (autenticado)

Alumno (no autenticado)

# Documentación API - Sistema de Asistencia QR

## Base URL
`http://localhost:5000/api`

## Autenticación
La API utiliza autenticación basada en JWT (JSON Web Tokens). Para acceder a los endpoints protegidos, se debe incluir el token en la cabecera de autorización:

```
Authorization: Bearer <token>
```

## Endpoints

### Autenticación

#### Iniciar sesión
- **URL**: `/auth/login`
- **Método**: `POST`
- **Autenticación**: No requerida
- **Parámetros de cuerpo**:
  ```json
  {
    "usuario": "string",
    "contrasena": "string"
  }
  ```
- **Respuesta exitosa**:
  ```json
  {
    "message": "Inicio de sesión exitoso",
    "docente": {
      "id": "number",
      "usuario": "string",
      "nombre": "string",
      "apellido": "string",
      "email": "string"
    },
    "token": "string"
  }
  ```
- **Códigos de respuesta**:
  - `200 OK`: Inicio de sesión exitoso
  - `400 Bad Request`: Datos de entrada inválidos
  - `401 Unauthorized`: Credenciales inválidas

#### Verificar autenticación
- **URL**: `/auth/check`
- **Método**: `GET`
- **Autenticación**: Requerida
- **Respuesta exitosa**:
  ```json
  {
    "message": "Sesión válida",
    "docente": {
      "id": "number",
      "usuario": "string",
      "nombre": "string",
      "apellido": "string",
      "email": "string"
    }
  }
  ```
- **Códigos de respuesta**:
  - `200 OK`: Sesión válida
  - `401 Unauthorized`: Token inválido o expirado
  - `404 Not Found`: Docente no encontrado

### Docentes

#### Obtener todos los docentes
- **URL**: `/docentes`
- **Método**: `GET`
- **Autenticación**: Requerida
- **Respuesta exitosa**:
  ```json
  {
    "message": "Docentes obtenidos correctamente",
    "data": [
      {
        "id_docente": "number",
        "usuario": "string",
        "nombre": "string",
        "apellido": "string",
        "email": "string",
        "estado": "boolean",
        "createdAt": "date",
        "updatedAt": "date"
      }
    ]
  }
  ```
- **Códigos de respuesta**:
  - `200 OK`: Respuesta exitosa
  - `401 Unauthorized`: No autenticado
  - `500 Internal Server Error`: Error en el servidor

#### Obtener docente por ID
- **URL**: `/docentes/:id`
- **Método**: `GET`
- **Autenticación**: Requerida
- **Parámetros de ruta**:
  - `id`: ID del docente
- **Respuesta exitosa**:
  ```json
  {
    "message": "Docente obtenido correctamente",
    "data": {
      "id_docente": "number",
      "usuario": "string",
      "nombre": "string",
      "apellido": "string",
      "email": "string",
      "estado": "boolean",
      "createdAt": "date",
      "updatedAt": "date"
    }
  }
  ```
- **Códigos de respuesta**:
  - `200 OK`: Respuesta exitosa
  - `401 Unauthorized`: No autenticado
  - `404 Not Found`: Docente no encontrado
  - `500 Internal Server Error`: Error en el servidor

#### Crear docente
- **URL**: `/docentes`
- **Método**: `POST`
- **Autenticación**: Requerida
- **Parámetros de cuerpo**:
  ```json
  {
    "usuario": "string",
    "contrasena": "string",
    "nombre": "string",
    "apellido": "string",
    "email": "string"
  }
  ```
- **Respuesta exitosa**:
  ```json
  {
    "message": "Docente creado correctamente",
    "data": {
      "id_docente": "number",
      "usuario": "string",
      "nombre": "string",
      "apellido": "string",
      "email": "string",
      "estado": "boolean",
      "createdAt": "date",
      "updatedAt": "date"
    }
  }
  ```
- **Códigos de respuesta**:
  - `201 Created`: Docente creado
  - `400 Bad Request`: Datos inválidos o usuario/email ya existe
  - `401 Unauthorized`: No autenticado
  - `500 Internal Server Error`: Error en el servidor

#### Actualizar docente
- **URL**: `/docentes/:id`
- **Método**: `PUT`
- **Autenticación**: Requerida
- **Parámetros de ruta**:
  - `id`: ID del docente
- **Parámetros de cuerpo** (todos opcionales):
  ```json
  {
    "nombre": "string",
    "apellido": "string",
    "email": "string",
    "contrasena": "string"
  }
  ```
- **Respuesta exitosa**:
  ```json
  {
    "message": "Docente actualizado correctamente",
    "data": {
      "id_docente": "number",
      "usuario": "string",
      "nombre": "string",
      "apellido": "string",
      "email": "string",
      "estado": "boolean",
      "createdAt": "date",
      "updatedAt": "date"
    }
  }
  ```
- **Códigos de respuesta**:
  - `200 OK`: Docente actualizado
  - `401 Unauthorized`: No autenticado
  - `404 Not Found`: Docente no encontrado
  - `500 Internal Server Error`: Error en el servidor

#### Eliminar docente (soft delete)
- **URL**: `/docentes/:id`
- **Método**: `DELETE`
- **Autenticación**: Requerida
- **Parámetros de ruta**:
  - `id`: ID del docente
- **Respuesta exitosa**:
  ```json
  {
    "message": "Docente desactivado correctamente"
  }
  ```
- **Códigos de respuesta**:
  - `200 OK`: Docente desactivado
  - `401 Unauthorized`: No autenticado
  - `404 Not Found`: Docente no encontrado
  - `500 Internal Server Error`: Error en el servidor

## Modelos de datos

### Docente
```json
{
  "id_docente": "number (clave primaria, autoincremental)",
  "usuario": "string (único)",
  "contrasena": "string (encriptada con argon2)",
  "nombre": "string",
  "apellido": "string",
  "email": "string (único)",
  "estado": "boolean (default: true)",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Clase
```json
{
  "id_clase": "number (clave primaria, autoincremental)",
  "id_docente": "number (clave foránea → Docente.id_docente)",
  "ubicacion_latitud": "decimal(10,8)",
  "ubicacion_longitud": "decimal(11,8)",
  "fecha_creacion": "date",
  "titulo": "string",
  "descripcion": "text",
  "estado": "boolean (default: true)",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Asistencia
```json
{
  "id_asistencia": "number (clave primaria, autoincremental)",
  "id_clase": "number (clave foránea → Clase.id_clase)",
  "legajo_alumno": "string",
  "nombre_alumno": "string",
  "apellido_alumno": "string",
  "dni_alumno": "string",
  "fecha_hora_asistencia": "date",
  "ubicacion_alumno_latitud": "decimal(10,8)",
  "ubicacion_alumno_longitud": "decimal(11,8)",
  "distancia_al_aula": "decimal(10,2)",
  "createdAt": "date",
  "updatedAt": "date"
}
```

## Notas sobre validación de datos

- Los campos requeridos se validan en el servidor
- Las contraseñas se encriptan con argon2 antes de almacenarse
- Los campos de email se validan con un formato correcto
- Se verifica la unicidad de usuario y email antes de crear un docente