import { useEffect, useState } from 'react';
import { api, mensajeError } from '../../api/cliente';
import { useAuth } from '../../context/auth';
import { formatoOro } from '../../utils/formato';

const ESTADOS = ['pendiente', 'enviada', 'entregada', 'cancelada'];

// Las mismas transiciones que permite el backend
const ACCIONES = {
  pendiente: [
    { estado: 'enviada', texto: '📦 Marcar enviada' },
    { estado: 'cancelada', texto: 'Cancelar', peligro: true },
  ],
  enviada: [{ estado: 'entregada', texto: '✅ Marcar entregada' }],
  entregada: [],
  cancelada: [],
};

export default function AdminOrdenes() {
  const { usuario, refrescarPerfil } = useAuth();
  const [ordenes, setOrdenes] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [procesandoId, setProcesandoId] = useState(null);

  useEffect(() => {
    setCargando(true);
    setError('');
    api.get('/ordenes', { params: filtro ? { estado: filtro } : {} })
      .then((res) => setOrdenes(res.data))
      .catch((err) => setError(mensajeError(err)))
      .finally(() => setCargando(false));
  }, [filtro]);

  async function cambiarEstado(orden, nuevoEstado) {
    if (
      nuevoEstado === 'cancelada' &&
      !window.confirm(`¿Cancelar la orden #${orden.id}? Se devolverán ${formatoOro(orden.total)} al cliente y el stock a la tienda.`)
    ) {
      return;
    }

    setError('');
    setProcesandoId(orden.id);
    try {
      const res = await api.patch(`/ordenes/${orden.id}/estado`, { estado: nuevoEstado });

      // La respuesta no trae los datos del cliente, así que se conservan los que ya teníamos
      setOrdenes((actuales) =>
        actuales.map((o) => (o.id === orden.id ? { ...o, ...res.data, usuario: o.usuario } : o))
      );

      // Si el admin canceló una orden propia, su oro cambió
      if (nuevoEstado === 'cancelada' && orden.usuario.id === usuario.id) {
        refrescarPerfil().catch(() => {});
      }
    } catch (err) {
      setError(mensajeError(err));
    } finally {
      setProcesandoId(null);
    }
  }

  return (
    <section>
      <div className="barra-acciones">
        <p className="texto-suave">{ordenes.length} órdenes</p>
        <div className="filtros filtros-compactos">
          <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
            <option value="">Todos los estados</option>
            {ESTADOS.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="mensaje-error">{error}</p>}
      {cargando && <p className="cargando">Revisando el libro de cuentas...</p>}
      {!cargando && !error && ordenes.length === 0 && (
        <p className="cargando">No hay órdenes {filtro && `en estado "${filtro}"`}.</p>
      )}

      {!cargando && ordenes.map((orden) => (
        <article key={orden.id} className="orden">
          <div className="orden-cabecera">
            <div>
              <strong>Orden #{orden.id}</strong>
              <span className="texto-suave bloque">
                {orden.usuario.nombre} · {orden.usuario.email}
              </span>
            </div>
            <span className="texto-suave">
              {new Date(orden.creadaEn).toLocaleString('es-CL')}
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

          <div className="orden-pie">
            <div className="acciones">
              {ACCIONES[orden.estado].map((accion) => (
                <button
                  key={accion.estado}
                  className={`boton boton-chico ${accion.peligro ? 'boton-peligro' : ''}`}
                  onClick={() => cambiarEstado(orden, accion.estado)}
                  disabled={procesandoId === orden.id}
                >
                  {accion.texto}
                </button>
              ))}
            </div>
            <p className="orden-total">Total: {formatoOro(orden.total)}</p>
          </div>
        </article>
      ))}
    </section>
  );
}