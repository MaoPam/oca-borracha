// Las fichas que puede escoger cada jugador: basura de fiesta, que es lo que
// de verdad acaba usandose de ficha cuando se juega en una mesa.
// Solo datos: el dibujo vive en FichaDibujo.jsx para no romper el hot reload.
export const FICHAS = [
  { id: 'corcholata', nombre: 'Corcholata' },
  { id: 'colilla', nombre: 'Colilla' },
  { id: 'cheeto', nombre: 'Cheeto' },
  { id: 'murcielago', nombre: 'Murciélago' },
  { id: 'encendedor', nombre: 'Encendedor' },
  { id: 'marioneta', nombre: 'Marioneta' },
];

export const FICHA_POR_DEFECTO = FICHAS[0].id;

// La primera ficha que nadie haya agarrado todavia.
export const fichaLibre = (jugadores) => {
  const usadas = new Set(jugadores.map(j => j.ficha));
  return (FICHAS.find(f => !usadas.has(f.id)) || FICHAS[0]).id;
};
