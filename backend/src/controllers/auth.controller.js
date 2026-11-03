import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

const CLASES = ['guerrero', 'mago', 'arquero'];

function generarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function sinPassword(usuario) {
  const { passwordHash, ...resto } = usuario;
  return resto;
}

export async function registrar(req, res) {
  try {
    const { nombre, email, password, clase } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }
    if (clase && !CLASES.includes(clase)) {
      return res.status(400).json({ error: `La clase debe ser: ${CLASES.join(', ')}` });
    }

    const existe = await prisma.usuario.findUnique({ where: { email } });
    if (existe) {
      return res.status(409).json({ error: 'Ese email ya está registrado' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Ojo: no se lee "rol" del body, así nadie puede registrarse como admin
    const usuario = await prisma.usuario.create({
      data: { nombre, email, passwordHash, clase },
    });

    res.status(201).json({ token: generarToken(usuario), usuario: sinPassword(usuario) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    const usuario = await prisma.usuario.findUnique({ where: { email } });
    const passwordOk = usuario && (await bcrypt.compare(password, usuario.passwordHash));

    if (!passwordOk) {
      // Mismo mensaje en ambos casos para no revelar qué emails existen
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    res.json({ token: generarToken(usuario), usuario: sinPassword(usuario) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
}

export async function perfil(req, res) {
  try {
    const usuario = await prisma.usuario.findUnique({ where: { id: req.usuario.id } });
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(sinPassword(usuario));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el perfil' });
  }
}