import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, mensajeError, urlImagen } from '../api/cliente';
import { RAREZAS, ELEMENTOS, formatoOro } from '../utils/formato';

export default function DetalleProducto() {
  const { id } = useParams();
  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function cargar() {
      setCargando(true);
      setError('');
      try {
        const res = await api.get(`/productos/${id}`);
        setProducto(res.data);
      } catch (err) {
        setError(mensajeError(err));
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, [id]);

  if (cargando) {
    return <main className="contenedor"><p className="cargando">Desenvolviendo el objeto...</p></main>;
  }

  if (error) {
    return (
      <main className="contenedor">
        <p className="mensaje-error">{error}</p>
        <Link to="/" className="volver">← Volver al arsenal</Link>
      </main>
    );
  }

  const imagen = urlImagen(producto.imagen);

  return (
    <main className="contenedor">
      <Link to="/" className="volver">← Volver al arsenal</Link>

      <div className={`detalle rareza-${producto.rareza}`}>
        <div className="detalle-imagen">
          {imagen
            ? <img src={imagen} alt={producto.nombre} />
            : <span className="sin-imagen">⚔️</span>}
        </div>

        <div className="detalle-info">
          <span className="etiqueta-rareza">{RAREZAS[producto.rareza]}</span>
          <h1>{producto.nombre}</h1>
          <p>{producto.descripcion}</p>

          {producto.encantamiento && (
            <p className="encantamiento">✦ {producto.encantamiento}</p>
          )}

          <dl className="stats">
            <dt>Categoría</dt>
            <dd>{producto.categoria?.nombre}</dd>
            <dt>Elemento</dt>
            <dd>{producto.elemento ? ELEMENTOS[producto.elemento] : 'Ninguno'}</dd>
            <dt>Nivel requerido</dt>
            <dd>{producto.nivelRequerido}</dd>
            <dt>Poder</dt>
            <dd>{producto.poder}</dd>
            <dt>Disponibles</dt>
            <dd>{producto.stock > 0 ? producto.stock : 'Agotado'}</dd>
          </dl>

          <p className="precio-grande">{formatoOro(producto.precio)}</p>

          <button className="boton boton-principal" disabled>
            Agregar al carrito (próximamente)
          </button>
        </div>
      </div>
    </main>
  );
}