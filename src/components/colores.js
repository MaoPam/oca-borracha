// Colores de las fichas (corazones). c: relleno · tc: color de la inicial
export const COLORES = [
  { c: '#ff3d9a', tc: '#000' },
  { c: '#19c3ff', tc: '#000' },
  { c: '#8b3dff', tc: '#fff' },
  { c: '#ffe500', tc: '#000' },
  { c: '#e0001b', tc: '#fff' },
  { c: '#3ddc6a', tc: '#000' },
  { c: '#ff7a1a', tc: '#000' },
  { c: '#f4efe4', tc: '#000' },
];

export const MAX_JUGADORES = COLORES.length;
export const colorDe = (i) => COLORES[i % COLORES.length];
