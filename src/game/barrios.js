// Los cuatro barrios del recorrido. Como el tablero es espiral, no quedan en
// franjas sino en ANILLOS: Tianguis es el borde de afuera y El Laberinto el centro,
// pegado a la 60. La intensidad sube conforme te acercas al final.
export const BARRIOS = {
  tianguis: { nombre: 'Tianguis', desde: 1, hasta: 15 },
  metro: { nombre: 'Metro', desde: 16, hasta: 30 },
  perreo: { nombre: 'Perreo', desde: 31, hasta: 45 },
  laberinto: { nombre: 'El Laberinto', desde: 46, hasta: 59 },
};

export const barrioDe = (n) =>
  n >= 60 ? 'meta'
  : n >= 46 ? 'laberinto'
  : n >= 31 ? 'perreo'
  : n >= 16 ? 'metro'
  : 'tianguis';

// El tipo se codifica con forma e icono, no solo con color (accesibilidad).
export const tipoDe = (cas, comodin) =>
  cas.tipo === 'meta' ? 'meta'
  : comodin ? 'estampa'
  : cas.tipo === 'bonus' ? 'avanza'
  : cas.tipo === 'trampa' ? 'atras'
  : 'tragos';
