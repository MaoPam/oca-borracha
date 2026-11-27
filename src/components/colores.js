// Colores de las fichas. c: el color del jugador · tc: lo que se lee encima.
// Ninguno repite un color que ya significa algo en el tablero: verde (avanzar),
// rojo (retroceder), amarillo (comodín), hueso (casilla normal) ni violeta (selección).
export const COLORES = [
  { c: '#ff2e93', tc: '#000' }, // rosa chicle
  { c: '#19c3ff', tc: '#000' }, // azul cielo
  { c: '#ff7a1a', tc: '#000' }, // naranja
  { c: '#14d9b5', tc: '#000' }, // turquesa
  { c: '#3d5bff', tc: '#fff' }, // azul rey
  { c: '#a0603a', tc: '#fff' }, // café
  { c: '#ff9ad5', tc: '#000' }, // rosa pastel
  { c: '#161616', tc: '#fff' }, // negro (el troquel blanco lo despega del fondo)
];

export const MAX_JUGADORES = COLORES.length;
export const colorDe = (i) => COLORES[i % COLORES.length];
