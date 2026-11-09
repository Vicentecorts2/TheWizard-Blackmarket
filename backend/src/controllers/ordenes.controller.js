import { prisma } from '../lib/prisma.js';
import { ErrorNegocio } from '../lib/errores.js';

const ESTADOS = ['pendiente', 'enviada', 'entregada', 'cancelada'];

// Desde qué estado se puede pasar a cuál
const TRANSICIONES = {
  pendiente: ['enviada', 'cancelada'],
  enviada: ['entregada'],
  entregada: [],
  cancelada: [],
};

const incluirItems = {
  items: {
    include: {
      producto: { select: { id: true, nombre: true, imagen: true, rareza: true } },
    },
  },
};

function responderError(res, error, mensajeGenerico) {
  if (error instanceof ErrorNegocio) {
    return res.status(error.status).json({ error: error.message });
  }
  console.error(error);
  return res.status(500).json({ error: mensajeGenerico });
}

// Valida el body y junta productos repetidos: [{1,2},{1,1}] → [{1,3}]
function leerItems(body) {
  const items = body?.items;

  if (!Array.isArray(items) || items.length === 0) {
    throw new ErrorNegocio(400, 'Debes enviar al menos un objeto en "items"');
  }

  const agrupados = new Map();
  for (const item of items) {
    const productoId = Number(item.productoId);
    const cantidad = Number(item.cantidad);

    if (!Number.isInteger(productoId) || !Number.isInteger(cantidad) || cantidad < 1) {
      throw new ErrorNegocio(400, 'Cada item necesita productoId y una cantidad entera mayor a 0');
    }
    agrupados.set(productoId, (agrupados.get(productoId) || 0) + cantidad);
  }

  return [...agrupados].map(([productoId, cantidad]) => ({ productoId, cantidad }));
}

export async function crearOrden(req, res) {
  try {
    const items = leerItems(req.body);

    const resultado = await prisma.$transaction(async (tx) => {
      const usuario = await tx.usuario.findUnique({ where: { id: req.usuario.id } });
      if (!usuario) throw new ErrorNegocio(404, 'Usuario no encontrado');

      const ids = items.map((i) => i.productoId);
      const productos = await tx.producto.findMany({ where: { id: { in: ids } } });

      if (productos.length !== ids.length) {
        throw new ErrorNegocio(404, 'Uno o más objetos no existen en la forja');
      }

      let total = 0;

      for (const item of items) {
        const producto = productos.find((p) => p.id === item.productoId);

        if (usuario.nivel < producto.nivelRequerido) {
          throw new ErrorNegocio(
            403,
            `Necesitas nivel ${producto.nivelRequerido} para empuñar "${producto.nombre}" (tienes nivel ${usuario.nivel})`
          );
        }
        if (producto.stock < item.cantidad) {
          throw new ErrorNegocio(
            409,
            `Stock insuficiente de "${producto.nombre}" (quedan ${producto.stock})`
          );
        }

        item.precioUnitario = producto.precio;
        total += producto.precio * item.cantidad;
      }

      if (usuario.oro < total) {
        throw new ErrorNegocio(
          400,
          `Oro insuficiente: la compra cuesta ${total} y tienes ${usuario.oro}`
        );
      }

      // Descuenta stock solo si todavía alcanza (protege contra compras simultáneas)
      for (const item of items) {
        const { count } = await tx.producto.updateMany({
          where: { id: item.productoId, stock: { gte: item.cantidad } },
          data: { stock: { decrement: item.cantidad } },
        });
        if (count === 0) {
          throw new ErrorNegocio(409, 'Otro aventurero se llevó el último ejemplar. Intenta de nuevo.');
        }
      }

      const usuarioActualizado = await tx.usuario.update({
        where: { id: usuario.id },
        data: { oro: { decrement: total } },
      });

      const orden = await tx.orden.create({
        data: {
          usuarioId: usuario.id,
          total,
          items: {
            create: items.map((i) => ({
              productoId: i.productoId,
              cantidad: i.cantidad,
              precioUnitario: i.precioUnitario,
            })),
          },
        },
        include: incluirItems,
      });

      return { orden, oroRestante: usuarioActualizado.oro };
    });

    res.status(201).json(resultado);
  } catch (error) {
    responderError(res, error, 'Error al crear la orden');
  }
}

export async function misOrdenes(req, res) {
  try {
    const ordenes = await prisma.orden.findMany({
      where: { usuarioId: req.usuario.id },
      include: incluirItems,
      orderBy: { creadaEn: 'desc' },
    });
    res.json(ordenes);
  } catch (error) {
    responderError(res, error, 'Error al obtener tus órdenes');
  }
}

export async function listarOrdenes(req, res) {
  try {
    const { estado } = req.query;
    const where = {};

    if (estado) {
      if (!ESTADOS.includes(estado)) {
        throw new ErrorNegocio(400, `estado debe ser: ${ESTADOS.join(', ')}`);
      }
      where.estado = estado;
    }

    const ordenes = await prisma.orden.findMany({
      where,
      include: {
        ...incluirItems,
        usuario: { select: { id: true, nombre: true, email: true } },
      },
      orderBy: { creadaEn: 'desc' },
    });
    res.json(ordenes);
  } catch (error) {
    responderError(res, error, 'Error al obtener las órdenes');
  }
}

export async function cambiarEstado(req, res) {
  try {
    const id = Number(req.params.id);
    const { estado } = req.body;

    if (isNaN(id)) throw new ErrorNegocio(400, 'ID inválido');
    if (!ESTADOS.includes(estado)) {
      throw new ErrorNegocio(400, `estado debe ser: ${ESTADOS.join(', ')}`);
    }

    const orden = await prisma.$transaction(async (tx) => {
      const actual = await tx.orden.findUnique({ where: { id }, include: { items: true } });
      if (!actual) throw new ErrorNegocio(404, 'Orden no encontrada');

      if (!TRANSICIONES[actual.estado].includes(estado)) {
        throw new ErrorNegocio(
          409,
          `No se puede pasar de "${actual.estado}" a "${estado}"`
        );
      }

      // Al cancelar: devolver stock a la tienda y oro al cliente
      if (estado === 'cancelada') {
        for (const item of actual.items) {
          await tx.producto.update({
            where: { id: item.productoId },
            data: { stock: { increment: item.cantidad } },
          });
        }
        await tx.usuario.update({
          where: { id: actual.usuarioId },
          data: { oro: { increment: actual.total } },
        });
      }

      return tx.orden.update({
        where: { id },
        data: { estado },
        include: incluirItems,
      });
    });

    res.json(orden);
  } catch (error) {
    responderError(res, error, 'Error al cambiar el estado');
  }
}