import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const unico = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, unico + path.extname(file.originalname).toLowerCase());
  },
});

const FORMATOS = ['image/jpeg', 'image/png', 'image/webp'];

export const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
  fileFilter: (req, file, cb) => {
    if (FORMATOS.includes(file.mimetype)) cb(null, true);
    else cb(new Error('FORMATO_INVALIDO'));
  },
});