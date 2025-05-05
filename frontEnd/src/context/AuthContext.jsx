import React, { createContext, useState, useEffect, useContext } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!token); // Inicializa basado en localStorage
  const [loading, setLoading] = useState(true); // Para el chequeo inicial del token

  // Efecto para verificar el token al cargar la app
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          // Llama al endpoint /auth/check para validar el token en el backend
          // const response = await fetch(`${API_BASE_URL}/auth/check`, { 
          const response = await fetch(`${API_BASE_URL}/auth/check`, { 
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${storedToken}`,
            },
          });

          if (response.ok) {
            const result = await response.json();
            setUser(result.docente);
            setToken(storedToken);
            setIsAuthenticated(true);
            console.log("Sesión válida:", result.docente.usuario);
          } else {
            // Token inválido o expirado, limpiar almacenamiento
            console.warn("Token inválido o expirado. Limpiando sesión.");
            logout(); // Llama a la función de logout para limpiar
          }
        } catch (error) {
          console.error("Error al verificar el token:", error);
          logout(); // Error de red o servidor, tratar como no autenticado
        } finally {
          setLoading(false); // Finaliza el estado de carga
        }
      } else {
        setLoading(false); // No hay token, no hay carga
      }
    };

    checkAuth();
  }, []); // Se ejecuta solo una vez al montar

  const login = async (newToken, newUser) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    // Opcional: Redirigir al login después de logout
    // const navigate = useNavigate(); // No se puede usar aquí directamente, manejar en componente
    window.location.href = '/login'; // Redirección forzada si es necesario, mejor usar navigate en componente
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto fácilmente
export const useAuth = () => {

  return useContext(AuthContext);
};