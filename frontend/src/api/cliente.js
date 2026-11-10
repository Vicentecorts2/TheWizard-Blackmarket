import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
});

// Si hay sesión iniciada, envía el token en cada petición automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function urlImagen(ruta) {
  return ruta ? `${API_URL}${ruta}` : null;
}

// Extrae el mensaje de error que envía nuestra API
export function mensajeError(error) {
  const data = error.response?.data;
  if (data?.error) return data.error;
  if (data?.errores) return data.errores.join('. ');
  return 'No se pudo conectar con la forja. ¿Está encendido el backend?';
}