import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/cliente';
import { CarritoContext } from './carrito';

const CLAVE = 'carrito';

function leerGuardado() {
  try {
    const datos = JSON.parse(localStorage.getItem(CLAVE));
    return Array.isArray(datos) ? datos : [];
  } catch {
    return [];
  }
}

// Guarda solo lo necesario del producto
function resumen(producto) {
  const { id, nombre, precio, imagen, rareza, nivelRequerido, stock } = producto;
  return { id, nombre, precio, imagen, rareza, nivelRequerido, stock };
}

export default function CarritoProvider({ children }) {
  // items: [{ producto, cantidad }]
  const [items, setItems] = useState(leerGuardado);

  // Cada vez que cambia el carrito, se guarda en el navegador
  useEffect(() => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(items));
    } catch {
      // Si el navegador no permite guardar, el carrito funciona igual mientras la página esté abierta
    }
  }, [items]);

  function agregar(producto, cantidad = 1) {
    setItems((actuales) => {
      const existente = actuales.find((i) => i.producto.id === producto.id);

      if (existente) {
        return actuales.map((i) =>
          i.producto.id === producto.id
            ? { producto: resumen(producto), cantidad: Math.min(i.cantidad + cantidad, producto.stock) }
            : i
        );
      }

      return [...actuales, { producto: resumen(producto), cantidad: Math.min(cantidad, producto.stock) }];
    });
  }

  function cambiarCantidad(id, cantidad) {
    setItems((actuales) =>
      actuales.map((i) =>
        i.producto.id === id
          ? { ...i, cantidad: Math.max(1, Math.min(cantidad, i.producto.stock)) }
          : i
      )
    );
  }

  function quitar(id) {
    setItems((actuales) => actuales.filter((i) => i.producto.id !== id));
  }

  function vaciar() {
    setItems([]);
  }

  // Actualiza precios y stock con los datos reales de la API
  const sincronizar = useCallback(async () => {
    const res = await api.get('/productos');
    const vigentes = new Map(res.data.map((p) => [p.id, p]));

    setItems((actuales) =>
      actuales
        .filter((i) => vigentes.has(i.producto.id) && vigentes.get(i.producto.id).stock > 0)
        .map((i) => {
          const producto = vigentes.get(i.producto.id);
          return {
            producto: resumen(producto),
            cantidad: Math.min(i.cantidad, producto.stock),
          };
        })
    );
  }, []);

  const cantidadTotal = items.reduce((suma, i) => suma + i.cantidad, 0);
  const total = items.reduce((suma, i) => suma + i.producto.precio * i.cantidad, 0);

  return (
    <CarritoContext.Provider
      value={{ items, cantidadTotal, total, agregar, cambiarCantidad, quitar, vaciar, sincronizar }}
    >
      {children}
    </CarritoContext.Provider>
  );
}