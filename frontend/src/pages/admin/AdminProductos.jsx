import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api, mensajeError, urlImagen } from '../../api/cliente';
import { RAREZAS, formatoOro } from '../../utils/formato';

export default function AdminProductos() {
  const location = useLocation();
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState(location.state?.mensaje || '');
  const [eliminandoId, setEliminandoId] = useState(null);

  useEffect(() => {
    api.get('/productos')
      .then((res) => setProductos(res.data))
      .catch((err) => setError(mensajeError(err)))
      .finally(() => setCargando(false));
  }, []);

  async function eliminar(producto) {
    const confirmado = window.confirm(
      `¿Fundir "${producto.nombre}" para siempre? Esta acción no se puede deshacer.`
    );
    if (!confirmado) return;

    setError('');
    setMensaje('');
    setEliminandoId(producto.id);
    try {
      await api.delete(`/productos/${producto.id}`);
      setProductos((actuales) => actuales.filter((p) => p.id !== producto.id));
      setMensaje(`"${producto.nombre}" fue eliminado.`);
    } catch (err) {
      setError(mensajeError(err));
    } finally {
      setEliminandoId(null);
    }
  }

  return (
    <section>
      <div className="barra-acciones">
        <p className="texto-suave">{productos.length} objetos en el arsenal</p>
        <Link to="/admin/productos/nuevo" className="boton boton-principal">
          + Forjar nuevo objeto
        </Link>
      </div>

      {mensaje && <p className="exito">{mensaje}</p>}
      {error && <p className="mensaje-error">{error}</p>}
      {cargando && <p className="cargando">Inventariando el arsenal...</p>}

      {!cargando && productos.length > 0 && (
        <div className="tabla-contenedor">
          <table className="tabla">
            <thead>
              <tr>
                <th></th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Nivel</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => {
                const imagen = urlImagen(p.imagen);
                return (
                  <tr key={p.id} className={`rareza-${p.rareza}`}>
                    <td>
                      <div className="miniatura">
                        {imagen ? <img src={imagen} alt="" /> : <span>⚔️</span>}
                      </div>
                    </td>
                    <td>
                      <strong>{p.nombre}</strong>
                      <span className="etiqueta-rareza bloque">{RAREZAS[p.rareza]}</span>
                    </td>
                    <td className="texto-suave">{p.categoria?.nombre}</td>
                    <td className="precio">{formatoOro(p.precio)}</td>
                    <td className={p.stock === 0 ? 'sin-stock' : ''}>{p.stock}</td>
                    <td>{p.nivelRequerido}</td>
                    <td>
                      <div className="acciones">
                        <Link to={`/admin/productos/${p.id}/editar`} className="boton boton-chico">
                          Editar
                        </Link>
                        <button
                          className="boton boton-chico boton-peligro"
                          onClick={() => eliminar(p)}
                          disabled={eliminandoId === p.id}
                        >
                          {eliminandoId === p.id ? '...' : 'Eliminar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}