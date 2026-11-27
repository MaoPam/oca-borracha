// Colores de las fichas (corazones). c: relleno · tc: color de la inicial
export const COLORES = [
  { c: '#ff2e93', tc: '#fff' },
  { c: '#3fa9f5', tc: '#fff' },
  { c: '#9b5cff', tc: '#fff' },
  { c: '#f5c542', tc: '#2b0a1c' },
  { c: '#e0112b', tc: '#fff' },
  { c: '#7ee05a', tc: '#1c2b0a' },
  { c: '#ff9a3c', tc: '#2b0a1c' },
  { c: '#f4f1ea', tc: '#2b0a1c' },
];

export const MAX_JUGADORES = COLORES.length;
export const colorDe = (i) => COLORES[i % COLORES.length];
