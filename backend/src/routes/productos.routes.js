import { Router } from 'express';
import {
  listarProductos,
  obtenerProducto,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} from '../controllers/productos.controller.js';
import { verificarToken, soloAdmin } from '../middlewares/auth.js';
import { upload } from '../middlewares/upload.js';

const router = Router();

// Públicas
router.get('/', listarProductos);
router.get('/:id', obtenerProducto);

// Solo admin
router.post('/', verificarToken, soloAdmin, upload.single('imagen'), crearProducto);
router.put('/:id', verificarToken, soloAdmin, upload.single('imagen'), actualizarProducto);
router.delete('/:id', verificarToken, soloAdmin, eliminarProducto);

export default router;