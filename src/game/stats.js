// Stats de juego de cada jugador: hígado (corazones), tragos y mareo.
// Son de juego, no miden nada real. Reglas puras: no tocan React, así se pueden probar solas.
//
// medios: medios corazones (20 = 10 corazones llenos) · mareo: de 0 a 100.
export const MAX_MEDIOS = 20;
export const STATS_INICIO = { medios: MAX_MEDIOS, tragos: 0, shots: 0, aguas: 0, mareo: 0 };

// Lo que le hace cada cosa a las stats. Cambia los números a tu gusto.
export const EFECTOS = {
  trago: { medios: -1, tragos: 1, mareo: 7 },
  shot: { medios: -2, tragos: 1, shots: 1, mareo: 14 },
  fondo: { medios: -4, tragos: 1, mareo: 22 },
  agua: { medios: 2, aguas: 1, mareo: -12 },
  ronda: { mareo: -5 },          // cada vuelta completa de turnos se baja un poco el mareo
};

const topar = (v, min, max) => Math.min(Math.max(v, min), max);

// Aplica una acción (trago, shot, fondo, agua, ronda) una o varias veces.
// Sin stats (partidas guardadas de antes) arranca de STATS_INICIO.
export function aplicarStat(stats, accion, veces = 1) {
  const efecto = EFECTOS[accion];
  let s = { ...STATS_INICIO, ...stats };
  if (!efecto) return s;
  for (let k = 0; k < veces; k++) {
    s = Object.fromEntries(Object.entries(s).map(([clave, v]) => [clave, v + (efecto[clave] || 0)]));
    s.medios = topar(s.medios, 0, MAX_MEDIOS);
    s.mareo = topar(s.mareo, 0, 100);
  }
  return s;
}

// Cómo va cada quien según su mareo. Nombres sin género para que le queden a todos.
// cara: la carita de pixeles · dice: lo que sale en el globito.
export const ESTADOS = [
  { desde: 0, nombre: 'Al cien', color: '#14b85a', cara: '^_^', dice: '¡Salud, bebé!' },
  { desde: 15, nombre: 'Alegre', color: '#e0a800', cara: '^o^', dice: 'Una más y ya…' },
  { desde: 35, nombre: 'En la nube', color: '#ff2e93', cara: '~v~', dice: 'Los amo a todos' },
  { desde: 55, nombre: 'Viendo doble', color: '#ff7a1a', cara: '@_@', dice: '¿Quién movió el piso?' },
  { desde: 75, nombre: 'Ya valió', color: '#e0002b', cara: '@o@', dice: 'Agüita porfa' },
];
export const KO = { nombre: 'K.O.', color: '#e0002b', cara: 'x_x', dice: '…zzz' };

export const estadoDe = (stats) => {
  const s = { ...STATS_INICIO, ...stats };
  return s.medios === 0 ? KO : ESTADOS.filter(e => s.mareo >= e.desde).at(-1);
};

// Cómo se ve el corazón k (0 a 9): lleno, medio o vacío.
export const tipoCorazon = (medios, k) => (medios >= (k + 1) * 2 ? 'lleno' : medios === k * 2 + 1 ? 'medio' : 'vacio');
