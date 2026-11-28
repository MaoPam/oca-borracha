import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resumen } from './resumen.js';

const j = (nombre, pos, gano, stats = {}, extra = {}) => ({ nombre, pos, gano, stats: { medios: 20, tragos: 0, shots: 0, aguas: 0, mareo: 0, ...stats }, ...extra });

test('podio: primero los que llegaron, en su orden; luego por casilla', () => {
  const r = resumen([j('Ana', 30, 0), j('Beto', 60, 2), j('Caro', 60, 1), j('Dani', 45, 0)]);
  assert.deepEqual(r.podio, [2, 1, 3, 0]);
});

test('premios: gana quien tiene más; si nadie tiene, el premio no sale', () => {
  const r = resumen([j('Ana', 1, 0, { tragos: 3, aguas: 1 }), j('Beto', 1, 0, { tragos: 7 }, { rajadas: 2 })]);
  const de = (id) => r.premios.find(p => p.id === id);
  assert.equal(de('higado').i, 1);
  assert.equal(de('higado').texto, '7 tragos');
  assert.equal(de('agua').texto, '1 agüita');
  assert.equal(de('pollo').i, 1);
  assert.equal(de('shots'), undefined);
  assert.equal(de('comodines'), undefined);
});

test('empate: gana quien va primero en la lista', () => {
  const r = resumen([j('Ana', 1, 0, { shots: 2 }), j('Beto', 1, 0, { shots: 2 })]);
  assert.equal(r.premios.find(p => p.id === 'shots').i, 0);
});

test('total del grupo y partidas guardadas sin stats', () => {
  const r = resumen([j('Ana', 1, 0, { tragos: 2, shots: 1 }), { nombre: 'Viejo', pos: 5, gano: 0 }]);
  assert.deepEqual(r.total, { tragos: 2, shots: 1, aguas: 0 });
});
