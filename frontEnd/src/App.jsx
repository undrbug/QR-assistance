import React from 'react';
import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';
import Login from './components/Login.jsx';
import Dashboard from './components/Dashboard.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import { AuthProvider } from './context/AuthContext';
import CreateClass from './components/CreateClass.jsx'; 
import AttendancePage from './pages/AttendancePage.jsx';
import AttendanceMonitorPage from './pages/AttendanceMonitorPage.jsx'; 

function App() {
  return (
    <AuthProvider> {/* Envuelve aquí */}
      <div className="App">
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/asistencias/:classId" element={<AttendancePage />} />
          {/* Rutas privadas */}
          <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
          <Route path="/classes/new" element={<PrivateRoute element={<CreateClass />} />} />
          <Route path="/asistencias" element={<PrivateRoute element={<AttendanceMonitorPage />} />} />
          {/* {Ruta para redireccionar} */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;