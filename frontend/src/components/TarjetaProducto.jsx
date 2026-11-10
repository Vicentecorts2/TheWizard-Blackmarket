import { Link } from 'react-router-dom';
import { urlImagen } from '../api/cliente';
import { RAREZAS, ELEMENTOS, formatoOro } from '../utils/formato';

export default function TarjetaProducto({ producto }) {
  const imagen = urlImagen(producto.imagen);
  const agotado = producto.stock === 0;

  return (
    <Link to={`/producto/${producto.id}`} className={`tarjeta rareza-${producto.rareza}`}>
      <div className="tarjeta-imagen">
        {imagen
          ? <img src={imagen} alt={producto.nombre} />
          : <span className="sin-imagen">⚔️</span>}
      </div>

      <div className="tarjeta-cuerpo">
        <span className="etiqueta-rareza">{RAREZAS[producto.rareza]}</span>
        <h3>{producto.nombre}</h3>
        <p className="categoria">{producto.categoria?.nombre}</p>
        {producto.elemento && <p className="elemento">{ELEMENTOS[producto.elemento]}</p>}

        <div className="tarjeta-pie">
          <span className="precio">{formatoOro(producto.precio)}</span>
          <span className="nivel">Nv. {producto.nivelRequerido}</span>
        </div>
      </div>

      {agotado && <span className="agotado">Agotado</span>}
    </Link>
  );
}