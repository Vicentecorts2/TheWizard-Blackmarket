import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/auth';

export default function RutaProtegida({ children, soloAdmin = false }) {
  const { usuario, cargando } = useAuth();
  const location = useLocation();

  if (cargando) {
    return <main className="contenedor"><p className="cargando">Verificando tu identidad...</p></main>;
  }

  if (!usuario) {
    // Guarda a dónde quería ir, para volver ahí después del login
    return <Navigate to="/login" replace state={{ desde: location.pathname }} />;
  }

  if (soloAdmin && usuario.rol !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}
