import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Importa el hook de autenticación

const PrivateRoute = ({ element }) => {
  const { isAuthenticated, loading } = useAuth(); // Usa el hook para acceder al estado

  if (loading) {
    // Opcional: Muestra un spinner o mensaje de carga mientras se verifica el token
    return <div>Cargando...</div>;
  }

  // Si está autenticado, renderiza el elemento (la página protegida)
  // Si no, redirige a la página de login
  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

export default PrivateRoute;