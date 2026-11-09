import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import authRoutes from './src/routes/auth.routes.js';
import productosRoutes from './src/routes/productos.routes.js';
import categoriasRoutes from './src/routes/categorias.routes.js';
import ordenesRoutes from './src/routes/ordenes.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Las imágenes subidas se sirven en http://localhost:3000/uploads/archivo.png
app.use('/uploads', express.static('uploads'));

app.get('/api/salud', (req, res) => {
  res.json({ estado: 'La forja está encendida' });
});

app.use('/api/auth', authRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/ordenes', ordenesRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo central de errores (siempre al final y con 4 parámetros)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const mensaje = err.code === 'LIMIT_FILE_SIZE'
      ? 'La imagen no puede pesar más de 2 MB'
      : err.message;
    return res.status(400).json({ error: mensaje });
  }
  if (err.message === 'FORMATO_INVALIDO') {
    return res.status(400).json({ error: 'Solo se permiten imágenes JPG, PNG o WEBP' });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El JSON enviado no es válido' });
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});