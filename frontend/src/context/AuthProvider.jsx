import { useEffect, useState } from 'react';
import { api } from '../api/cliente';
import { AuthContext } from './auth';

export default function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Al abrir la página: si hay un token guardado, recupera al usuario
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      setCargando(false);
      return;
    }

    api.get('/auth/perfil')
      .then((res) => setUsuario(res.data))
      .catch(() => localStorage.removeItem('token')) // token vencido o inválido
      .finally(() => setCargando(false));
  }, []);

  function guardarSesion(data) {
    localStorage.setItem('token', data.token);
    setUsuario(data.usuario);
  }

  async function iniciarSesion(email, password) {
    const res = await api.post('/auth/login', { email, password });
    guardarSesion(res.data);
  }

  async function registrar(datos) {
    const res = await api.post('/auth/register', datos);
    guardarSesion(res.data);
  }

  function cerrarSesion() {
    localStorage.removeItem('token');
    setUsuario(null);
  }

  // Para actualizar oro y nivel después de una compra
  async function refrescarPerfil() {
    const res = await api.get('/auth/perfil');
    setUsuario(res.data);
  }

  return (
    <AuthContext.Provider
      value={{ usuario, cargando, iniciarSesion, registrar, cerrarSesion, refrescarPerfil }}
    >
      {children}
    </AuthContext.Provider>
  );
}