// Reglas puras del juego: no tocan React ni el DOM, así se pueden probar solas.
import { META, LLEGADA_EXACTA, COMODINES } from '../data/casillas.js';

// Recorrido en espiral igual que la lona impresa (9 columnas × 7 filas):
// sale abajo a la izquierda y gira en sentido antihorario hacia el centro.
// Devuelve [fila, columna] para las casillas 1..59 y el rectángulo libre para la 60.
export function trazarEspiral(cols = 9, filas = 7, total = META - 1) {
  const camino = [];
  let t = 0, b = filas - 1, l = 0, r = cols - 1, d = 0;
  while (camino.length < total) {
    if (d === 0) { for (let c = l; c <= r; c++) camino.push([b, c]); b--; }
    else if (d === 1) { for (let q = b; q >= t; q--) camino.push([q, r]); r--; }
    else if (d === 2) { for (let c = r; c >= l; c--) camino.push([t, c]); t++; }
    else { for (let q = t; q <= b; q++) camino.push([q, l]); l++; }
    d = (d + 1) % 4;
  }
  return { camino: camino.slice(0, total), meta: { filas: [t, b], cols: [l, r] } };
}

// Lista de casillas que pisa la ficha paso a paso (con rebote en la meta).
export function pasos(desde, cantidad, direccion = 1) {
  const ruta = [];
  let pos = desde, dir = direccion, rebote = false;
  for (let i = 0; i < cantidad; i++) {
    if (dir > 0 && pos + 1 > META) {
      if (!LLEGADA_EXACTA) break;
      dir = -1; rebote = true;
    }
    if (dir < 0 && pos - 1 < 1) break;
    pos += dir;
    ruta.push(pos);
  }
  return { ruta, destino: pos, rebote };
}

// Qué pasa al caer en una casilla.
export function efecto(n) {
  if (n >= META) return { tipo: 'meta' };
  switch (n) {
    case 3: return { tipo: 'reparte' };
    case 7: return { tipo: 'otraVez' };
    case 31: return { tipo: 'mover', cantidad: 3, direccion: 1 };
    case 45: return { tipo: 'mover', cantidad: 4, direccion: -1 };
    case 49: return { tipo: 'pierdeTurno' };
    case 58: return { tipo: 'retrocedeDado' };
    default: return { tipo: COMODINES.includes(n) ? 'comodin' : 'normal' };
  }
}

// Líneas de la carrera que un jugador acaba de cruzar: las que ya alcanzó (tope es la casilla
// más lejana a la que ha llegado, así cuenta aunque luego retroceda) y que aún no le tocaban.
export const lineasCruzadas = (tope, cruzadas, lineas) => lineas.filter(l => tope >= l && !cruzadas.includes(l));

// Siguiente jugador que sí tira: salta a quien ya ganó y a quien pierde turno.
// Devuelve el índice y la lista de avisos ("X no tira este turno").
export function siguienteTurno(jugadores, actual) {
  const n = jugadores.length;
  const lista = jugadores.map(j => ({ ...j }));
  const avisos = [];
  if (lista.every(j => j.gano)) return { indice: actual, jugadores: lista, avisos };
  let i = actual;
  for (let vueltas = 0; vueltas < n * 4; vueltas++) {
    i = (i + 1) % n;
    const j = lista[i];
    if (j.gano) continue;
    if (j.pierde > 0) { j.pierde -= 1; avisos.push(`${j.nombre} no tira este turno (Detente jochis).`); continue; }
    return { indice: i, jugadores: lista, avisos };
  }
  return { indice: i, jugadores: lista, avisos };
}

export const tirarDado = (rand = Math.random) => 1 + Math.floor(rand() * 6);

export function barajar(arr, rand = Math.random) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
