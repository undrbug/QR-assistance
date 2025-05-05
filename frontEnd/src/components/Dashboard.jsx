// src/components/Dashboard.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth(); // Obtiene el usuario y la función logout del contexto
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Llama a la función logout del contexto
    navigate('/login'); // Redirige al login después de cerrar sesión
  };

  if (!user) {
    // Esto no debería ocurrir si PrivateRoute funciona, pero es un buen fallback
    return <div>Cargando datos del usuario...</div>;
  }

  return (
    <div className="container mt-5">
      <h1>Bienvenido, {user.nombre} {user.apellido}!</h1>
      <p>Pronto tendremos nuevas funcionalidades...</p>
      
      {/* Aquí irán las funcionalidades del docente */}
      <div className="mt-4">
         <Link to="/classes/new" className="btn btn-primary me-2">Crear Nueva Clase y QR</Link>
         {/* Puedes añadir más botones o enlaces a otras funcionalidades aquí */}
         <Link to="/asistencias" className="btn btn-info">Ver Asistencias</Link>
      </div>

      <button className="btn btn-danger mt-3" onClick={handleLogout}>
        Cerrar Sesión
      </button>
    </div>
  );
};

export default Dashboard;