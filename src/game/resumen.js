// Resumen al final de la partida: el podio y los "premios de la peda" sacados de las stats.
// Funciones puras (sin React): se prueban en resumen.test.js.
import { STATS_INICIO } from './stats.js';

const st = (j) => ({ ...STATS_INICIO, ...j.stats });

// Cada premio dice cómo se mide. Solo sale si alguien sacó más de 0; en empate gana quien va primero en la lista.
// Para agregar uno nuevo: copia un renglón y cambia el título y la medida.
export const PREMIOS_PEDA = [
  { id: 'higado', icono: '🍺', titulo: 'Hígado de acero', medida: j => st(j).tragos, unidad: ['trago', 'tragos'] },
  { id: 'shots', icono: '🥃', titulo: 'Shot tras shot', medida: j => st(j).shots, unidad: ['shot', 'shots'] },
  { id: 'mareo', icono: '🌀', titulo: 'Mareo máximo', medida: j => st(j).mareo, unidad: ['punto de mareo', 'puntos de mareo'] },
  { id: 'agua', icono: '💧', titulo: 'Hidratación ejemplar', medida: j => st(j).aguas, unidad: ['agüita', 'agüitas'] },
  { id: 'pollo', icono: '🐔', titulo: 'Corazón de pollo', medida: j => j.rajadas || 0, unidad: ['rajada', 'rajadas'] },
  { id: 'comodines', icono: '🃏', titulo: 'Maestría en comodines', medida: j => j.usados || 0, unidad: ['comodín usado', 'comodines usados'] },
];

export function resumen(jugadores = []) {
  // Podio: primero los que llegaron a la 60 (en su orden), luego los demás por casilla.
  const podio = jugadores
    .map((j, i) => ({ j, i }))
    .sort((a, b) => (a.j.gano || 99) - (b.j.gano || 99) || b.j.pos - a.j.pos)
    .map(({ i }) => i);

  const premios = PREMIOS_PEDA.flatMap(p => {
    let quien = null, max = 0;
    jugadores.forEach((j, i) => { const v = p.medida(j); if (v > max) { max = v; quien = i; } });
    return quien === null ? [] : [{ id: p.id, icono: p.icono, titulo: p.titulo, i: quien, valor: max, texto: `${max} ${p.unidad[max === 1 ? 0 : 1]}` }];
  });

  const total = jugadores.reduce((t, j) => {
    const s = st(j);
    return { tragos: t.tragos + s.tragos, shots: t.shots + s.shots, aguas: t.aguas + s.aguas };
  }, { tragos: 0, shots: 0, aguas: 0 });

  return { podio, premios, total };
}
