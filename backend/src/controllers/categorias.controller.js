import { prisma } from '../lib/prisma.js';

export async function listarCategorias(req, res) {
  try {
    const categorias = await prisma.categoria.findMany({ orderBy: { nombre: 'asc' } });
    res.json(categorias);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener las categorías' });
  }
}