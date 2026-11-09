import { Router } from 'express';
import {
  crearOrden,
  misOrdenes,
  listarOrdenes,
  cambiarEstado,
} from '../controllers/ordenes.controller.js';
import { verificarToken, soloAdmin } from '../middlewares/auth.js';

const router = Router();

// Todas las rutas de órdenes requieren login
router.use(verificarToken);

router.post('/', crearOrden);
router.get('/mias', misOrdenes);
router.get('/', soloAdmin, listarOrdenes);
router.patch('/:id/estado', soloAdmin, cambiarEstado);

export default router;