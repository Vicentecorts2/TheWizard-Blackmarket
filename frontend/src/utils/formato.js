export const RAREZAS = {
  comun: 'Común',
  raro: 'Raro',
  epico: 'Épico',
  legendario: 'Legendario',
};

export const ELEMENTOS = {
  fuego: '🔥 Fuego',
  hielo: '❄️ Hielo',
  rayo: '⚡ Rayo',
  sombra: '🌑 Sombra',
  sagrado: '✨ Sagrado',
};

export function formatoOro(cantidad) {
  return `${cantidad.toLocaleString('es-CL')} de oro`;
}