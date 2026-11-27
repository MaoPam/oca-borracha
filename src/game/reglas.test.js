// Pruebas de las reglas: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { trazarEspiral, pasos, efecto, siguienteTurno, lineasCruzadas, armarBolsa } from './reglas.js';
import { CARTAS, PROPORCION_COMODINES } from '../data/comodines.js';
import { CASILLAS, COMODINES, META } from '../data/casillas.js';
import { RETOS } from '../data/retos.js';

test('la espiral reproduce la lona impresa', () => {
  const { camino, meta } = trazarEspiral();
  assert.equal(camino.length, 59);
  const en = (n) => camino[n - 1].join(',');
  assert.equal(en(1), '6,0');   // abajo a la izquierda
  assert.equal(en(9), '6,8');   // abajo a la derecha
  assert.equal(en(15), '0,8');  // arriba a la derecha
  assert.equal(en(23), '0,0');  // arriba a la izquierda
  assert.equal(en(28), '5,0');
  assert.equal(en(39), '1,7');
  assert.equal(en(48), '4,1');
  assert.equal(en(55), '2,6');  // "Tú preparas" (en la lona venía como otro 56)
  assert.equal(en(59), '2,2');
  assert.deepEqual(meta, { filas: [3, 3], cols: [2, 5] }); // la 60 ocupa 4 casillas al centro
  assert.equal(new Set(camino.map(c => c.join(','))).size, 59);
});

test('hay 60 casillas con mensaje e icono', () => {
  for (let n = 1; n <= META; n++) {
    assert.ok(CASILLAS[n]?.mensaje, `falta mensaje en ${n}`);
    assert.ok(CASILLAS[n]?.icono, `falta icono en ${n}`);
  }
  assert.ok(RETOS.length > 0 && RETOS.every(r => r.titulo && r.desc));
});

test('avanzar normal y rebote en la meta', () => {
  assert.deepEqual(pasos(1, 4), { ruta: [2, 3, 4, 5], destino: 5, rebote: false });
  const r = pasos(57, 6);
  assert.deepEqual(r.ruta, [58, 59, 60, 59, 58, 57]);
  assert.equal(r.rebote, true);
  assert.equal(pasos(56, 4).destino, 60);
});

test('retroceder no baja del inicio', () => {
  assert.deepEqual(pasos(3, 5, -1).ruta, [2, 1]);
  assert.equal(pasos(45, 4, -1).destino, 41);
});

test('efectos de las casillas especiales', () => {
  assert.equal(efecto(7).tipo, 'otraVez');
  assert.deepEqual(efecto(31), { tipo: 'mover', cantidad: 3, direccion: 1 });
  assert.deepEqual(efecto(45), { tipo: 'mover', cantidad: 4, direccion: -1 });
  assert.equal(efecto(49).tipo, 'pierdeTurno');
  assert.equal(efecto(58).tipo, 'retrocedeDado');
  assert.equal(efecto(3).tipo, 'reparte');
  assert.equal(efecto(60).tipo, 'meta');
  for (const n of COMODINES) assert.equal(efecto(n).tipo, 'comodin', `comodín ${n}`);
  assert.equal(efecto(12).tipo, 'normal');
});

test('turnos: salta a quien pierde turno y a quien ya ganó', () => {
  const js = [
    { nombre: 'Ana', pierde: 0, gano: 0 },
    { nombre: 'Beto', pierde: 1, gano: 0 },
    { nombre: 'Carla', pierde: 0, gano: 1 },
    { nombre: 'Dani', pierde: 0, gano: 0 },
  ];
  const r = siguienteTurno(js, 0);
  assert.equal(r.indice, 3);
  assert.equal(r.jugadores[1].pierde, 0);
  assert.equal(r.avisos.length, 1);
  assert.equal(js[1].pierde, 1, 'no muta la lista original');
  assert.equal(siguienteTurno(r.jugadores, 3).indice, 0);
});

test('líneas de la carrera: cada una se la lleva solo el primero', () => {
  const L = [15, 30, 45];
  assert.deepEqual(lineasCruzadas(14, [], L), []);
  assert.deepEqual(lineasCruzadas(15, [], L), [15], 'llegar justo a la línea cuenta');
  assert.deepEqual(lineasCruzadas(33, [15], L), [30]);
  assert.deepEqual(lineasCruzadas(33, [15, 30], L), [], 'si otro ya la ganó, ya no sale');
  assert.deepEqual(lineasCruzadas(50, [], L), [15, 30, 45], 'si brinca varias, salen todas');
});

test('la bolsa trae todos los retos y 1 de cada 3 papelitos es comodín', () => {
  const bolsa = armarBolsa(RETOS.length, CARTAS.map(c => c.id), PROPORCION_COMODINES);
  const retos = bolsa.filter(x => typeof x === 'number');
  const comodines = bolsa.filter(x => typeof x === 'string');
  assert.deepEqual([...retos].sort((a, b) => a - b), RETOS.map((_, i) => i), 'no falta ni sobra ningún reto');
  assert.ok(Math.abs(comodines.length / bolsa.length - 1 / 3) < 0.02, `comodines: ${comodines.length} de ${bolsa.length}`);
  assert.ok(comodines.every(id => CARTAS.some(c => c.id === id)));
  assert.equal(new Set(CARTAS.map(c => c.id)).size, CARTAS.length, 'ids de comodín sin repetir');
});

test('los retos que hablan de dados dicen cuántos piden', () => {
  for (const r of RETOS) {
    if (/\bdados?\b/i.test(r.desc)) assert.ok(r.dados >= 1, `al reto ${r.titulo} le falta dados`);
  }
});
