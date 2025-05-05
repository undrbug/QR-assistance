import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// validación con Yup 
const loginSchema = yup.object().shape({
  usuario: yup.string().required('El usuario es obligatorio'),
  contrasena: yup.string().required('La contraseña es obligatoria'),
});

const Login = () => {
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login, isAuthenticated, loading } = useAuth(); // Usa el hook de autenticación

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(loginSchema),
  });

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);


  if (loading) {
    return <div>Verificando sesión...</div>;
  }

  const onSubmit = async (data) => {
    setError(null); // Limpiar errores anteriores
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || 'Error al iniciar sesión');
        console.error('Login failed:', result);
        return;
      }

      console.log('Login successful:', result);
      await login(result.token, result.docente);

    } catch (err) {
      console.error('Network error or unexpected issue:', err);
      setError('Error de conexión o del servidor.');
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">Iniciar Sesión Docente</div>
            <div className="card-body">
              <form onSubmit={handleSubmit(onSubmit)}>
                {error && <div className="alert alert-danger">{error}</div>}

                <div className="mb-3">
                  <label htmlFor="usuario" className="form-label">Usuario:</label>
                  <input
                    type="text"
                    className={`form-control ${errors.usuario ? 'is-invalid' : ''}`}
                    id="usuario"
                    {...register('usuario')}
                  />
                  {errors.usuario && <div className="invalid-feedback">{errors.usuario.message}</div>}
                </div>

                <div className="mb-3">
                  <label htmlFor="contrasena" className="form-label">Contraseña:</label>
                  <input
                    type="password"
                    className={`form-control ${errors.contrasena ? 'is-invalid' : ''}`}
                    id="contrasena"
                    {...register('contrasena')}
                  />
                  {errors.contrasena && <div className="invalid-feedback">{errors.contrasena.message}</div>}
                </div>

                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Iniciando...' : 'Entrar'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;