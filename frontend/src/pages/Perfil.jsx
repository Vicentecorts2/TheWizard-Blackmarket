import { useEffect, useState } from 'react';
import { api, mensajeError } from '../api/cliente';
import { useAuth } from '../context/auth';
import { formatoOro } from '../utils/formato';

const NOMBRES_CLASE = { guerrero: '⚔️ Guerrero', mago: '🔮 Mago', arquero: '🏹 Arquero' };

export default function Perfil() {
  const { usuario } = useAuth();
  const [ordenes, setOrdenes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/ordenes/mias')
      .then((res) => setOrdenes(res.data))
      .catch((err) => setError(mensajeError(err)))
      .finally(() => setCargando(false));
  }, []);

  return (
    <main className="contenedor">
      <h1>
        {usuario.nombre}
        {usuario.rol === 'admin' && <span className="insignia-admin">Maestro Herrero</span>}
      </h1>
      <p className="subtitulo">{usuario.email}</p>

      <div className="perfil-datos">
        <div className="dato">
          <span>Clase</span>
          <strong>{NOMBRES_CLASE[usuario.clase] || 'Sin clase'}</strong>
        </div>
        <div className="dato">
          <span>Nivel</span>
          <strong>{usuario.nivel}</strong>
        </div>
        <div className="dato">
          <span>Bolsa</span>
          <strong className="precio">{formatoOro(usuario.oro)}</strong>
        </div>
      </div>

      <h2>Historial de compras</h2>

      {cargando && <p className="cargando">Revisando tus pergaminos de compra...</p>}
      {error && <p className="mensaje-error">{error}</p>}
      {!cargando && !error && ordenes.length === 0 && (
        <p className="cargando">Aún no has comprado nada en la forja.</p>
      )}

      {ordenes.map((orden) => (
        <article key={orden.id} className="orden">
          <div className="orden-cabecera">
            <strong>Orden #{orden.id}</strong>
            <span className="texto-suave">
              {new Date(orden.creadaEn).toLocaleDateString('es-CL')}
            </span>
            <span className={`estado estado-${orden.estado}`}>{orden.estado}</span>
          </div>

          <ul className="orden-items">
            {orden.items.map((item) => (
              <li key={item.id}>
                {item.cantidad} × {item.producto.nombre} — {formatoOro(item.precioUnitario)} c/u
              </li>
            ))}
          </ul>

          <p className="orden-total">Total: {formatoOro(orden.total)}</p>
        </article>
      ))}
    </main>
  );
}