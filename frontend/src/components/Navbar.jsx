import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth';

export default function Navbar() {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  function salir() {
    cerrarSesion();
    navigate('/');
  }

  return (
    <header className="navbar">
      <Link to="/" className="logo">🧙 TheWizard Blackmarket</Link>

      <nav>
        <Link to="/">Catálogo</Link>

        {usuario ? (
          <>
            <Link to="/perfil" className="nav-usuario">
              <span>{usuario.nombre}</span>
              <span className="nav-stats">
                Nv. {usuario.nivel} · 🪙 {usuario.oro.toLocaleString('es-CL')}
              </span>
            </Link>
            <button className="boton boton-chico" onClick={salir}>Salir</button>
          </>
        ) : (
          <>
            <Link to="/login">Iniciar sesión</Link>
            <Link to="/registro" className="boton boton-principal boton-chico">Registrarse</Link>
          </>
        )}
      </nav>
    </header>
  );
}