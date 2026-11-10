import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth';
import { mensajeError } from '../api/cliente';

export default function Login() {
  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destino = location.state?.desde || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  function cambiar(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function enviar(e) {
    e.preventDefault();
    setError('');
    setEnviando(true);
    try {
      await iniciarSesion(form.email, form.password);
      navigate(destino, { replace: true });
    } catch (err) {
      setError(mensajeError(err));
      setEnviando(false);
    }
  }

  return (
    <main className="contenedor">
      <form className="formulario" onSubmit={enviar}>
        <h1>Entrar a la forja</h1>

        {error && <p className="mensaje-error">{error}</p>}

        <label>
          Email
          <input type="email" name="email" value={form.email} onChange={cambiar} required autoComplete="email" />
        </label>

        <label>
          Contraseña
          <input type="password" name="password" value={form.password} onChange={cambiar} required autoComplete="current-password" />
        </label>

        <button className="boton boton-principal" disabled={enviando}>
          {enviando ? 'Entrando...' : 'Iniciar sesión'}
        </button>

        <p className="nota">
          ¿Nuevo en la forja? <Link to="/registro">Crea tu aventurero</Link>
        </p>
      </form>
    </main>
  );
}