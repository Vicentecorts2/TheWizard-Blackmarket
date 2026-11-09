import { prisma } from '../lib/prisma.js';
import fs from 'fs/promises';
import path from 'path';

export async function listarProductos(req, res) {
  try {
    const { categoria, q, rareza, elemento, nivelMax } = req.query;
    const where = {};

    if (categoria) {
      if (isNaN(Number(categoria))) {
        return res.status(400).json({ error: 'categoria debe ser un número' });
      }
      where.categoriaId = Number(categoria);
    }
    if (nivelMax) {
      if (isNaN(Number(nivelMax))) {
        return res.status(400).json({ error: 'nivelMax debe ser un número' });
      }
      where.nivelRequerido = { lte: Number(nivelMax) };
    }
    if (q) where.nombre = { contains: q };
    if (rareza) where.rareza = rareza;
    if (elemento) where.elemento = elemento;

    const productos = await prisma.producto.findMany({
      where,
      include: { categoria: true },
      orderBy: { nombre: 'asc' },
    });

    res.json(productos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener los productos' });
  }
}

export async function obtenerProducto(req, res) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const producto = await prisma.producto.findUnique({
      where: { id },
      include: { categoria: true },
    });

    if (!producto) {
      return res.status(404).json({ error: 'Ese objeto no existe en la forja' });
    }

    res.json(producto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el producto' });
  }
}

const RAREZAS = ['comun', 'raro', 'epico', 'legendario'];
const ELEMENTOS = ['fuego', 'hielo', 'rayo', 'sombra', 'sagrado'];
const OBLIGATORIOS = ['nombre', 'descripcion', 'precio', 'stock', 'rareza', 'categoriaId'];

// Los datos llegan como texto (multipart/form-data), aquí se validan y convierten
function leerDatos(body, parcial = false) {
  const datos = {};
  const errores = [];

  for (const campo of ['nombre', 'descripcion', 'encantamiento']) {
    if (body[campo] !== undefined) {
      const valor = String(body[campo]).trim();
      datos[campo] = campo === 'encantamiento' && valor === '' ? null : valor;
    }
  }

  for (const campo of ['precio', 'stock', 'nivelRequerido', 'poder', 'categoriaId']) {
    if (body[campo] !== undefined && body[campo] !== '') {
      const n = Number(body[campo]);
      if (!Number.isInteger(n) || n < 0) {
        errores.push(`${campo} debe ser un número entero mayor o igual a 0`);
      } else {
        datos[campo] = n;
      }
    }
  }

  if (body.rareza !== undefined) {
    if (RAREZAS.includes(body.rareza)) datos.rareza = body.rareza;
    else errores.push(`rareza debe ser: ${RAREZAS.join(', ')}`);
  }

  if (body.elemento !== undefined) {
    if (body.elemento === '') datos.elemento = null;
    else if (ELEMENTOS.includes(body.elemento)) datos.elemento = body.elemento;
    else errores.push(`elemento debe ser: ${ELEMENTOS.join(', ')}`);
  }

  if (!parcial) {
    for (const campo of OBLIGATORIOS) {
      if (datos[campo] === undefined || datos[campo] === '') {
        errores.push(`${campo} es obligatorio`);
      }
    }
  }

  return { datos, errores };
}

async function borrarImagen(ruta) {
  if (!ruta) return;
  try {
    await fs.unlink(path.join(process.cwd(), ruta));
  } catch {
    // Si el archivo ya no existe, no pasa nada
  }
}

function rutaSubida(req) {
  return req.file ? `/uploads/${req.file.filename}` : null;
}

export async function crearProducto(req, res) {
  try {
    const { datos, errores } = leerDatos(req.body);
    if (errores.length) {
      await borrarImagen(rutaSubida(req));
      return res.status(400).json({ errores });
    }

    const categoria = await prisma.categoria.findUnique({ where: { id: datos.categoriaId } });
    if (!categoria) {
      await borrarImagen(rutaSubida(req));
      return res.status(400).json({ error: 'La categoría no existe' });
    }

    if (req.file) datos.imagen = rutaSubida(req);

    const producto = await prisma.producto.create({
      data: datos,
      include: { categoria: true },
    });

    res.status(201).json(producto);
  } catch (error) {
    console.error(error);
    await borrarImagen(rutaSubida(req));
    res.status(500).json({ error: 'Error al crear el producto' });
  }
}

export async function actualizarProducto(req, res) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      await borrarImagen(rutaSubida(req));
      return res.status(400).json({ error: 'ID inválido' });
    }

    const existente = await prisma.producto.findUnique({ where: { id } });
    if (!existente) {
      await borrarImagen(rutaSubida(req));
      return res.status(404).json({ error: 'Ese objeto no existe en la forja' });
    }

    const { datos, errores } = leerDatos(req.body, true);
    if (errores.length) {
      await borrarImagen(rutaSubida(req));
      return res.status(400).json({ errores });
    }

    if (datos.categoriaId !== undefined) {
      const categoria = await prisma.categoria.findUnique({ where: { id: datos.categoriaId } });
      if (!categoria) {
        await borrarImagen(rutaSubida(req));
        return res.status(400).json({ error: 'La categoría no existe' });
      }
    }

    if (req.file) datos.imagen = rutaSubida(req);

    const producto = await prisma.producto.update({
      where: { id },
      data: datos,
      include: { categoria: true },
    });

    // Si se subió una imagen nueva, se borra la anterior
    if (req.file) await borrarImagen(existente.imagen);

    res.json(producto);
  } catch (error) {
    console.error(error);
    await borrarImagen(rutaSubida(req));
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
}

export async function eliminarProducto(req, res) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const existente = await prisma.producto.findUnique({ where: { id } });
    if (!existente) {
      return res.status(404).json({ error: 'Ese objeto no existe en la forja' });
    }

    const vecesVendido = await prisma.ordenItem.count({ where: { productoId: id } });
    if (vecesVendido > 0) {
      return res.status(409).json({
        error: 'No se puede eliminar: aparece en órdenes de clientes. Deja su stock en 0.',
      });
    }

    await prisma.producto.delete({ where: { id } });
    await borrarImagen(existente.imagen);

    res.status(204).end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
}