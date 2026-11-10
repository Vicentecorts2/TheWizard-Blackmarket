import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth';
import { mensajeError } from '../api/cliente';

const CLASES = {
  guerrero: '⚔️ Guerrero',
  mago: '🔮 Mago',
  arquero: '🏹 Arquero',
};

export default function Registro() {
  const { registrar } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmar: '',
    clase: '',
  });
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  function cambiar(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function enviar(e) {
    e.preventDefault();
    setError('');

    // Validaciones rápidas en el navegador (el backend valida igual)
    if (form.password.length < 6) {
      return setError('La contraseña debe tener al menos 6 caracteres');
    }
    if (form.password !== form.confirmar) {
      return setError('Las contraseñas no coinciden');
    }

    setEnviando(true);
    try {
      const { confirmar, ...datos } = form;
      if (!datos.clase) delete datos.clase;
      await registrar(datos);
      navigate('/', { replace: true });
    } catch (err) {
      setError(mensajeError(err));
      setEnviando(false);
    }
  }

  return (
    <main className="contenedor">
      <form className="formulario" onSubmit={enviar}>
        <h1>Nuevo aventurero</h1>
        <p className="nota">Recibirás 1.000 de oro para tu primera compra.</p>

        {error && <p className="mensaje-error">{error}</p>}

        <label>
          Nombre
          <input name="nombre" value={form.nombre} onChange={cambiar} required autoComplete="name" />
        </label>

        <label>
          Email
          <input type="email" name="email" value={form.email} onChange={cambiar} required autoComplete="email" />
        </label>

        <label>
          Clase
          <select name="clase" value={form.clase} onChange={cambiar}>
            <option value="">Sin clase</option>
            {Object.entries(CLASES).map(([valor, texto]) => (
              <option key={valor} value={valor}>{texto}</option>
            ))}
          </select>
        </label>

        <label>
          Contraseña
          <input type="password" name="password" value={form.password} onChange={cambiar} required autoComplete="new-password" />
        </label>

        <label>
          Repite la contraseña
          <input type="password" name="confirmar" value={form.confirmar} onChange={cambiar} required autoComplete="new-password" />
        </label>

        <button className="boton boton-principal" disabled={enviando}>
          {enviando ? 'Forjando tu destino...' : 'Crear aventurero'}
        </button>

        <p className="nota">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </form>
    </main>
  );
}