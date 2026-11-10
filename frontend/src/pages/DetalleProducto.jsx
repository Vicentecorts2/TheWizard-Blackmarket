import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, mensajeError, urlImagen } from '../api/cliente';
import { useAuth } from '../context/auth';
import { useCarrito } from '../context/carrito';
import { RAREZAS, ELEMENTOS, formatoOro } from '../utils/formato';

export default function DetalleProducto() {
  const { id } = useParams();
  const { usuario } = useAuth();
  const { items, agregar } = useCarrito();

  const [producto, setProducto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);

  useEffect(() => {
    async function cargar() {
      setCargando(true);
      setError('');
      setAgregado(false);
      setCantidad(1);
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
  const enCarrito = items.find((i) => i.producto.id === producto.id)?.cantidad || 0;
  const disponibles = producto.stock - enCarrito;
  const nivelInsuficiente = usuario && usuario.nivel < producto.nivelRequerido;

  function agregarAlCarrito() {
    const cantidadValida = Math.min(Math.max(1, cantidad), disponibles);
    agregar(producto, cantidadValida);
    setCantidad(1);
    setAgregado(true);
  }

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

          {nivelInsuficiente && (
            <p className="aviso">
              Necesitas nivel {producto.nivelRequerido} para empuñar este objeto (tienes nivel {usuario.nivel}).
            </p>
          )}

          {producto.stock === 0 ? (
            <button className="boton" disabled>Agotado</button>
          ) : disponibles === 0 ? (
            <p className="aviso">Ya tienes en el carrito todas las unidades disponibles.</p>
          ) : (
            <div className="comprar">
              <input
                type="number"
                min="1"
                max={disponibles}
                value={cantidad}
                onChange={(e) => setCantidad(Number(e.target.value))}
                aria-label="Cantidad"
              />
              <button
                className="boton boton-principal"
                onClick={agregarAlCarrito}
                disabled={nivelInsuficiente}
              >
                Agregar al carrito
              </button>
            </div>
          )}

          {agregado && (
            <p className="exito">
              ¡Agregado al carrito! <Link to="/carrito">Ver carrito →</Link>
            </p>
          )}
        </div>
      </div>
    </main>
  );
}