import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth';
import { useCarrito } from '../context/carrito';

export default function Navbar() {
  const { usuario, cerrarSesion } = useAuth();
  const { cantidadTotal } = useCarrito();
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

        <Link to="/carrito" className="nav-carrito" aria-label="Carrito">
          🛒
          {cantidadTotal > 0 && <span className="contador">{cantidadTotal}</span>}
        </Link>

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