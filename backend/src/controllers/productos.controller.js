import { prisma } from '../lib/prisma.js';

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