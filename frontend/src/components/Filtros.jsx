import { RAREZAS, ELEMENTOS } from '../utils/formato';

export default function Filtros({ filtros, categorias, onCambio, onLimpiar }) {
  function cambiar(e) {
    onCambio({ ...filtros, [e.target.name]: e.target.value });
  }

  return (
    <div className="filtros">
      <input
        name="q"
        placeholder="Buscar objeto..."
        value={filtros.q}
        onChange={cambiar}
      />

      <select name="categoria" value={filtros.categoria} onChange={cambiar}>
        <option value="">Todas las categorías</option>
        {categorias.map((c) => (
          <option key={c.id} value={c.id}>{c.nombre}</option>
        ))}
      </select>

      <select name="rareza" value={filtros.rareza} onChange={cambiar}>
        <option value="">Todas las rarezas</option>
        {Object.entries(RAREZAS).map(([valor, texto]) => (
          <option key={valor} value={valor}>{texto}</option>
        ))}
      </select>

      <select name="elemento" value={filtros.elemento} onChange={cambiar}>
        <option value="">Todos los elementos</option>
        {Object.entries(ELEMENTOS).map(([valor, texto]) => (
          <option key={valor} value={valor}>{texto}</option>
        ))}
      </select>

      <button type="button" className="boton" onClick={onLimpiar}>
        Limpiar
      </button>
    </div>
  );
}