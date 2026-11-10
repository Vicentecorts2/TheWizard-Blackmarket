import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, mensajeError, urlImagen } from '../api/cliente';
import { useAuth } from '../context/auth';
import { useCarrito } from '../context/carrito';
import { RAREZAS, formatoOro } from '../utils/formato';

export default function Carrito() {
  const { items, total, cambiarCantidad, quitar, vaciar, sincronizar } = useCarrito();
  const { usuario, refrescarPerfil } = useAuth();

  const [error, setError] = useState('');
  const [comprando, setComprando] = useState(false);
  const [ordenCreada, setOrdenCreada] = useState(null);

  // Al abrir el carrito, actualiza precios y stock
  useEffect(() => {
    sincronizar().catch(() => {});
  }, [sincronizar]);

  async function comprar() {
    setError('');
    setComprando(true);
    try {
      const res = await api.post('/ordenes', {
        items: items.map((i) => ({ productoId: i.producto.id, cantidad: i.cantidad })),
      });
      setOrdenCreada(res.data);
      vaciar();
      refrescarPerfil().catch(() => {}); // actualiza el oro en la barra
    } catch (err) {
      setError(mensajeError(err));
      sincronizar().catch(() => {}); // por si el stock cambió mientras tanto
    } finally {
      setComprando(false);
    }
  }

  // Pantalla de compra exitosa
  if (ordenCreada) {
    return (
      <main className="contenedor">
        <div className="formulario compra-exitosa">
          <h1>¡Trato cerrado!</h1>
          <p>
            Tu orden <strong>#{ordenCreada.orden.id}</strong> por{' '}
            <span className="precio">{formatoOro(ordenCreada.orden.total)}</span> fue registrada.
          </p>
          <p className="texto-suave">Te quedan {formatoOro(ordenCreada.oroRestante)} en la bolsa.</p>
          <Link to="/perfil" className="boton boton-principal">Ver mis compras</Link>
          <Link to="/" className="volver">← Seguir comprando</Link>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="contenedor">
        <h1>Tu carrito</h1>
        <p className="cargando">Tu carrito está vacío. El herrero espera tu visita.</p>
        <Link to="/" className="volver">← Explorar el arsenal</Link>
      </main>
    );
  }

  const itemsSinNivel = usuario
    ? items.filter((i) => i.producto.nivelRequerido > usuario.nivel)
    : [];
  const oroInsuficiente = usuario && usuario.oro < total;
  const puedeComprar = usuario && !oroInsuficiente && itemsSinNivel.length === 0 && !comprando;

  return (
    <main className="contenedor">
      <h1>Tu carrito</h1>

      <div className="carrito">
        <section className="carrito-items">
          {items.map(({ producto, cantidad }) => {
            const imagen = urlImagen(producto.imagen);
            const sinNivel = usuario && producto.nivelRequerido > usuario.nivel;

            return (
              <article key={producto.id} className={`item-carrito rareza-${producto.rareza}`}>
                <Link to={`/producto/${producto.id}`} className="item-imagen">
                  {imagen ? <img src={imagen} alt={producto.nombre} /> : <span>⚔️</span>}
                </Link>

                <div className="item-info">
                  <span className="etiqueta-rareza">{RAREZAS[producto.rareza]}</span>
                  <Link to={`/producto/${producto.id}`}><h3>{producto.nombre}</h3></Link>
                  <span className="texto-suave">{formatoOro(producto.precio)} c/u</span>
                  {sinNivel && (
                    <span className="aviso-chico">Requiere nivel {producto.nivelRequerido}</span>
                  )}
                </div>

                <div className="cantidad">
                  <button
                    className="boton boton-chico"
                    onClick={() => cambiarCantidad(producto.id, cantidad - 1)}
                    disabled={cantidad <= 1}
                    aria-label="Quitar uno"
                  >−</button>
                  <span>{cantidad}</span>
                  <button
                    className="boton boton-chico"
                    onClick={() => cambiarCantidad(producto.id, cantidad + 1)}
                    disabled={cantidad >= producto.stock}
                    aria-label="Agregar uno"
                  >+</button>
                </div>

                <div className="item-subtotal">
                  <span className="precio">{formatoOro(producto.precio * cantidad)}</span>
                  <button className="enlace-quitar" onClick={() => quitar(producto.id)}>
                    Quitar
                  </button>
                </div>
              </article>
            );
          })}
        </section>

        <aside className="resumen">
          <h2>Resumen</h2>

          <div className="fila">
            <span>Total</span>
            <strong className="precio">{formatoOro(total)}</strong>
          </div>

          {usuario && (
            <>
              <div className="fila texto-suave">
                <span>Tu bolsa</span>
                <span>{formatoOro(usuario.oro)}</span>
              </div>
              {!oroInsuficiente && (
                <div className="fila texto-suave">
                  <span>Te quedarán</span>
                  <span>{formatoOro(usuario.oro - total)}</span>
                </div>
              )}
            </>
          )}

          {error && <p className="mensaje-error">{error}</p>}

          {oroInsuficiente && (
            <p className="aviso">Te faltan {formatoOro(total - usuario.oro)} para esta compra.</p>
          )}
          {itemsSinNivel.length > 0 && (
            <p className="aviso">Hay objetos que requieren más nivel del que tienes. Quítalos para continuar.</p>
          )}

          {usuario ? (
            <button className="boton boton-principal" onClick={comprar} disabled={!puedeComprar}>
              {comprando ? 'Sellando el trato...' : 'Confirmar compra'}
            </button>
          ) : (
            <Link to="/login" state={{ desde: '/carrito' }} className="boton boton-principal">
              Inicia sesión para comprar
            </Link>
          )}
        </aside>
      </div>
    </main>
  );
}