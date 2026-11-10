import { useEffect, useState } from 'react';
import { api, mensajeError } from '../api/cliente';
import Filtros from '../components/Filtros';
import TarjetaProducto from '../components/TarjetaProducto';

const FILTROS_VACIOS = { q: '', categoria: '', rareza: '', elemento: '' };

export default function Catalogo() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [filtros, setFiltros] = useState(FILTROS_VACIOS);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // Categorías: se cargan una sola vez
  useEffect(() => {
    api.get('/categorias')
      .then((res) => setCategorias(res.data))
      .catch(() => {});
  }, []);

  // Productos: se recargan cada vez que cambian los filtros
  useEffect(() => {
    // Solo se envían los filtros que tienen valor
    const params = Object.fromEntries(
      Object.entries(filtros).filter(([, valor]) => valor !== '')
    );

    // Espera 300 ms tras la última tecla para no llamar a la API en cada letra
    const temporizador = setTimeout(async () => {
      setCargando(true);
      setError('');
      try {
        const res = await api.get('/productos', { params });
        setProductos(res.data);
      } catch (err) {
        setError(mensajeError(err));
      } finally {
        setCargando(false);
      }
    }, 300);

    return () => clearTimeout(temporizador);
  }, [filtros]);

  return (
    <main className="contenedor">
      <h1>El Arsenal</h1>
      <p className="subtitulo">Armas encantadas, reliquias y conjuros para todo aventurero.</p>

      <Filtros
        filtros={filtros}
        categorias={categorias}
        onCambio={setFiltros}
        onLimpiar={() => setFiltros(FILTROS_VACIOS)}
      />

      {error && <p className="mensaje-error">{error}</p>}

      {cargando && <p className="cargando">Consultando al herrero...</p>}

      {!cargando && !error && productos.length === 0 && (
        <p className="cargando">Ningún objeto coincide con tu búsqueda.</p>
      )}

      {!cargando && productos.length > 0 && (
        <div className="grilla">
          {productos.map((p) => (
            <TarjetaProducto key={p.id} producto={p} />
          ))}
        </div>
      )}
    </main>
  );
}