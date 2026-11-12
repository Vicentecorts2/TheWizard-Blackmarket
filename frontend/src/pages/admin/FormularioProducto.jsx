import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, mensajeError, urlImagen } from '../../api/cliente';
import { RAREZAS, ELEMENTOS } from '../../utils/formato';

const VACIO = {
  nombre: '',
  descripcion: '',
  categoriaId: '',
  rareza: 'comun',
  elemento: '',
  precio: '',
  stock: '',
  nivelRequerido: '1',
  poder: '0',
  encantamiento: '',
};

const FORMATOS = ['image/jpeg', 'image/png', 'image/webp'];
const TAMANO_MAXIMO = 2 * 1024 * 1024; // 2 MB, igual que en el backend

export default function FormularioProducto() {
  const { id } = useParams();
  const esEdicion = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(VACIO);
  const [categorias, setCategorias] = useState([]);
  const [imagenActual, setImagenActual] = useState(null);
  const [archivo, setArchivo] = useState(null);
  const [vistaPrevia, setVistaPrevia] = useState(null);
  const [cargando, setCargando] = useState(esEdicion);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/categorias')
      .then((res) => setCategorias(res.data))
      .catch(() => {});
  }, []);

  // Si es edición, carga el producto y llena el formulario
  useEffect(() => {
    setArchivo(null);
    setError('');

    if (!esEdicion) {
      setForm(VACIO);
      setImagenActual(null);
      return;
    }

    setCargando(true);
    api.get(`/productos/${id}`)
      .then(({ data: p }) => {
        setForm({
          nombre: p.nombre,
          descripcion: p.descripcion,
          categoriaId: String(p.categoriaId),
          rareza: p.rareza,
          elemento: p.elemento || '',
          precio: String(p.precio),
          stock: String(p.stock),
          nivelRequerido: String(p.nivelRequerido),
          poder: String(p.poder),
          encantamiento: p.encantamiento || '',
        });
        setImagenActual(p.imagen);
      })
      .catch((err) => setError(mensajeError(err)))
      .finally(() => setCargando(false));
  }, [id, esEdicion]);

  // Vista previa de la imagen elegida, antes de subirla
  useEffect(() => {
    if (!archivo) {
      setVistaPrevia(null);
      return;
    }
    const url = URL.createObjectURL(archivo);
    setVistaPrevia(url);
    return () => URL.revokeObjectURL(url); // libera memoria al cambiar de imagen
  }, [archivo]);

  function cambiar(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function elegirArchivo(e) {
    const elegido = e.target.files[0];
    setError('');

    if (!elegido) return setArchivo(null);
    if (!FORMATOS.includes(elegido.type)) {
      e.target.value = '';
      return setError('Solo se permiten imágenes JPG, PNG o WEBP');
    }
    if (elegido.size > TAMANO_MAXIMO) {
      e.target.value = '';
      return setError('La imagen no puede pesar más de 2 MB');
    }
    setArchivo(elegido);
  }

  async function guardar(e) {
    e.preventDefault();
    setError('');
    setGuardando(true);

    // Con imágenes no se envía JSON, sino FormData (multipart/form-data)
    const datos = new FormData();
    Object.entries(form).forEach(([campo, valor]) => datos.append(campo, valor));
    if (archivo) datos.append('imagen', archivo);

    try {
      const res = esEdicion
        ? await api.put(`/productos/${id}`, datos)
        : await api.post('/productos', datos);

      navigate('/admin/productos', {
        state: {
          mensaje: esEdicion
            ? `"${res.data.nombre}" fue actualizado.`
            : `"${res.data.nombre}" fue forjado con éxito.`,
        },
      });
    } catch (err) {
      setError(mensajeError(err));
      setGuardando(false);
    }
  }

  if (cargando) {
    return <p className="cargando">Sacando el objeto del yunque...</p>;
  }

  const imagenMostrada = vistaPrevia || urlImagen(imagenActual);

  return (
    <form className="formulario formulario-ancho" onSubmit={guardar}>
      <h2>{esEdicion ? 'Editar objeto' : 'Forjar nuevo objeto'}</h2>

      {error && <p className="mensaje-error">{error}</p>}

      <div className="campos-dobles">
        <label>
          Nombre *
          <input name="nombre" value={form.nombre} onChange={cambiar} required />
        </label>

        <label>
          Categoría *
          <select name="categoriaId" value={form.categoriaId} onChange={cambiar} required>
            <option value="">Elige una categoría</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </label>
      </div>

      <label>
        Descripción *
        <textarea name="descripcion" value={form.descripcion} onChange={cambiar} rows="3" required />
      </label>

      <div className="campos-dobles">
        <label>
          Rareza *
          <select name="rareza" value={form.rareza} onChange={cambiar}>
            {Object.entries(RAREZAS).map(([valor, texto]) => (
              <option key={valor} value={valor}>{texto}</option>
            ))}
          </select>
        </label>

        <label>
          Elemento
          <select name="elemento" value={form.elemento} onChange={cambiar}>
            <option value="">Ninguno</option>
            {Object.entries(ELEMENTOS).map(([valor, texto]) => (
              <option key={valor} value={valor}>{texto}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="campos-cuadruples">
        <label>
          Precio (oro) *
          <input type="number" min="0" name="precio" value={form.precio} onChange={cambiar} required />
        </label>
        <label>
          Stock *
          <input type="number" min="0" name="stock" value={form.stock} onChange={cambiar} required />
        </label>
        <label>
          Nivel requerido
          <input type="number" min="0" name="nivelRequerido" value={form.nivelRequerido} onChange={cambiar} />
        </label>
        <label>
          Poder
          <input type="number" min="0" name="poder" value={form.poder} onChange={cambiar} />
        </label>
      </div>

      <label>
        Encantamiento
        <input
          name="encantamiento"
          value={form.encantamiento}
          onChange={cambiar}
          placeholder="Ej: Incendia al enemigo con cada golpe"
        />
      </label>

      <div className={`campo-imagen rareza-${form.rareza}`}>
        <div className="vista-previa">
          {imagenMostrada ? <img src={imagenMostrada} alt="Vista previa" /> : <span>⚔️</span>}
        </div>
        <label>
          Imagen (JPG, PNG o WEBP, máx. 2 MB)
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={elegirArchivo} />
          {esEdicion && imagenActual && !archivo && (
            <span className="texto-suave">Si no eliges otra, se mantiene la actual.</span>
          )}
        </label>
      </div>

      <div className="acciones">
        <button className="boton boton-principal" disabled={guardando}>
          {guardando ? 'Forjando...' : esEdicion ? 'Guardar cambios' : 'Forjar objeto'}
        </button>
        <Link to="/admin/productos" className="boton">Cancelar</Link>
      </div>
    </form>
  );
}